'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/lib/store'
import { DEMO_CANDIDATES } from '@/lib/demo'
import {
  Search, UserCog, Building2, Briefcase, Users,
  ShieldCheck, ShieldOff, MoreHorizontal, X,
  CheckCircle2, AlertCircle, RefreshCw, Ban, Mail,
  ChevronDown, SlidersHorizontal,
} from 'lucide-react'
import { toast } from '@/lib/toast'

const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }

type RoleFilter = 'all' | 'clinician' | 'employer' | 'recruiter'
type StatusFilter = 'all' | 'active' | 'trial' | 'suspended'

const ALL_USERS = [
  ...DEMO_CANDIDATES.map(c => ({
    id: c.id, name: c.name, email: `${c.name.replace('Dr. ', '').replace(' ', '.').toLowerCase()}@mednode.cloud`,
    role: 'clinician' as const, status: c.available ? 'active' : 'placed' as any,
    plan: 'Free', joined: '12 Jan 2026', location: c.location, specialty: c.specialty,
  })),
  { id: 'emp-01', name: 'Royal London NHS Trust',      email: 'trust@mednode.cloud',     role: 'employer' as const, status: 'active',    plan: 'Professional', joined: '1 Feb 2026',  location: 'London',     specialty: 'Multi-specialty' },
  { id: 'emp-02', name: 'Leeds Teaching Hospitals',    email: 'ltd@mednode.cloud',       role: 'employer' as const, status: 'active',    plan: 'Starter',      joined: '14 Feb 2026', location: 'Leeds',      specialty: 'General' },
  { id: 'emp-03', name: 'QEH Birmingham NHS Trust',    email: 'qeh@mednode.cloud',       role: 'employer' as const, status: 'trial',     plan: 'Trial',        joined: '20 Mar 2026', location: 'Birmingham', specialty: 'Trauma' },
  { id: 'emp-04', name: 'North Bristol NHS Trust',     email: 'nbh@mednode.cloud',       role: 'employer' as const, status: 'suspended', plan: 'Starter',      joined: '5 Jan 2026',  location: 'Bristol',    specialty: 'General' },
  { id: 'rec-01', name: 'Agent Recruiter',             email: 'agent@mednode.cloud',     role: 'recruiter' as const,status: 'active',    plan: 'Enterprise',   joined: '15 Jan 2026', location: 'London',     specialty: 'General' },
  { id: 'rec-02', name: 'Apex Medical Staffing',       email: 'apex@mednode.cloud',      role: 'recruiter' as const,status: 'trial',     plan: 'Trial',        joined: '18 Mar 2026', location: 'Manchester', specialty: 'Emergency' },
  { id: 'rec-03', name: 'MedForce Recruitment',        email: 'medforce@mednode.cloud',  role: 'recruiter' as const,status: 'active',    plan: 'Professional', joined: '5 Feb 2026',  location: 'Birmingham', specialty: 'ICU' },
]

const roleIcon = { clinician: Users, employer: Building2, recruiter: Briefcase }
const roleColor = { clinician: '#818cf8', employer: '#34d399', recruiter: '#f59e0b' }
const statusBadge: Record<string, { bg: string; color: string }> = {
  active:    { bg: '#10b98115', color: '#34d399' },
  trial:     { bg: '#f59e0b15', color: '#f59e0b' },
  suspended: { bg: '#f8717115', color: '#f87171' },
  placed:    { bg: '#818cf815', color: '#818cf8' },
}

function UserDrawer({ u, onClose }: { u: typeof ALL_USERS[0]; onClose: () => void }) {
  const Icon = roleIcon[u.role]
  const [suspended, setSuspended] = useState(u.status === 'suspended')

  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="rounded-2xl border overflow-hidden flex flex-col"
      style={{ background: 'var(--mn-card)', borderColor: '#f8717140', boxShadow: '0 0 0 1px #f8717120', position: 'sticky', top: 16, maxHeight: 'calc(100vh - 120px)' }}>
      <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #f87171, #f59e0b, transparent)' }} />

      <div className="flex-shrink-0 px-5 pt-4 pb-4 border-b" style={{ borderColor: 'var(--mn-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold tracking-widest uppercase"
            style={{ background: '#f8717118', color: '#f87171', border: '1px solid #f8717140', ...MONO }}>
            Admin view
          </span>
          <button onClick={onClose} className="h-7 w-7 rounded-lg border flex items-center justify-center"
            style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)', background: 'var(--mn-surface)' }}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl border-2 flex items-center justify-center text-base font-bold flex-shrink-0"
            style={{ background: roleColor[u.role] + '18', borderColor: roleColor[u.role] + '50', color: roleColor[u.role] }}>
            {u.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--mn-text-1)' }}>{u.name}</p>
            <p className="text-xs capitalize" style={{ color: roleColor[u.role] }}>{u.role} · {u.plan}</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--mn-text-3)', ...MONO }}>{u.email}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" style={{ scrollbarWidth: 'none' }}>

        {/* Status + details */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Status',    value: u.status },
            { label: 'Plan',      value: u.plan },
            { label: 'Joined',    value: u.joined },
            { label: 'Location',  value: u.location },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border p-2.5" style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
              <p className="text-[9px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--mn-text-3)', ...MONO }}>{label}</p>
              <p className="text-xs font-semibold capitalize" style={{ color: 'var(--mn-text-1)' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Compliance */}
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--mn-text-3)', ...MONO }}>Compliance</p>
          <div className="space-y-1.5">
            {(u.role === 'clinician' ? [
              { label: 'GMC registration', ok: true },
              { label: 'DBS Enhanced', ok: true },
              { label: 'Right to work', ok: true },
              { label: 'Indemnity insurance', ok: true },
            ] : [
              { label: 'Company verified', ok: true },
              { label: 'Director check', ok: u.status !== 'suspended' },
              { label: 'Bank details', ok: u.status === 'active' },
            ]).map(({ label, ok }) => (
              <div key={label} className="flex items-center gap-2">
                {ok
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" strokeWidth={1.5} />
                  : <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" strokeWidth={1.5} />
                }
                <span className="text-xs" style={{ color: 'var(--mn-text-2)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Admin actions */}
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--mn-text-3)', ...MONO }}>Admin actions</p>
          <div className="space-y-2">
            <button onClick={() => { setSuspended(!suspended); toast.success(suspended ? `${u.name} reactivated` : `${u.name} suspended`) }}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all"
              style={{ borderColor: suspended ? '#10b98140' : '#f8717140', color: suspended ? '#34d399' : '#f87171', background: suspended ? '#10b98110' : '#f8717110' }}>
              {suspended ? <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Ban className="w-3.5 h-3.5" strokeWidth={1.5} />}
              {suspended ? 'Reactivate account' : 'Suspend account'}
            </button>
            <button onClick={() => toast.info(`Password reset sent to ${u.email}`)}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-medium"
              style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-2)', background: 'var(--mn-surface)' }}>
              <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} /> Send password reset
            </button>
            <button onClick={() => toast.info(`Message sent to ${u.email}`)}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-medium"
              style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-2)', background: 'var(--mn-surface)' }}>
              <Mail className="w-3.5 h-3.5" strokeWidth={1.5} /> Send message
            </button>
            <button onClick={() => toast.info('Impersonation session started')}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-medium"
              style={{ borderColor: '#f59e0b30', color: '#f59e0b', background: '#f59e0b08' }}>
              <UserCog className="w-3.5 h-3.5" strokeWidth={1.5} /> Impersonate (view as user)
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function SuperAdminUsers() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || user?.role !== 'superadmin') { router.push('/login'); return }
  }, [isLoading, isAuthenticated, user])

  if (isLoading || !isAuthenticated || user?.role !== 'superadmin') return null

  const filtered = ALL_USERS.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false
    if (statusFilter !== 'all' && u.status !== statusFilter) return false
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const selectedUser = ALL_USERS.find(u => u.id === selectedId) ?? null

  return (
    <DashboardLayout>
      <div className="space-y-4">

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#f87171', ...MONO }}>Super admin</span>
          </div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--mn-text-1)' }}>User management</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--mn-text-3)' }}>All roles · Override controls · Compliance</p>
        </div>

        {/* Summary pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'All users',   count: ALL_USERS.length,                         id: 'all'      as RoleFilter, color: 'var(--mn-text-3)' },
            { label: 'Clinicians',  count: ALL_USERS.filter(u=>u.role==='clinician').length, id: 'clinician' as RoleFilter, color: '#818cf8' },
            { label: 'Employers',   count: ALL_USERS.filter(u=>u.role==='employer').length,  id: 'employer'  as RoleFilter, color: '#34d399' },
            { label: 'Recruiters',  count: ALL_USERS.filter(u=>u.role==='recruiter').length, id: 'recruiter' as RoleFilter, color: '#f59e0b' },
          ].map(({ label, count, id, color }) => (
            <button key={id} onClick={() => setRoleFilter(id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all"
              style={{
                borderColor: roleFilter === id ? color + '60' : 'var(--mn-border)',
                background: roleFilter === id ? color + '15' : 'var(--mn-surface)',
                color: roleFilter === id ? color : 'var(--mn-text-3)',
              }}>
              {label} <span className="font-bold" style={MONO}>{count}</span>
            </button>
          ))}
        </div>

        {/* Search + status filter */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-0 rounded-xl border px-3 py-2"
            style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--mn-text-3)' }} strokeWidth={1.5} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="flex-1 bg-transparent text-sm focus:outline-none min-w-0"
              style={{ color: 'var(--mn-text-1)' }} />
            {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5" style={{ color: 'var(--mn-text-3)' }} /></button>}
          </div>
          <div className="flex gap-1.5">
            {(['all','active','trial','suspended'] as StatusFilter[]).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className="px-3 py-2 rounded-xl border text-xs font-medium capitalize transition-all"
                style={{
                  borderColor: statusFilter === s ? '#f8717160' : 'var(--mn-border)',
                  background: statusFilter === s ? '#f8717115' : 'var(--mn-surface)',
                  color: statusFilter === s ? '#f87171' : 'var(--mn-text-3)',
                }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table + drawer */}
        <div className={`grid gap-4 items-start ${selectedUser ? 'grid-cols-1 xl:grid-cols-[1fr_340px]' : 'grid-cols-1'}`}>

          <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
            <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: 'var(--mn-border)', background: 'var(--mn-surface)' }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--mn-text-2)' }}>{filtered.length} users</p>
              {selectedUser && (
                <button onClick={() => setSelectedId(null)} className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border"
                  style={{ borderColor: '#f8717140', background: '#f8717112', color: '#f87171', ...MONO }}>
                  <X className="w-2.5 h-2.5" /> close panel
                </button>
              )}
            </div>

            <div className="divide-y" style={{ borderColor: 'var(--mn-border)' }}>
              {filtered.map((u, i) => {
                const Icon = roleIcon[u.role]
                const badge = statusBadge[u.status] ?? statusBadge.active
                const isSelected = selectedId === u.id
                return (
                  <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    onClick={() => setSelectedId(isSelected ? null : u.id)}
                    className="flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-all"
                    style={{
                      background: isSelected ? '#f8717108' : 'transparent',
                      borderLeft: isSelected ? '2px solid #f87171' : '2px solid transparent',
                    }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--mn-surface)' }}
                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent' }}>

                    <div className="h-9 w-9 rounded-xl border flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{ background: roleColor[u.role] + '15', borderColor: roleColor[u.role] + '40', color: roleColor[u.role] }}>
                      {u.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--mn-text-1)' }}>{u.name}</p>
                        <Icon className="w-3 h-3 flex-shrink-0" style={{ color: roleColor[u.role] }} strokeWidth={1.5} />
                      </div>
                      <p className="text-[11px] truncate" style={{ color: 'var(--mn-text-3)', ...MONO }}>{u.email}</p>
                    </div>

                    <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                      <span className="text-[10px] capitalize" style={{ color: 'var(--mn-text-3)', ...MONO }}>{u.role}</span>
                      <span className="text-[10px]" style={{ color: 'var(--mn-text-3)', ...MONO }}>{u.plan}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full capitalize"
                        style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.color}30`, ...MONO }}>
                        {u.status}
                      </span>
                      <span className="text-[11px]" style={{ color: 'var(--mn-text-3)', ...MONO }}>{u.joined}</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {selectedUser && (
              <UserDrawer key={selectedUser.id} u={selectedUser} onClose={() => setSelectedId(null)} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  )
}
