'use client'

import { Menu, Sun, Moon } from 'lucide-react'
import { useAuthStore, useSidebarStore, useThemeStore } from '@/lib/store'
import { NotificationPanel } from '@/components/ui/NotificationPanel'

const roleTitle: Record<string, string> = {
  employer:  'Employer',
  recruiter: 'Recruiter',
  clinician: 'Clinician',
}

interface HeaderProps {
  sidebarW: number
}

export function Header({ sidebarW }: HeaderProps) {
  const { user } = useAuthStore()
  const { setMobileOpen } = useSidebarStore()
  const { theme, toggle } = useThemeStore()
  const role = user?.role ?? 'employer'
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'U'
  const isLight = theme === 'light'

  return (
    <header
      className="dashboard-hdr fixed top-0 right-0 z-40 h-14 flex items-center justify-between px-4 md:px-6 border-b transition-[left] duration-300 ease-in-out"
      style={{
        background: 'var(--mn-surface)',
        borderColor: 'var(--mn-border)',
      }}
    >
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-200 mr-2"
        style={{ color: 'var(--mn-text-3)' }}
        aria-label="Open sidebar"
      >
        <Menu size={18} strokeWidth={1.5} />
      </button>

      {/* Page identity */}
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-sm font-medium" style={{ color: 'var(--mn-text-2)' }}>
          {roleTitle[role]}
        </span>
        <span className="text-sm hidden sm:inline" style={{ color: 'var(--mn-border-hi)' }}>·</span>
        <span className="text-xs hidden sm:inline" style={{ color: 'var(--mn-text-3)' }}>
          {user?.name ?? ''}
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        {/* AI active badge */}
        <div
          className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1.5 border"
          style={{ background: 'var(--mn-badge-bg)', borderColor: 'var(--mn-border)' }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px]" style={{ color: 'var(--mn-text-3)' }}>AI active</span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
          className="h-8 w-8 rounded-lg flex items-center justify-center border transition-all duration-200"
          style={{
            borderColor: 'var(--mn-border)',
            color: 'var(--mn-text-3)',
            background: 'transparent',
          }}
        >
          {isLight
            ? <Moon size={13} strokeWidth={1.5} />
            : <Sun  size={13} strokeWidth={1.5} />
          }
        </button>

        {/* Notifications */}
        <NotificationPanel />

        {/* Expand icon button */}
        <button
          className="h-8 w-8 border rounded-lg flex items-center justify-center transition-all duration-200"
          style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
          </svg>
        </button>

        {/* Avatar */}
        <div
          className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium border"
          style={{
            background: 'var(--mn-avatar-bg)',
            borderColor: 'var(--mn-border)',
            color: 'var(--mn-text-1)',
          }}
        >
          {initials}
        </div>
      </div>
    </header>
  )
}
