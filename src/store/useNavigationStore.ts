import { create } from 'zustand';

type View = 'messages' | 'calls' | 'contacts' | 'settings' | 'dial';

type NavigationStore = {
  currentView: View;
  setView: (view: View) => void;
};

export const useNavigationStore = create<NavigationStore>((set) => ({
  currentView: 'dial',
  setView: (view) => set({ currentView: view }),
}));