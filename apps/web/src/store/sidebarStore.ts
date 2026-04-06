import { create } from "zustand";

interface SidebarState {
  isOpen: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
}

/**
 * Not persisted: persisting `isOpen` caused desktop "open" state to reopen the
 * drawer on mobile after navigation. Sidebar always starts closed on load.
 */
export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
}));
