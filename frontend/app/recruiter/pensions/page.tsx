'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/lib/store'
import { toast } from '@/lib/toast'
import {
  Eye, AlertTriangle, CheckCircle2, Clock, Download,
  Bell, ShieldCheck, FileText, Zap,
} from 'lucide-react'

const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }

/* ── Audit-only view: status of all forms in the recruiter's network ── */
interface AuditRecord {
  id: string
  formType: 'A' | 'B'
  period: string
  clinicianName: string
  hospital: string
  pensionablePay: number
  memberSigned: boolean
  employerSigned: boolean
  status: 'awaiting_member' | 'awaiting_employer' | 'complete' | 'overdue'
  submittedAt: string | null
  daysSince: number | null
  nudgeSent: boolean
}

const AUDIT_RECORDS: AuditRecord[] = [
  { id: 'ar001', formType: 'A', period: 'March 2026',   clinicianName: 'Dr. James Park',    hospital: 'Royal London',       pensionablePay: 1624, memberSigned: true,  employerSigned: false, status: 'awaiting_employer', submittedAt: '27 Mar 2026', daysSince: 2,  nudgeSent: false },
  { id: 'ar002', formType: 'A', period: 'March 2026',   clinicianName: 'Dr. James Park',    hospital: "St. Mary's Trust",   pensionablePay: 1800, memberSigned: false, employerSigned: false, status: 'awaiting_member',   submittedAt: null,          daysSince: null, nudgeSent: false },
  { id: 'ar003', formType: 'A', period: 'February 2026',clinicianName: 'Dr. Anya Sharma',   hospital: 'Royal London',       pensionablePay: 2520, memberSigned: true,  employerSigned: false, status: 'overdue',           submittedAt: '13 Feb 2026', daysSince: 44, nudgeSent: true  },
  { id: 'ar004', formType: 'A', period: 'January 2026', clinicianName: 'Dr. Marcus Webb',   hospital: 'Royal London',       pensionablePay: 1200, memberSigned: true,  employerSigned: true,  status: 'complete',          submittedAt: '23 Jan 2026', daysSince: 65, nudgeSent: false },
  { id: 'ar005', formType: 'A', period: 'February 2026',clinicianName: 'Dr. Li Wei',        hospital: 'North Middlesex',    pensionablePay: 3200, memberSigned: true,  employerSigned: true,  status: 'complete',          submittedAt: '28 Feb 2026', daysSince: 29, nudgeSent: false },
  { id: 'ar006', formType: 'B', period: 'March 2026',   clinicianName: 'Dr. James Park',    hospital: 'ALL EMPLOYERS',      pensionablePay: 6682, memberSigned: false, employerSigned: false, status: 'awaiting_member',   submittedAt: null,          daysSince: null, nudgeSent: false },
]

const STATUS_CONFIG = {
  awaiting_member:   { label: 'Awaiting member',   color: '#60a5fa', bg: '#3b82f618', border: '#3b82f640', icon: Clock         },
  awaiting_employer: { label: 'Awaiting employer', color: '#f59e0b', bg: '#f59e0b18', border: '#f59e0b40', icon: Clock         },
  complete:          { label: 'Complete',           color: '#34d399', bg: '#10b98118', border: '#10b98140', icon: CheckCircle2  },
  overdue:           { label: 'Overdue',            color: '#f87171', bg: '#ef444418', border: '#ef444440', icon: AlertTriangle },
}

export default function RecruiterPensionsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const [records, setRecords] = useState<AuditRecord[]>(AUDIT_RECORDS)
  const [filterStatus, setFilterStatus] = useState<'all' | 'overdue' | 'awaiting_employer' | 'complete'>('all')
  const [nudging, setNudging] = useState<string | null>(null)

  useEffect(() => { if (!isLoading && !isAuthenticated) router.push('/login') }, [isLoading, isAuthenticated])

  const sendNudge = (id: string, hospital: string, clinician: string) => {
    setNudging(id)
    setTimeout(() => {
      setRecords(rs => rs.map(r => r.id === id ? { ...r, nudgeSent: true } : r))
      setNudging(null)
      toast.success(`Nudge sent to ${hospital} Finance re: ${clinician} Form`)
    }, 1400)
  }

  if (isLoading || !isAuthenticated) return null

  const stats = {
    total:    records.length,
    overdue:  records.filter(r => r.status === 'overdue').length,
    awaiting: records.filter(r => r.status === 'awaiting_employer').length,
    complete: records.filter(r => r.status === 'complete').length,
  }

  const filtered = filterStatus === 'all' ? records : records.filter(r => r.status === filterStatus)

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Role badge */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
              <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--mn-text-3)', ...MONO }}>workflow node · audit orchestrator</p>
            </div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--mn-text-1)' }}>Pension form status</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--mn-text-3)' }}>
              Read-only audit view. Monitor compliance and nudge employer nodes for unsigned forms.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border" style={{ background: '#7c3aed10', borderColor: '#7c3aed40' }}>
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" strokeWidth={1.5} />
            <span className="text-[11px] font-medium text-purple-400" style={MONO}>AUDIT ACCESS — Facilitator</span>
          </div>
        </div>

        {/* Read-only notice */}
        <div className="flex items-start gap-3 rounded-xl border px-4 py-3" style={{ background: '#7c3aed10', borderColor: '#7c3aed40' }}>
          <Eye className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-400" strokeWidth={1.5} />
          <div>
            <p className="text-xs font-medium text-purple-400">Read-only audit view</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--mn-text-3)' }}>
              As the workflow orchestrator you can see form status across your network but cannot edit, generate, or sign any pension forms. These are legal declarations between the physician and the NHS Pension Scheme. You may send automated nudges to employer finance nodes.
            </p>
          </div>
        </div>

        {/* Nudge rule banner */}
        {stats.overdue > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border" style={{ background: '#ef444410', borderColor: '#ef444440' }}>
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" strokeWidth={1.5} />
            <p className="text-xs" style={{ color: 'var(--mn-text-2)' }}>
              <span className="font-semibold text-red-400">{stats.overdue} overdue form{stats.overdue !== 1 ? 's' : ''}</span> — employer has not signed past the 7th of the month. Agentic nudge workflow active. Use the Nudge button to notify the hospital finance node immediately.
            </p>
          </div>
        )}

        {/* Stat row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total forms',        value: stats.total,    color: '#a78bfa', bg: '#7c3aed10', border: '#7c3aed30' },
            { label: 'Overdue',            value: stats.overdue,  color: '#f87171', bg: '#ef444410', border: '#ef444430' },
            { label: 'Awaiting employer',  value: stats.awaiting, color: '#f59e0b', bg: '#f59e0b10', border: '#f59e0b30' },
            { label: 'Complete',           value: stats.complete, color: '#34d399', bg: '#10b98110', border: '#10b98130' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border p-4 text-center" style={{ background: s.bg, borderColor: s.border }}>
              <p className="text-2xl font-bold" style={{ color: s.color, ...MONO }}>{s.value}</p>
              <p className="text-[11px] mt-1" style={{ color: 'var(--mn-text-3)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 p-1 rounded-xl border w-fit" style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
          {([
            { id: 'all',              label: `All (${records.length})` },
            { id: 'overdue',          label: `Overdue (${stats.overdue})` },
            { id: 'awaiting_employer',label: `Awaiting employer (${stats.awaiting})` },
            { id: 'complete',         label: `Complete (${stats.complete})` },
          ] as const).map(f => (
            <button key={f.id} onClick={() => setFilterStatus(f.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
              style={{
                background: filterStatus === f.id ? '#7c3aed' : 'transparent',
                color: filterStatus === f.id ? 'white' : 'var(--mn-text-3)',
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Audit table */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
          <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #7c3aed, #6d28d9, transparent)' }} />

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--mn-border)', background: 'var(--mn-surface)' }}>
                  {['Form', 'Period', 'Clinician', 'Hospital', 'Pensionable pay', 'Member', 'Employer', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: 'var(--mn-text-3)', ...MONO }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const cfg = STATUS_CONFIG[r.status]
                  return (
                    <motion.tr key={r.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ borderBottom: '1px solid var(--mn-border)' }}
                      className="hover:bg-[var(--mn-nav-hover-bg)] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--mn-text-3)' }} strokeWidth={1.5} />
                          <span className="font-medium" style={{ color: 'var(--mn-text-1)', ...MONO }}>Form {r.formType}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--mn-text-2)' }}>{r.period}</td>
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--mn-text-1)' }}>{r.clinicianName}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--mn-text-2)' }}>{r.hospital}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: 'var(--mn-text-1)', ...MONO }}>£{r.pensionablePay.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className={`h-2 w-2 rounded-full inline-block ${r.memberSigned ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                      </td>
                      <td className="px-4 py-3">
                        <div className={`h-2 w-2 rounded-full inline-block ${r.employerSigned ? 'bg-emerald-400' : r.status === 'overdue' ? 'bg-red-400 animate-pulse' : 'bg-zinc-600'}`} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-full border" style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border, ...MONO }}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {(r.status === 'awaiting_employer' || r.status === 'overdue') && !r.employerSigned && (
                            <button onClick={() => sendNudge(r.id, r.hospital, r.clinicianName)}
                              disabled={nudging === r.id || r.nudgeSent}
                              className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg border transition-all disabled:opacity-50"
                              style={{
                                borderColor: r.nudgeSent ? '#10b98140' : '#f59e0b40',
                                color: r.nudgeSent ? '#34d399' : '#f59e0b',
                                background: r.nudgeSent ? '#10b98110' : '#f59e0b10',
                              }}>
                              {nudging === r.id
                                ? <span className="h-2 w-2 rounded-full border border-amber-400 border-t-transparent animate-spin" />
                                : r.nudgeSent
                                  ? <><CheckCircle2 className="w-3 h-3" strokeWidth={2} /> Nudged</>
                                  : <><Bell className="w-3 h-3" strokeWidth={1.5} /> Nudge</>}
                            </button>
                          )}
                          {r.status === 'complete' && (
                            <button onClick={() => toast.success('Audit PDF downloaded')}
                              className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg border transition-all hover:border-purple-500/30"
                              style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)', background: 'var(--mn-surface)' }}>
                              <Download className="w-3 h-3" strokeWidth={1.5} /> Audit
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Agentic workflow status */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
          <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #7c3aed, transparent)' }} />
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" strokeWidth={1.5} />
              <p className="text-sm font-medium" style={{ color: 'var(--mn-text-1)' }}>Agentic nudge workflow</p>
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#10b98118', color: '#34d399', border: '1px solid #10b98140', ...MONO }}>active</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--mn-text-3)' }}>
              Automatically monitors all Form B submissions. If an employer node has not signed by the <strong style={{ color: 'var(--mn-text-2)' }}>7th of the month</strong>, the system sends a compliance nudge to the hospital finance node. You can also trigger manual nudges above.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Auto-nudges sent',  value: records.filter(r => r.nudgeSent).length, color: '#a78bfa' },
                { label: 'Next scheduled',    value: '7 Apr 2026', color: 'var(--mn-text-2)' },
                { label: 'Compliance rate',   value: `${Math.round((stats.complete / stats.total) * 100)}%`, color: '#34d399' },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl border p-3 text-center" style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
                  <p className="text-base font-bold" style={{ color, ...MONO }}>{value}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--mn-text-3)' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 py-2">
          <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-center text-[10px]" style={{ ...MONO, color: 'var(--mn-text-3)' }}>
            audit access only · cannot edit or sign · workflow node orchestrator · value exchange protocol
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
