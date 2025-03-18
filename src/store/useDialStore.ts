import { create } from 'zustand';

type CenterOffset = {
  left: number;
  width: number;
};

type DialStore = {
  centerOffset: CenterOffset;
  setCenterOffset: (offset: CenterOffset) => void;
};

export const useDialStore = create<DialStore>((set) => ({
  centerOffset: { left: 0, width: 0 },
  setCenterOffset: (offset: CenterOffset) => set({ centerOffset: offset }),
})); 