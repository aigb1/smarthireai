'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/store'

export function AuthInit() {
  const initFromStorage = useAuthStore((s) => s.initFromStorage)
  useEffect(() => {
    initFromStorage()
  }, [])
  return null
}
