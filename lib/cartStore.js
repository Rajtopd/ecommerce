import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      addItem: (item) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (i) => i.variantId === item.variantId
          )

          if (existingItemIndex > -1) {
            const newItems = [...state.items]
            newItems[existingItemIndex].quantity += 1
            return { items: newItems }
          } else {
            return { items: [...state.items, { ...item, quantity: item.quantity || 1 }] }
          }
        })
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        }))
      },

      updateQuantity: (variantId, newQty) => {
        if (newQty <= 0) {
          get().removeItem(variantId)
          return
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId ? { ...i, quantity: newQty } : i
          ),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      openDrawer: () => {
        set({ isDrawerOpen: true })
      },

      closeDrawer: () => {
        set({ isDrawerOpen: false })
      },

      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: 'soul-sisters-cart',
    }
  )
)

export default useCartStore
