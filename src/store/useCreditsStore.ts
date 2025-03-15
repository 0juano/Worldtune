import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CreditsStore {
  credits: number;
  addCredits: (amount: number) => void;
  decrementCredits: () => void;
}

export const useCreditsStore = create<CreditsStore>()(
  persist(
    (set) => ({
      credits: 10, // Start with 10 credits
      addCredits: (amount) => set((state) => ({ credits: state.credits + amount })),
      decrementCredits: () => set((state) => ({ credits: Math.max(0, state.credits - 1) })),
    }),
    {
      name: 'credits-storage',
    }
  )
);