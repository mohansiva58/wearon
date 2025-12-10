"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useEffect } from "react"

interface CartItem {
  id: string | number  // Support both string ObjectId and legacy number
  name: string
  price: number
  image: string
  color?: string
  size?: string
  quantity: number
}

interface CartStore {
  items: CartItem[]
  total: number
  addItem: (item: CartItem) => void
  removeItem: (id: string | number) => void
  updateQuantity: (id: string | number, quantity: number) => void
  clearCart: () => void
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      addItem: (item) => {
        const state = get()
        const existingItem = state.items.find((i) => String(i.id) === String(item.id) && i.color === item.color && i.size === item.size)

        if (existingItem) {
          set({
            items: state.items.map((i) =>
              String(i.id) === String(item.id) && i.color === item.color && i.size === item.size
                ? { ...i, quantity: i.quantity + item.quantity }
                : i,
            ),
          })
        } else {
          set({ items: [...state.items, item] })
        }

        const newTotal = [...(existingItem ? state.items : [...state.items, item])].reduce(
          (sum, i) => sum + i.price * i.quantity,
          0,
        )
        set({ total: newTotal })
      },
      removeItem: (id) => {
        set((state) => {
          const newItems = state.items.filter((item) => String(item.id) !== String(id))
          const newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
          return { items: newItems, total: newTotal }
        })
      },
      updateQuantity: (id, quantity) => {
        set((state) => {
          const newItems = state.items.map((item) => (String(item.id) === String(id) ? { ...item, quantity } : item))
          const newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
          return { items: newItems, total: newTotal }
        })
      },
      clearCart: () => set({ items: [], total: 0 }),
    }),
    { name: "cart-storage" },
  ),
)
