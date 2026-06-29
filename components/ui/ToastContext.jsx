'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { CheckCircle, AlertCircle } from 'lucide-react'

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-[200] m-5 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex flex-row items-center gap-[10px] rounded-[4px] px-[18px] py-[12px] text-white shadow-lg pointer-events-auto transition-all animate-in slide-in-from-bottom-5 fade-in duration-300 ${
              toast.type === 'error' ? 'bg-[#C8726A]' : 'bg-[#1C1410]'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle size={16} />
            ) : (
              <CheckCircle size={16} />
            )}
            <span className="font-body text-[11px] font-normal leading-none pt-[2px]">
              {toast.message}
            </span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
