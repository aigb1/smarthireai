'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/lib/store'

export function ThemeProvider() {
  const initTheme = useThemeStore((s) => s.initTheme)
  useEffect(() => {
    initTheme()
  }, [])
  return null
}
