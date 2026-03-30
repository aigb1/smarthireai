'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, X, Check, FileText, DollarSign, AlertCircle,
  ShieldCheck, Users, Zap, ClipboardList, CheckCircle2,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import Link from 'next/link'

const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }

type NCategory = 'action' | 'financial' | 'compliance' | 'system'
type NRole     = 'clinician' | 'employer' | 'recruiter' | 'all'

interface Notification {
  id: string
  roles: NRole[]
  category: NCategory
  icon: React.ElementType
  title: string
  description: string
  timestamp: string        // display string
  group: 'today' | 'yesterday' | 'week'
  read: boolean
  href?: string
  actionLabel?: string
}

const CATEGORY_STYLE: Record<NCategory, { color: string; bg: string; border: string }> = {
  action:     { color: '#a78bfa', bg: '#7c3aed18', border: '#7c3aed30' },
  financial:  { color: '#34d399', bg: '#10b98118', border: '#10b98130' },
  compliance: { color: '#f59e0b', bg: '#f59e0b18', border: '#f59e0b30' },
  system:     { color: '#60a5fa', bg: '#3b82f618', border: '#3b82f630' },
}

const ALL_NOTIFICATIONS: Notification[] = [
  /* ── CLINICIAN ── */
  {
    id: 'n_c1', roles: ['clinician'], category: 'action',
    icon: FileText, group: 'today', read: false,
    title: 'Sign Pension Form A — Royal London',
    description: 'Your ICU shift on 26 Mar has been verified. Member declaration required.',
    timestamp: '2m ago', href: '/clinician/pensions', actionLabel: 'Sign now',
  },
  {
    id: 'n_c2', roles: ['clinician'], category: 'financial',
    icon: DollarSign, group: 'today', read: false,
    title: 'Payment of £880 settled',
    description: 'Royal London ICU · 8h @ £110/hr · Ref: RLH_ICU_004',
    timestamp: '1h ago', href: '/clinician/wallet',
  },
  {
    id: 'n_c3', roles: ['clinician'], category: 'action',
    icon: ClipboardList, group: 'today', read: false,
    title: 'New bid invite — A&E, North Middlesex',
    description: '12h shift, 4 Apr 2026 · £125/hr · Urgent cover required.',
    timestamp: '3h ago', href: '/clinician/dashboard',
  },
  {
    id: 'n_c4', roles: ['clinician'], category: 'compliance',
    icon: ShieldCheck, group: 'yesterday', read: true,
    title: 'DBS certificate verified by mednode',
    description: 'Your enhanced DBS check has been validated and added to your document vault.',
    timestamp: 'Yesterday', href: '/clinician/documents',
  },
  {
    id: 'n_c5', roles: ['clinician'], category: 'financial',
    icon: DollarSign, group: 'yesterday', read: true,
    title: 'Payment of £1,200 settled',
    description: "St. Mary's Trust A&E · 12h @ £100/hr · Ref: SMT_AE_001",
    timestamp: 'Yesterday', href: '/clinician/wallet',
  },
  {
    id: 'n_c6', roles: ['clinician'], category: 'action',
    icon: FileText, group: 'week', read: true,
    title: 'Sign Pension Form B — March 2026',
    description: 'Monthly summary auto-generated. £6,682 total pensionable pay across 3 employers.',
    timestamp: '3 days ago', href: '/clinician/pensions',
  },

  /* ── EMPLOYER ── */
  {
    id: 'n_e1', roles: ['employer'], category: 'action',
    icon: Users, group: 'today', read: false,
    title: 'New applicant — ICU signal',
    description: 'Dr. Priya Nair (GMC 7823199) matched your urgent ICU posting at 97% fit.',
    timestamp: '8m ago', href: '/employer/jobs',
  },
  {
    id: 'n_e2', roles: ['employer'], category: 'action',
    icon: FileText, group: 'today', read: false,
    title: 'Pension form awaiting your signature',
    description: 'Dr. James Park · Form A · March 2026 · £1,624 pensionable pay.',
    timestamp: '2h ago', href: '/employer/pensions', actionLabel: 'Review & sign',
  },
  {
    id: 'n_e3', roles: ['employer'], category: 'action',
    icon: ClipboardList, group: 'today', read: false,
    title: 'Review and initialise workflow',
    description: 'Recruiter node uploaded a white-label contract for ICU locum pool. Action required.',
    timestamp: '4h ago', href: '/employer/applications', actionLabel: 'Review',
  },
  {
    id: 'n_e4', roles: ['employer'], category: 'system',
    icon: Zap, group: 'yesterday', read: true,
    title: 'Shift coverage at 94%',
    description: 'All ICU and A&E rotas are covered for the next 7 days. 2 gaps remain in Cardiology.',
    timestamp: 'Yesterday', href: '/employer/analytics',
  },
  {
    id: 'n_e5', roles: ['employer'], category: 'compliance',
    icon: AlertCircle, group: 'yesterday', read: true,
    title: 'Audit trail updated',
    description: '3 new entries added to your compliance audit log by the mednode protocol.',
    timestamp: 'Yesterday', href: '/employer/applications',
  },
  {
    id: 'n_e6', roles: ['employer'], category: 'action',
    icon: ClipboardList, group: 'week', read: true,
    title: 'Authorise timesheet — Dr. A. Sharma',
    description: 'Cardiology CCU · 24h across 2 shifts · Feb 2026. Awaiting your approval.',
    timestamp: '4 days ago', href: '/employer/jobs',
  },

  /* ── RECRUITER ── */
  {
    id: 'n_r1', roles: ['recruiter'], category: 'compliance',
    icon: AlertCircle, group: 'today', read: false,
    title: 'Compliance gap — Dr. B. Jones',
    description: 'DBS certificate expires in 14 days. Renewal required before next placement.',
    timestamp: '15m ago', href: '/recruiter/candidates',
  },
  {
    id: 'n_r2', roles: ['recruiter'], category: 'action',
    icon: FileText, group: 'today', read: false,
    title: 'Pension Form B overdue — employer nudge sent',
    description: 'Royal London has not signed Dr. Anya Sharma Form A. Automated nudge dispatched.',
    timestamp: '1h ago', href: '/recruiter/pensions',
  },
  {
    id: 'n_r3', roles: ['recruiter'], category: 'financial',
    icon: DollarSign, group: 'today', read: false,
    title: 'Revenue milestone reached',
    description: 'March 2026 commission: £14,220 settled across 9 completed placements.',
    timestamp: '3h ago', href: '/recruiter/bookmarks',
  },
  {
    id: 'n_r4', roles: ['recruiter'], category: 'system',
    icon: Zap, group: 'yesterday', read: true,
    title: 'New node connected to mesh',
    description: 'Whittington Health NHS Trust joined the mednode protocol. 12,411 nodes active.',
    timestamp: 'Yesterday', href: '/recruiter/dashboard',
  },
  {
    id: 'n_r5', roles: ['recruiter'], category: 'compliance',
    icon: ShieldCheck, group: 'week', read: true,
    title: 'GMC re-validation alert — Dr. M. Webb',
    description: 'Annual re-validation window opens in 30 days. Notify clinician to initiate.',
    timestamp: '2 days ago', href: '/recruiter/candidates',
  },
]

const GROUP_LABELS: Record<string, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  week: 'Last 7 days',
}

export function NotificationPanel() {
  const { user } = useAuthStore()
  const role = (user?.role ?? 'clinician') as NRole
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notification[]>(() =>
    ALL_NOTIFICATIONS.filter(n => n.roles.includes(role) || n.roles.includes('all'))
  )
  const panelRef = useRef<HTMLDivElement>(null)

  const unread = items.filter(n => !n.read).length

  useEffect(() => {
    setItems(ALL_NOTIFICATIONS.filter(n => n.roles.includes(role) || n.roles.includes('all')))
  }, [role])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, read: true })))
  const markRead = (id: string) => setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))

  const groups = ['today', 'yesterday', 'week'] as const
  const grouped = groups
    .map(g => ({ key: g, items: items.filter(n => n.group === g) }))
    .filter(g => g.items.length > 0)

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative h-8 w-8 rounded-lg flex items-center justify-center border transition-all duration-200"
        style={{
          borderColor: open ? '#7c3aed60' : 'var(--mn-border)',
          background: open ? '#7c3aed12' : 'transparent',
          color: open ? '#a78bfa' : 'var(--mn-text-3)',
        }}
        aria-label="Notifications"
      >
        <Bell size={14} strokeWidth={1.5} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
        )}
      </button>

      {/* Popover */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="notif-panel"
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-11 z-[200] w-[320px] rounded-2xl border shadow-2xl overflow-hidden"
            style={{
              background: 'var(--mn-card)',
              borderColor: 'var(--mn-border)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b" style={{ borderColor: 'var(--mn-border)' }}>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold" style={{ color: 'var(--mn-text-1)' }}>Notifications</p>
                {unread > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: '#7c3aed20', color: '#a78bfa', ...MONO }}>
                    {unread} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-[11px] transition-colors hover:opacity-80" style={{ color: 'var(--mn-text-3)' }}>
                    Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="h-5 w-5 flex items-center justify-center rounded transition-colors hover:opacity-70" style={{ color: 'var(--mn-text-3)' }}>
                  <X size={13} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="max-h-[440px] overflow-y-auto">
              {items.length === 0 || (unread === 0 && items.every(n => n.read)) ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: '#10b98118', border: '1px solid #10b98140' }}>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium" style={{ color: 'var(--mn-text-1)' }}>All caught up</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--mn-text-3)' }}>No new activity in your feed</p>
                  </div>
                </div>
              ) : (
                grouped.map(({ key, items: groupItems }, gi) => (
                  <div key={key}>
                    {/* Group label */}
                    <div className="px-4 py-2 sticky top-0" style={{ background: 'var(--mn-card)' }}>
                      <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--mn-text-3)', ...MONO }}>
                        {GROUP_LABELS[key]}
                      </p>
                    </div>

                    {/* Items */}
                    {groupItems.map((n, idx) => {
                      const cat = CATEGORY_STYLE[n.category]
                      const Icon = n.icon
                      return (
                        <motion.div
                          key={n.id}
                          initial={{ opacity: 0, x: 6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: gi * 0.04 + idx * 0.03 }}
                          className="group"
                        >
                          <div
                            className="flex gap-3 px-4 py-3 cursor-pointer transition-colors"
                            style={{
                              background: n.read ? 'transparent' : `${cat.color}06`,
                              borderBottom: '1px solid var(--mn-border)',
                            }}
                            onClick={() => markRead(n.id)}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--mn-nav-hover-bg)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = n.read ? 'transparent' : `${cat.color}06` }}
                          >
                            {/* Icon */}
                            <div className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: cat.bg, border: `1px solid ${cat.border}` }}>
                              <Icon size={13} style={{ color: cat.color }} strokeWidth={1.5} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-[13px] font-semibold leading-tight" style={{ color: n.read ? 'var(--mn-text-2)' : 'var(--mn-text-1)' }}>
                                  {n.title}
                                </p>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0" />}
                                  <span className="text-[11px] whitespace-nowrap" style={{ color: 'var(--mn-text-3)', ...MONO }}>{n.timestamp}</span>
                                </div>
                              </div>
                              <p className="text-[12px] mt-0.5 leading-snug" style={{ color: 'var(--mn-text-3)' }}>
                                {n.description}
                              </p>
                              {n.actionLabel && n.href && (
                                <Link href={n.href} onClick={() => { markRead(n.id); setOpen(false) }}>
                                  <span className="inline-block mt-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all" style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}>
                                    {n.actionLabel} →
                                  </span>
                                </Link>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--mn-border)', background: 'var(--mn-surface)' }}>
              <div className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[10px]" style={{ color: 'var(--mn-text-3)', ...MONO }}>
                  {role} node · live feed
                </p>
              </div>
              <button onClick={markAllRead} className="text-[11px] flex items-center gap-1 transition-colors hover:opacity-80" style={{ color: 'var(--mn-text-3)' }}>
                <Check size={11} strokeWidth={2} /> Clear all
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
