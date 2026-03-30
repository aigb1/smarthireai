'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore, useJobsStore } from '@/lib/store'
import { DEMO_JOBS } from '@/lib/demo'
import { toast } from '@/lib/toast'
import NewBidModal from '@/components/employer/NewBidModal'
import {
  Shield, Clock, CheckCircle2, AlertCircle, Plus, MapPin,
  RefreshCw, ArrowUp, Sparkles, Zap, X, ChevronRight,
  Users, UserPlus, Mail,
} from 'lucide-react'

const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }

const AI_STEPS = [
  'Parsing bid requirements…',
  'Scanning active postings…',
  'Ranking by relevance…',
]

const AI_SUGGESTED_BIDS = [
  'Show live bids only',
  'Highest salary roles',
  'Emergency and urgent positions',
  'Draft bids needing publish',
  'London-based postings',
]

function aiFilterJobs(query: string, allJobs: any[]): any[] {
  const q = query.toLowerCase()
  let result = [...allJobs]

  if (q.includes('live') || q.includes('published')) result = result.filter(j => j.status === 'published')
  else if (q.includes('draft')) result = result.filter(j => j.status === 'draft')
  else if (q.includes('urgent') || q.includes('emergency')) result = result.filter(j => j.status === 'urgent' || j.status === 'draft')

  const cities = ['london', 'manchester', 'birmingham', 'leeds', 'bristol', 'edinburgh']
  const city = cities.find(c => q.includes(c))
  if (city) result = result.filter(j => (j.location || '').toLowerCase().includes(city))

  if (q.includes('highest') || q.includes('salary')) result = [...result].sort((a, b) => (b.salary_min || 0) - (a.salary_min || 0))

  if (result.length === 0 || (!q.includes('live') && !q.includes('draft') && !q.includes('urgent') && !city && !q.includes('salary'))) {
    const words = q.split(/\s+/).filter(w => w.length > 3)
    const keyword = result.filter(j =>
      words.some(w => (j.title || '').toLowerCase().includes(w) || (j.description || '').toLowerCase().includes(w))
    )
    if (keyword.length) result = keyword
  }

  return result.length ? result : allJobs
}

const EMPLOYER_TEAM = [
  { id: 't1', name: 'Dr. Sarah Mitchell', initials: 'SM', role: 'HR Director',         permission: 'admin',  status: 'active',  lastSeen: 'Now',        dept: 'Human Resources' },
  { id: 't2', name: 'James Okonkwo',      initials: 'JO', role: 'Hiring Manager',       permission: 'editor', status: 'active',  lastSeen: '2 min ago',  dept: 'Workforce Planning' },
  { id: 't3', name: 'Priya Sharma',       initials: 'PS', role: 'Compliance Lead',      permission: 'editor', status: 'away',    lastSeen: '18 min ago', dept: 'Governance' },
  { id: 't4', name: 'Tom Bradley',        initials: 'TB', role: 'Ward Manager, ICU',    permission: 'viewer', status: 'offline', lastSeen: '3 hrs ago',  dept: 'Clinical Ops' },
  { id: 't5', name: 'Aisha Patel',        initials: 'AP', role: 'Finance Lead',         permission: 'viewer', status: 'active',  lastSeen: '5 min ago',  dept: 'Finance' },
  { id: 't6', name: 'Liam Hartley',       initials: 'LH', role: 'Talent Acquisition',  permission: 'editor', status: 'away',    lastSeen: '45 min ago', dept: 'HR' },
]

const PERM_STYLE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  admin:  { label: 'Admin',  color: 'rgba(255,255,255,0.85)', bg: 'rgba(255,255,255,0.10)', border: 'rgba(255,255,255,0.20)' },
  editor: { label: 'Editor', color: 'rgba(255,255,255,0.60)', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)' },
  viewer: { label: 'Viewer', color: 'var(--mn-text-3)', bg: 'var(--mn-surface)', border: 'var(--mn-border)' },
}

const STATUS_DOT: Record<string, string> = {
  active: 'bg-emerald-400',
  away:   'bg-amber-400',
  offline:'bg-zinc-500',
}

const EMPLOYER_ROLES = ['HR Manager', 'Hiring Manager', 'Ward Manager', 'Compliance Officer', 'Finance Lead', 'Admin']
const PERMISSIONS    = ['admin', 'editor', 'viewer']

function FillRateRing({ value }: { value: number }) {
  const r = 36, circ = 2 * Math.PI * r
  const pct = Math.min(Math.max(value, 0), 100)
  return (
    <div className="relative h-24 w-24 flex-shrink-0">
      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="var(--mn-border)" strokeWidth="6" />
        <circle cx="48" cy="48" r={r} fill="none" stroke="#22c55e" strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-semibold" style={{ color: 'var(--mn-text-1)' }}>{Math.round(pct)}</span>
      </div>
    </div>
  )
}

export default function EmployerDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const { jobs, setJobs } = useJobsStore()
  const bidInputRef = useRef<HTMLTextAreaElement>(null)

  const [showNewBid, setShowNewBid] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({ totalJobs: 0, publishedJobs: 0, totalApplications: 0 })

  const [bidPrompt, setBidPrompt] = useState('')
  const [bidQuery, setBidQuery] = useState('')
  const [bidStage, setBidStage] = useState<'browse' | 'thinking' | 'ai'>('browse')
  const [bidStep, setBidStep] = useState(0)
  const [bidJobs, setBidJobs] = useState<any[]>([])

  const [teamMembers, setTeamMembers] = useState(EMPLOYER_TEAM)
  const [teamFilter, setTeamFilter] = useState<'all' | 'active' | 'admin'>('all')
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState(EMPLOYER_ROLES[0])
  const [invitePermission, setInvitePermission] = useState('editor')

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || user?.role !== 'employer') { router.push('/login'); return }
    const jobsList = DEMO_JOBS
    setJobs(jobsList as any)
    setBidJobs(jobsList as any)
    setStats({
      totalJobs: jobsList.length,
      publishedJobs: jobsList.filter(j => j.status === 'published').length,
      totalApplications: jobsList.reduce((sum, j) => sum + (j.application_count || 0), 0),
    })
  }, [isLoading, isAuthenticated, user])

  const refreshJobs = async () => {
    setRefreshing(true)
    await new Promise(r => setTimeout(r, 800))
    toast.success('Dashboard refreshed')
    setRefreshing(false)
  }

  const runBidAi = (q: string) => {
    if (!q.trim()) return
    setBidQuery(q)
    setBidStage('thinking')
    setBidStep(0)
    let step = 0
    const iv = setInterval(() => {
      step++
      setBidStep(step)
      if (step >= AI_STEPS.length - 1) {
        clearInterval(iv)
        setTimeout(() => {
          setBidJobs(aiFilterJobs(q, jobs.length ? jobs : DEMO_JOBS as any))
          setBidStage('ai')
        }, 300)
      }
    }, 380)
  }

  const submitBidAi = () => {
    if (bidPrompt.trim()) { runBidAi(bidPrompt.trim()); setBidPrompt('') }
  }

  const clearBidAi = () => {
    setBidStage('browse')
    setBidQuery('')
    setBidJobs(jobs.length ? jobs : DEMO_JOBS as any)
  }

  const sendInvite = () => {
    if (!inviteEmail.trim()) return
    const initials = inviteEmail.slice(0, 2).toUpperCase()
    setTeamMembers(prev => [...prev, {
      id: `t${Date.now()}`, name: inviteEmail, initials,
      role: inviteRole, permission: invitePermission,
      status: 'offline', lastSeen: 'Invited', dept: 'Pending',
    }])
    toast.success(`Invite sent to ${inviteEmail}`)
    setInviteEmail(''); setShowInvite(false)
  }

  if (isLoading || !isAuthenticated) return null

  const fillRate = stats.totalJobs > 0 ? Math.round((stats.publishedJobs / stats.totalJobs) * 100) : 0
  const activeGaps = stats.totalJobs - stats.publishedJobs
  const estimatedSavings = stats.totalApplications * 85
  const displayJobs = bidStage === 'ai' ? bidJobs : (jobs.length ? jobs : DEMO_JOBS)

  const filteredTeam = teamMembers.filter(m =>
    teamFilter === 'all' ? true : teamFilter === 'active' ? m.status === 'active' : m.permission === 'admin'
  )

  return (
    <DashboardLayout>
      {showNewBid && <NewBidModal onClose={() => setShowNewBid(false)} onCreated={refreshJobs} />}

      {/* Invite modal */}
      <AnimatePresence>
        {showInvite && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowInvite(false) }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border p-6 space-y-4"
              style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg border flex items-center justify-center" style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
                    <UserPlus className="w-3.5 h-3.5" style={{ color: 'var(--mn-text-3)' }} strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: 'var(--mn-text-1)' }}>Invite team member</p>
                </div>
                <button onClick={() => setShowInvite(false)} style={{ color: 'var(--mn-text-3)' }}><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: 'var(--mn-text-3)', ...MONO }}>Email address</label>
                  <div className="flex items-center gap-2 rounded-xl border px-3 py-2.5" style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--mn-text-3)' }} strokeWidth={1.5} />
                    <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                      placeholder="colleague@nhs.net" className="flex-1 bg-transparent text-sm focus:outline-none"
                      style={{ color: 'var(--mn-text-1)' }} onKeyDown={e => e.key === 'Enter' && sendInvite()} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs mb-1.5 block" style={{ color: 'var(--mn-text-3)', ...MONO }}>Role</label>
                    <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                      className="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none"
                      style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)', color: 'var(--mn-text-1)' }}>
                      {EMPLOYER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs mb-1.5 block" style={{ color: 'var(--mn-text-3)', ...MONO }}>Permission</label>
                    <select value={invitePermission} onChange={e => setInvitePermission(e.target.value)}
                      className="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none capitalize"
                      style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)', color: 'var(--mn-text-1)' }}>
                      {PERMISSIONS.map(p => <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <button onClick={sendInvite} disabled={!inviteEmail.trim()}
                className="w-full rounded-xl py-2.5 text-sm font-medium transition-all disabled:opacity-40"
                style={{ background: 'rgba(255,255,255,0.12)', color: 'white' }}>
                Send invite
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4 w-full">

        {/* ── Fill-rate panel ── */}
        <div className="rounded-2xl border p-6" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-8 w-8 rounded-lg border flex items-center justify-center flex-shrink-0" style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--mn-text-3)' }}>
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <p className="text-sm font-medium flex-1" style={{ color: 'var(--mn-text-1)' }}>Active fill rate</p>
            <button onClick={refreshJobs} disabled={refreshing}
              className="flex items-center gap-1.5 text-xs border rounded-lg px-3 py-1.5 transition-all disabled:opacity-50"
              style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)', background: 'var(--mn-surface)' }}>
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          <div className="flex items-center gap-8 flex-wrap">
            <FillRateRing value={fillRate} />
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-semibold mb-0.5" style={{ color: 'var(--mn-text-1)' }}>Fill rate</h2>
              <p className="text-sm" style={{ color: 'var(--mn-text-3)' }}>Across all active postings</p>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-xs text-orange-400/80 mb-1">Active gaps</p>
                <p className="text-orange-400 text-3xl font-semibold">{activeGaps}</p>
              </div>
              <div className="text-right">
                <p className="text-xs mb-1" style={{ color: 'var(--mn-text-3)' }}>Estimated savings</p>
                <p className="text-2xl font-semibold" style={{ color: 'var(--mn-text-1)' }}>£{estimatedSavings.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Active bids — AI driven ── */}
        <div
          className="relative rounded-2xl border overflow-hidden"
          style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-white/5" />

          <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg border flex items-center justify-center" style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--mn-text-3)' }}>
                  <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--mn-text-1)' }}>Active bids</p>
                <p className="text-[11px]" style={{ color: 'var(--mn-text-3)' }}>
                  {displayJobs.length} posting{displayJobs.length !== 1 ? 's' : ''} · AI filter enabled
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                {bidStage === 'ai' && (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full border border-white/10 bg-white/6 text-white/40 uppercase tracking-wider" style={MONO}>
                    AI filtered
                  </span>
                )}
                <button onClick={() => setShowNewBid(true)}
                  className="flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 transition-colors"
                  style={{ background: 'var(--mn-text-1)', color: 'var(--mn-bg)' }}>
                  <Plus className="w-3.5 h-3.5" /> New bid
                </button>
              </div>
            </div>

            {/* Active query pill */}
            <AnimatePresence>
              {bidStage === 'ai' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] flex-1 min-w-0"
                    style={{ borderColor: 'var(--mn-border)', background: 'var(--mn-surface)', color: 'var(--mn-text-3)', ...MONO }}>
                    <Sparkles className="w-3 h-3 text-white/40 flex-shrink-0" strokeWidth={1.5} />
                    <span className="truncate">&ldquo;{bidQuery}&rdquo;</span>
                  </div>
                  <button onClick={clearBidAi} className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full border transition-all flex-shrink-0"
                    style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)', background: 'var(--mn-surface)' }}>
                    <X className="w-3 h-3" /> reset
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI prompt bar */}
            <div className="relative rounded-xl border transition-all duration-200 focus-within:border-white/20"
              style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
              <div className="absolute left-4 top-3.5 text-white/28">
                <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
              </div>
              <textarea
                ref={bidInputRef}
                rows={2}
                value={bidPrompt}
                onChange={e => setBidPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitBidAi() } }}
                placeholder="Filter bids by specialty, status, location or urgency…"
                className="w-full bg-transparent resize-none pl-10 pr-12 py-3.5 text-sm focus:outline-none leading-relaxed placeholder:text-[13px]"
                style={{ color: 'var(--mn-text-1)', caretColor: 'var(--mn-text-1)' }}
              />
              <button onClick={submitBidAi} disabled={!bidPrompt.trim() || bidStage === 'thinking'}
                className="absolute right-3 bottom-2.5 h-7 w-7 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-30"
                style={{ background: bidPrompt.trim() ? 'rgba(255,255,255,0.16)' : 'var(--mn-nav-hover-bg)' }}>
                <ArrowUp className="w-3.5 h-3.5 text-white" strokeWidth={2} />
              </button>
            </div>

            {/* Suggested */}
            <div className="flex flex-wrap gap-2">
              {AI_SUGGESTED_BIDS.map((s, i) => (
                <button key={i} onClick={() => { setBidPrompt(s); bidInputRef.current?.focus() }}
                  className="text-[11px] px-3 py-1.5 rounded-full border transition-all hover:border-white/15"
                  style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)', background: 'var(--mn-surface)' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* AI thinking */}
          <AnimatePresence>
            {bidStage === 'thinking' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-5 pb-4 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-3.5 h-3.5 text-white/40 animate-pulse" strokeWidth={1.5} />
                  <span className="text-sm" style={{ color: 'var(--mn-text-1)' }}>Filtering bids…</span>
                  <div className="flex gap-1 ml-auto">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-white/50"
                        animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }} />
                    ))}
                  </div>
                </div>
                {AI_STEPS.map((step, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className={`h-1.5 w-1.5 rounded-full ${i <= bidStep ? 'bg-white/50' : 'bg-zinc-700'}`} />
                    <span className="text-xs" style={{ color: i <= bidStep ? 'var(--mn-text-2)' : 'var(--mn-text-3)', ...MONO }}>{step}</span>
                    {i === bidStep && <motion.span className="text-xs text-white/40" style={MONO} animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>▋</motion.span>}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Job cards */}
          {bidStage !== 'thinking' && (
            <div className="px-5 pb-5">
              {displayJobs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm" style={{ color: 'var(--mn-text-3)' }}>No bids matched — try adjusting your query</p>
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-1" style={{ touchAction: 'pan-x', scrollbarWidth: 'none' }}>
                  {(displayJobs as any[]).slice(0, 6).map((job: any) => (
                    <div key={job.id}
                      onClick={() => router.push(`/employer/jobs/${job.id}`)}
                      className="flex-shrink-0 w-60 rounded-xl border p-4 cursor-pointer transition-all hover:border-white/8"
                      style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full border flex items-center justify-center text-xs font-medium flex-shrink-0"
                            style={{ background: 'var(--mn-nav-hover-bg)', borderColor: 'var(--mn-border)', color: 'var(--mn-text-1)' }}>
                            {job.title?.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate max-w-[100px]" style={{ color: 'var(--mn-text-1)' }}>{job.title}</p>
                            <p className="text-[10px] mt-0.5" style={{ color: 'var(--mn-text-3)' }}>{job.job_type || 'Full-time'}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 ${
                          job.status === 'published' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' : 'text-amber-400 border-amber-500/20 bg-amber-500/10'
                        }`}>
                          {job.status === 'published' ? 'Live' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-[11px] line-clamp-2 leading-relaxed mb-3" style={{ color: 'var(--mn-text-3)' }}>
                        {job.description?.slice(0, 65) || 'No description.'}
                      </p>
                      <div className="flex items-end justify-between">
                        <div>
                          {job.salary_min && <p className="text-sm font-semibold" style={{ color: 'var(--mn-text-1)' }}>£{Number(job.salary_min).toLocaleString()}<span className="text-[10px] ml-0.5" style={{ color: 'var(--mn-text-3)' }}>/yr</span></p>}
                          {job.location && <p className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: 'var(--mn-text-3)' }}><MapPin className="w-2.5 h-2.5" />{job.location}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-[10px]" style={{ color: 'var(--mn-text-3)' }}>Applicants</p>
                          <p className="text-sm font-semibold" style={{ color: 'var(--mn-text-1)' }}>{job.application_count || 0}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {displayJobs.length > 6 && (
                <div className="text-center mt-3">
                  <Link href="/employer/jobs" className="text-[11px]" style={{ color: 'var(--mn-text-3)' }}>
                    View all {displayJobs.length} bids →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Compliance panel ── */}
        <div className="rounded-2xl border p-5" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-lg border flex items-center justify-center flex-shrink-0" style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
              <Shield className="w-3.5 h-3.5" style={{ color: 'var(--mn-text-3)' }} strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--mn-text-1)' }}>Compliance overview</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Shield className="w-4 h-4" strokeWidth={1.5} style={{ color: 'var(--mn-text-3)' }} />, label: 'Job status', value: stats.publishedJobs > 0 ? '100% active' : 'No active', action: () => router.push('/employer/jobs') },
              { icon: <Clock className="w-4 h-4 text-amber-400" strokeWidth={1.5} />, label: 'Applications', value: `${stats.totalApplications} pending`, action: () => router.push('/employer/applications') },
              { icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />, label: 'Node status', value: 'Verified', action: () => toast.success('Node verified — all systems nominal') },
            ].map(({ icon, label, value, action }) => (
              <button key={label} onClick={action}
                className="rounded-xl border p-4 text-left transition-all hover:border-white/8"
                style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
                <div className="flex items-center gap-2 mb-2">{icon}<p className="text-xs" style={{ color: 'var(--mn-text-3)' }}>{label}</p></div>
                <p className="text-base font-semibold" style={{ color: 'var(--mn-text-1)' }}>{value}</p>
              </button>
            ))}
          </div>

          {activeGaps > 0 && (
            <div className="flex items-center justify-between mt-3 bg-amber-500/5 border border-amber-500/15 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
                <p className="text-amber-400/90 text-sm">
                  {activeGaps} job{activeGaps !== 1 ? 's' : ''} require publishing in the next 30 days.
                </p>
              </div>
              <Link href="/employer/jobs" className="text-xs transition-colors" style={{ color: 'var(--mn-text-3)' }}>Review →</Link>
            </div>
          )}
        </div>

        {/* ── Team / Staff panel ── */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
          {/* Purple top accent */}
          <div className="h-0.5 w-full" style={{ background: 'rgba(255,255,255,0.06)' }} />

          <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg border flex items-center justify-center flex-shrink-0" style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
                <Users className="w-3.5 h-3.5" style={{ color: 'var(--mn-text-3)' }} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: 'var(--mn-text-1)' }}>Team members</p>
                <p className="text-[11px]" style={{ color: 'var(--mn-text-3)', ...MONO }}>
                  {teamMembers.filter(m => m.status === 'active').length} active · {teamMembers.length} total
                </p>
              </div>
              <button onClick={() => setShowInvite(true)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all hover:border-white/15 "
                style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)', background: 'var(--mn-surface)' }}>
                <UserPlus className="w-3.5 h-3.5" strokeWidth={1.5} />
                Invite
              </button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1">
              {(['all', 'active', 'admin'] as const).map(f => (
                <button key={f} onClick={() => setTeamFilter(f)}
                  className="px-3 py-1 rounded-lg text-xs font-medium transition-all capitalize"
                  style={{
                    background: teamFilter === f ? 'rgba(255,255,255,0.08)' : 'transparent',
                    color: teamFilter === f ? 'var(--mn-text-1)' : 'var(--mn-text-3)',
                    border: `1px solid ${teamFilter === f ? 'rgba(255,255,255,0.12)' : 'transparent'}`,
                  }}>
                  {f === 'all' ? `All (${teamMembers.length})` : f === 'active' ? `Active (${teamMembers.filter(m => m.status === 'active').length})` : `Admins (${teamMembers.filter(m => m.permission === 'admin').length})`}
                </button>
              ))}
            </div>

            {/* Member grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AnimatePresence mode="popLayout">
                {filteredTeam.map(m => {
                  const perm = PERM_STYLE[m.permission] || PERM_STYLE.viewer
                  return (
                    <motion.div key={m.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-3 rounded-xl border px-4 py-3 transition-all hover:border-white/8"
                      style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="h-9 w-9 rounded-full border flex items-center justify-center text-xs font-semibold"
                          style={{ background: 'var(--mn-nav-hover-bg)', borderColor: 'var(--mn-border)', color: 'var(--mn-text-1)' }}>
                          {m.initials}
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 ${STATUS_DOT[m.status]}`}
                          style={{ borderColor: 'var(--mn-surface)' }} />
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate leading-tight" style={{ color: 'var(--mn-text-1)' }}>{m.name}</p>
                        <p className="text-[11px] truncate" style={{ color: 'var(--mn-text-3)' }}>{m.role} · {m.dept}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--mn-text-3)', ...MONO }}>{m.lastSeen}</p>
                      </div>
                      {/* Permission badge */}
                      <span className="text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 font-medium"
                        style={{ color: perm.color, background: perm.bg, borderColor: perm.border, ...MONO }}>
                        {perm.label}
                      </span>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 py-2">
          <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-center text-[10px] font-mono" style={{ ...MONO, color: 'var(--mn-text-3)' }}>
            sovereign ai protocol · end-to-end encrypted · 12,400+ nodes indexed
          </p>
        </div>

      </div>
    </DashboardLayout>
  )
}
