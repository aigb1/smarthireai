'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthStore, useVoiceStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  Activity, ClipboardList, BarChart3, Settings,
  Zap, AlertCircle, Users,
  Target, Calendar, Wallet,
  LayoutDashboard, UserCog, ScrollText, SlidersHorizontal,
  LogOut,
  LucideIcon,
} from 'lucide-react'

interface FooterItem {
  title: string
  href?: string
  icon: LucideIcon
  isLogout?: boolean
}

const NAV: Record<string, FooterItem[]> = {
  employer: [
    { title: 'Pulse',     href: '/employer/dashboard',    icon: Activity      },
    { title: 'Bids',      href: '/employer/jobs',         icon: ClipboardList },
    { title: 'Analytics', href: '/employer/analytics',    icon: BarChart3     },
    { title: 'Settings',  href: '/employer/settings',     icon: Settings      },
    { title: 'Sign out',  icon: LogOut, isLogout: true },
  ],
  recruiter: [
    { title: 'Velocity',  href: '/recruiter/dashboard',   icon: Zap           },
    { title: 'Search',    href: '/recruiter/search',      icon: AlertCircle   },
    { title: 'Talent',    href: '/recruiter/candidates',  icon: Users         },
    { title: 'Settings',  href: '/recruiter/settings',    icon: Settings      },
    { title: 'Sign out',  icon: LogOut, isLogout: true },
  ],
  clinician: [
    { title: 'Matches',   href: '/clinician/dashboard',   icon: Target        },
    { title: 'Schedule',  href: '/clinician/schedule',    icon: Calendar      },
    { title: 'Wallet',    href: '/clinician/wallet',      icon: Wallet        },
    { title: 'Settings',  href: '/clinician/settings',    icon: Settings      },
    { title: 'Sign out',  icon: LogOut, isLogout: true },
  ],
  superadmin: [
    { title: 'Overview',  href: '/superadmin/dashboard',  icon: LayoutDashboard   },
    { title: 'Users',     href: '/superadmin/users',      icon: UserCog           },
    { title: 'Audit',     href: '/superadmin/audit',      icon: ScrollText        },
    { title: 'Config',    href: '/superadmin/settings',   icon: SlidersHorizontal },
    { title: 'Sign out',  icon: LogOut, isLogout: true },
  ],
}

function NavIcon({
  item,
  active,
  onLogout,
}: {
  item: FooterItem
  active: boolean
  onLogout: () => void
}) {
  const iconEl = (
    <div className="relative">
      <item.icon
        className="w-[22px] h-[22px] transition-colors"
        strokeWidth={active ? 2 : 1.5}
        style={{
          color: item.isLogout
            ? 'var(--mn-text-3)'
            : active
            ? 'var(--mn-text-1)'
            : 'var(--mn-text-3)',
        }}
      />
      {active && !item.isLogout && (
        <motion.span
          layoutId="nav-dot"
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full"
          style={{ background: 'var(--mn-text-1)' }}
        />
      )}
    </div>
  )

  const label = (
    <span
      className="text-[9px] font-medium truncate w-full text-center"
      style={{
        color: item.isLogout
          ? 'var(--mn-text-3)'
          : active
          ? 'var(--mn-text-1)'
          : 'var(--mn-text-3)',
      }}
    >
      {item.title}
    </span>
  )

  if (item.isLogout) {
    return (
      <button
        onClick={onLogout}
        className="flex flex-col items-center gap-1 flex-1 py-2 min-w-0 active:opacity-60 transition-opacity"
        aria-label="Sign out"
      >
        {iconEl}
        {label}
      </button>
    )
  }

  return (
    <Link
      href={item.href!}
      className="flex flex-col items-center gap-1 flex-1 py-2 min-w-0"
    >
      {iconEl}
      {label}
    </Link>
  )
}

export function MobileFooterNav() {
  const { user, logout } = useAuthStore()
  const { open: openVoice } = useVoiceStore()
  const pathname = usePathname()
  const router = useRouter()

  const role = user?.role ?? 'employer'
  const items = NAV[role] ?? NAV.employer

  const left = items.slice(0, 2)
  const right = items.slice(2)

  function handleLogout() {
    logout()
    router.push('/login')
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden"
      style={{
        background: 'var(--mn-surface)',
        borderTop: '1px solid var(--mn-border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-end justify-between h-16">

        {/* Left 2 items */}
        <div className="flex items-end justify-around flex-1">
          {left.map((item) => (
            <NavIcon
              key={item.href ?? item.title}
              item={item}
              active={!!item.href && pathname === item.href}
              onLogout={handleLogout}
            />
          ))}
        </div>

        {/* Centre AI button */}
        <div className="flex flex-col items-center flex-shrink-0 px-2 pb-1">
          <button
            onClick={openVoice}
            aria-label="AI Voice Assistant"
            className="relative -mt-5 h-14 w-14 rounded-full flex items-center justify-center shadow-xl transition-transform active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 60%, #4c1d95 100%)',
              boxShadow: '0 0 20px #7c3aed50, 0 4px 20px rgba(0,0,0,0.5)',
              border: '2px solid #a78bfa30',
            }}
          >
            <svg
              width="26" height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.4"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeWidth="1.8" />
              <path d="M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" strokeOpacity="0.6" />
            </svg>
            <span
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ border: '1.5px solid #a78bfa40', transform: 'scale(1.15)' }}
            />
          </button>
          <span className="text-[9px] font-medium mt-1.5" style={{ color: 'var(--mn-text-3)' }}>AI</span>
        </div>

        {/* Right 3 items (Settings · [role item] · Sign out) */}
        <div className="flex items-end justify-around flex-1">
          {right.map((item) => (
            <NavIcon
              key={item.href ?? item.title}
              item={item}
              active={!!item.href && pathname === item.href}
              onLogout={handleLogout}
            />
          ))}
        </div>

      </div>
    </nav>
  )
}
