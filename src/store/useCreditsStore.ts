import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Credit to USD conversion rate
const CREDIT_TO_USD_RATE = 0.05; // 1 credit = $0.05 USD

interface CreditsStore {
  credits: number;
  addCredits: (amount: number) => void;
  decrementCredits: () => void;
  getUSDValue: () => number;
}

export const useCreditsStore = create<CreditsStore>()(
  persist(
    (set, get) => ({
      credits: 10, // Start with 10 credits
      addCredits: (amount) => set((state) => ({ credits: state.credits + amount })),
      decrementCredits: () => set((state) => ({ credits: Math.max(0, state.credits - 1) })),
      getUSDValue: () => {
        const { credits } = get();
        return Number((credits * CREDIT_TO_USD_RATE).toFixed(2));
      },
    }),
    {
      name: 'credits-storage',
    }
  )
);