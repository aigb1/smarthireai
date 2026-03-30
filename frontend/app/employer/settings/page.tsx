'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/lib/store'
import { toast } from '@/lib/toast'
import {
  User, Bell, Shield, Palette, Trash2, Check, Moon, Sun,
  Mail, Phone, MapPin, Building2, Lock, Key,
  Cpu, PoundSterling, Users, LayoutGrid, Zap, AlertCircle,
  Plus, X as XIcon, Star, CreditCard, Calendar, Receipt,
  CheckCircle2, Download, RefreshCw,
} from 'lucide-react'

const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }

type Tab = 'profile' | 'plan' | 'node' | 'notifications' | 'security' | 'appearance' | 'danger'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile',       label: 'Profile',        icon: User       },
  { id: 'plan',          label: 'Plan',            icon: CreditCard },
  { id: 'node',          label: 'Node protocol',   icon: Cpu        },
  { id: 'notifications', label: 'Notifications',   icon: Bell       },
  { id: 'security',      label: 'Security',        icon: Shield     },
  { id: 'appearance',    label: 'Appearance',      icon: Palette    },
  { id: 'danger',        label: 'Danger zone',     icon: Trash2     },
]

const NOTIF_TOGGLES = [
  { label: 'New bid applications',   desc: 'Alert when clinicians apply to your shifts',        key: 'bids'       },
  { label: 'Compliance alerts',      desc: 'DBS expiry, GMC re-validation reminders',           key: 'compliance' },
  { label: 'Shift confirmation',     desc: 'Confirmation when a shift is accepted',             key: 'shifts'     },
  { label: 'Settlement notifications',desc: 'When payment batches are processed',               key: 'settlement' },
  { label: 'Pension form alerts',    desc: 'When forms are submitted for your signature',       key: 'pension'    },
  { label: 'AI weekly report',       desc: 'Weekly summary of staffing and spend',              key: 'digest'     },
]

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
      <div className="h-0.5 w-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
      <div className="p-6 space-y-5">
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--mn-text-1)' }}>{title}</p>
          {desc && <p className="text-xs mt-0.5" style={{ color: 'var(--mn-text-3)' }}>{desc}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}

function ToggleRow({ label, desc, enabled, onChange, accent = 'rgba(255,255,255,0.7)' }: {
  label: string; desc: string; enabled: boolean; onChange: (v: boolean) => void; accent?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm" style={{ color: 'var(--mn-text-1)' }}>{label}</p>
        {desc && <p className="text-xs mt-0.5" style={{ color: 'var(--mn-text-3)' }}>{desc}</p>}
      </div>
      <button onClick={() => onChange(!enabled)}
        className="relative h-6 w-11 rounded-full transition-colors flex-shrink-0"
        style={{ background: enabled ? accent : 'var(--mn-border)' }}>
        <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
          style={{ left: enabled ? '22px' : '2px' }} />
      </button>
    </div>
  )
}

function SliderRow({ label, desc, value, min, max, unit, onChange }: {
  label: string; desc: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: 'var(--mn-text-1)' }}>{label}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--mn-text-3)' }}>{desc}</p>
        </div>
        <span className="text-sm font-semibold px-2.5 py-1 rounded-lg" style={{ background: '#3b82f620', color: '#60a5fa', ...MONO }}>
          {unit}{value}
        </span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: '#3b82f6', background: `linear-gradient(90deg, #3b82f6 ${((value - min) / (max - min)) * 100}%, var(--mn-border) 0%)` }} />
      <div className="flex justify-between text-[10px]" style={{ color: 'var(--mn-text-3)', ...MONO }}>
        <span>{unit}{min}</span><span>{unit}{max}</span>
      </div>
    </div>
  )
}

export default function EmployerSettingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const [tab, setTab] = useState<Tab>('profile')

  /* Profile */
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [phone, setPhone]       = useState('+44 20 7946 0312')
  const [orgName, setOrgName]   = useState('Royal London NHS Foundation Trust')
  const [location, setLocation] = useState('Whitechapel, London E1 1FR')

  /* Node protocol */
  const [rateCeiling, setRateCeiling]           = useState(125)
  const [autoApproveThreshold, setAutoApproveThreshold] = useState(4)
  const [emergencyOverride, setEmergencyOverride] = useState(false)
  const [autoApproveOn, setAutoApproveOn]       = useState(true)
  const [wards, setWards] = useState(['A&E', 'ICU', 'Cardiology', 'Gastroenterology', 'Theatres'])
  const [newWard, setNewWard] = useState('')
  const [signatories, setSignatories] = useState([
    { name: 'Dr. Helen Marsh',   role: 'Medical Director',      email: 'h.marsh@royallondon.nhs.uk' },
    { name: 'James Okafor',      role: 'Finance Lead',          email: 'j.okafor@royallondon.nhs.uk' },
  ])
  const [newSigName, setNewSigName]   = useState('')
  const [newSigRole, setNewSigRole]   = useState('')
  const [newSigEmail, setNewSigEmail] = useState('')

  /* Notifications */
  const [notifs, setNotifs] = useState<Record<string, boolean>>({
    bids: true, compliance: true, shifts: true, settlement: true, pension: true, digest: false,
  })

  /* Security */
  const [twoFa, setTwoFa]         = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw]         = useState('')

  /* Appearance */
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => { if (!isLoading && !isAuthenticated) router.push('/login') }, [isLoading, isAuthenticated])
  useEffect(() => {
    if (user) { setName(user.name || ''); setEmail(user.email || '') }
    const stored = typeof window !== 'undefined' ? localStorage.getItem('mn_theme') : null
    setTheme(stored === 'light' ? 'light' : 'dark')
  }, [user])

  const applyTheme = (t: 'dark' | 'light') => {
    setTheme(t)
    document.documentElement.classList.toggle('light', t === 'light')
    localStorage.setItem('mn_theme', t)
  }

  const addWard = () => {
    if (!newWard.trim()) return
    setWards(w => [...w, newWard.trim()])
    setNewWard('')
    toast.success(`Ward "${newWard.trim()}" added`)
  }

  const addSignatory = () => {
    if (!newSigName || !newSigRole || !newSigEmail) return toast.error('Fill all signatory fields')
    setSignatories(s => [...s, { name: newSigName, role: newSigRole, email: newSigEmail }])
    setNewSigName(''); setNewSigRole(''); setNewSigEmail('')
    toast.success('Authorised signatory added')
  }

  const inputStyle = { background: 'var(--mn-surface)', borderColor: 'var(--mn-border)', color: 'var(--mn-text-1)' }
  const labelStyle: React.CSSProperties = { color: 'var(--mn-text-3)', ...MONO, fontSize: '11px' }

  if (isLoading || !isAuthenticated) return null

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">

        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--mn-text-3)', ...MONO }}>hospital node · infrastructure settings</p>
          </div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--mn-text-1)' }}>Settings</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--mn-text-3)' }}>Manage your trust node configuration, budget guardrails, and authorisation rules</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 rounded-xl border overflow-x-auto" style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0"
              style={{ background: tab === t.id ? '#3b82f6' : 'transparent', color: tab === t.id ? 'white' : 'var(--mn-text-3)' }}>
              <t.icon className="w-3.5 h-3.5" strokeWidth={1.5} />
              {t.label}
            </button>
          ))}
        </div>

        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>

          {/* ── PROFILE ── */}
          {tab === 'profile' && (
            <Section title="Trust profile">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Contact name',  value: name,     set: setName,     Icon: User,      placeholder: '' },
                  { label: 'Email',         value: email,    set: setEmail,    Icon: Mail,      placeholder: '', type: 'email' },
                  { label: 'Phone',         value: phone,    set: setPhone,    Icon: Phone,     placeholder: '+44 20 0000 0000' },
                  { label: 'Organisation',  value: orgName,  set: setOrgName,  Icon: Building2, placeholder: 'NHS Foundation Trust' },
                  { label: 'Location',      value: location, set: setLocation, Icon: MapPin,    placeholder: 'London, UK' },
                ].map(({ label, value, set, Icon, placeholder, type }) => (
                  <div key={label}>
                    <label style={labelStyle} className="block mb-1.5">{label}</label>
                    <div className="flex items-center gap-2 rounded-xl border px-3 py-2.5" style={inputStyle}>
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--mn-text-3)' }} strokeWidth={1.5} />
                      <input value={value} onChange={e => set(e.target.value)} type={type ?? 'text'} placeholder={placeholder}
                        className="flex-1 bg-transparent text-sm focus:outline-none" style={{ color: 'var(--mn-text-1)' }} />
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => toast.success('Trust profile updated')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ background: '#3b82f6', color: 'white' }}>
                <Check className="w-3.5 h-3.5" strokeWidth={2} /> Save profile
              </button>
            </Section>
          )}

          {/* ── PLAN ── */}
          {tab === 'plan' && (
            <div className="space-y-4">

              {/* Current plan card */}
              <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
                <div className="h-0.5 w-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: '#10b98118', color: '#34d399', border: '1px solid #10b98140', ...MONO }}>
                          ACTIVE
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--mn-text-3)', ...MONO }}>3 days until renewal</span>
                      </div>
                      <h2 className="text-lg font-bold" style={{ color: 'var(--mn-text-1)' }}>Employer node — Professional</h2>
                      <p className="text-sm mt-0.5" style={{ color: 'var(--mn-text-3)' }}>Royal London NHS Foundation Trust</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold" style={{ color: 'var(--mn-text-1)', ...MONO }}>£299</p>
                      <p className="text-xs" style={{ color: 'var(--mn-text-3)', ...MONO }}>/month · billed monthly</p>
                    </div>
                  </div>

                  {/* Key dates */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                    {[
                      { label: 'Plan started',    value: '1 Feb 2026',  Icon: Calendar },
                      { label: 'Current period',  value: '1 Mar 2026',  Icon: Calendar },
                      { label: 'Renews on',       value: '1 Apr 2026',  Icon: RefreshCw },
                      { label: 'Payment method',  value: 'Visa ···· 4242', Icon: CreditCard },
                    ].map(({ label, value, Icon }) => (
                      <div key={label} className="rounded-xl border p-3" style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon className="w-3 h-3 flex-shrink-0" style={{ color: '#60a5fa' }} strokeWidth={1.5} />
                          <p className="text-[10px]" style={{ color: 'var(--mn-text-3)', ...MONO }}>{label}</p>
                        </div>
                        <p className="text-xs font-semibold" style={{ color: 'var(--mn-text-1)', ...MONO }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Plan features included */}
              <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
                <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--mn-border)', background: 'var(--mn-surface)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--mn-text-1)' }}>{"What's included in your plan"}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#3b82f618', color: '#60a5fa', border: '1px solid #3b82f640', ...MONO }}>Professional</span>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    'Unlimited shift postings',
                    'Unlimited team members',
                    'AI candidate screening & ranking',
                    'Compliance rota management',
                    'Ward analytics dashboard',
                    'Automated DBS & GMC verification',
                    'Bid ledger & settlement tracking',
                    'NHS Pension Form A — AI auto-fill & employer sign',
                    '14-day free trial included',
                  ].map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-blue-400" strokeWidth={2} />
                      <span className="text-xs" style={{ color: 'var(--mn-text-2)' }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoice history */}
              <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
                <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--mn-border)', background: 'var(--mn-surface)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--mn-text-1)' }}>Invoice history</p>
                </div>
                <div className="divide-y" style={{ borderColor: 'var(--mn-border)' }}>
                  {[
                    { period: 'March 2026',   date: '1 Mar 2026',  amount: '£299.00', status: 'Paid' },
                    { period: 'February 2026',date: '1 Feb 2026',  amount: '£299.00', status: 'Paid' },
                    { period: 'January 2026', date: '1 Jan 2026',  amount: '£299.00', status: 'Paid' },
                    { period: 'December 2025',date: '1 Dec 2025',  amount: '£0.00',   status: 'Trial' },
                  ].map(inv => (
                    <div key={inv.period} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Receipt className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--mn-text-3)' }} strokeWidth={1.5} />
                        <div>
                          <p className="text-xs font-medium" style={{ color: 'var(--mn-text-1)' }}>{inv.period}</p>
                          <p className="text-[11px]" style={{ color: 'var(--mn-text-3)', ...MONO }}>{inv.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{
                          background: inv.status === 'Paid' ? '#10b98118' : '#3b82f618',
                          color: inv.status === 'Paid' ? '#34d399' : '#60a5fa',
                          border: `1px solid ${inv.status === 'Paid' ? '#10b98140' : '#3b82f640'}`,
                          ...MONO,
                        }}>{inv.status}</span>
                        <p className="text-xs font-semibold" style={{ color: 'var(--mn-text-1)', ...MONO }}>{inv.amount}</p>
                        <button onClick={() => toast.success(`Invoice for ${inv.period} downloaded`)}
                          className="opacity-60 hover:opacity-100 transition-opacity">
                          <Download className="w-3.5 h-3.5" style={{ color: 'var(--mn-text-3)' }} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upgrade / manage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button onClick={() => toast.success('Redirecting to billing portal…')}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold" style={{ background: '#3b82f6', color: 'white' }}>
                  <Zap className="w-3.5 h-3.5" strokeWidth={1.5} /> Upgrade to Enterprise
                </button>
                <button onClick={() => toast.error('Contact support to cancel your plan')}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium border transition-all"
                  style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)', background: 'var(--mn-surface)' }}>
                  Manage billing
                </button>
              </div>
            </div>
          )}

          {/* ── NODE PROTOCOL ── */}
          {tab === 'node' && (
            <div className="space-y-4">

              {/* Rate ceiling */}
              <Section title="Rate ceiling" desc="Maximum hourly cap per clinician to prevent the AI from bidding over your departmental budget.">
                <SliderRow label="Maximum hourly rate" desc="AI will not accept bids above this rate for any shift type"
                  value={rateCeiling} min={60} max={250} unit="£" onChange={setRateCeiling} />
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ background: '#3b82f610', borderColor: '#3b82f640' }}>
                  <PoundSterling className="w-3.5 h-3.5 text-blue-400" strokeWidth={1.5} />
                  <p className="text-xs text-blue-400" style={MONO}>
                    Current cap: £{rateCeiling}/hr · Applies to all wards · Surge override requires director sign-off
                  </p>
                </div>
              </Section>

              {/* Ward geometry */}
              <Section title="Ward geometry" desc="Define the wards (sub-nodes) within your trust for precise deployment targeting.">
                <div className="flex flex-wrap gap-2">
                  {wards.map(w => (
                    <div key={w} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border" style={{ background: '#3b82f610', borderColor: '#3b82f640' }}>
                      <LayoutGrid className="w-3 h-3 text-blue-400" strokeWidth={1.5} />
                      <span className="text-xs font-medium text-blue-400" style={MONO}>{w}</span>
                      <button onClick={() => { setWards(ws => ws.filter(x => x !== w)); toast.success(`Ward "${w}" removed`) }}
                        className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity">
                        <XIcon className="w-3 h-3 text-blue-400" strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 rounded-xl border px-3 py-2.5" style={inputStyle}>
                    <LayoutGrid className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--mn-text-3)' }} strokeWidth={1.5} />
                    <input value={newWard} onChange={e => setNewWard(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addWard()}
                      placeholder="Add ward (e.g. Oncology)" className="flex-1 bg-transparent text-sm focus:outline-none" style={{ color: 'var(--mn-text-1)' }} />
                  </div>
                  <button onClick={addWard} className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5" style={{ background: '#3b82f6', color: 'white' }}>
                    <Plus className="w-3.5 h-3.5" strokeWidth={2} /> Add
                  </button>
                </div>
              </Section>

              {/* Authorised signatories */}
              <Section title="Authorised signatories" desc="Manage which staff members have digital authority to sign pension forms and settlement ledgers.">
                <div className="space-y-2">
                  {signatories.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl border p-3" style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                        style={{ background: '#3b82f620', color: '#60a5fa' }}>
                        {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: 'var(--mn-text-1)' }}>{s.name}</p>
                        <p className="text-xs" style={{ color: 'var(--mn-text-3)' }}>{s.role} · {s.email}</p>
                      </div>
                      <button onClick={() => { setSignatories(ss => ss.filter((_, j) => j !== i)); toast.success('Signatory removed') }}
                        className="opacity-50 hover:opacity-100 transition-opacity">
                        <XIcon className="w-3.5 h-3.5" style={{ color: 'var(--mn-text-3)' }} strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-medium" style={{ color: 'var(--mn-text-3)', ...MONO }}>add signatory</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { placeholder: 'Full name',  value: newSigName,  set: setNewSigName  },
                      { placeholder: 'Role/title', value: newSigRole,  set: setNewSigRole  },
                      { placeholder: 'NHS email',  value: newSigEmail, set: setNewSigEmail },
                    ].map(({ placeholder, value, set }) => (
                      <div key={placeholder} className="flex items-center gap-2 rounded-xl border px-3 py-2.5" style={inputStyle}>
                        <input value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
                          className="flex-1 bg-transparent text-xs focus:outline-none" style={{ color: 'var(--mn-text-1)' }} />
                      </div>
                    ))}
                  </div>
                  <button onClick={addSignatory} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: '#3b82f6', color: 'white' }}>
                    <Plus className="w-3.5 h-3.5" strokeWidth={2} /> Add signatory
                  </button>
                </div>
              </Section>

              {/* Auto-approval */}
              <Section title="Auto-approval logic" desc="Set rules for instant timesheet approval — no manual review needed for consistently high-rated clinicians.">
                <ToggleRow label="Enable auto-approval" desc="Automatically sign timesheets when clinician meets the rating threshold"
                  enabled={autoApproveOn} onChange={v => { setAutoApproveOn(v); toast.success(`Auto-approval ${v ? 'enabled' : 'disabled'}`) }}
                  accent="#3b82f6" />
                {autoApproveOn && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm" style={{ color: 'var(--mn-text-1)' }}>Rating threshold</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--mn-text-3)' }}>Clinicians with this average stability rating auto-approved</p>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: '#3b82f620' }}>
                        <Star className="w-3.5 h-3.5 text-blue-400" strokeWidth={1.5} />
                        <span className="text-sm font-semibold text-blue-400" style={MONO}>{autoApproveThreshold}+</span>
                      </div>
                    </div>
                    <input type="range" min={3} max={5} step={0.5} value={autoApproveThreshold} onChange={e => setAutoApproveThreshold(Number(e.target.value))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: '#3b82f6', background: `linear-gradient(90deg, #3b82f6 ${((autoApproveThreshold - 3) / 2) * 100}%, var(--mn-border) 0%)` }} />
                    <div className="flex justify-between text-[10px]" style={{ color: 'var(--mn-text-3)', ...MONO }}>
                      <span>3.0 ★</span><span>5.0 ★</span>
                    </div>
                  </div>
                )}
              </Section>

              {/* Compliance strictness */}
              <Section title="Compliance strictness" desc="Control whether the system allows clinicians with pending (but not expired) documents to be placed in an emergency.">
                <ToggleRow label="Allow emergency overrides"
                  desc="Permits placement of clinicians with pending (not expired) DBS or GMC checks during declared emergencies"
                  enabled={emergencyOverride} onChange={v => { setEmergencyOverride(v); toast.success(`Emergency overrides ${v ? 'enabled' : 'disabled'}`) }}
                  accent="#f59e0b" />
                {emergencyOverride && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ background: '#f59e0b10', borderColor: '#f59e0b40' }}>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.5} />
                    <p className="text-xs text-amber-400" style={MONO}>Override requires explicit director sign-off for each placement · Logged in audit trail</p>
                  </div>
                )}
              </Section>

              <button onClick={() => toast.success('Node protocol saved')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ background: '#3b82f6', color: 'white' }}>
                <Check className="w-3.5 h-3.5" strokeWidth={2} /> Save node settings
              </button>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {tab === 'notifications' && (
            <Section title="Notification preferences">
              <div className="space-y-5 divide-y" style={{ borderColor: 'var(--mn-border)' }}>
                {NOTIF_TOGGLES.map((n, i) => (
                  <div key={n.key} style={{ paddingTop: i > 0 ? '20px' : '0' }}>
                    <ToggleRow label={n.label} desc={n.desc} enabled={notifs[n.key]} accent="#3b82f6" onChange={v => {
                      setNotifs(p => ({ ...p, [n.key]: v }))
                      toast.success(`${n.label} ${v ? 'enabled' : 'disabled'}`)
                    }} />
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ── SECURITY ── */}
          {tab === 'security' && (
            <div className="space-y-4">
              <Section title="Change password">
                <div className="space-y-3">
                  <div>
                    <label style={labelStyle} className="block mb-1.5">Current password</label>
                    <div className="flex items-center gap-2 rounded-xl border px-3 py-2.5" style={inputStyle}>
                      <Lock className="w-3.5 h-3.5" style={{ color: 'var(--mn-text-3)' }} strokeWidth={1.5} />
                      <input value={currentPw} onChange={e => setCurrentPw(e.target.value)} type="password" placeholder="••••••••"
                        className="flex-1 bg-transparent text-sm focus:outline-none" style={{ color: 'var(--mn-text-1)' }} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle} className="block mb-1.5">New password</label>
                    <div className="flex items-center gap-2 rounded-xl border px-3 py-2.5" style={inputStyle}>
                      <Key className="w-3.5 h-3.5" style={{ color: 'var(--mn-text-3)' }} strokeWidth={1.5} />
                      <input value={newPw} onChange={e => setNewPw(e.target.value)} type="password" placeholder="••••••••"
                        className="flex-1 bg-transparent text-sm focus:outline-none" style={{ color: 'var(--mn-text-1)' }} />
                    </div>
                  </div>
                  <button onClick={() => { if (!currentPw || !newPw) return toast.error('Fill both fields'); setCurrentPw(''); setNewPw(''); toast.success('Password changed') }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ background: '#3b82f6', color: 'white' }}>
                    <Check className="w-3.5 h-3.5" strokeWidth={2} /> Update password
                  </button>
                </div>
              </Section>
              <Section title="Two-factor authentication">
                <ToggleRow label="Authenticator app 2FA" desc="Use Google Authenticator or Authy for extra security"
                  enabled={twoFa} onChange={v => { setTwoFa(v); toast.success(`2FA ${v ? 'enabled' : 'disabled'}`) }} accent="#3b82f6" />
              </Section>
            </div>
          )}

          {/* ── APPEARANCE ── */}
          {tab === 'appearance' && (
            <Section title="Appearance" desc="Choose your preferred interface theme">
              <div className="grid grid-cols-2 gap-3">
                {(['dark', 'light'] as const).map(t => (
                  <button key={t} onClick={() => applyTheme(t)}
                    className="flex items-center gap-3 rounded-xl border p-4 transition-all text-left"
                    style={{ borderColor: theme === t ? '#3b82f6' : 'var(--mn-border)', background: theme === t ? '#3b82f610' : 'var(--mn-surface)' }}>
                    {t === 'dark'
                      ? <Moon className="w-4 h-4" style={{ color: theme === t ? '#60a5fa' : 'var(--mn-text-3)' }} strokeWidth={1.5} />
                      : <Sun  className="w-4 h-4" style={{ color: theme === t ? '#60a5fa' : 'var(--mn-text-3)' }} strokeWidth={1.5} />}
                    <div>
                      <p className="text-sm font-medium capitalize" style={{ color: theme === t ? '#60a5fa' : 'var(--mn-text-1)' }}>{t} mode</p>
                      <p className="text-[11px]" style={{ color: 'var(--mn-text-3)' }}>{t === 'dark' ? 'Neural protocol default' : 'High contrast light'}</p>
                    </div>
                    {theme === t && <Check className="w-3.5 h-3.5 ml-auto" style={{ color: '#60a5fa' }} strokeWidth={2} />}
                  </button>
                ))}
              </div>
            </Section>
          )}

          {/* ── DANGER ZONE ── */}
          {tab === 'danger' && (
            <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--mn-card)', borderColor: '#ef444430' }}>
              <div className="h-0.5 w-full bg-red-500/60" />
              <div className="p-6 space-y-4">
                <p className="text-sm font-semibold text-red-400">Danger zone</p>
                {[
                  { label: 'Suspend node',   desc: 'Temporarily suspend your trust node. All rotas and pending shifts paused.', btn: 'Suspend node',   variant: 'warn'   as const },
                  { label: 'Delete account', desc: 'Permanently delete your trust account and all data. Cannot be undone.',      btn: 'Delete account', variant: 'danger' as const },
                ].map(({ label, desc, btn, variant }) => (
                  <div key={label} className="flex items-center justify-between gap-4 rounded-xl border p-4" style={{ borderColor: 'var(--mn-border)', background: 'var(--mn-surface)' }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--mn-text-1)' }}>{label}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--mn-text-3)' }}>{desc}</p>
                    </div>
                    <button onClick={() => toast.error(`Contact support to ${btn.toLowerCase()}`)}
                      className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold border"
                      style={{ borderColor: variant === 'danger' ? '#ef4444' : '#f59e0b', color: variant === 'danger' ? '#ef4444' : '#f59e0b', background: variant === 'danger' ? '#ef444410' : '#f59e0b10' }}>
                      {btn}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <div className="flex items-center justify-center gap-2 py-2">
          <span className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
          <p className="text-center text-[10px]" style={{ ...MONO, color: 'var(--mn-text-3)' }}>
            hospital node · infrastructure guardrails · value exchange protocol
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
