'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/store'
import { useSidebarStore } from '@/lib/store'
import {
  Activity, ClipboardList, BarChart3, ClipboardCheck,
  Zap, AlertCircle, Users, Receipt,
  Sparkles, Calendar, Wallet, FolderLock,
  LogOut, Plus, LucideIcon, MoreHorizontal,
  MapPin, ShieldCheck, CreditCard,
  PanelLeftOpen, PanelLeftClose, X,
  Settings, PiggyBank,
  LayoutDashboard, UserCog, BadgeDollarSign, ScrollText, SlidersHorizontal,
} from 'lucide-react'
import { authApi } from '@/lib/api'
import { useState } from 'react'

interface NavItem {
  title: string
  href: string
  icon: LucideIcon
}

const employerNav: NavItem[] = [
  { title: 'Staffing pulse',  href: '/employer/dashboard',    icon: Activity },
  { title: 'Active bids',     href: '/employer/jobs',         icon: ClipboardList },
  { title: 'Ward analytics',  href: '/employer/analytics',    icon: BarChart3 },
  { title: 'Compliance rota', href: '/employer/applications', icon: ClipboardCheck },
  { title: 'Pensions',        href: '/employer/pensions',     icon: PiggyBank },
  { title: 'Settings',        href: '/employer/settings',     icon: Settings },
]

const recruiterNav: NavItem[] = [
  { title: 'Network velocity',  href: '/recruiter/dashboard',  icon: Zap },
  { title: 'Critical gaps',     href: '/recruiter/search',     icon: AlertCircle },
  { title: 'Talent pool',       href: '/recruiter/candidates', icon: Users },
  { title: 'Settlement ledger', href: '/recruiter/bookmarks',  icon: Receipt },
  { title: 'Pension audit',     href: '/recruiter/pensions',   icon: PiggyBank },
  { title: 'Settings',          href: '/recruiter/settings',   icon: Settings },
]

const clinicianNav: NavItem[] = [
  { title: 'Matches',        href: '/clinician/dashboard',  icon: Sparkles },
  { title: 'Schedule',       href: '/clinician/schedule',   icon: Calendar },
  { title: 'Wallet',         href: '/clinician/wallet',     icon: Wallet },
  { title: 'Documents',      href: '/clinician/documents',  icon: FolderLock },
  { title: 'My pension',     href: '/clinician/pensions',   icon: PiggyBank },
  { title: 'Settings',       href: '/clinician/settings',   icon: Settings },
]

const superadminNav: NavItem[] = [
  { title: 'Overview',      href: '/superadmin/dashboard', icon: LayoutDashboard      },
  { title: 'Users',         href: '/superadmin/users',     icon: UserCog              },
  { title: 'Payments',      href: '/superadmin/payments',  icon: BadgeDollarSign      },
  { title: 'Audit log',     href: '/superadmin/audit',     icon: ScrollText           },
  { title: 'Platform settings', href: '/superadmin/settings', icon: SlidersHorizontal },
]

const publicProtocolLinks: NavItem[] = [
  { title: 'Live map',         href: '/discovery', icon: MapPin },
  { title: 'Trust & security', href: '/trust',     icon: ShieldCheck },
  { title: 'Pricing',          href: '/pricing',   icon: CreditCard },
]

const roleLabel: Record<string, string> = {
  employer:   'Employer workspace',
  recruiter:  'Recruiter workspace',
  clinician:  'Clinician workspace',
  superadmin: 'Super admin',
}

const COLLAPSED_W = 60
const EXPANDED_W  = 260

export function Sidebar() {
  const pathname   = usePathname()
  const { user, logout } = useAuthStore()
  const { isOpen, toggle, mobileOpen, setMobileOpen } = useSidebarStore()
  const isExpanded = isOpen || mobileOpen
  const router     = useRouter()
  const [showMenu, setShowMenu] = useState(false)

  const role = user?.role ?? 'employer'
  const navItems =
    role === 'employer'   ? employerNav :
    role === 'clinician'  ? clinicianNav :
    role === 'superadmin' ? superadminNav :
    recruiterNav

  const initials = user?.name
    ?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'U'

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    logout()
    setMobileOpen(false)
    router.push('/login')
  }

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href
    return (
      <Link href={item.href} title={!isExpanded ? item.title : undefined} onClick={() => setMobileOpen(false)}>
        <div
          className={cn(
            'flex items-center h-10 rounded-lg transition-all duration-200 text-sm cursor-pointer',
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
            size={17}
            strokeWidth={1.6}
            className="flex-shrink-0 transition-colors"
            style={{ color: isActive ? 'var(--mn-text-1)' : 'var(--mn-icon)' }}
          />
          {isExpanded && (
            <span className="truncate font-medium">{item.title}</span>
          )}
        </div>
      </Link>
    )
  }

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          role="button"
          aria-label="Close sidebar"
          onPointerDown={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/70 z-[55] lg:hidden cursor-pointer"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-[60] h-screen flex flex-col border-r transition-[width,transform,background,border-color] duration-300 ease-in-out overflow-hidden will-change-transform',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{
          width: mobileOpen ? EXPANDED_W : (isOpen ? EXPANDED_W : COLLAPSED_W),
          background: 'var(--mn-surface)',
          borderColor: 'var(--mn-border)',
        }}
      >
        {/* Close button — mobile only */}
        <button
          onPointerDown={() => setMobileOpen(false)}
          className="lg:hidden absolute top-3 right-3 p-2 rounded-lg transition-colors z-10"
          style={{ color: 'var(--mn-text-3)' }}
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── Logo / Toggle ── */}
        <div
          className={cn(
            'flex items-center h-14 border-b flex-shrink-0',
            isExpanded ? 'px-4 justify-between' : 'justify-center px-0'
          )}
          style={{ borderColor: 'var(--mn-border)' }}
        >
          {isExpanded && (
            <div className="flex items-center gap-2.5">
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
            </div>
          )}
          <button
            onClick={toggle}
            title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            className="h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-200 flex-shrink-0"
            style={{ color: 'var(--mn-text-3)' }}
          >
            {isOpen
              ? <PanelLeftClose size={17} strokeWidth={1.6} />
              : <PanelLeftOpen  size={17} strokeWidth={1.6} />
            }
          </button>
        </div>

        {/* ── New session ── */}
        <div className={cn('pt-3 pb-1 flex-shrink-0', isExpanded ? 'px-3' : 'px-2')}>
          <button
            onClick={() => {
              setMobileOpen(false)
              router.push(role === 'employer' ? '/employer/jobs' : role === 'clinician' ? '/clinician/dashboard' : '/recruiter/search')
            }}
            title={!isExpanded ? 'New session' : undefined}
            className={cn(
              'w-full flex items-center rounded-full border transition-all duration-200 text-sm',
              isExpanded ? 'gap-2 px-3 py-2' : 'justify-center py-2'
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
            <Plus className="w-[17px] h-[17px] flex-shrink-0" strokeWidth={1.8} />
            {isExpanded && <span className="whitespace-nowrap text-sm">New session</span>}
          </button>
        </div>

        {/* ── Nav items ── */}
        <div className={cn('flex-1 overflow-y-auto pt-4 pb-2', isExpanded ? 'px-3' : 'px-2')}>
          {isExpanded && (
            <p className="text-[11px] font-medium mb-1.5 px-2 tracking-wide" style={{ color: 'var(--mn-text-3)' }}>
              Workspace
            </p>
          )}
          <nav className="space-y-0.5">
            {navItems.map((item) => <NavLink key={item.href} item={item} />)}
          </nav>

          <div className={cn(isExpanded ? 'mt-5' : 'mt-3')}>
            {isExpanded && (
              <p className="text-[11px] font-medium mb-1.5 px-2 tracking-wide" style={{ color: 'var(--mn-text-3)' }}>
                Discover
              </p>
            )}
            {!isExpanded && (
              <div className="border-t mb-3" style={{ borderColor: 'var(--mn-border)' }} />
            )}
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
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer"
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
                  className="absolute bottom-full left-0 right-0 mb-1 rounded-xl border overflow-hidden shadow-xl"
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
                    <LogOut size={15} style={{ color: 'var(--mn-icon)' }} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleLogout}
              title="Sign out"
              className="w-full flex items-center justify-center h-9 rounded-lg transition-all duration-200"
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
      </aside>
    </>
  )
}
