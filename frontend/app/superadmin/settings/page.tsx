'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/lib/store'
import {
  SlidersHorizontal, ShieldCheck, DollarSign, Zap,
  Globe, Bell, Palette, Trash2, Save, RefreshCw,
  AlertTriangle, ToggleLeft, ToggleRight,
} from 'lucide-react'
import { toast } from '@/lib/toast'

const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }

type Tab = 'protocol' | 'compliance' | 'billing' | 'notifications' | 'danger'

const TABS: { id: Tab; label: string; Icon: any }[] = [
  { id: 'protocol',      label: 'Node protocol',  Icon: Zap             },
  { id: 'compliance',    label: 'Compliance',      Icon: ShieldCheck     },
  { id: 'billing',       label: 'Billing',         Icon: DollarSign      },
  { id: 'notifications', label: 'Notifications',   Icon: Bell            },
  { id: 'danger',        label: 'Danger zone',     Icon: AlertTriangle   },
]

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className="flex-shrink-0 transition-all">
      {on
        ? <ToggleRight className="w-7 h-7 text-emerald-400" strokeWidth={1.5} />
        : <ToggleLeft className="w-7 h-7" style={{ color: 'var(--mn-text-3)' }} strokeWidth={1.5} />
      }
    </button>
  )
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
      <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--mn-border)', background: 'var(--mn-surface)' }}>
        <p className="text-sm font-semibold" style={{ color: 'var(--mn-text-1)' }}>{title}</p>
        {desc && <p className="text-[11px] mt-0.5" style={{ color: 'var(--mn-text-3)' }}>{desc}</p>}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

function ToggleRow({ label, desc, on, onChange }: { label: string; desc: string; on: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--mn-text-1)' }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--mn-text-3)' }}>{desc}</p>
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  )
}

export default function SuperAdminSettings() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const [tab, setTab] = useState<Tab>('protocol')

  const [flags, setFlags] = useState({
    aiRanking: true, autoCompliance: true, pensionAutoFill: true,
    emergencyOverride: false, maintenanceMode: false,
    paymentWebhooks: true, invoiceAutoSend: true,
    emailAlerts: true, slackAlerts: false, smsAlerts: false,
    newUserAlerts: true, paymentAlerts: true, complianceAlerts: true,
  })

  const [globalRateCeiling, setGlobalRateCeiling] = useState(120)
  const [autoSuspendDays, setAutoSuspendDays] = useState(14)
  const [sessionTimeout, setSessionTimeout] = useState(480)
  const [trialDays, setTrialDays] = useState(14)

  const toggle = (key: keyof typeof flags) => setFlags(prev => ({ ...prev, [key]: !prev[key] }))

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || user?.role !== 'superadmin') { router.push('/login'); return }
  }, [isLoading, isAuthenticated, user])

  if (isLoading || !isAuthenticated || user?.role !== 'superadmin') return null

  return (
    <DashboardLayout>
      <div className="space-y-4">

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#f87171', ...MONO }}>Super admin</span>
          </div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--mn-text-1)' }}>Platform settings</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--mn-text-3)' }}>Global overrides — changes apply to all roles immediately</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 rounded-xl border overflow-x-auto" style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-shrink-0"
              style={{
                background: tab === t.id ? 'var(--mn-card)' : 'transparent',
                color: tab === t.id ? (t.id === 'danger' ? '#f87171' : 'var(--mn-text-1)') : 'var(--mn-text-3)',
                boxShadow: tab === t.id ? '0 1px 4px #0002' : 'none',
              }}>
              <t.Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Protocol ── */}
        {tab === 'protocol' && (
          <div className="space-y-4">
            <Section title="AI engine" desc="Controls AI-powered features across all roles">
              <ToggleRow label="AI candidate ranking" desc="Enable AI match scoring for recruiter talent pool" on={flags.aiRanking} onChange={() => toggle('aiRanking')} />
              <ToggleRow label="AI pension auto-fill" desc="Allow clinicians to use AI to pre-populate pension forms" on={flags.pensionAutoFill} onChange={() => toggle('pensionAutoFill')} />
            </Section>
            <Section title="Global rate ceiling" desc="Maximum hourly rate any clinician can be placed at">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--mn-text-2)' }}>Ceiling rate</span>
                  <span className="text-sm font-bold" style={{ color: '#f87171', ...MONO }}>£{globalRateCeiling}/hr</span>
                </div>
                <input type="range" min={60} max={200} step={5} value={globalRateCeiling}
                  onChange={e => setGlobalRateCeiling(+e.target.value)} className="w-full accent-red-400" />
                <div className="flex justify-between text-[10px]" style={{ color: 'var(--mn-text-3)', ...MONO }}>
                  <span>£60</span><span>£200</span>
                </div>
              </div>
            </Section>
            <Section title="Session & access" desc="Global session and access controls">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm" style={{ color: 'var(--mn-text-2)' }}>Session timeout</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--mn-text-1)', ...MONO }}>{sessionTimeout} min</span>
                </div>
                <input type="range" min={60} max={1440} step={60} value={sessionTimeout}
                  onChange={e => setSessionTimeout(+e.target.value)} className="w-full accent-red-400" />
              </div>
              <ToggleRow label="Emergency override mode" desc="Allow admins to bypass all role-gated checks" on={flags.emergencyOverride} onChange={() => toggle('emergencyOverride')} />
            </Section>
            <button onClick={() => toast.success('Protocol settings saved')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: '#f87171', color: 'white' }}>
              <Save className="w-3.5 h-3.5" strokeWidth={1.5} /> Save protocol settings
            </button>
          </div>
        )}

        {/* ── Compliance ── */}
        {tab === 'compliance' && (
          <div className="space-y-4">
            <Section title="Automated compliance" desc="Controls the automated compliance pipeline">
              <ToggleRow label="Auto-compliance scan" desc="Run nightly DBS/GMC re-validation for all clinicians" on={flags.autoCompliance} onChange={() => toggle('autoCompliance')} />
            </Section>
            <Section title="Auto-suspend overdue accounts" desc="Automatically suspend accounts with overdue payments">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--mn-text-2)' }}>Grace period</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--mn-text-1)', ...MONO }}>{autoSuspendDays} days</span>
                </div>
                <input type="range" min={1} max={60} step={1} value={autoSuspendDays}
                  onChange={e => setAutoSuspendDays(+e.target.value)} className="w-full accent-red-400" />
              </div>
            </Section>
            <Section title="Pension gateway" desc="Controls NHS Pension form access by role">
              {[
                { role: 'Clinician',  access: 'Full (Form A/B · sign · download)' },
                { role: 'Employer',   access: 'Certifying officer (Form A · must verify tier)' },
                { role: 'Recruiter',  access: 'Audit only (read-only + nudge)' },
              ].map(({ role, access }) => (
                <div key={role} className="flex items-center justify-between gap-4 py-1">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--mn-text-1)' }}>{role}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--mn-text-3)' }}>{access}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#10b98115', color: '#34d399', border: '1px solid #10b98130', ...MONO }}>
                    Enforced
                  </span>
                </div>
              ))}
            </Section>
            <button onClick={() => toast.success('Compliance settings saved')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: '#f87171', color: 'white' }}>
              <Save className="w-3.5 h-3.5" strokeWidth={1.5} /> Save compliance settings
            </button>
          </div>
        )}

        {/* ── Billing ── */}
        {tab === 'billing' && (
          <div className="space-y-4">
            <Section title="Trial &amp; subscription" desc="Default trial and plan settings for new accounts">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--mn-text-2)' }}>Default trial length</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--mn-text-1)', ...MONO }}>{trialDays} days</span>
                </div>
                <input type="range" min={7} max={30} step={1} value={trialDays}
                  onChange={e => setTrialDays(+e.target.value)} className="w-full accent-red-400" />
              </div>
              <ToggleRow label="Payment webhooks" desc="Enable Stripe webhooks for real-time payment events" on={flags.paymentWebhooks} onChange={() => toggle('paymentWebhooks')} />
              <ToggleRow label="Auto invoice dispatch" desc="Automatically email invoices on payment confirmation" on={flags.invoiceAutoSend} onChange={() => toggle('invoiceAutoSend')} />
            </Section>
            <Section title="Plan pricing (override)" desc="Current published prices — changes require redeployment">
              {[
                { plan: 'Clinician node',        price: 'Free',  note: 'Commission on placements' },
                { plan: 'Employer Starter',      price: '£149/mo',note: '' },
                { plan: 'Employer Professional', price: '£299/mo',note: 'Most popular' },
                { plan: 'Recruiter Professional',price: '£399/mo',note: '' },
                { plan: 'Recruiter Enterprise',  price: '£799/mo',note: 'Annual discount 20%' },
              ].map(({ plan, price, note }) => (
                <div key={plan} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--mn-text-1)' }}>{plan}</p>
                    {note && <p className="text-[11px]" style={{ color: 'var(--mn-text-3)' }}>{note}</p>}
                  </div>
                  <span className="text-xs font-bold" style={{ color: '#34d399', ...MONO }}>{price}</span>
                </div>
              ))}
            </Section>
            <button onClick={() => toast.success('Billing settings saved')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: '#f87171', color: 'white' }}>
              <Save className="w-3.5 h-3.5" strokeWidth={1.5} /> Save billing settings
            </button>
          </div>
        )}

        {/* ── Notifications ── */}
        {tab === 'notifications' && (
          <div className="space-y-4">
            <Section title="Alert channels" desc="Where platform alerts are delivered">
              <ToggleRow label="Email alerts" desc="Send alerts to admin@mednode.cloud" on={flags.emailAlerts} onChange={() => toggle('emailAlerts')} />
              <ToggleRow label="Slack alerts" desc="Post critical events to #platform-alerts" on={flags.slackAlerts} onChange={() => toggle('slackAlerts')} />
              <ToggleRow label="SMS alerts" desc="Send SMS for critical severity events" on={flags.smsAlerts} onChange={() => toggle('smsAlerts')} />
            </Section>
            <Section title="Alert types" desc="Which events trigger admin notifications">
              <ToggleRow label="New user registrations" desc="Alert when a new employer or recruiter signs up" on={flags.newUserAlerts} onChange={() => toggle('newUserAlerts')} />
              <ToggleRow label="Payment events" desc="Failed payments, overdue accounts, refund requests" on={flags.paymentAlerts} onChange={() => toggle('paymentAlerts')} />
              <ToggleRow label="Compliance flags" desc="DBS expiry, GMC re-validation failures, pension issues" on={flags.complianceAlerts} onChange={() => toggle('complianceAlerts')} />
            </Section>
            <button onClick={() => toast.success('Notification settings saved')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: '#f87171', color: 'white' }}>
              <Save className="w-3.5 h-3.5" strokeWidth={1.5} /> Save notification settings
            </button>
          </div>
        )}

        {/* ── Danger zone ── */}
        {tab === 'danger' && (
          <div className="space-y-4">
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#f8717150', background: '#f8717108' }}>
              <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: '#f8717130' }}>
                <AlertTriangle className="w-4 h-4 text-red-400" strokeWidth={1.5} />
                <p className="text-sm font-semibold" style={{ color: '#f87171' }}>Danger zone</p>
              </div>
              <div className="p-5 space-y-4">
                <ToggleRow label="Maintenance mode" desc="Take the platform offline — shows a maintenance page to all users" on={flags.maintenanceMode} onChange={() => toggle('maintenanceMode')} />
                <div className="border-t pt-4 space-y-3" style={{ borderColor: '#f8717120' }}>
                  {[
                    { label: 'Force GMC re-validation',    desc: 'Re-verify all 1,284 clinician nodes immediately',    action: () => toast.info('GMC re-validation triggered for all nodes') },
                    { label: 'Reset all rate ceilings',    desc: 'Revert employer and global rate ceilings to defaults', action: () => { setGlobalRateCeiling(120); toast.success('Rate ceilings reset to defaults') } },
                    { label: 'Clear AI ranking cache',     desc: 'Force re-ranking of all talent pool scores',           action: () => toast.success('AI ranking cache cleared') },
                    { label: 'Export full platform data',  desc: 'Generate encrypted backup of all platform data',       action: () => toast.info('Export queued — you will receive an email') },
                    { label: 'Purge audit logs (>90 days)',desc: 'Permanently delete audit entries older than 90 days',  action: () => toast.error('Audit log purge requires secondary confirmation') },
                  ].map(({ label, desc, action }) => (
                    <div key={label} className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--mn-text-1)' }}>{label}</p>
                        <p className="text-xs" style={{ color: 'var(--mn-text-3)' }}>{desc}</p>
                      </div>
                      <button onClick={action}
                        className="flex-shrink-0 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all"
                        style={{ borderColor: '#f8717140', color: '#f87171', background: '#f8717110' }}>
                        Execute
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  )
}
