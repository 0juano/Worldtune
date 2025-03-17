import { create } from 'zustand';

type View = 'messages' | 'calls' | 'contacts' | 'settings' | 'dial' | 'login';

type NavigationStore = {
  currentView: View;
  setView: (view: View) => void;
};

// Initialize with login view by default
export const useNavigationStore = create<NavigationStore>((set) => ({
  currentView: 'login', // Start with login view
  setView: (view) => {
    console.log(`Navigation: Changing view from 'login' to '${view}'`);
    set({ currentView: view });
    console.log(`Navigation: View changed to '${view}'`);
  },
}));