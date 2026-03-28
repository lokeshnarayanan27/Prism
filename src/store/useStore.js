import { create } from 'zustand';
import { supabase } from '../supabase/supabase';

const GUEST_EMAIL = 'guest@prism.app';
const GUEST_PASSWORD = 'Guest@Prism2024!';

export const useStore = create((set, get) => ({
  user: null,
  images: [],
  users: {},
  loading: true,

  initAuth: () => {
    let initialized = false;

    // Absolute fallback — loading can never stay true forever
    const killswitch = setTimeout(() => {
      console.warn('[Auth] Killswitch: forcing loading=false');
      set({ loading: false });
    }, 15000);

    // Listen FIRST so we don't miss the initial SIGNED_IN from session restoration
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] Event:', event, '| User:', session?.user?.email || session?.user?.id || 'none');

      if (event === 'SIGNED_IN' && session?.user) {
        set({ loading: true });
        try {
          // Race _loadUser against a 5s timeout — profile fetch must never block navigation
          await Promise.race([
            get()._loadUser(session.user),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('profile_timeout')), 5000)
            ),
          ]);
        } catch (err) {
          console.warn('[Auth] _loadUser timed out or failed, using minimal user:', err.message);
          const u = session.user;
          const isGuest = !!u.is_anonymous || u.email === GUEST_EMAIL;
          // Set a minimal user so ProtectedRoute lets the user through
          set({
            user: {
              uid: u.id,
              email: u.email || (isGuest ? 'Guest' : ''),
              username: u.email?.split('@')[0] || 'guest_' + u.id.substring(0, 5),
              nickname: isGuest ? 'Guest' : 'User',
              isGuest,
            }
          });
          // Still try to load images for real users
          get().listenToImages();
        } finally {
          initialized = true;
          clearTimeout(killswitch);
          set({ loading: false });
        }
      } else if (event === 'SIGNED_OUT') {
        initialized = true;
        clearTimeout(killswitch);
        set({ user: null, images: [], users: {}, loading: false });
      } else if (event === 'INITIAL_SESSION') {
        // Fired on startup — no session means no user
        if (!session) {
          initialized = true;
          clearTimeout(killswitch);
          set({ user: null, loading: false });
        }
        // If session exists, SIGNED_IN fires next and handles it
      } else {
        if (!initialized) {
          initialized = true;
          clearTimeout(killswitch);
          set({ loading: false });
        }
      }
    });

    return () => {
      clearTimeout(killswitch);
      subscription.unsubscribe();
    };
  },

  // Internal: load user profile + images after auth
  _loadUser: async (supabaseUser) => {
    try {
      // Fetch profile (maybeSingle avoids 406 when no row exists)
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      const isGuest = !!supabaseUser.is_anonymous || supabaseUser.email === GUEST_EMAIL;

      let customUser = {
        uid: supabaseUser.id,
        email: supabaseUser.email || (isGuest ? 'Guest' : ''),
        username: supabaseUser.email?.split('@')[0] ||
          (isGuest ? 'guest_' + supabaseUser.id.substring(0, 5) : 'user'),
        nickname: isGuest ? 'Guest' : 'User',
        isGuest,
      };

      if (profile) {
        customUser = { ...customUser, ...profile, uid: profile.id };
      } else if (!isGuest) {
        // Create a profile for new real users
        const { data: newProfile } = await supabase
          .from('profiles')
          .upsert({
            id: supabaseUser.id,
            username: customUser.username,
            nickname: customUser.nickname,
            email: customUser.email,
          }, { onConflict: 'id' })
          .select()
          .maybeSingle();

        if (newProfile) customUser = { ...customUser, ...newProfile, uid: newProfile.id };
      }

      // Set user FIRST before loading images
      set({ user: customUser });

      // Then load images in background (don't await — don't block login)
      get().listenToImages();
    } catch (err) {
      console.error('[Auth] _loadUser error:', err);
      // Even if profile fails, set a minimal user so navigation works
      const isGuest = !!supabaseUser.is_anonymous;
      set({
        user: {
          uid: supabaseUser.id,
          email: supabaseUser.email || 'Guest',
          username: supabaseUser.email?.split('@')[0] || 'guest_' + supabaseUser.id.substring(0, 5),
          nickname: isGuest ? 'Guest' : 'User',
          isGuest,
        }
      });
    }
  },

  // Keep for compatibility
  fetchUserProfile: async (supabaseUser) => get()._loadUser(supabaseUser),

  listenToImages: () => {
    const fetchImages = async () => {
      try {
        const { data: allImages } = await supabase
          .from('images')
          .select('*')
          .order('createdAt', { ascending: false });

        if (allImages) {
          const userCache = { ...get().users };
          allImages.forEach(img => {
            if (img.authorId && !userCache[img.authorId]) {
              userCache[img.authorId] = { username: img.user, nickname: img.userNickname };
            }
          });
          set({ images: allImages, users: userCache });
        }
      } catch (err) {
        console.error('[Images] Fetch error:', err);
      }
    };

    fetchImages();

    const channel = supabase
      .channel('public:images')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'images' }, () => fetchImages())
      .subscribe();

    return () => supabase.removeChannel(channel);
  },

  login: async (email, password) => {
    // ── GUEST ──────────────────────────────────────────────────────────────────
    if (email === GUEST_EMAIL || !password) {
      // Try anonymous first
      const { error: anonError } = await supabase.auth.signInAnonymously();
      if (!anonError) return;

      console.warn('[Auth] Anonymous disabled, trying guest account:', anonError.message);

      // Fallback to real guest account
      const { error: guestError } = await supabase.auth.signInWithPassword({
        email: GUEST_EMAIL,
        password: GUEST_PASSWORD,
      });

      if (!guestError) return;

      // Guest account doesn't exist — create it
      if (
        guestError.message?.toLowerCase().includes('invalid') ||
        guestError.message?.toLowerCase().includes('not found') ||
        guestError.message?.toLowerCase().includes('credentials')
      ) {
        const { error: createErr } = await supabase.auth.signUp({
          email: GUEST_EMAIL,
          password: GUEST_PASSWORD,
        });
        if (createErr && !createErr.message?.toLowerCase().includes('already')) {
          throw new Error('Guest mode setup failed. Please sign up for your own account.');
        }
        // Retry login
        const { error: retryErr } = await supabase.auth.signInWithPassword({
          email: GUEST_EMAIL,
          password: GUEST_PASSWORD,
        });
        if (retryErr) throw new Error('Guest login failed. Please try signing up instead.');
        return;
      }
      throw guestError;
    }

    // ── NORMAL LOGIN ──────────────────────────────────────────────────────────
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.status === 429 || error.message?.toLowerCase().includes('rate limit')) {
        throw new Error('EMAIL_RATE_LIMIT');
      }
      if (
        error.message?.toLowerCase().includes('email not confirmed') ||
        error.message?.toLowerCase().includes('not confirmed')
      ) {
        throw new Error('EMAIL_NOT_CONFIRMED');
      }
      // Wrong password for a real account
      if (
        error.message?.toLowerCase().includes('invalid login') ||
        error.message?.toLowerCase().includes('invalid credentials') ||
        error.status === 400
      ) {
        throw new Error('Invalid email or password. Please check and try again.');
      }
      throw error;
    }
  },

  signUp: async (email, password, username, nickname) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, nickname: nickname || username },
      },
    });

    if (error) {
      if (error.message?.toLowerCase().includes('rate limit') || error.status === 429) {
        throw new Error('EMAIL_RATE_LIMIT');
      }
      if (
        error.message?.toLowerCase().includes('already registered') ||
        error.message?.toLowerCase().includes('already been registered') ||
        error.message?.toLowerCase().includes('user already') ||
        error.message?.toLowerCase().includes('sending confirmation') ||
        error.message?.toLowerCase().includes('email already')
      ) {
        throw new Error('ALREADY_REGISTERED');
      }
      throw error;
    }

    // Supabase bug: if user exists but is unconfirmed, signUp returns data.user but no error.
    // Detect this: identities array will be empty.
    if (data?.user && data.user.identities?.length === 0) {
      throw new Error('ALREADY_REGISTERED');
    }

    return data;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, images: [], users: {} });
  },

  updateNickname: async (newNickname) => {
    const { user } = get();
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ nickname: newNickname })
      .eq('id', user.uid);
    if (!error) set({ user: { ...user, nickname: newNickname } });
  },

  likeImage: async (id) => {
    // 1. Optimistic update — instant UI feedback
    set(state => ({
      images: state.images.map(img =>
        img.id === id ? { ...img, likes: (img.likes || 0) + 1 } : img
      ),
    }));

    // 2. Atomic increment on the server side — no race condition
    const { error } = await supabase.rpc('increment_likes', { image_id: id });

    if (error) {
      // Fallback: read current value and write back (less ideal but works)
      console.warn('RPC increment_likes not found, using fallback:', error.message);
      const { data: img } = await supabase
        .from('images').select('likes').eq('id', id).maybeSingle();
      if (img !== null) {
        await supabase
          .from('images').update({ likes: (img.likes || 0) + 1 }).eq('id', id);
      }
    }
  },

  deleteImage: async (id) => {
    const { error } = await supabase.from('images').delete().eq('id', id);
    if (error) throw error;
    set(state => ({ images: state.images.filter(img => img.id !== id) }));
  },
}));
