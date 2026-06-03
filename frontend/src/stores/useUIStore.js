import { create } from 'zustand'

const useUIStore = create((set) => ({
  isMenuOpen: false,

  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  setIsMenuOpen: (val) => set({ isMenuOpen: val }),
  closeMenu: () => set({ isMenuOpen: false }),
  openMenu: () => set({ isMenuOpen: true }),

  // ─── সার্ভার লোডিং স্টেট ───
  isServerLoading: true,
  setServerLoading: (val) => set({ isServerLoading: val }),
}))

export default useUIStore
