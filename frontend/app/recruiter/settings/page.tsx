'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/lib/store'
import { toast } from '@/lib/toast'
import {
  User, Bell, Shield, Palette, Trash2, Check, Moon, Sun,
  Mail, Phone, MapPin, Briefcase, Lock, Key,
  Cpu, Paintbrush, PoundSterling, Zap, Globe, EyeOff,
  Upload, Link as LinkIcon, CreditCard, Calendar, Receipt,
  CheckCircle2, Download, RefreshCw,
} from 'lucide-react'

const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }

type Tab = 'profile' | 'plan' | 'node' | 'notifications' | 'security' | 'appearance' | 'danger'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile',       label: 'Profile',       icon: User       },
  { id: 'plan',          label: 'Plan',           icon: CreditCard },
  { id: 'node',          label: 'Node protocol',  icon: Cpu        },
  { id: 'notifications', label: 'Notifications',  icon: Bell       },
  { id: 'security',      label: 'Security',        icon: Shield     },
  { id: 'appearance',    label: 'Appearance',      icon: Palette    },
  { id: 'danger',        label: 'Danger zone',     icon: Trash2     },
]

const NOTIF_TOGGLES = [
  { label: 'New candidate matches',    desc: 'Alert when clinicians match your open gaps',           key: 'matches'    },
  { label: 'Booking confirmations',    desc: 'When a clinician accepts or declines placement',       key: 'bookings'   },
  { label: 'Commission settlements',   desc: 'When commission payments are processed',               key: 'commission' },
  { label: 'Critical gap alerts',      desc: 'Urgent staffing gap notifications from trusts',        key: 'gaps'       },
  { label: 'Compliance reminders',     desc: 'DBS, GMC, indemnity expiry across your pool',         key: 'compliance' },
  { label: 'AI weekly digest',         desc: 'Weekly revenue and placement summary',                 key: 'digest'     },
]

const ACCENT_PRESETS = [
  { name: 'Mednode purple', value: 'rgba(255,255,255,0.16)' },
  { name: 'Ocean blue',     value: '#2563eb' },
  { name: 'Emerald',        value: '#059669' },
  { name: 'Rose',           value: '#e11d48' },
  { name: 'Amber',          value: '#d97706' },
  { name: 'Slate',          value: '#475569' },
]

const AGGRESSIVENESS_LABELS: Record<number, string> = {
  1: 'Conservative — no auto-rate boosts',
  2: 'Measured — small boosts 2h before shift',
  3: 'Balanced — moderate boosts from 4h out',
  4: 'Assertive — rate boosts start 8h out',
  5: 'High urgency — aggressive rate escalation',
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
      <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.4), rgba(255,255,255,0.75), transparent)' }} />
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

function ToggleRow({ label, desc, enabled, onChange, accent = 'rgba(255,255,255,0.16)' }: {
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

export default function RecruiterSettingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const [tab, setTab] = useState<Tab>('profile')

  /* Profile */
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [phone, setPhone]       = useState('+44 7900 654321')
  const [agency, setAgency]     = useState('Mednode Recruitment Ltd')
  const [location, setLocation] = useState('Manchester, UK')

  /* Node protocol */
  const [accentColor, setAccentColor]   = useState('rgba(255,255,255,0.16)')
  const [customDomain, setCustomDomain] = useState('app.mednoderecruitment.com')
  const [meshFee, setMeshFee]           = useState(8.5)
  const [aggressiveness, setAggressiveness] = useState(3)
  const [networkPublic, setNetworkPublic]   = useState(false)
  const [logoLabel, setLogoLabel]           = useState('Logo uploaded · mednode_brand.svg')
  const fileRef = useRef<HTMLInputElement>(null)

  /* Notifications */
  const [notifs, setNotifs] = useState<Record<string, boolean>>({
    matches: true, bookings: true, commission: true, gaps: true, compliance: true, digest: false,
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

  const inputStyle = { background: 'var(--mn-surface)', borderColor: 'var(--mn-border)', color: 'var(--mn-text-1)' }
  const labelStyle: React.CSSProperties = { color: 'var(--mn-text-3)', ...MONO, fontSize: '11px' }

  if (isLoading || !isAuthenticated) return null

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">

        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
            <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--mn-text-3)', ...MONO }}>workflow node · marketplace settings</p>
          </div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--mn-text-1)' }}>Settings</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--mn-text-3)' }}>Configure your white-label node, commission engine, and AI orchestration preferences</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 rounded-xl border overflow-x-auto" style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0"
              style={{ background: tab === t.id ? 'rgba(255,255,255,0.16)' : 'transparent', color: tab === t.id ? 'white' : 'var(--mn-text-3)' }}>
              <t.icon className="w-3.5 h-3.5" strokeWidth={1.5} />
              {t.label}
            </button>
          ))}
        </div>

        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>

          {/* ── PROFILE ── */}
          {tab === 'profile' && (
            <Section title="Recruiter profile">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full name',    value: name,     set: setName,     Icon: User,      placeholder: '' },
                  { label: 'Email',        value: email,    set: setEmail,    Icon: Mail,      placeholder: '', type: 'email' },
                  { label: 'Phone',        value: phone,    set: setPhone,    Icon: Phone,     placeholder: '+44 7700 000000' },
                  { label: 'Agency name',  value: agency,   set: setAgency,   Icon: Briefcase, placeholder: 'Agency name' },
                  { label: 'Location',     value: location, set: setLocation, Icon: MapPin,    placeholder: 'City, UK' },
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
              <button onClick={() => toast.success('Profile updated')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'rgba(255,255,255,0.16)', color: 'white' }}>
                <Check className="w-3.5 h-3.5" strokeWidth={2} /> Save profile
              </button>
            </Section>
          )}

          {/* ── PLAN ── */}
          {tab === 'plan' && (
            <div className="space-y-4">

              {/* Current plan card */}
              <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
                <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.4), rgba(255,255,255,0.75), transparent)' }} />
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: '#10b98118', color: '#34d399', border: '1px solid #10b98140', ...MONO }}>
                          ACTIVE
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--mn-text-3)', ...MONO }}>17 days until renewal</span>
                      </div>
                      <h2 className="text-lg font-bold" style={{ color: 'var(--mn-text-1)' }}>Recruiter node — Enterprise</h2>
                      <p className="text-sm mt-0.5" style={{ color: 'var(--mn-text-3)' }}>Mednode Recruitment Ltd · Annual billing (20% discount)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold" style={{ color: 'var(--mn-text-1)', ...MONO }}>£799</p>
                      <p className="text-xs" style={{ color: 'var(--mn-text-3)', ...MONO }}>/month · billed annually</p>
                    </div>
                  </div>

                  {/* Key dates */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                    {[
                      { label: 'Plan started',        value: '15 Jan 2026',         Icon: Calendar    },
                      { label: 'Current period',      value: '15 Mar 2026',         Icon: Calendar    },
                      { label: 'Renews on',           value: '15 Apr 2026',         Icon: RefreshCw   },
                      { label: 'Payment method',      value: 'Mastercard ···· 0813',Icon: CreditCard  },
                    ].map(({ label, value, Icon }) => (
                      <div key={label} className="rounded-xl border p-3" style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon className="w-3 h-3 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.75)' }} strokeWidth={1.5} />
                          <p className="text-[10px]" style={{ color: 'var(--mn-text-3)', ...MONO }}>{label}</p>
                        </div>
                        <p className="text-xs font-semibold" style={{ color: 'var(--mn-text-1)', ...MONO }}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Usage stats */}
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {[
                      { label: 'Active placements', value: '14',    sub: 'this month'   },
                      { label: 'Nodes in pool',      value: '847',   sub: 'clinicians'  },
                      { label: 'Commission earned',  value: '£14.2k',sub: 'Mar 2026'    },
                    ].map(({ label, value, sub }) => (
                      <div key={label} className="rounded-xl border p-3 text-center" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' }}>
                        <p className="text-base font-bold" style={{ color: 'rgba(255,255,255,0.75)', ...MONO }}>{value}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--mn-text-3)' }}>{label}</p>
                        <p className="text-[10px]" style={{ color: 'var(--mn-text-3)', ...MONO }}>{sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Plan features included */}
              <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
                <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--mn-border)', background: 'var(--mn-surface)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--mn-text-1)' }}>{"What's included in your plan"}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.15)', ...MONO }}>Enterprise</span>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    'Full talent pool access (12k+ nodes)',
                    'Unlimited team members',
                    'Network velocity dashboard',
                    'Critical gap intelligence',
                    'Candidate bookmark & shortlist',
                    'Settlement ledger & commission tracking',
                    'AI-powered candidate matching',
                    'NHS Pension audit orchestration',
                    'White-label branding & custom domain',
                    'Dedicated protocol manager',
                  ].map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-purple-400" strokeWidth={2} />
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
                    { period: 'March 2026',   date: '15 Mar 2026', amount: '£799.00', status: 'Paid' },
                    { period: 'February 2026',date: '15 Feb 2026', amount: '£799.00', status: 'Paid' },
                    { period: 'January 2026', date: '15 Jan 2026', amount: '£799.00', status: 'Paid' },
                    { period: 'December 2025',date: '15 Dec 2025', amount: '£799.00', status: 'Paid' },
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
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#10b98118', color: '#34d399', border: '1px solid #10b98140', ...MONO }}>
                          {inv.status}
                        </span>
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

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button onClick={() => toast.success('Redirecting to billing portal…')}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold" style={{ background: 'rgba(255,255,255,0.16)', color: 'white' }}>
                  <CreditCard className="w-3.5 h-3.5" strokeWidth={1.5} /> Manage billing
                </button>
                <button onClick={() => toast.error('Contact your account manager to modify your plan')}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium border transition-all"
                  style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)', background: 'var(--mn-surface)' }}>
                  Contact account manager
                </button>
              </div>
            </div>
          )}

          {/* ── NODE PROTOCOL ── */}
          {tab === 'node' && (
            <div className="space-y-4">

              {/* White-label branding */}
              <Section title="White-label branding" desc="Upload your logo, choose your accent colour, and set your custom domain for client-facing deployment.">
                <div>
                  <label style={labelStyle} className="block mb-1.5">Logo</label>
                  <input ref={fileRef} type="file" accept="image/*,.svg" className="hidden" onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) { setLogoLabel(`Logo uploaded · ${f.name}`); toast.success('Logo uploaded') }
                  }} />
                  <button onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all hover:border-purple-500/40"
                    style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-2)', background: 'var(--mn-surface)' }}>
                    <Upload className="w-3.5 h-3.5" strokeWidth={1.5} /> Upload logo
                  </button>
                  <p className="text-[11px] mt-1.5" style={{ color: 'var(--mn-text-3)', ...MONO }}>{logoLabel}</p>
                </div>

                <div>
                  <label style={labelStyle} className="block mb-2">Accent colour</label>
                  <div className="flex flex-wrap gap-2">
                    {ACCENT_PRESETS.map(p => (
                      <button key={p.value} onClick={() => { setAccentColor(p.value); toast.success(`Accent colour set to ${p.name}`) }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs"
                        style={{
                          borderColor: accentColor === p.value ? p.value : 'var(--mn-border)',
                          background: accentColor === p.value ? `${p.value}20` : 'var(--mn-surface)',
                          color: accentColor === p.value ? p.value : 'var(--mn-text-3)',
                        }}>
                        <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: p.value }} />
                        {p.name}
                        {accentColor === p.value && <Check className="w-3 h-3" strokeWidth={2} />}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2 rounded-xl border px-3 py-2.5" style={inputStyle}>
                    <Paintbrush className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accentColor }} strokeWidth={1.5} />
                    <input value={accentColor} onChange={e => setAccentColor(e.target.value)} placeholder="rgba(255,255,255,0.16)"
                      className="flex-1 bg-transparent text-sm focus:outline-none" style={{ color: 'var(--mn-text-1)', ...MONO }} />
                    <span className="h-4 w-4 rounded-full flex-shrink-0" style={{ background: accentColor }} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle} className="block mb-1.5">Custom domain</label>
                  <div className="flex items-center gap-2 rounded-xl border px-3 py-2.5" style={inputStyle}>
                    <LinkIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--mn-text-3)' }} strokeWidth={1.5} />
                    <input value={customDomain} onChange={e => setCustomDomain(e.target.value)} placeholder="app.youragency.com"
                      className="flex-1 bg-transparent text-sm focus:outline-none" style={{ color: 'var(--mn-text-1)' }} />
                  </div>
                  <p className="text-[11px] mt-1.5" style={{ color: 'var(--mn-text-3)' }}>Point your DNS CNAME to <code style={{ ...MONO, color: 'var(--mn-text-2)' }}>proxy.mednode.cloud</code></p>
                </div>
              </Section>

              {/* Commission engine */}
              <Section title="Commission engine" desc="Set your mesh fee — the percentage taken on each completed placement transaction.">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm" style={{ color: 'var(--mn-text-1)' }}>Mesh (handshake) fee</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--mn-text-3)' }}>Applied per completed shift settlement</p>
                    </div>
                    <span className="text-sm font-semibold px-2.5 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)', ...MONO }}>
                      {meshFee.toFixed(1)}%
                    </span>
                  </div>
                  <input type="range" min={2} max={20} step={0.5} value={meshFee} onChange={e => setMeshFee(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: 'rgba(255,255,255,0.16)', background: `linear-gradient(90deg, rgba(255,255,255,0.4) ${((meshFee - 2) / 18) * 100}%, var(--mn-border) 0%)` }} />
                  <div className="flex justify-between text-[10px]" style={{ color: 'var(--mn-text-3)', ...MONO }}>
                    <span>2.0%</span><span>20.0%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.15)' }}>
                  <PoundSterling className="w-3.5 h-3.5 text-purple-400" strokeWidth={1.5} />
                  <p className="text-xs" style={{ color: 'var(--mn-text-3)' }}>
                    At <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.75)', ...MONO }}>{meshFee.toFixed(1)}%</span> on a £880 shift: you earn <span className="font-semibold text-emerald-400" style={MONO}>£{(880 * meshFee / 100).toFixed(2)}</span>
                  </p>
                </div>
              </Section>

              {/* Agentic personality */}
              <Section title="Agentic personality" desc="Adjust how aggressively the AI fills shifts — higher urgency mode automatically boosts rates as the shift start time approaches.">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm" style={{ color: 'var(--mn-text-1)' }}>Urgency level</p>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <Zap className="w-3.5 h-3.5 text-purple-400" strokeWidth={1.5} />
                      <span className="text-xs font-semibold text-purple-400" style={MONO}>Level {aggressiveness}</span>
                    </div>
                  </div>
                  <input type="range" min={1} max={5} value={aggressiveness} onChange={e => setAggressiveness(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: 'rgba(255,255,255,0.16)', background: `linear-gradient(90deg, rgba(255,255,255,0.4) ${((aggressiveness - 1) / 4) * 100}%, var(--mn-border) 0%)` }} />
                  <div className="flex justify-between text-[10px]" style={{ color: 'var(--mn-text-3)', ...MONO }}>
                    <span>Conservative</span><span>High urgency</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.15)' }}>
                    <Zap className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" strokeWidth={1.5} />
                    <p className="text-xs" style={{ color: 'var(--mn-text-3)' }}>{AGGRESSIVENESS_LABELS[aggressiveness]}</p>
                  </div>
                </div>
              </Section>

              {/* Network visibility */}
              <Section title="Network visibility" desc="Control whether your node pool is visible to other recruiters on the mesh or kept private to your own clients.">
                <ToggleRow label="Public node pool"
                  desc="Allow other approved recruiters to access your talent pool for cross-agency placements"
                  enabled={networkPublic}
                  onChange={v => { setNetworkPublic(v); toast.success(`Network pool set to ${v ? 'public' : 'private'}`) }}
                  accent="#7c3aed" />
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{
                  background: networkPublic ? 'rgba(255,255,255,0.06)' : '#f59e0b10',
                  borderColor: networkPublic ? 'rgba(255,255,255,0.15)' : '#f59e0b40',
                }}>
                  {networkPublic
                    ? <Globe className="w-3.5 h-3.5 text-purple-400" strokeWidth={1.5} />
                    : <EyeOff className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.5} />}
                  <p className="text-xs" style={{ color: 'var(--mn-text-3)' }}>
                    {networkPublic ? 'Your pool is visible to the wider mesh · Cross-agency matching enabled' : 'Your node pool is private · Only your clients can see your clinicians'}
                  </p>
                </div>
              </Section>

              <button onClick={() => toast.success('Node protocol saved')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'rgba(255,255,255,0.16)', color: 'white' }}>
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
                    <ToggleRow label={n.label} desc={n.desc} enabled={notifs[n.key]} onChange={v => {
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
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'rgba(255,255,255,0.16)', color: 'white' }}>
                    <Check className="w-3.5 h-3.5" strokeWidth={2} /> Update password
                  </button>
                </div>
              </Section>
              <Section title="Two-factor authentication">
                <ToggleRow label="Authenticator app 2FA" desc="Use Google Authenticator or Authy for extra security"
                  enabled={twoFa} onChange={v => { setTwoFa(v); toast.success(`2FA ${v ? 'enabled' : 'disabled'}`) }} />
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
                    style={{ borderColor: theme === t ? 'rgba(255,255,255,0.16)' : 'var(--mn-border)', background: theme === t ? 'rgba(255,255,255,0.06)' : 'var(--mn-surface)' }}>
                    {t === 'dark'
                      ? <Moon className="w-4 h-4" style={{ color: theme === t ? 'rgba(255,255,255,0.75)' : 'var(--mn-text-3)' }} strokeWidth={1.5} />
                      : <Sun  className="w-4 h-4" style={{ color: theme === t ? 'rgba(255,255,255,0.75)' : 'var(--mn-text-3)' }} strokeWidth={1.5} />}
                    <div>
                      <p className="text-sm font-medium capitalize" style={{ color: theme === t ? 'rgba(255,255,255,0.75)' : 'var(--mn-text-1)' }}>{t} mode</p>
                      <p className="text-[11px]" style={{ color: 'var(--mn-text-3)' }}>{t === 'dark' ? 'Neural protocol default' : 'High contrast light'}</p>
                    </div>
                    {theme === t && <Check className="w-3.5 h-3.5 ml-auto" style={{ color: 'rgba(255,255,255,0.75)' }} strokeWidth={2} />}
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
                  { label: 'Suspend node',   desc: 'Pause your recruiter node. All active placements frozen for 72h.',     btn: 'Suspend node',   variant: 'warn'   as const },
                  { label: 'Delete account', desc: 'Permanently delete your agency account and all client data.',          btn: 'Delete account', variant: 'danger' as const },
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
          <span className="h-1 w-1 rounded-full bg-purple-500 animate-pulse" />
          <p className="text-center text-[10px]" style={{ ...MONO, color: 'var(--mn-text-3)' }}>
            workflow node · marketplace orchestration · white-label protocol
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
