import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info' | 'loading'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  add: (t: Omit<Toast, 'id'>) => string
  remove: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (t) => {
    const id = Math.random().toString(36).slice(2, 9)
    set(s => ({ toasts: [...s.toasts, { ...t, id }] }))
    if (t.duration !== 0) {
      setTimeout(() => set(s => ({ toasts: s.toasts.filter(x => x.id !== id) })), t.duration ?? 3800)
    }
    return id
  },
  remove: (id) => set(s => ({ toasts: s.toasts.filter(x => x.id !== id) })),
}))

export const toast = {
  success: (msg: string) => useToastStore.getState().add({ message: msg, type: 'success' }),
  error:   (msg: string) => useToastStore.getState().add({ message: msg, type: 'error' }),
  info:    (msg: string) => useToastStore.getState().add({ message: msg, type: 'info' }),
  loading: (msg: string) => useToastStore.getState().add({ message: msg, type: 'loading', duration: 0 }),
  dismiss: (id: string)  => useToastStore.getState().remove(id),
}
