'use client'

import { useToastStore } from '@/lib/toast'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Info, Loader2, X } from 'lucide-react'

const iconMap = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" strokeWidth={1.5} />,
  error:   <XCircle     className="w-4 h-4 text-red-400    flex-shrink-0" strokeWidth={1.5} />,
  info:    <Info        className="w-4 h-4 text-blue-400   flex-shrink-0" strokeWidth={1.5} />,
  loading: <Loader2    className="w-4 h-4 text-zinc-400    flex-shrink-0 animate-spin" strokeWidth={1.5} />,
}

export function Toaster() {
  const { toasts, remove } = useToastStore()
  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col-reverse gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{    opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex items-center gap-3 rounded-xl border border-white/8 bg-zinc-900/95 backdrop-blur-sm px-4 py-3 shadow-2xl min-w-[260px] max-w-[380px]"
          >
            {iconMap[t.type]}
            <p className="text-sm text-white flex-1">{t.message}</p>
            <button onClick={() => remove(t.id)} className="text-zinc-600 hover:text-white transition-colors flex-shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
