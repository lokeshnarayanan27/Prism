import { create } from 'zustand';
import { auth, db } from '../firebase/firebase';
import { 
  signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  signOut, signInAnonymously 
} from 'firebase/auth';
import { 
  collection, doc, setDoc, getDoc, updateDoc, 
  onSnapshot, query, orderBy, increment 
} from 'firebase/firestore';

export const useStore = create((set, get) => ({
  user: null, 
  images: [], 
  users: {}, 
  loading: true,

  initAuth: () => {
    return auth.onAuthStateChanged(async (firebaseUser) => {
      set({ loading: true });
      if (firebaseUser) {
        // Fetch custom user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        let customUser = { 
          uid: firebaseUser.uid, 
          email: firebaseUser.email, 
          username: firebaseUser.email?.split('@')[0] || 'guest',
          nickname: firebaseUser.email?.split('@')[0] || 'Guest User'
        };

        if (userDoc.exists()) {
          customUser = userDoc.data();
        } else {
          // Initialize fresh document for tracking
          await setDoc(doc(db, 'users', firebaseUser.uid), customUser, { merge: true });
        }
        
        set({ user: customUser });
        get().listenToImages();
      } else {
        set({ user: null, images: [], users: {} });
      }
      set({ loading: false });
    });
  },

  listenToImages: () => {
    const q = query(collection(db, 'images'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const allImages = [];
      const userCache = { ...get().users };
      
      snapshot.forEach(doc => {
        const data = doc.data();
        allImages.push({ id: doc.id, ...data });
        
        if (data.authorId && !userCache[data.authorId]) {
           // We could aggressively fetch missing users here, or defer to global user records.
           // Setting basic skeleton to ensure UI won't break if author lookup hasn't finalized.
           userCache[data.authorId] = { username: data.user, nickname: data.userNickname };
        }
      });
      set({ images: allImages, users: userCache });
    });
  },

  login: async (email, password) => {
    if(email === 'guest@prism.app' || !password) {
       const res = await signInAnonymously(auth);
       await setDoc(doc(db, 'users', res.user.uid), {
         uid: res.user.uid,
         username: 'guest',
         nickname: 'Guest User',
         email: null
       }, { merge: true });
       return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', res.user.uid), {
          uid: res.user.uid,
          username: email.split('@')[0],
          nickname: email.split('@')[0],
          email: email
        });
      } else {
        throw err;
      }
    }
  },
  
  logout: async () => {
    await signOut(auth);
    set({ user: null });
  },
  
  updateNickname: async (newNickname) => {
    const state = get();
    if (!state.user) return;
    
    const updatedUser = { ...state.user, nickname: newNickname };
    set({ user: updatedUser });
    set((s) => ({ users: { ...s.users, [state.user.uid]: updatedUser } }));
    
    // Push update to Firestore
    await updateDoc(doc(db, 'users', state.user.uid), {
      nickname: newNickname
    });
  },

  likeImage: async (id) => {
    // Optimistic UI update combined with actual Firestore backend update
    set((state) => ({
      images: state.images.map(img => 
        img.id === id ? { ...img, likes: img.likes + 1 } : img
      )
    }));
    await updateDoc(doc(db, 'images', id), {
      likes: increment(1)
    });
  },
}));
