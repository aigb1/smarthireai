'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/lib/store'
import {
  DollarSign, TrendingUp, AlertCircle, CheckCircle2,
  Download, RefreshCw, Clock, Receipt, Search, X, Ban,
} from 'lucide-react'
import { toast } from '@/lib/toast'

const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }

type PayStatus = 'all' | 'paid' | 'pending' | 'failed' | 'refunded'

const PAYMENT_STATS = [
  { label: 'MRR',           value: '£62,400', sub: '+8.2% vs last month', color: '#34d399', Icon: TrendingUp   },
  { label: 'ARR',           value: '£748,800',sub: 'Annualised run rate',  color: '#818cf8', Icon: DollarSign  },
  { label: 'Failed this mo',value: '3',       sub: '£897 at risk',         color: '#f87171', Icon: AlertCircle },
  { label: 'Pending',       value: '£4,180',  sub: '7 invoices',           color: '#f59e0b', Icon: Clock       },
]

const TRANSACTIONS = [
  { id: 'txn-001', name: 'Agent Recruiter',         plan: 'Enterprise',   amount: '£799.00', date: '15 Mar 2026', status: 'paid',     method: 'Mastercard ···· 0813' },
  { id: 'txn-002', name: 'Royal London NHS Trust',  plan: 'Professional', amount: '£299.00', date: '1 Mar 2026',  status: 'paid',     method: 'Visa ···· 4242'       },
  { id: 'txn-003', name: 'MedForce Recruitment',    plan: 'Professional', amount: '£399.00', date: '5 Mar 2026',  status: 'paid',     method: 'Visa ···· 9910'       },
  { id: 'txn-004', name: 'Leeds Teaching Hospitals',plan: 'Starter',      amount: '£149.00', date: '14 Mar 2026', status: 'paid',     method: 'Amex ···· 3311'       },
  { id: 'txn-005', name: 'QEH Birmingham NHS Trust',plan: 'Trial',        amount: '£0.00',   date: '20 Mar 2026', status: 'pending',  method: '—'                    },
  { id: 'txn-006', name: 'Apex Medical Staffing',   plan: 'Trial',        amount: '£0.00',   date: '18 Mar 2026', status: 'pending',  method: '—'                    },
  { id: 'txn-007', name: 'North Bristol NHS Trust', plan: 'Starter',      amount: '£149.00', date: '5 Mar 2026',  status: 'failed',   method: 'Visa ···· 7723'       },
  { id: 'txn-008', name: 'Royal London NHS Trust',  plan: 'Professional', amount: '£299.00', date: '1 Feb 2026',  status: 'paid',     method: 'Visa ···· 4242'       },
  { id: 'txn-009', name: 'Agent Recruiter',         plan: 'Enterprise',   amount: '£799.00', date: '15 Feb 2026', status: 'paid',     method: 'Mastercard ···· 0813' },
  { id: 'txn-010', name: 'MedForce Recruitment',    plan: 'Professional', amount: '£399.00', date: '5 Feb 2026',  status: 'refunded', method: 'Visa ···· 9910'       },
]

const statusStyle: Record<string, { bg: string; color: string }> = {
  paid:     { bg: '#10b98115', color: '#34d399' },
  pending:  { bg: '#f59e0b15', color: '#f59e0b' },
  failed:   { bg: '#f8717115', color: '#f87171' },
  refunded: { bg: '#818cf815', color: '#818cf8' },
}

const MRR_BARS = [
  { month: 'Oct', value: 44200 }, { month: 'Nov', value: 48100 }, { month: 'Dec', value: 51300 },
  { month: 'Jan', value: 55600 }, { month: 'Feb', value: 57700 }, { month: 'Mar', value: 62400 },
]
const MAX_MRR = Math.max(...MRR_BARS.map(b => b.value))

export default function SuperAdminPayments() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const [statusFilter, setStatusFilter] = useState<PayStatus>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || user?.role !== 'superadmin') { router.push('/login'); return }
  }, [isLoading, isAuthenticated, user])

  if (isLoading || !isAuthenticated || user?.role !== 'superadmin') return null

  const filtered = TRANSACTIONS.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <DashboardLayout>
      <div className="space-y-5">

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#f87171', ...MONO }}>Super admin</span>
          </div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--mn-text-1)' }}>Payments &amp; billing</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--mn-text-3)' }}>All subscriptions · Revenue · Override controls</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PAYMENT_STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl border p-4" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
              <div className="h-8 w-8 rounded-lg flex items-center justify-center mb-3"
                style={{ background: s.color + '18', border: `1px solid ${s.color}30` }}>
                <s.Icon className="w-4 h-4" style={{ color: s.color }} strokeWidth={1.5} />
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--mn-text-1)', ...MONO }}>{s.value}</p>
              <p className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--mn-text-2)' }}>{s.label}</p>
              <p className="text-[10px]" style={{ color: 'var(--mn-text-3)' }}>{s.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">

          {/* Transaction table */}
          <div className="space-y-3">

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-1 min-w-[180px] rounded-xl border px-3 py-2"
                style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
                <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--mn-text-3)' }} strokeWidth={1.5} />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Filter by account…" className="flex-1 bg-transparent text-xs focus:outline-none"
                  style={{ color: 'var(--mn-text-1)' }} />
                {search && <button onClick={() => setSearch('')}><X className="w-3 h-3" style={{ color: 'var(--mn-text-3)' }} /></button>}
              </div>
              {(['all','paid','pending','failed','refunded'] as PayStatus[]).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className="px-3 py-2 rounded-xl border text-[11px] font-medium capitalize transition-all"
                  style={{
                    borderColor: statusFilter === s ? '#f8717160' : 'var(--mn-border)',
                    background: statusFilter === s ? '#f8717115' : 'var(--mn-surface)',
                    color: statusFilter === s ? '#f87171' : 'var(--mn-text-3)',
                  }}>
                  {s}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
              <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: 'var(--mn-border)', background: 'var(--mn-surface)' }}>
                <p className="text-xs font-semibold" style={{ color: 'var(--mn-text-2)' }}>{filtered.length} transactions</p>
                <button onClick={() => toast.success('Exporting transaction history…')}
                  className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border transition-all"
                  style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)', background: 'var(--mn-surface)' }}>
                  <Download className="w-3 h-3" strokeWidth={1.5} /> Export CSV
                </button>
              </div>

              <div className="divide-y" style={{ borderColor: 'var(--mn-border)' }}>
                {filtered.map((t, i) => {
                  const badge = statusStyle[t.status]
                  return (
                    <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="flex items-center gap-4 px-5 py-3.5">
                      <div className="h-8 w-8 rounded-lg border flex items-center justify-center flex-shrink-0"
                        style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
                        <Receipt className="w-3.5 h-3.5" style={{ color: 'var(--mn-text-3)' }} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate" style={{ color: 'var(--mn-text-1)' }}>{t.name}</p>
                        <p className="text-[11px]" style={{ color: 'var(--mn-text-3)', ...MONO }}>{t.plan} · {t.method}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-[10px]" style={{ color: 'var(--mn-text-3)', ...MONO }}>{t.date}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full capitalize"
                          style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.color}30`, ...MONO }}>
                          {t.status}
                        </span>
                        <span className="text-sm font-bold w-16 text-right" style={{ color: 'var(--mn-text-1)', ...MONO }}>{t.amount}</span>
                        <div className="flex gap-1">
                          <button onClick={() => toast.success(`Invoice ${t.id} downloaded`)}
                            className="h-7 w-7 rounded-lg border flex items-center justify-center"
                            style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)', background: 'var(--mn-surface)' }}>
                            <Download className="w-3 h-3" strokeWidth={1.5} />
                          </button>
                          {t.status === 'failed' && (
                            <button onClick={() => toast.info(`Retry triggered for ${t.name}`)}
                              className="h-7 w-7 rounded-lg border flex items-center justify-center"
                              style={{ borderColor: '#f8717140', color: '#f87171', background: '#f8717110' }}>
                              <RefreshCw className="w-3 h-3" strokeWidth={1.5} />
                            </button>
                          )}
                          {t.status === 'paid' && (
                            <button onClick={() => toast.info(`Refund initiated for ${t.name} — ${t.amount}`)}
                              className="h-7 w-7 rounded-lg border flex items-center justify-center"
                              style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)', background: 'var(--mn-surface)' }}>
                              <Ban className="w-3 h-3" strokeWidth={1.5} />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* MRR chart */}
          <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--mn-border)', background: 'var(--mn-surface)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--mn-text-1)' }}>MRR trend</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--mn-text-3)' }}>Oct 2025 → Mar 2026</p>
            </div>
            <div className="p-5">
              <div className="flex items-end justify-between gap-2 h-36">
                {MRR_BARS.map(({ month, value }, i) => (
                  <div key={month} className="flex flex-col items-center gap-1 flex-1">
                    <span className="text-[9px]" style={{ color: '#34d399', ...MONO }}>
                      £{(value/1000).toFixed(0)}k
                    </span>
                    <motion.div className="w-full rounded-t-md" style={{ background: 'linear-gradient(to top, #10b981, #34d399)' }}
                      initial={{ height: 0 }}
                      animate={{ height: `${(value / MAX_MRR) * 100}px` }}
                      transition={{ duration: 0.6, delay: i * 0.08 }} />
                    <span className="text-[9px]" style={{ color: 'var(--mn-text-3)', ...MONO }}>{month}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2">
                {[
                  { label: 'Employer subs',   value: '£20.3k', color: '#34d399' },
                  { label: 'Recruiter subs',  value: '£39.2k', color: '#818cf8' },
                  { label: 'Commission',      value: '£2.9k',  color: '#f59e0b' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="text-xs" style={{ color: 'var(--mn-text-2)' }}>{label}</span>
                    </div>
                    <span className="text-xs font-bold" style={{ color, ...MONO }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}
