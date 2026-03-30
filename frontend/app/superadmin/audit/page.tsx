'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/lib/store'
import {
  ScrollText, Search, X, Download, Filter,
  ShieldCheck, DollarSign, Users, Zap, Globe,
  AlertCircle, Settings, FileText,
} from 'lucide-react'
import { toast } from '@/lib/toast'

const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }

type LogType = 'all' | 'auth' | 'payment' | 'compliance' | 'data' | 'system' | 'admin'

const AUDIT_LOG = [
  { id: 'log-001', ts: '2026-03-29 05:42:11', type: 'auth',       actor: 'admin@mednode.cloud',           action: 'Superadmin login',                      detail: 'IP: 93.184.216.34 · Browser: Chrome 123' },
  { id: 'log-002', ts: '2026-03-29 05:38:04', type: 'data',       actor: 'agent@mednode.cloud',           action: 'Candidate profile viewed',              detail: 'Dr. A. Sterling · cand-03' },
  { id: 'log-003', ts: '2026-03-29 05:21:50', type: 'compliance', actor: 'System',                        action: 'DBS expiry flag raised',                detail: 'Dr. B. Hassan · expires 22 Apr 2026' },
  { id: 'log-004', ts: '2026-03-29 04:59:00', type: 'payment',    actor: 'Stripe webhook',                action: 'Payment confirmed',                     detail: 'Mednode Recruitment Ltd · £799.00 · inv-Mar-2026' },
  { id: 'log-005', ts: '2026-03-29 03:15:33', type: 'data',       actor: 'trust@mednode.cloud',           action: 'Pension Form A signed',                 detail: 'Dr. A. Sterling · Royal London NHS' },
  { id: 'log-006', ts: '2026-03-29 02:44:18', type: 'system',     actor: 'AI engine',                     action: 'Ranking cache rebuilt',                 detail: '1,284 nodes re-scored · avg latency 180ms' },
  { id: 'log-007', ts: '2026-03-29 01:30:05', type: 'auth',       actor: 'nbh@mednode.cloud',             action: 'Login failed (3× attempts)',            detail: 'Account locked for 30 min · IP: 185.93.4.12' },
  { id: 'log-008', ts: '2026-03-28 23:00:00', type: 'system',     actor: 'Scheduler',                     action: 'Nightly compliance scan',               detail: '1,284 clinicians checked · 7 flags raised' },
  { id: 'log-009', ts: '2026-03-28 21:44:12', type: 'admin',      actor: 'admin@mednode.cloud',           action: 'Account suspended',                     detail: 'North Bristol NHS Trust · nbh@mednode.cloud' },
  { id: 'log-010', ts: '2026-03-28 20:05:30', type: 'payment',    actor: 'Stripe webhook',                action: 'Payment failed',                        detail: 'North Bristol NHS Trust · £149.00 · card declined' },
  { id: 'log-011', ts: '2026-03-28 18:31:22', type: 'data',       actor: 'dr.morgan@mednode.cloud',       action: 'Pension Form B downloaded',             detail: 'NHS Pension Form B · member signed' },
  { id: 'log-012', ts: '2026-03-28 17:10:09', type: 'compliance', actor: 'System',                        action: 'GMC re-validation queued',              detail: 'Dr. C. Nakamura · GMC #6892341' },
  { id: 'log-013', ts: '2026-03-28 15:55:40', type: 'auth',       actor: 'apex@mednode.cloud',            action: 'New recruiter registered',              detail: 'Apex Medical Staffing · trial started' },
  { id: 'log-014', ts: '2026-03-28 14:22:18', type: 'admin',      actor: 'admin@mednode.cloud',           action: 'Global rate ceiling updated',           detail: '£110/hr → £120/hr' },
  { id: 'log-015', ts: '2026-03-28 12:00:01', type: 'system',     actor: 'Scheduler',                     action: 'Invoice batch dispatched',              detail: '6 invoices · total £2,044.00' },
  { id: 'log-016', ts: '2026-03-28 10:45:33', type: 'data',       actor: 'agent@mednode.cloud',           action: 'Placement request submitted',           detail: 'Dr. M. Patel → QEH Birmingham · £110/hr' },
  { id: 'log-017', ts: '2026-03-28 09:12:08', type: 'compliance', actor: 'System',                        action: 'Right-to-work check completed',         detail: 'Dr. F. Okonkwo · verified via UKVI API' },
  { id: 'log-018', ts: '2026-03-27 23:59:59', type: 'system',     actor: 'Scheduler',                     action: 'Monthly MRR snapshot saved',            detail: 'MRR: £62,400 · ARR: £748,800' },
]

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; Icon: any }> = {
  auth:       { label: 'AUTH',       color: '#818cf8', bg: '#818cf815', Icon: Users       },
  payment:    { label: 'PAYMENT',    color: '#34d399', bg: '#10b98115', Icon: DollarSign  },
  compliance: { label: 'COMPLIANCE', color: '#f59e0b', bg: '#f59e0b15', Icon: ShieldCheck },
  data:       { label: 'DATA',       color: '#60a5fa', bg: '#60a5fa15', Icon: FileText    },
  system:     { label: 'SYSTEM',     color: '#a78bfa', bg: '#a78bfa15', Icon: Zap         },
  admin:      { label: 'ADMIN',      color: '#f87171', bg: '#f8717115', Icon: Settings    },
}

const LOG_SUMMARY = [
  { label: 'Auth events',      count: AUDIT_LOG.filter(l=>l.type==='auth').length,       color: '#818cf8' },
  { label: 'Data events',      count: AUDIT_LOG.filter(l=>l.type==='data').length,       color: '#60a5fa' },
  { label: 'Compliance',       count: AUDIT_LOG.filter(l=>l.type==='compliance').length, color: '#f59e0b' },
  { label: 'System',           count: AUDIT_LOG.filter(l=>l.type==='system').length,     color: '#a78bfa' },
  { label: 'Payment',          count: AUDIT_LOG.filter(l=>l.type==='payment').length,    color: '#34d399' },
  { label: 'Admin overrides',  count: AUDIT_LOG.filter(l=>l.type==='admin').length,      color: '#f87171' },
]

export default function SuperAdminAudit() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const [typeFilter, setTypeFilter] = useState<LogType>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || user?.role !== 'superadmin') { router.push('/login'); return }
  }, [isLoading, isAuthenticated, user])

  if (isLoading || !isAuthenticated || user?.role !== 'superadmin') return null

  const filtered = AUDIT_LOG.filter(l => {
    if (typeFilter !== 'all' && l.type !== typeFilter) return false
    if (search && !l.action.toLowerCase().includes(search.toLowerCase()) &&
        !l.actor.toLowerCase().includes(search.toLowerCase()) &&
        !l.detail.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <DashboardLayout>
      <div className="space-y-4">

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#f87171', ...MONO }}>Super admin</span>
          </div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--mn-text-1)' }}>Audit log</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--mn-text-3)' }}>Immutable event trail · All roles · All actions</p>
        </div>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setTypeFilter('all')}
            className="px-3 py-1.5 rounded-full border text-xs font-medium transition-all"
            style={{
              borderColor: typeFilter === 'all' ? '#f8717160' : 'var(--mn-border)',
              background: typeFilter === 'all' ? '#f8717115' : 'var(--mn-surface)',
              color: typeFilter === 'all' ? '#f87171' : 'var(--mn-text-3)',
            }}>
            All <span style={MONO}>{AUDIT_LOG.length}</span>
          </button>
          {LOG_SUMMARY.map(({ label, count, color }) => {
            const id = label.split(' ')[0].toLowerCase() as LogType
            return (
              <button key={label} onClick={() => setTypeFilter(id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all"
                style={{
                  borderColor: typeFilter === id ? color + '60' : 'var(--mn-border)',
                  background: typeFilter === id ? color + '15' : 'var(--mn-surface)',
                  color: typeFilter === id ? color : 'var(--mn-text-3)',
                }}>
                {label} <span style={MONO}>{count}</span>
              </button>
            )
          })}
        </div>

        {/* Search + export */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] rounded-xl border px-3 py-2"
            style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--mn-text-3)' }} strokeWidth={1.5} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search events, actors, details…"
              className="flex-1 bg-transparent text-sm focus:outline-none"
              style={{ color: 'var(--mn-text-1)' }} />
            {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5" style={{ color: 'var(--mn-text-3)' }} /></button>}
          </div>
          <button onClick={() => toast.success('Audit log export queued — you will receive an email')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all"
            style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-2)', background: 'var(--mn-surface)' }}>
            <Download className="w-3.5 h-3.5" strokeWidth={1.5} /> Export
          </button>
        </div>

        {/* Log table */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
          <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: 'var(--mn-border)', background: 'var(--mn-surface)' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--mn-text-2)' }}>{filtered.length} events</p>
            <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--mn-text-3)', ...MONO }}>
              <Globe className="w-3 h-3" strokeWidth={1.5} />
              Immutable · tamper-evident
            </div>
          </div>

          <div className="divide-y" style={{ borderColor: 'var(--mn-border)' }}>
            {filtered.map((log, i) => {
              const cfg = TYPE_CONFIG[log.type]
              return (
                <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.015 }}
                  className="flex items-start gap-4 px-5 py-3.5">
                  <div className="h-7 w-7 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: cfg.bg, borderColor: cfg.color + '30' }}>
                    <cfg.Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30`, ...MONO }}>
                        {cfg.label}
                      </span>
                      <p className="text-xs font-semibold" style={{ color: 'var(--mn-text-1)' }}>{log.action}</p>
                    </div>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--mn-text-3)' }}>{log.detail}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--mn-text-3)', ...MONO }}>
                      {log.actor}
                    </p>
                  </div>
                  <span className="text-[10px] flex-shrink-0 mt-0.5 tabular-nums" style={{ color: 'var(--mn-text-3)', ...MONO }}>
                    {log.ts}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}
