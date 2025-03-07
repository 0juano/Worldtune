import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CreditsStore = {
  credits: number;
  addCredits: (amount: number) => void;
  useCredits: (amount: number) => boolean;
};

export const useCreditsStore = create<CreditsStore>()(
  persist(
    (set, get) => ({
      credits: 0,
      addCredits: (amount) => set((state) => ({ credits: state.credits + amount })),
      useCredits: (amount) => {
        const currentCredits = get().credits;
        if (currentCredits >= amount) {
          set({ credits: currentCredits - amount });
          return true;
        }
        return false;
      },
    }),
    {
      name: 'credits-storage',
    }
  )
);