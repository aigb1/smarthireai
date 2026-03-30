'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/lib/store'
import { toast } from '@/lib/toast'
import {
  User, Bell, Shield, Palette, Trash2, Check, Moon, Sun,
  Mail, Phone, MapPin, Stethoscope, Lock, Key,
  Cpu, RefreshCw, BanknoteIcon, PiggyBank,
  Clock, CalendarOff,
} from 'lucide-react'

const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }

type Tab = 'profile' | 'node' | 'notifications' | 'security' | 'appearance' | 'danger'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile',       label: 'Profile',        icon: User            },
  { id: 'node',          label: 'Node protocol',   icon: Cpu             },
  { id: 'notifications', label: 'Notifications',   icon: Bell            },
  { id: 'security',      label: 'Security',        icon: Shield          },
  { id: 'appearance',    label: 'Appearance',      icon: Palette         },
  { id: 'danger',        label: 'Danger zone',     icon: Trash2          },
]

const NOTIF_TOGGLES = [
  { label: 'Shift match alerts',  desc: 'Instant alerts when new shifts match your profile', key: 'matches'  },
  { label: 'Bid confirmations',   desc: 'When a trust accepts or declines your bid',         key: 'bids'     },
  { label: 'Document reminders',  desc: 'DBS, GMC, indemnity expiry reminders',              key: 'docs'     },
  { label: 'Wallet & payments',   desc: 'When payments are received or pending',             key: 'wallet'   },
  { label: 'Schedule changes',    desc: 'Shift cancellations or time changes',               key: 'schedule' },
  { label: 'AI weekly digest',    desc: 'Weekly summary of activity and earnings',           key: 'digest'   },
]

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
      <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #10b981, #7c3aed, transparent)' }} />
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

function ToggleRow({ label, desc, enabled, onChange, accent = '#7c3aed' }: {
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
        <span className="text-sm font-semibold px-2.5 py-1 rounded-lg" style={{ background: '#7c3aed20', color: '#a78bfa', ...MONO }}>
          {value}{unit}
        </span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: '#7c3aed', background: `linear-gradient(90deg, #7c3aed ${((value - min) / (max - min)) * 100}%, var(--mn-border) 0%)` }} />
      <div className="flex justify-between text-[10px]" style={{ color: 'var(--mn-text-3)', ...MONO }}>
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  )
}

export default function ClinicianSettingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const [tab, setTab] = useState<Tab>('profile')

  /* Profile */
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [phone, setPhone]         = useState('+44 7700 123456')
  const [specialty, setSpecialty] = useState('Emergency Medicine')
  const [gmcNumber, setGmcNumber] = useState('7654321')
  const [location, setLocation]   = useState('London, UK')

  /* Node protocol */
  const [credSync, setCredSync]         = useState(true)
  const [autoPension, setAutoPension]   = useState(true)
  const [quietHoursOn, setQuietHoursOn] = useState(false)
  const [quietFrom, setQuietFrom]       = useState('22:00')
  const [quietTo, setQuietTo]           = useState('07:00')
  const [blackout, setBlackout]         = useState('2026-04-14, 2026-04-21')
  const [taxReserve, setTaxReserve]     = useState(20)
  const [radius, setRadius]             = useState(35)
  const [bankName, setBankName]         = useState('Barclays Bank')
  const [sortCode, setSortCode]         = useState('20-45-13')
  const [accountNo, setAccountNo]       = useState('12345678')

  /* Notifications */
  const [notifs, setNotifs] = useState<Record<string, boolean>>({
    matches: true, bids: true, docs: true, wallet: true, schedule: true, digest: false,
  })

  /* Security */
  const [twoFa, setTwoFa]       = useState(false)
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
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--mn-text-3)', ...MONO }}>physician node · sovereignty settings</p>
          </div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--mn-text-1)' }}>Settings</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--mn-text-3)' }}>Manage your node configuration, credentials, and deployment preferences</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 rounded-xl border overflow-x-auto" style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0"
              style={{ background: tab === t.id ? '#7c3aed' : 'transparent', color: tab === t.id ? 'white' : 'var(--mn-text-3)' }}>
              <t.icon className="w-3.5 h-3.5" strokeWidth={1.5} />
              {t.label}
            </button>
          ))}
        </div>

        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>

          {/* ── PROFILE ── */}
          {tab === 'profile' && (
            <Section title="Clinician profile">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Display name',    value: name,      set: setName,      Icon: User,            placeholder: '' },
                  { label: 'Email',           value: email,     set: setEmail,     Icon: Mail,            placeholder: '', type: 'email' },
                  { label: 'Phone',           value: phone,     set: setPhone,     Icon: Phone,           placeholder: '+44 7700 000000' },
                  { label: 'Specialty',       value: specialty, set: setSpecialty, Icon: Stethoscope,     placeholder: '' },
                  { label: 'GMC / NMC number',value: gmcNumber, set: setGmcNumber, Icon: Shield,          placeholder: '7654321' },
                  { label: 'Base location',   value: location,  set: setLocation,  Icon: MapPin,          placeholder: 'London, UK' },
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ background: '#7c3aed', color: 'white' }}>
                <Check className="w-3.5 h-3.5" strokeWidth={2} /> Save profile
              </button>
            </Section>
          )}

          {/* ── NODE PROTOCOL ── */}
          {tab === 'node' && (
            <div className="space-y-4">

              {/* Credential auto-sync */}
              <Section title="Credential auto-sync" desc="Allow the AI to handshake with GMC and DBS databases every 24 hours to keep your node verified on the mesh.">
                <ToggleRow label="Enable credential auto-sync"
                  desc="Verifies GMC registration, DBS certificate, and indemnity status automatically"
                  enabled={credSync} onChange={v => { setCredSync(v); toast.success(`Credential sync ${v ? 'enabled' : 'paused'}`) }}
                  accent="#10b981" />
                {credSync && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ background: '#10b98110', borderColor: '#10b98140' }}>
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
                    <p className="text-xs text-emerald-400" style={MONO}>Last synced: Today 03:41 · GMC verified · DBS valid</p>
                  </div>
                )}
              </Section>

              {/* Availability protocol */}
              <Section title="Availability protocol" desc="Set quiet hours or blackout dates where your node is invisible to the mesh — no signals or bids received.">
                <ToggleRow label="Quiet hours" desc="Hide your node from all matching during these hours daily"
                  enabled={quietHoursOn} onChange={setQuietHoursOn} />
                {quietHoursOn && (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Quiet from', value: quietFrom, set: setQuietFrom, Icon: Clock },
                      { label: 'Until',       value: quietTo,   set: setQuietTo,   Icon: Clock },
                    ].map(({ label, value, set, Icon }) => (
                      <div key={label}>
                        <label style={labelStyle} className="block mb-1.5">{label}</label>
                        <div className="flex items-center gap-2 rounded-xl border px-3 py-2.5" style={inputStyle}>
                          <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--mn-text-3)' }} strokeWidth={1.5} />
                          <input type="time" value={value} onChange={e => set(e.target.value)}
                            className="flex-1 bg-transparent text-sm focus:outline-none" style={{ color: 'var(--mn-text-1)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <label style={labelStyle} className="block mb-1.5">Blackout dates (comma-separated YYYY-MM-DD)</label>
                  <div className="flex items-center gap-2 rounded-xl border px-3 py-2.5" style={inputStyle}>
                    <CalendarOff className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--mn-text-3)' }} strokeWidth={1.5} />
                    <input value={blackout} onChange={e => setBlackout(e.target.value)}
                      placeholder="2026-04-14, 2026-04-21"
                      className="flex-1 bg-transparent text-sm focus:outline-none" style={{ color: 'var(--mn-text-1)' }} />
                  </div>
                </div>
              </Section>

              {/* Proximity radius */}
              <Section title="Proximity radius" desc="Maximum travel distance for surge signals. Shifts beyond this radius will not appear in your feed.">
                <SliderRow label="Max travel distance" desc="Applies to locum shifts only" value={radius} min={5} max={100} unit=" mi" onChange={setRadius} />
              </Section>

              {/* Financial routing */}
              <Section title="Financial routing" desc="Bank account for instant settlement payouts and automatic tax reserve.">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Bank name',      value: bankName,   set: setBankName,   placeholder: 'Barclays Bank' },
                    { label: 'Sort code',      value: sortCode,   set: setSortCode,   placeholder: '20-45-13' },
                    { label: 'Account number', value: accountNo,  set: setAccountNo,  placeholder: '12345678' },
                  ].map(({ label, value, set, placeholder }) => (
                    <div key={label}>
                      <label style={labelStyle} className="block mb-1.5">{label}</label>
                      <div className="flex items-center gap-2 rounded-xl border px-3 py-2.5" style={inputStyle}>
                        <BanknoteIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--mn-text-3)' }} strokeWidth={1.5} />
                        <input value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
                          className="flex-1 bg-transparent text-sm focus:outline-none" style={{ color: 'var(--mn-text-1)' }} />
                      </div>
                    </div>
                  ))}
                </div>
                <SliderRow label="Tax reserve percentage"
                  desc="This portion is automatically held back from every settlement into your tax reserve pot"
                  value={taxReserve} min={0} max={45} unit="%" onChange={setTaxReserve} />
              </Section>

              {/* Pension defaults */}
              <Section title="Pension defaults" desc="Automate NHS pension form creation so you never miss a qualifying shift.">
                <ToggleRow label="Auto-draft Pension Form A/B"
                  desc="Automatically generates Form A for every verified shift and Form B at month-end"
                  enabled={autoPension} onChange={v => { setAutoPension(v); toast.success(`Pension auto-draft ${v ? 'enabled' : 'disabled'}`) }}
                  accent="#10b981" />
                {autoPension && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ background: '#10b98110', borderColor: '#10b98140' }}>
                    <PiggyBank className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
                    <p className="text-xs text-emerald-400" style={MONO}>Form A auto-generates after each settled shift · Form B on the 1st of each month</p>
                  </div>
                )}
              </Section>

              <button onClick={() => toast.success('Node protocol saved')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ background: '#7c3aed', color: 'white' }}>
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
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ background: '#7c3aed', color: 'white' }}>
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
                    style={{ borderColor: theme === t ? '#7c3aed' : 'var(--mn-border)', background: theme === t ? '#7c3aed10' : 'var(--mn-surface)' }}>
                    {t === 'dark'
                      ? <Moon className="w-4 h-4" style={{ color: theme === t ? '#a78bfa' : 'var(--mn-text-3)' }} strokeWidth={1.5} />
                      : <Sun  className="w-4 h-4" style={{ color: theme === t ? '#a78bfa' : 'var(--mn-text-3)' }} strokeWidth={1.5} />}
                    <div>
                      <p className="text-sm font-medium capitalize" style={{ color: theme === t ? '#a78bfa' : 'var(--mn-text-1)' }}>{t} mode</p>
                      <p className="text-[11px]" style={{ color: 'var(--mn-text-3)' }}>{t === 'dark' ? 'Neural protocol default' : 'High contrast light'}</p>
                    </div>
                    {theme === t && <Check className="w-3.5 h-3.5 ml-auto" style={{ color: '#a78bfa' }} strokeWidth={2} />}
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
                  { label: 'Pause node',     desc: 'Suspend your clinician node. All data retained for 30 days.', btn: 'Pause node',     variant: 'warn'   as const },
                  { label: 'Delete account', desc: 'Permanently delete your account and all data. Cannot be undone.', btn: 'Delete account', variant: 'danger' as const },
                ].map(({ label, desc, btn, variant }) => (
                  <div key={label} className="flex items-center justify-between gap-4 rounded-xl border p-4" style={{ borderColor: 'var(--mn-border)', background: 'var(--mn-surface)' }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--mn-text-1)' }}>{label}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--mn-text-3)' }}>{desc}</p>
                    </div>
                    <button onClick={() => toast.error(`Contact support to ${btn.toLowerCase()}`)}
                      className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold border transition-all"
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
          <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-center text-[10px]" style={{ ...MONO, color: 'var(--mn-text-3)' }}>
            sovereign physician node · settings encrypted · value exchange protocol
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
