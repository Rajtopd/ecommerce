'use client'

export default function CartProvider({ children }) {
  // Simple wrapper as per requirements. 
  // Zustand store handles state outside the tree, but this wrapper
  // can be useful for context or future initialization.
  return <>{children}</>
}
