'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore, useSidebarStore, useThemeStore } from '@/lib/store'
import { authApi } from '@/lib/api'
import {
  Activity, ClipboardList, BarChart3, ClipboardCheck,
  Zap, AlertCircle, Users, Receipt,
  Sparkles, Calendar, Wallet, FolderLock,
  LogOut, Plus, LucideIcon, MoreHorizontal,
  MapPin, ShieldCheck, CreditCard,
  Stethoscope, Building2, Network,
  PanelLeftOpen, PanelLeftClose, Menu, X, Sun, Moon,
} from 'lucide-react'
import { VoiceAssistant } from '@/components/ui/VoiceAssistant'

interface NavItem {
  title: string
  href: string
  icon: LucideIcon
}

const discoveryLinks: NavItem[] = [
  { title: 'Clinician', href: '/discover/clinician', icon: Stethoscope },
  { title: 'Employer',  href: '/discover/employer',  icon: Building2 },
  { title: 'Recruiter', href: '/discover/recruiter', icon: Network },
]

const publicProtocolLinks: NavItem[] = [
  { title: 'Live map',       href: '/discovery', icon: MapPin },
  { title: 'Trust protocol', href: '/trust',     icon: ShieldCheck },
  { title: 'Fee structure',  href: '/pricing',   icon: CreditCard },
]

const employerNav: NavItem[] = [
  { title: 'Staffing pulse',  href: '/employer/dashboard',    icon: Activity },
  { title: 'Active bids',     href: '/employer/jobs',         icon: ClipboardList },
  { title: 'Ward analytics',  href: '/employer/analytics',    icon: BarChart3 },
  { title: 'Compliance rota', href: '/employer/applications', icon: ClipboardCheck },
]

const recruiterNav: NavItem[] = [
  { title: 'Network velocity',  href: '/recruiter/dashboard',  icon: Zap },
  { title: 'Critical gaps',     href: '/recruiter/search',     icon: AlertCircle },
  { title: 'Talent pool',       href: '/recruiter/candidates', icon: Users },
  { title: 'Settlement ledger', href: '/recruiter/bookmarks',  icon: Receipt },
]

const clinicianNav: NavItem[] = [
  { title: 'Neural matches', href: '/clinician/dashboard',  icon: Sparkles },
  { title: 'Schedule',       href: '/clinician/schedule',   icon: Calendar },
  { title: 'Wallet',         href: '/clinician/wallet',     icon: Wallet },
  { title: 'Document vault', href: '/clinician/documents',  icon: FolderLock },
]

const roleLabel: Record<string, string> = {
  employer:  'Employer workspace',
  recruiter: 'Recruiter workspace',
  clinician: 'Clinician workspace',
}

const COLLAPSED_W = 60
const EXPANDED_W  = 260

interface PublicLayoutProps {
  children: React.ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const pathname = usePathname()
  const router   = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { isOpen, toggle } = useSidebarStore()
  const { theme, toggle: toggleTheme } = useThemeStore()
  const isLight = theme === 'light'

  const role = user?.role ?? 'employer'
  const navItems =
    role === 'employer' ? employerNav :
    role === 'clinician' ? clinicianNav :
    recruiterNav
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'U'

  const sidebarW = isOpen ? EXPANDED_W : COLLAPSED_W
  const isExpanded = isOpen || mobileOpen

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    logout()
    setMobileOpen(false)
    router.push('/')
  }

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href || (item.href !== '/' && (pathname?.startsWith(item.href) ?? false))
    return (
      <Link href={item.href} onClick={() => setMobileOpen(false)} title={!isExpanded ? item.title : undefined}>
        <div
          className={cn(
            'flex items-center h-11 rounded-md transition-all duration-200 text-sm cursor-pointer',
            isExpanded ? 'gap-2.5 px-3' : 'justify-center px-0',
          )}
          style={{
            background: isActive ? 'var(--mn-nav-active-bg)' : 'transparent',
            color: isActive ? 'var(--mn-text-1)' : 'var(--mn-text-3)',
          }}
          onMouseEnter={(e) => {
            if (!isActive) {
              e.currentTarget.style.background = 'var(--mn-nav-hover-bg)'
              e.currentTarget.style.color = 'var(--mn-text-2)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive) {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--mn-text-3)'
            }
          }}
        >
          <item.icon
            className="flex-shrink-0 transition-colors"
            size={18}
            strokeWidth={1.5}
            style={{ color: isActive ? 'var(--mn-text-1)' : 'var(--mn-icon)' }}
          />
          {isExpanded && <span className="truncate">{item.title}</span>}
        </div>
      </Link>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* ── Logo / Toggle ── */}
      <div
        className={cn(
          'flex items-center h-14 border-b flex-shrink-0',
          isExpanded ? 'px-4 justify-between' : 'justify-center px-0'
        )}
        style={{ borderColor: 'var(--mn-border)' }}
      >
        {isExpanded && (
          <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
            <div
              className="h-6 w-6 rounded-md border flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--mn-nav-active-bg)', borderColor: 'var(--mn-border)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" strokeWidth="1.5"
                stroke="var(--mn-text-1)">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight whitespace-nowrap" style={{ color: 'var(--mn-text-1)' }}>
              mednode.cloud
            </span>
          </Link>
        )}
        <button
          onClick={toggle}
          title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className="h-8 w-8 flex items-center justify-center rounded-md transition-all duration-200 flex-shrink-0"
          style={{ color: 'var(--mn-text-3)' }}
        >
          {isOpen
            ? <PanelLeftClose size={18} strokeWidth={1.5} />
            : <PanelLeftOpen  size={18} strokeWidth={1.5} />
          }
        </button>
      </div>

      {isAuthenticated ? (
        <>
          {/* ── New session ── */}
          <div className={cn('pt-3 pb-1 flex-shrink-0', isExpanded ? 'px-3' : 'px-2')}>
            <button
              onClick={() => {
                router.push(role === 'employer' ? '/employer/jobs' : role === 'clinician' ? '/clinician/dashboard' : '/recruiter/search')
                setMobileOpen(false)
              }}
              title={!isExpanded ? 'New session' : undefined}
              className={cn(
                'w-full flex items-center rounded-md border transition-all duration-200 text-sm',
                isExpanded ? 'gap-2 px-3 py-2.5' : 'justify-center py-2.5'
              )}
              style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--mn-nav-hover-bg)'
                e.currentTarget.style.color = 'var(--mn-text-1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--mn-text-3)'
              }}
            >
              <Plus className="w-[18px] h-[18px] flex-shrink-0" />
              {isExpanded && <span className="whitespace-nowrap">New session</span>}
            </button>
          </div>

          {/* ── Workspace nav ── */}
          <div className={cn('flex-1 overflow-y-auto pt-4 pb-2', isExpanded ? 'px-3' : 'px-2')}>
            {isExpanded && (
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-1.5 px-3" style={{ color: 'var(--mn-text-3)' }}>
                Workspace
              </p>
            )}
            <nav className="space-y-0.5">
              {navItems.map((item) => <NavLink key={item.href} item={item} />)}
            </nav>

            <div className={cn(isExpanded ? 'mt-5' : 'mt-3')}>
              {isExpanded && (
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-1.5 px-3" style={{ color: 'var(--mn-text-3)' }}>
                  Public protocol
                </p>
              )}
              {!isExpanded && <div className="border-t mb-3" style={{ borderColor: 'var(--mn-border)' }} />}
              <nav className="space-y-0.5">
                {publicProtocolLinks.map((item) => <NavLink key={item.href} item={item} />)}
              </nav>
            </div>
          </div>

          {/* ── User profile ── */}
          <div
            className={cn('pb-4 pt-2 border-t flex-shrink-0', isExpanded ? 'px-3' : 'px-2')}
            style={{ borderColor: 'var(--mn-border)' }}
          >
            {isExpanded ? (
              <div className="relative">
                <div
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-all duration-200 cursor-pointer"
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--mn-nav-hover-bg)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <div
                    className="h-7 w-7 rounded-full border flex items-center justify-center text-xs font-medium flex-shrink-0"
                    style={{ background: 'var(--mn-avatar-bg)', borderColor: 'var(--mn-border)', color: 'var(--mn-text-1)' }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate leading-tight" style={{ color: 'var(--mn-text-1)' }}>
                      {user?.name ?? 'User'}
                    </p>
                    <p className="text-[11px] truncate capitalize leading-tight" style={{ color: 'var(--mn-text-3)' }}>
                      {roleLabel[role] ?? role}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
                    className="transition-colors flex-shrink-0"
                    style={{ color: 'var(--mn-text-3)' }}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>
                {showMenu && (
                  <div
                    className="absolute bottom-full left-0 right-0 mb-1 rounded-md border overflow-hidden shadow-xl"
                    style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}
                  >
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm transition-all duration-200 text-left"
                      style={{ color: 'var(--mn-text-3)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--mn-nav-hover-bg)'
                        e.currentTarget.style.color = 'var(--mn-text-1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = 'var(--mn-text-3)'
                      }}
                    >
                      <LogOut size={16} style={{ color: 'var(--mn-icon)' }} />
                      Disconnect node
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                title="User menu"
                className="w-full flex items-center justify-center h-9 rounded-md transition-all duration-200"
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--mn-nav-hover-bg)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <div
                  className="h-7 w-7 rounded-full border flex items-center justify-center text-xs font-medium"
                  style={{ background: 'var(--mn-avatar-bg)', borderColor: 'var(--mn-border)', color: 'var(--mn-text-1)' }}
                >
                  {initials}
                </div>
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          {/* ── Unauthenticated nav ── */}
          <div className={cn('flex-1 overflow-y-auto pt-4 pb-2', isExpanded ? 'px-3' : 'px-2')}>
            {isExpanded && (
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-1.5 px-3" style={{ color: 'var(--mn-text-3)' }}>
                Workspace
              </p>
            )}
            <nav className="space-y-0.5">
              {discoveryLinks.map((item) => <NavLink key={item.href} item={item} />)}
            </nav>

            <div className={cn(isExpanded ? 'mt-5' : 'mt-3')}>
              {isExpanded && (
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-1.5 px-3" style={{ color: 'var(--mn-text-3)' }}>
                  Public protocol
                </p>
              )}
              {!isExpanded && <div className="border-t mb-3" style={{ borderColor: 'var(--mn-border)' }} />}
              <nav className="space-y-0.5">
                {publicProtocolLinks.map((item) => <NavLink key={item.href} item={item} />)}
              </nav>
            </div>
          </div>

          {/* ── Connect node CTA ── */}
          <div
            className={cn('pb-4 pt-2 border-t flex-shrink-0', isExpanded ? 'px-3' : 'px-2')}
            style={{ borderColor: 'var(--mn-border)' }}
          >
            {isExpanded ? (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <div
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md transition-all duration-200 text-sm font-medium cursor-pointer"
                    style={{ background: 'var(--mn-text-1)', color: 'var(--mn-bg)' }}
                  >
                    <Plus className="w-[18px] h-[18px] flex-shrink-0" />
                    Connect node
                  </div>
                </Link>
                <div className="mt-2.5 flex items-center gap-2 justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px]" style={{ color: 'var(--mn-text-3)' }}>Protocol active</span>
                </div>
              </>
            ) : (
              <Link href="/login" title="Connect node" onClick={() => setMobileOpen(false)}>
                <div
                  className="w-full flex items-center justify-center h-9 rounded-md transition-all duration-200 cursor-pointer"
                  style={{ background: 'var(--mn-nav-hover-bg)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--mn-nav-active-bg)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--mn-nav-hover-bg)' }}
                >
                  <Plus size={18} style={{ color: 'var(--mn-text-1)' }} strokeWidth={1.5} />
                </div>
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  )

  const drawerW = mobileOpen ? EXPANDED_W : (isOpen ? EXPANDED_W : COLLAPSED_W)

  return (
    <div
      className="flex min-h-screen transition-colors duration-300"
      style={{ background: 'var(--mn-bg)', color: 'var(--mn-text-1)' }}
    >
      {/* ── Mobile top nav bar ── */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-[59] flex items-center h-12 px-3 border-b"
        style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}
      >
        <button
          onPointerDown={() => setMobileOpen(true)}
          className="flex items-center justify-center h-9 w-9 rounded-lg transition-colors"
          style={{ color: 'var(--mn-text-3)' }}
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex-1 flex items-center justify-center gap-2">
          <div
            className="h-5 w-5 rounded-md border flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--mn-nav-active-bg)', borderColor: 'var(--mn-border)' }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="var(--mn-text-1)">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--mn-text-1)' }}>
            mednode.cloud
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Theme toggle — mobile */}
          <button
            onClick={toggleTheme}
            title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
            className="h-8 w-8 rounded-lg border flex items-center justify-center transition-all duration-200"
            style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)' }}
          >
            {isLight ? <Moon size={13} strokeWidth={1.5} /> : <Sun size={13} strokeWidth={1.5} />}
          </button>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-mono tracking-wider uppercase" style={{ color: 'var(--mn-text-3)' }}>live</span>
        </div>
      </div>

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div
          role="button"
          aria-label="Close navigation"
          onPointerDown={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/70 z-[55] lg:hidden cursor-pointer"
        />
      )}

      {/* ── Sidebar drawer ── */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-screen z-[60] border-r will-change-transform',
          'transition-[width,transform,background,border-color] duration-300 ease-in-out overflow-hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{
          width: drawerW,
          background: 'var(--mn-surface)',
          borderColor: 'var(--mn-border)',
        }}
      >
        {/* Close button — mobile only */}
        <button
          onPointerDown={() => setMobileOpen(false)}
          className="lg:hidden absolute top-3 right-3 z-10 p-2 rounded-lg transition-colors"
          style={{ color: 'var(--mn-text-3)' }}
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* ── Desktop theme toggle — fixed top-right ── */}
      <button
        onClick={toggleTheme}
        title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
        className="hidden lg:flex fixed top-4 right-4 z-50 h-8 w-8 rounded-lg border items-center justify-center transition-all duration-200"
        style={{
          background: 'var(--mn-surface)',
          borderColor: 'var(--mn-border)',
          color: 'var(--mn-text-3)',
        }}
      >
        {isLight ? <Moon size={13} strokeWidth={1.5} /> : <Sun size={13} strokeWidth={1.5} />}
      </button>

      {/* ── Page content ── */}
      <div
        className="public-content flex-1 min-h-screen transition-[margin-left] duration-300 ease-in-out"
        style={{ marginLeft: sidebarW }}
      >
        <div className="lg:hidden h-12" aria-hidden="true" />
        {children}
      </div>

      <VoiceAssistant />
    </div>
  )
}
