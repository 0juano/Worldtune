import { create } from 'zustand';

interface CenterOffset {
  left: number;
  width: number;
}

interface DialStore {
  centerOffset: CenterOffset;
  setCenterOffset: (offset: CenterOffset) => void;
}

const useDialStore = create<DialStore>()((set) => ({
  centerOffset: { left: 0, width: 0 },
  setCenterOffset: (offset: CenterOffset) => set({ centerOffset: offset }),
}));

export { useDialStore }; 