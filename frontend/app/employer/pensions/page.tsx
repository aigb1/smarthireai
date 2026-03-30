'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/lib/store'
import { toast } from '@/lib/toast'
import {
  FileText, CheckCircle2, Clock, AlertTriangle, Download,
  PenLine, Building2, ShieldCheck, ChevronDown, ChevronUp,
  AlertCircle, Info,
} from 'lucide-react'

const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }

/* ── Only forms submitted to THIS hospital ── */
interface EmployerForm {
  id: string
  formType: 'A' | 'B'
  period: string
  clinicianName: string
  clinicianGMC: string
  specialty: string
  shifts: { date: string; ward: string; hours: number; rate: number; pensionablePay: number }[]
  totalPensionable: number
  employeeRate: number
  employeeAmount: number
  employerAmount: number
  memberSigned: boolean
  memberSignedAt: string | null
  employerSigned: boolean
  employerSignedAt: string | null
  tierVerified: boolean
  status: 'awaiting_employer' | 'complete' | 'overdue'
  submittedAt: string
}

const THIS_TRUST = 'Royal London NHS Foundation Trust'

const EMPLOYER_FORMS: EmployerForm[] = [
  {
    id: 'ef001', formType: 'A', period: 'March 2026',
    clinicianName: 'Dr. James Park', clinicianGMC: '7823401', specialty: 'Emergency Medicine',
    shifts: [
      { date: '26 Mar 2026', ward: 'ICU',   hours: 8, rate: 110, pensionablePay: 880 },
      { date: '15 Mar 2026', ward: 'Gastro', hours: 8, rate: 93,  pensionablePay: 744 },
    ],
    totalPensionable: 1624,
    employeeRate: 11.3, employeeAmount: 183.51, employerAmount: 233.53,
    memberSigned: true, memberSignedAt: '27 Mar 2026 09:41',
    employerSigned: false, employerSignedAt: null,
    tierVerified: false,
    status: 'awaiting_employer', submittedAt: '27 Mar 2026',
  },
  {
    id: 'ef002', formType: 'A', period: 'February 2026',
    clinicianName: 'Dr. Anya Sharma', clinicianGMC: '6541209', specialty: 'Cardiology',
    shifts: [
      { date: '12 Feb 2026', ward: 'CCU',    hours: 12, rate: 105, pensionablePay: 1260 },
      { date: '05 Feb 2026', ward: 'CCU',    hours: 12, rate: 105, pensionablePay: 1260 },
    ],
    totalPensionable: 2520,
    employeeRate: 12.5, employeeAmount: 315.00, employerAmount: 362.23,
    memberSigned: true, memberSignedAt: '13 Feb 2026 10:15',
    employerSigned: false, employerSignedAt: null,
    tierVerified: false,
    status: 'overdue', submittedAt: '13 Feb 2026',
  },
  {
    id: 'ef003', formType: 'A', period: 'January 2026',
    clinicianName: 'Dr. Marcus Webb', clinicianGMC: '4918732', specialty: 'Anaesthetics',
    shifts: [
      { date: '22 Jan 2026', ward: 'Theatres', hours: 10, rate: 120, pensionablePay: 1200 },
    ],
    totalPensionable: 1200,
    employeeRate: 11.3, employeeAmount: 135.60, employerAmount: 172.56,
    memberSigned: true, memberSignedAt: '23 Jan 2026 08:30',
    employerSigned: true, employerSignedAt: '02 Feb 2026 16:00',
    tierVerified: true,
    status: 'complete', submittedAt: '23 Jan 2026',
  },
]

const NHS_TIERS: Record<number, string> = {
  5.1: 'Up to £13,259', 5.7: '£13,260–£16,614', 6.1: '£16,615–£22,878',
  6.8: '£22,879–£23,948', 7.7: '£23,949–£28,223', 8.8: '£28,224–£29,179',
  9.8: '£29,180–£43,805', 10.0: '£43,806–£49,245', 11.3: '£49,246–£56,163',
  12.5: '£56,164–£72,030', 13.5: '£72,031+',
}

const STATUS_CONFIG = {
  awaiting_employer: { label: 'Awaiting your signature', color: '#f59e0b', bg: '#f59e0b18', border: '#f59e0b40', icon: Clock        },
  complete:          { label: 'Complete',                 color: '#34d399', bg: '#10b98118', border: '#10b98140', icon: CheckCircle2 },
  overdue:           { label: 'Overdue — action needed',  color: '#f87171', bg: '#ef444418', border: '#ef444440', icon: AlertTriangle },
}

export default function EmployerPensionsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const [forms, setForms] = useState<EmployerForm[]>(EMPLOYER_FORMS)
  const [expanded, setExpanded] = useState<string | null>('ef001')
  const [signing, setSigning] = useState<string | null>(null)

  useEffect(() => { if (!isLoading && !isAuthenticated) router.push('/login') }, [isLoading, isAuthenticated])

  const verifyTier = (id: string) => {
    setForms(fs => fs.map(f => f.id === id ? { ...f, tierVerified: true } : f))
    toast.success('Contribution tier verified ✓')
  }

  const employerSign = (id: string) => {
    setSigning(id)
    setTimeout(() => {
      setForms(fs => fs.map(f => f.id === id ? {
        ...f,
        employerSigned: true,
        employerSignedAt: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        status: 'complete' as const,
      } : f))
      setSigning(null)
      toast.success('Employer contribution certified. Form complete and archived.')
    }, 1600)
  }

  if (isLoading || !isAuthenticated) return null

  const pending = forms.filter(f => f.status !== 'complete').length

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Role badge */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--mn-text-3)', ...MONO }}>hospital node · certifying officer</p>
            </div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--mn-text-1)' }}>Pension form approval</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--mn-text-3)' }}>
              Review and certify submitted pension forms from locums who worked at your trust.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border" style={{ background: '#3b82f610', borderColor: '#3b82f640' }}>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" strokeWidth={1.5} />
            <span className="text-[11px] font-medium text-blue-400" style={MONO}>APPROVAL ACCESS — Certifier</span>
          </div>
        </div>

        {/* Hospital restriction notice */}
        <div className="flex items-start gap-3 rounded-xl border px-4 py-3" style={{ background: '#3b82f610', borderColor: '#3b82f640' }}>
          <Building2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-400" strokeWidth={1.5} />
          <div>
            <p className="text-xs font-medium text-blue-400">Restricted to your trust</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--mn-text-3)' }}>
              You can only see forms for locums who worked at <strong style={{ color: 'var(--mn-text-2)' }}>{THIS_TRUST}</strong>. Forms from other hospitals are not visible to you.
            </p>
          </div>
        </div>

        {/* Stat row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Awaiting signature', value: forms.filter(f => f.status === 'awaiting_employer').length, color: '#f59e0b', bg: '#f59e0b10', border: '#f59e0b30' },
            { label: 'Overdue',            value: forms.filter(f => f.status === 'overdue').length,           color: '#f87171', bg: '#ef444410', border: '#ef444430' },
            { label: 'Complete',           value: forms.filter(f => f.status === 'complete').length,          color: '#34d399', bg: '#10b98110', border: '#10b98130' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border p-4 text-center" style={{ background: s.bg, borderColor: s.border }}>
              <p className="text-2xl font-bold" style={{ color: s.color, ...MONO }}>{s.value}</p>
              <p className="text-[11px] mt-1" style={{ color: 'var(--mn-text-3)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {pending > 0 && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border" style={{ background: '#f59e0b10', borderColor: '#f59e0b40' }}>
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" strokeWidth={1.5} />
            <p className="text-xs" style={{ color: 'var(--mn-text-2)' }}>
              <span className="font-semibold text-amber-400">{pending} form{pending !== 1 ? 's' : ''}</span> awaiting your employer certification. Unsigned forms after the 7th of the month are flagged as overdue by the recruiter workflow node.
            </p>
          </div>
        )}

        {/* Form list */}
        <div className="space-y-3">
          {forms.map(f => {
            const cfg = STATUS_CONFIG[f.status]
            const isOpen = expanded === f.id
            return (
              <motion.div key={f.id} layout className="rounded-2xl border overflow-hidden" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
                <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${cfg.color}, transparent)` }} />

                <button className="w-full flex items-center gap-4 p-4 text-left" onClick={() => setExpanded(isOpen ? null : f.id)}>
                  <div className="h-10 w-10 rounded-xl border flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg, borderColor: cfg.border }}>
                    <FileText className="w-4 h-4" style={{ color: cfg.color }} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold" style={{ color: 'var(--mn-text-1)' }}>{f.clinicianName}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border" style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border, ...MONO }}>{cfg.label}</span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--mn-text-3)' }}>
                      Form {f.formType} · {f.period} · GMC {f.clinicianGMC} · {f.specialty}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold" style={{ color: 'var(--mn-text-1)', ...MONO }}>£{f.totalPensionable.toLocaleString()}</p>
                    <p className="text-[10px]" style={{ color: 'var(--mn-text-3)' }}>pensionable pay</p>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 ml-2 flex-shrink-0" style={{ color: 'var(--mn-text-3)' }} /> : <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" style={{ color: 'var(--mn-text-3)' }} />}
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="border-t px-4 pb-5 space-y-4" style={{ borderColor: 'var(--mn-border)' }}>

                        {/* Shift detail */}
                        <div className="mt-4">
                          <p className="text-[11px] mb-2 font-medium" style={{ color: 'var(--mn-text-3)', ...MONO }}>shifts at {THIS_TRUST}</p>
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
                                {f.shifts.map((s, i) => (
                                  <tr key={i} style={{ borderBottom: '1px solid var(--mn-border)' }}>
                                    <td className="px-3 py-2" style={{ color: 'var(--mn-text-2)' }}>{s.date}</td>
                                    <td className="px-3 py-2" style={{ color: 'var(--mn-text-2)' }}>{s.ward}</td>
                                    <td className="px-3 py-2 font-medium" style={{ color: 'var(--mn-text-1)', ...MONO }}>{s.hours}h</td>
                                    <td className="px-3 py-2" style={{ color: 'var(--mn-text-2)', ...MONO }}>£{s.rate}/hr</td>
                                    <td className="px-3 py-2 font-semibold" style={{ color: 'var(--mn-text-1)', ...MONO }}>£{s.pensionablePay.toLocaleString()}</td>
                                  </tr>
                                ))}
                                <tr style={{ background: 'var(--mn-surface)' }}>
                                  <td colSpan={4} className="px-3 py-2 font-medium text-right" style={{ color: 'var(--mn-text-3)' }}>Total</td>
                                  <td className="px-3 py-2 font-bold" style={{ color: 'var(--mn-text-1)', ...MONO }}>£{f.totalPensionable.toLocaleString()}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Tier verification */}
                        <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: f.tierVerified ? '#10b98140' : '#f59e0b40', background: f.tierVerified ? '#10b98108' : '#f59e0b08' }}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Info className="w-3.5 h-3.5 flex-shrink-0" style={{ color: f.tierVerified ? '#34d399' : '#f59e0b' }} strokeWidth={1.5} />
                              <p className="text-xs font-medium" style={{ color: f.tierVerified ? '#34d399' : '#f59e0b' }}>Contribution tier verification</p>
                            </div>
                            {!f.tierVerified && !f.employerSigned && (
                              <button onClick={() => verifyTier(f.id)}
                                className="text-[11px] px-3 py-1 rounded-lg border transition-all"
                                style={{ borderColor: '#f59e0b40', color: '#f59e0b', background: '#f59e0b10' }}>
                                Verify tier
                              </button>
                            )}
                            {f.tierVerified && <CheckCircle2 className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />}
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <p style={{ color: 'var(--mn-text-3)' }}>Employee rate</p>
                              <p className="font-semibold mt-0.5" style={{ color: 'var(--mn-text-1)', ...MONO }}>{f.employeeRate}%</p>
                              <p className="text-[10px] mt-0.5" style={{ color: 'var(--mn-text-3)' }}>{NHS_TIERS[f.employeeRate]}</p>
                            </div>
                            <div>
                              <p style={{ color: 'var(--mn-text-3)' }}>Employee amount</p>
                              <p className="font-semibold mt-0.5" style={{ color: 'var(--mn-text-1)', ...MONO }}>£{f.employeeAmount.toFixed(2)}</p>
                            </div>
                            <div>
                              <p style={{ color: 'var(--mn-text-3)' }}>Employer (14.38%)</p>
                              <p className="font-semibold mt-0.5" style={{ color: 'var(--mn-text-1)', ...MONO }}>£{f.employerAmount.toFixed(2)}</p>
                              <p className="text-[10px] mt-0.5" style={{ color: 'var(--mn-text-3)' }}>to be paid by you</p>
                            </div>
                          </div>
                        </div>

                        {/* Signature status */}
                        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--mn-border)' }}>
                          <div className="px-4 py-2.5 border-b" style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
                            <p className="text-[11px] font-medium" style={{ color: 'var(--mn-text-3)', ...MONO }}>signature chain</p>
                          </div>
                          <div className="divide-y" style={{ borderColor: 'var(--mn-border)' }}>
                            <div className="flex items-center justify-between px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                                <p className="text-xs" style={{ color: 'var(--mn-text-2)' }}>Member declaration — {f.clinicianName}</p>
                              </div>
                              <p className="text-[11px] text-emerald-400" style={MONO}>Signed {f.memberSignedAt}</p>
                            </div>
                            <div className="flex items-center justify-between px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${f.employerSigned ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                                <p className="text-xs" style={{ color: 'var(--mn-text-2)' }}>Employer certification — {THIS_TRUST}</p>
                              </div>
                              {f.employerSigned
                                ? <p className="text-[11px] text-emerald-400" style={MONO}>Signed {f.employerSignedAt}</p>
                                : <p className="text-[11px] text-amber-400" style={MONO}>Awaiting your action</p>}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3 flex-wrap">
                          {!f.employerSigned && (
                            <button onClick={() => employerSign(f.id)} disabled={signing === f.id || !f.tierVerified}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                              style={{ background: f.tierVerified ? 'rgba(255,255,255,0.15)' : 'var(--mn-surface)', color: f.tierVerified ? 'white' : 'var(--mn-text-3)', border: f.tierVerified ? 'none' : '1px solid var(--mn-border)' }}
                              title={!f.tierVerified ? 'Verify tier before signing' : undefined}>
                              {signing === f.id
                                ? <><span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Signing…</>
                                : <><PenLine className="w-3.5 h-3.5" strokeWidth={1.5} /> Sign employer section</>}
                            </button>
                          )}
                          <button onClick={() => toast.success(`Form archived — ${f.clinicianName} ${f.period}`)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border transition-all hover:border-purple-500/30"
                            style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)', background: 'var(--mn-surface)' }}>
                            <Download className="w-3.5 h-3.5" strokeWidth={1.5} /> Download archive
                          </button>
                        </div>
                        {!f.tierVerified && !f.employerSigned && (
                          <p className="text-[11px]" style={{ color: 'var(--mn-text-3)' }}>
                            ⚠ Verify the contribution tier matches before signing the employer section.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        <div className="flex items-center justify-center gap-2 py-2">
          <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-center text-[10px]" style={{ ...MONO, color: 'var(--mn-text-3)' }}>
            restricted view · {THIS_TRUST} only · employer contribution 14.38% · value exchange protocol
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
