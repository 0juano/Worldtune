import { create } from 'zustand';

type View = 'dial' | 'history' | 'settings' | 'login';

interface NavigationStore {
  currentView: View;
  dialInitialNumber: string | null;
  setView: (view: View) => void;
  navigateToDial: (phoneNumber?: string | null) => void;
}

// Initialize with login view by default
export const useNavigationStore = create<NavigationStore>((set) => ({
  currentView: 'dial',
  dialInitialNumber: null,
  setView: (view) => set({ currentView: view, dialInitialNumber: null }),
  navigateToDial: (phoneNumber = null) => set({ 
    currentView: 'dial', 
    dialInitialNumber: phoneNumber 
  }),
}));