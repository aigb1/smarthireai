'use client'

import { useEffect } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { useSidebarStore, useAuthStore } from '@/lib/store'
import { Toaster } from '@/components/ui/Toaster'
import { VoiceAssistant } from '@/components/ui/VoiceAssistant'
import { MobileFooterNav } from './MobileFooterNav'

const COLLAPSED_W = 60
const EXPANDED_W  = 260

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isOpen } = useSidebarStore()
  const sidebarW = isOpen ? EXPANDED_W : COLLAPSED_W
  const initFromStorage = useAuthStore((s) => s.initFromStorage)
  const isLoading = useAuthStore((s) => s.isLoading)

  useEffect(() => {
    initFromStorage()
  }, [])

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ '--sidebar-w': `${sidebarW}px`, background: 'var(--mn-bg)', color: 'var(--mn-text-1)' } as React.CSSProperties}
    >
      <Sidebar />
      <Header sidebarW={sidebarW} />
      <main
        className="dashboard-main transition-[padding-left] duration-300 ease-in-out"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-[calc(100vh-56px)]">
            <div className="text-center space-y-3">
              <svg className="w-5 h-5 animate-spin mx-auto" style={{ color: 'var(--mn-text-3)' }} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <p className="text-xs tracking-wider" style={{ color: 'var(--mn-text-3)' }}>Initialising protocol…</p>
            </div>
          </div>
        ) : (
          <div className="p-4 pb-24 md:p-6 md:pb-24 lg:pb-6 w-full">
            {children}
          </div>
        )}
      </main>
      <MobileFooterNav />
      <Toaster />
      <VoiceAssistant />
    </div>
  )
}
