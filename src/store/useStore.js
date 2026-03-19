import { create } from 'zustand';

export const useStore = create((set) => ({
  user: null, // null when logged out, object when logged in format: { username, email, nickname }
  images: [], // Start unconditionally empty, no default images
  users: {}, // Minimal store logic to track user details globally if necessary mapping username to user details
  
  login: (userData) => set((state) => ({ 
    user: { ...userData, nickname: userData.nickname || userData.username },
    users: { ...state.users, [userData.username]: { ...userData, nickname: userData.nickname || userData.username } }
  })),
  
  logout: () => set({ user: null }),
  
  updateNickname: (newNickname) => set((state) => {
    if (!state.user) return state;
    const updatedUser = { ...state.user, nickname: newNickname };
    return {
      user: updatedUser,
      users: { ...state.users, [state.user.username]: updatedUser }
    };
  }),

  addImage: (image) => set((state) => ({ images: [image, ...state.images] })),
  
  likeImage: (id) => set((state) => ({
    images: state.images.map(img => 
      img.id === id ? { ...img, likes: img.likes + 1 } : img
    )
  })),
}));
