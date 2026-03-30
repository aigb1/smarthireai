'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/lib/store'
import { toast } from '@/lib/toast'
import {
  FileText, CheckCircle2, Clock, AlertTriangle, Download,
  PenLine, Eye, ChevronDown, ChevronUp, ShieldCheck, Zap,
} from 'lucide-react'

const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }

/* ── Shared demo pension records (clinician-owned) ── */
export interface PensionRecord {
  id: string
  formType: 'A' | 'B'
  period: string
  hospital: string
  hospitalNode: string
  shifts: { date: string; ward: string; hours: number; rate: number; pensionablePay: number }[]
  totalGross: number
  totalPensionable: number
  employeeRate: number
  employeeAmount: number
  employerAmount: number
  memberSigned: boolean
  memberSignedAt: string | null
  employerSigned: boolean
  employerSignedAt: string | null
  status: 'draft' | 'awaiting_employer' | 'complete' | 'overdue'
  submittedAt: string | null
}

const DEMO_RECORDS: PensionRecord[] = [
  {
    id: 'pf001', formType: 'A', period: 'March 2026',
    hospital: "St. Mary's Trust", hospitalNode: 'SMT_001',
    shifts: [
      { date: '28 Mar 2026', ward: 'A&E',       hours: 12, rate: 100, pensionablePay: 1200 },
      { date: '18 Mar 2026', ward: 'Emergency',  hours: 6,  rate: 100, pensionablePay: 600  },
    ],
    totalGross: 1800, totalPensionable: 1800,
    employeeRate: 11.3, employeeAmount: 203.40, employerAmount: 259.00,
    memberSigned: false, memberSignedAt: null,
    employerSigned: false, employerSignedAt: null,
    status: 'draft', submittedAt: null,
  },
  {
    id: 'pf002', formType: 'A', period: 'March 2026',
    hospital: 'Royal London', hospitalNode: 'RLH_001',
    shifts: [
      { date: '26 Mar 2026', ward: 'ICU',        hours: 8,  rate: 110, pensionablePay: 880  },
      { date: '15 Mar 2026', ward: 'Gastro',      hours: 8,  rate: 93,  pensionablePay: 744  },
    ],
    totalGross: 1624, totalPensionable: 1624,
    employeeRate: 11.3, employeeAmount: 183.51, employerAmount: 233.53,
    memberSigned: true, memberSignedAt: '27 Mar 2026 09:41',
    employerSigned: false, employerSignedAt: null,
    status: 'awaiting_employer', submittedAt: '27 Mar 2026',
  },
  {
    id: 'pf003', formType: 'A', period: 'February 2026',
    hospital: 'City General', hospitalNode: 'CG_001',
    shifts: [
      { date: '24 Feb 2026', ward: 'Cardiology',  hours: 12, rate: 90,  pensionablePay: 1080 },
      { date: '17 Feb 2026', ward: 'Cardiology',  hours: 12, rate: 90,  pensionablePay: 1080 },
    ],
    totalGross: 2160, totalPensionable: 2160,
    employeeRate: 11.3, employeeAmount: 244.08, employerAmount: 310.64,
    memberSigned: true,  memberSignedAt: '25 Feb 2026 11:02',
    employerSigned: true, employerSignedAt: '02 Mar 2026 14:30',
    status: 'complete', submittedAt: '25 Feb 2026',
  },
  {
    id: 'pf004', formType: 'B', period: 'March 2026',
    hospital: 'ALL EMPLOYERS', hospitalNode: 'MULTI',
    shifts: [],
    totalGross: 7258, totalPensionable: 6682,
    employeeRate: 11.3, employeeAmount: 755.07, employerAmount: 960.47,
    memberSigned: false, memberSignedAt: null,
    employerSigned: false, employerSignedAt: null,
    status: 'draft', submittedAt: null,
  },
]

const STATUS_CONFIG = {
  draft:             { label: 'Draft',                  color: '#60a5fa', bg: '#3b82f618', border: '#3b82f640', icon: FileText },
  awaiting_employer: { label: 'Awaiting employer',      color: '#f59e0b', bg: '#f59e0b18', border: '#f59e0b40', icon: Clock    },
  complete:          { label: 'Complete',               color: '#34d399', bg: '#10b98118', border: '#10b98140', icon: CheckCircle2 },
  overdue:           { label: 'Overdue',                color: '#f87171', bg: '#ef444418', border: '#ef444440', icon: AlertTriangle },
}

export default function ClinicianPensionsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const [records, setRecords] = useState<PensionRecord[]>(DEMO_RECORDS)
  const [activeTab, setActiveTab] = useState<'A' | 'B'>('A')
  const [expanded, setExpanded] = useState<string | null>('pf001')
  const [signing, setSigning] = useState<string | null>(null)

  useEffect(() => { if (!isLoading && !isAuthenticated) router.push('/login') }, [isLoading, isAuthenticated])

  const memberSign = (id: string) => {
    setSigning(id)
    setTimeout(() => {
      setRecords(rs => rs.map(r => r.id === id ? {
        ...r,
        memberSigned: true,
        memberSignedAt: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        status: 'awaiting_employer',
        submittedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      } : r))
      setSigning(null)
      toast.success('Member declaration signed. Form submitted to employer via mesh.')
    }, 1600)
  }

  if (isLoading || !isAuthenticated) return null

  const filtered = records.filter(r => r.formType === activeTab)
  const stats = {
    complete: records.filter(r => r.status === 'complete').length,
    awaiting: records.filter(r => r.status === 'awaiting_employer').length,
    draft:    records.filter(r => r.status === 'draft').length,
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Role badge */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--mn-text-3)', ...MONO }}>physician node · form originator</p>
            </div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--mn-text-1)' }}>NHS Pension Forms</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--mn-text-3)' }}>
              Auto-generated from your wallet. Sign the member declaration, then submit to each employer via the mesh.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border" style={{ background: '#10b98110', borderColor: '#10b98140' }}>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
            <span className="text-[11px] font-medium text-emerald-400" style={MONO}>FULL ACCESS — Owner</span>
          </div>
        </div>

        {/* Stat row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Complete', value: stats.complete, color: '#34d399', bg: '#10b98110', border: '#10b98130' },
            { label: 'Awaiting employer', value: stats.awaiting, color: '#f59e0b', bg: '#f59e0b10', border: '#f59e0b30' },
            { label: 'Draft', value: stats.draft, color: '#60a5fa', bg: '#3b82f610', border: '#3b82f630' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border p-4 text-center" style={{ background: s.bg, borderColor: s.border }}>
              <p className="text-2xl font-bold" style={{ color: s.color, ...MONO }}>{s.value}</p>
              <p className="text-[11px] mt-1" style={{ color: 'var(--mn-text-3)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Form type tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl border w-fit" style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
          {(['A', 'B'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className="px-6 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: activeTab === t ? '#7c3aed' : 'transparent',
                color: activeTab === t ? 'white' : 'var(--mn-text-3)',
              }}>
              Form {t}{t === 'A' ? ' — Record of Pay' : ' — Monthly Summary'}
            </button>
          ))}
        </div>

        {/* Form A description */}
        <div className="rounded-xl border px-4 py-3 flex gap-3" style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
          <Zap className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-400" strokeWidth={1.5} />
          <p className="text-xs leading-relaxed" style={{ color: 'var(--mn-text-3)' }}>
            {activeTab === 'A'
              ? 'Form A records your pensionable pay for each employer. It is auto-populated from your settled wallet transactions. You sign the member declaration; the employer then certifies and signs the employer section.'
              : 'Form B is a monthly summary of total pensionable earnings across all employers. It is generated automatically at the end of each month and submitted to NHSBSA after both member and employer sections are complete.'}
          </p>
        </div>

        {/* Records list */}
        <div className="space-y-3">
          {filtered.map(r => {
            const cfg = STATUS_CONFIG[r.status]
            const StatusIcon = cfg.icon
            const isOpen = expanded === r.id
            return (
              <motion.div key={r.id} layout className="rounded-2xl border overflow-hidden" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
                {/* Purple top accent for complete, amber for awaiting */}
                <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${cfg.color}, transparent)` }} />

                {/* Header row */}
                <button className="w-full flex items-center gap-4 p-4 text-left" onClick={() => setExpanded(isOpen ? null : r.id)}>
                  <div className="h-10 w-10 rounded-xl border flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg, borderColor: cfg.border }}>
                    <FileText className="w-4 h-4" style={{ color: cfg.color }} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold" style={{ color: 'var(--mn-text-1)' }}>
                        Form {r.formType} — {r.period}
                      </p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border" style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border, ...MONO }}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--mn-text-3)' }}>
                      {r.hospital} · Pensionable pay: £{r.totalPensionable.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs font-semibold" style={{ color: 'var(--mn-text-1)', ...MONO }}>£{r.employeeAmount.toFixed(2)}</p>
                      <p className="text-[10px]" style={{ color: 'var(--mn-text-3)' }}>your contrib.</p>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--mn-text-3)' }} /> : <ChevronDown className="w-4 h-4" style={{ color: 'var(--mn-text-3)' }} />}
                  </div>
                </button>

                {/* Expanded detail */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="border-t px-4 pb-5 space-y-4" style={{ borderColor: 'var(--mn-border)' }}>

                        {/* Shifts table (Form A) */}
                        {r.formType === 'A' && r.shifts.length > 0 && (
                          <div className="mt-4">
                            <p className="text-[11px] mb-2 font-medium" style={{ color: 'var(--mn-text-3)', ...MONO }}>auto-generated from wallet</p>
                            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--mn-border)' }}>
                              <table className="w-full text-xs">
                                <thead>
                                  <tr style={{ background: 'var(--mn-surface)', borderBottom: '1px solid var(--mn-border)' }}>
                                    {['Date', 'Ward', 'Hours', 'Rate', 'Pensionable pay'].map(h => (
                                      <th key={h} className="text-left px-3 py-2 font-medium" style={{ color: 'var(--mn-text-3)', ...MONO }}>{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {r.shifts.map((s, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--mn-border)' }}>
                                      <td className="px-3 py-2" style={{ color: 'var(--mn-text-2)' }}>{s.date}</td>
                                      <td className="px-3 py-2" style={{ color: 'var(--mn-text-2)' }}>{s.ward}</td>
                                      <td className="px-3 py-2 font-medium" style={{ color: 'var(--mn-text-1)', ...MONO }}>{s.hours}h</td>
                                      <td className="px-3 py-2" style={{ color: 'var(--mn-text-2)', ...MONO }}>£{s.rate}/hr</td>
                                      <td className="px-3 py-2 font-semibold" style={{ color: 'var(--mn-text-1)', ...MONO }}>£{s.pensionablePay.toLocaleString()}</td>
                                    </tr>
                                  ))}
                                  <tr style={{ background: 'var(--mn-surface)' }}>
                                    <td colSpan={4} className="px-3 py-2 font-medium text-right" style={{ color: 'var(--mn-text-3)' }}>Total pensionable pay</td>
                                    <td className="px-3 py-2 font-bold" style={{ color: 'var(--mn-text-1)', ...MONO }}>£{r.totalPensionable.toLocaleString()}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Form B summary */}
                        {r.formType === 'B' && (
                          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[
                              { label: 'Total gross pay',       value: `£${r.totalGross.toLocaleString()}` },
                              { label: 'Total pensionable pay', value: `£${r.totalPensionable.toLocaleString()}` },
                              { label: 'Employers this month',  value: '3' },
                              { label: 'Employee contrib.',     value: `£${r.employeeAmount.toFixed(2)}` },
                              { label: 'Employer contrib.',     value: `£${r.employerAmount.toFixed(2)}` },
                              { label: 'Contribution rate',     value: `${r.employeeRate}%` },
                            ].map(({ label, value }) => (
                              <div key={label} className="rounded-xl border p-3" style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
                                <p className="text-[10px]" style={{ color: 'var(--mn-text-3)', ...MONO }}>{label}</p>
                                <p className="text-sm font-semibold mt-1" style={{ color: 'var(--mn-text-1)', ...MONO }}>{value}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Contribution summary */}
                        {r.formType === 'A' && (
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { label: 'Rate tier', value: `${r.employeeRate}%` },
                              { label: 'Employee contribution', value: `£${r.employeeAmount.toFixed(2)}` },
                              { label: 'Employer contribution', value: `£${r.employerAmount.toFixed(2)}` },
                            ].map(({ label, value }) => (
                              <div key={label} className="rounded-xl border p-3" style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
                                <p className="text-[10px]" style={{ color: 'var(--mn-text-3)', ...MONO }}>{label}</p>
                                <p className="text-sm font-semibold mt-1" style={{ color: 'var(--mn-text-1)', ...MONO }}>{value}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Signature status */}
                        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--mn-border)' }}>
                          <div className="px-4 py-2.5 border-b" style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
                            <p className="text-[11px] font-medium" style={{ color: 'var(--mn-text-3)', ...MONO }}>signature status</p>
                          </div>
                          <div className="divide-y" style={{ borderColor: 'var(--mn-border)' }}>
                            <div className="flex items-center justify-between px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${r.memberSigned ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                                <p className="text-xs" style={{ color: 'var(--mn-text-2)' }}>Member declaration (you)</p>
                              </div>
                              <div className="text-right">
                                {r.memberSigned
                                  ? <p className="text-[11px] text-emerald-400" style={MONO}>Signed {r.memberSignedAt}</p>
                                  : <p className="text-[11px]" style={{ color: 'var(--mn-text-3)', ...MONO }}>Awaiting your signature</p>}
                              </div>
                            </div>
                            <div className="flex items-center justify-between px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${r.employerSigned ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                                <p className="text-xs" style={{ color: 'var(--mn-text-2)' }}>Employer certification ({r.hospital})</p>
                              </div>
                              <div className="text-right">
                                {r.employerSigned
                                  ? <p className="text-[11px] text-emerald-400" style={MONO}>Signed {r.employerSignedAt}</p>
                                  : r.memberSigned
                                    ? <p className="text-[11px] text-amber-400" style={MONO}>Pending employer action</p>
                                    : <p className="text-[11px]" style={{ color: 'var(--mn-text-3)', ...MONO }}>Awaiting member signature first</p>}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3 flex-wrap">
                          {!r.memberSigned && (
                            <button onClick={() => memberSign(r.id)} disabled={signing === r.id}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
                              style={{ background: '#7c3aed', color: 'white' }}>
                              {signing === r.id
                                ? <><span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Signing…</>
                                : <><PenLine className="w-3.5 h-3.5" strokeWidth={1.5} /> Sign member declaration</>}
                            </button>
                          )}
                          <button onClick={() => toast.success(`Form ${r.formType} — ${r.period} downloaded`)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border transition-all hover:border-purple-500/30"
                            style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)', background: 'var(--mn-surface)' }}>
                            <Download className="w-3.5 h-3.5" strokeWidth={1.5} /> Download PDF
                          </button>
                          {r.status === 'complete' && (
                            <button onClick={() => toast.success('Submitted to NHSBSA')}
                              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border text-emerald-400 transition-all hover:border-emerald-500/40"
                              style={{ borderColor: '#10b98140', background: '#10b98110' }}>
                              <Eye className="w-3.5 h-3.5" strokeWidth={1.5} /> Submit to NHSBSA
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 py-2">
          <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-center text-[10px]" style={{ ...MONO, color: 'var(--mn-text-3)' }}>
            nhs pension scheme · member data governed by value exchange protocol · physician node owner
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
