'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/lib/store'
import { DEMO_CANDIDATES, DEMO_JOBS } from '@/lib/demo'
import {
  Users, Building2, Briefcase, DollarSign,
  TrendingUp, AlertCircle, CheckCircle2, Clock,
  ShieldCheck, Activity, Zap, Globe,
} from 'lucide-react'

const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }

const PLATFORM_STATS = [
  { label: 'Total clinicians',  value: '1,284', sub: '+12 this week',   icon: Users,       color: '#818cf8', trend: 'up' },
  { label: 'Active employers',  value: '47',    sub: '3 pending review', icon: Building2,   color: '#34d399', trend: 'up' },
  { label: 'Recruiters',        value: '19',    sub: '2 trial ending',   icon: Briefcase,   color: '#f59e0b', trend: 'neutral' },
  { label: 'MRR',               value: '£62.4k',sub: '+8.2% vs last mo', icon: DollarSign,  color: '#10b981', trend: 'up' },
  { label: 'Active placements', value: '214',   sub: 'across 31 trusts', icon: Activity,    color: '#a78bfa', trend: 'up' },
  { label: 'Compliance flags',  value: '7',     sub: '3 critical',       icon: AlertCircle, color: '#f87171', trend: 'down' },
  { label: 'Pension forms',     value: '38',    sub: '12 awaiting sign',  icon: ShieldCheck, color: '#60a5fa', trend: 'neutral' },
  { label: 'Avg match score',   value: '91%',   sub: 'AI-ranked pool',   icon: Zap,         color: '#34d399', trend: 'up' },
]

const ROLE_BREAKDOWN = [
  { role: 'Clinicians',   count: 1284, active: 847,  trial: 0,   pct: 66 },
  { role: 'Employers',    count: 47,   active: 44,   trial: 3,   pct: 94 },
  { role: 'Recruiters',   count: 19,   active: 17,   trial: 2,   pct: 89 },
]

const RECENT_ACTIVITY = [
  { time: '2 min ago',  event: 'New clinician registered',     detail: 'Dr. J. Obi · Cardiology · London',          type: 'user'   },
  { time: '11 min ago', event: 'Payment confirmed',             detail: 'Mednode Recruitment Ltd · £799.00',          type: 'payment'},
  { time: '34 min ago', event: 'Compliance flag raised',        detail: 'Dr. B. Hassan · DBS expiring in 7 days',     type: 'alert'  },
  { time: '1 hr ago',   event: 'Employer verified',             detail: 'Leeds Teaching Hospitals NHS Trust',          type: 'user'   },
  { time: '2 hr ago',   event: 'Pension Form A signed',         detail: 'Royal London NHS · Dr. A. Sterling',         type: 'pension'},
  { time: '3 hr ago',   event: 'AI ranking recalibrated',       detail: '1,284 nodes re-scored',                      type: 'system' },
  { time: '5 hr ago',   event: 'Invoice dispatched',            detail: 'QEH Birmingham NHS · £299.00 · March 2026',  type: 'payment'},
  { time: '8 hr ago',   event: 'Recruiter trial expiring',      detail: 'Apex Medical Staffing · 2 days remaining',   type: 'alert'  },
]

const SYSTEM_HEALTH = [
  { label: 'API gateway',         status: 'Operational', ms: '42ms'  },
  { label: 'AI ranking engine',   status: 'Operational', ms: '180ms' },
  { label: 'Compliance scanner',  status: 'Operational', ms: '95ms'  },
  { label: 'Payment processor',   status: 'Operational', ms: '210ms' },
  { label: 'Pension gateway',     status: 'Degraded',    ms: '620ms' },
  { label: 'Document store',      status: 'Operational', ms: '55ms'  },
]

const typeStyle: Record<string, { bg: string; color: string; label: string }> = {
  user:    { bg: '#818cf818', color: '#818cf8', label: 'USER'    },
  payment: { bg: '#10b98118', color: '#34d399', label: 'PAYMENT' },
  alert:   { bg: '#f8717118', color: '#f87171', label: 'ALERT'   },
  pension: { bg: '#60a5fa18', color: '#60a5fa', label: 'PENSION' },
  system:  { bg: '#a78bfa18', color: '#a78bfa', label: 'SYSTEM'  },
}

export default function SuperAdminDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || user?.role !== 'superadmin') { router.push('/login'); return }
  }, [isLoading, isAuthenticated, user])

  if (isLoading || !isAuthenticated || user?.role !== 'superadmin') return null

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#f87171', ...MONO }}>Super admin</span>
            </div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--mn-text-1)' }}>Platform overview</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--mn-text-3)' }}>{"Bird's-eye view · All roles · Live data"}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs"
            style={{ borderColor: '#f8717130', background: '#f8717108', color: '#f87171', ...MONO }}>
            <Globe className="w-3 h-3" strokeWidth={1.5} /> admin@mednode.cloud
          </div>
        </div>

        {/* ── KPI grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PLATFORM_STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="rounded-2xl border p-4" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: s.color + '18', border: `1px solid ${s.color}30` }}>
                  <s.icon className="w-4 h-4" style={{ color: s.color }} strokeWidth={1.5} />
                </div>
                <span className="text-[10px]" style={{ color: s.trend === 'up' ? '#34d399' : s.trend === 'down' ? '#f87171' : 'var(--mn-text-3)', ...MONO }}>
                  {s.trend === 'up' ? '▲' : s.trend === 'down' ? '▼' : '—'}
                </span>
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--mn-text-1)', ...MONO }}>{s.value}</p>
              <p className="text-[11px] mt-0.5 font-medium" style={{ color: 'var(--mn-text-2)' }}>{s.label}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--mn-text-3)' }}>{s.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">

          {/* Left column */}
          <div className="space-y-4">

            {/* Role breakdown */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
              <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--mn-border)', background: 'var(--mn-surface)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--mn-text-1)' }}>Role breakdown</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#f8717118', color: '#f87171', ...MONO }}>Live</span>
              </div>
              <div className="p-5 space-y-4">
                {ROLE_BREAKDOWN.map(({ role, count, active, trial, pct }) => (
                  <div key={role}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium" style={{ color: 'var(--mn-text-1)' }}>{role}</p>
                        {trial > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: '#f59e0b18', color: '#f59e0b', ...MONO }}>{trial} trial</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs" style={{ color: 'var(--mn-text-3)', ...MONO }}>{active}/{count} active</span>
                        <span className="text-sm font-bold" style={{ color: 'var(--mn-text-1)', ...MONO }}>{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--mn-border)' }}>
                      <motion.div className="h-full rounded-full" style={{ background: '#f87171', width: `${pct}%` }}
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--mn-border)', background: 'var(--mn-surface)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--mn-text-1)' }}>Recent platform activity</p>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--mn-border)' }}>
                {RECENT_ACTIVITY.map((a, i) => {
                  const ts = typeStyle[a.type]
                  return (
                    <div key={i} className="flex items-start gap-3 px-5 py-3">
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full mt-0.5 flex-shrink-0"
                        style={{ background: ts.bg, color: ts.color, border: `1px solid ${ts.color}30`, ...MONO }}>
                        {ts.label}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium" style={{ color: 'var(--mn-text-1)' }}>{a.event}</p>
                        <p className="text-[11px] truncate" style={{ color: 'var(--mn-text-3)' }}>{a.detail}</p>
                      </div>
                      <span className="text-[10px] flex-shrink-0 mt-0.5" style={{ color: 'var(--mn-text-3)', ...MONO }}>{a.time}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">

            {/* System health */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--mn-border)', background: 'var(--mn-surface)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--mn-text-1)' }}>System health</p>
              </div>
              <div className="p-5 space-y-3">
                {SYSTEM_HEALTH.map(({ label, status, ms }) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`h-2 w-2 rounded-full flex-shrink-0 ${status === 'Operational' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className="text-xs truncate" style={{ color: 'var(--mn-text-2)' }}>{label}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px]" style={{ color: 'var(--mn-text-3)', ...MONO }}>{ms}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{
                          background: status === 'Operational' ? '#10b98115' : '#f59e0b15',
                          color: status === 'Operational' ? '#34d399' : '#f59e0b',
                          ...MONO,
                        }}>
                        {status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Open bids snapshot */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--mn-border)', background: 'var(--mn-surface)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--mn-text-1)' }}>Open bids</p>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--mn-border)' }}>
                {DEMO_JOBS.slice(0, 4).map(j => (
                  <div key={j.id} className="flex items-center justify-between gap-2 px-5 py-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: 'var(--mn-text-1)' }}>{j.title}</p>
                      <p className="text-[11px]" style={{ color: 'var(--mn-text-3)' }}>{j.company_name}</p>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: '#10b98115', color: '#34d399', ...MONO }}>
                      {j.application_count} apps
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Protocol footer */}
        <div className="flex items-center justify-center gap-2 py-2">
          <span className="h-1 w-1 rounded-full bg-red-500 animate-pulse" />
          <p className="text-[10px]" style={{ ...MONO, color: 'var(--mn-text-3)' }}>
            superadmin protocol · sovereign oversight · all roles visible
          </p>
        </div>

      </div>
    </DashboardLayout>
  )
}
