import { create } from 'zustand';

type UiState = {
  selectedItemId?: string;
  listItemIds: string[];
  paletteOpen: boolean;
  railOpen: boolean;
  railWidth: number;
  detailWidth: number;
  setSelectedItemId: (itemId?: string) => void;
  setListItemIds: (itemIds: string[]) => void;
  moveSelection: (direction: 1 | -1) => void;
  setPaletteOpen: (open: boolean) => void;
  setRailOpen: (open: boolean) => void;
  setRailWidth: (width: number) => void;
  setDetailWidth: (width: number) => void;
};

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export const useUiStore = create<UiState>((set, get) => ({
  selectedItemId: undefined,
  listItemIds: [],
  paletteOpen: false,
  railOpen: false,
  railWidth: 288,
  detailWidth: 432,
  setSelectedItemId: (itemId) => set({ selectedItemId: itemId }),
  setListItemIds: (itemIds) => {
    const current = get().selectedItemId;
    if (current && !itemIds.includes(current)) {
      set({ listItemIds: itemIds, selectedItemId: itemIds[0] });
      return;
    }
    set({ listItemIds: itemIds });
  },
  moveSelection: (direction) => {
    const { listItemIds, selectedItemId } = get();
    if (listItemIds.length === 0) return;
    if (!selectedItemId) {
      set({ selectedItemId: listItemIds[0] });
      return;
    }
    const currentIndex = Math.max(0, listItemIds.indexOf(selectedItemId));
    const nextIndex = (currentIndex + direction + listItemIds.length) % listItemIds.length;
    set({ selectedItemId: listItemIds[nextIndex] });
  },
  setPaletteOpen: (open) => set({ paletteOpen: open }),
  setRailOpen: (open) => set({ railOpen: open }),
  setRailWidth: (width) => set({ railWidth: clamp(width, 240, 420) }),
  setDetailWidth: (width) => set({ detailWidth: clamp(width, 280, 760) })
}));
