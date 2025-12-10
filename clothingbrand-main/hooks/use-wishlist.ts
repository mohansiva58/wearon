"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface WishlistItem {
  id: string | number  // Support both string ObjectId and legacy number
  name: string
  price: number
  image: string
}

interface WishlistStore {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (id: string | number) => void
  isInWishlist: (id: string | number) => boolean
  toggleWishlist: (item: WishlistItem) => void
  clearWishlist: () => void
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({
          items: state.items.some((i) => String(i.id) === String(item.id)) ? state.items : [...state.items, item],
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => String(item.id) !== String(id)),
        })),
      isInWishlist: (id) => get().items.some((item) => String(item.id) === String(id)),
      toggleWishlist: (item) => {
        const { isInWishlist, addItem, removeItem } = get()
        if (isInWishlist(item.id)) {
          removeItem(item.id)
        } else {
          addItem(item)
        }
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "wishlist-storage",
    },
  ),
)
