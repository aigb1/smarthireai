'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/lib/store'
import { DEMO_CANDIDATES } from '@/lib/demo'
import { ArrowUp, Sparkles, MapPin, Zap, BookmarkCheck, Plus, X, ChevronRight, Users, UserPlus, Mail } from 'lucide-react'
import { toast } from '@/lib/toast'

const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }

/* ── Static data ────────────────────────────────────── */
const GAP_CARDS = [
  { id: 'g1', role: 'ICU Consultant',       trust: 'Royal London Hospital',       location: 'London',      urgency: 'CRITICAL', color: '#ef4444', nodes: 3, age: '10 min ago', query: 'ICU consultant, London, immediate start' },
  { id: 'g2', role: 'A&E Registrar',         trust: 'Manchester Royal Infirmary',  location: 'Manchester',  urgency: 'HIGH',     color: '#f97316', nodes: 2, age: '25 min ago', query: 'A&E registrar, Manchester, available now' },
  { id: 'g3', role: 'Paeds SpR',             trust: 'Birmingham Children\'s',      location: 'Birmingham',  urgency: 'HIGH',     color: '#f97316', nodes: 1, age: '42 min ago', query: 'Paediatric SpR, Birmingham, GMC-verified' },
  { id: 'g4', role: 'Consultant Anaesthetist', trust: 'Leeds Teaching Hospitals', location: 'Leeds',       urgency: 'MEDIUM',   color: '#eab308', nodes: 2, age: '1 hr ago',   query: 'Anaesthetist, Leeds, senior grade, NHS' },
]

const AI_SUGGESTED = [
  'Fill urgent ICU vacancy, London',
  'Emergency A&E registrar, NHS trust',
  'GMC-verified Paeds SpR, available now',
  'Senior anaesthetist, Leeds, immediate',
  'Match all open gaps by urgency',
]

const AI_STEPS = [
  'Parsing gap requirements…',
  'Scanning verified candidate nodes…',
  'Cross-referencing GMC credentials…',
  'Ranking matches by urgency fit…',
]

const RECRUITER_TEAM = [
  { id: 'r1', name: 'Marcus Webb',    initials: 'MW', role: 'Senior Recruiter',     permission: 'admin',  status: 'active',  lastSeen: 'Now',        sector: 'Emergency Medicine' },
  { id: 'r2', name: 'Jade Thompson',  initials: 'JT', role: 'Account Manager',      permission: 'editor', status: 'active',  lastSeen: '4 min ago',  sector: 'Acute Care' },
  { id: 'r3', name: 'Raj Mehta',      initials: 'RM', role: 'Junior Recruiter',     permission: 'editor', status: 'away',    lastSeen: '22 min ago', sector: 'Allied Health' },
  { id: 'r4', name: 'Chloe Adams',    initials: 'CA', role: 'Operations Lead',      permission: 'editor', status: 'active',  lastSeen: '8 min ago',  sector: 'Operations' },
  { id: 'r5', name: 'Ethan Clarke',   initials: 'EC', role: 'Business Development', permission: 'viewer', status: 'offline', lastSeen: '2 hrs ago',  sector: 'Commercial' },
  { id: 'r6', name: 'Yuki Tanaka',    initials: 'YT', role: 'Compliance Manager',   permission: 'editor', status: 'active',  lastSeen: '1 min ago',  sector: 'Governance' },
]

const PERM_STYLE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  admin:  { label: 'Admin',  color: 'rgba(255,255,255,0.85)', bg: 'rgba(255,255,255,0.10)', border: 'rgba(255,255,255,0.20)' },
  editor: { label: 'Editor', color: 'rgba(255,255,255,0.60)', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)' },
  viewer: { label: 'Viewer', color: 'var(--mn-text-3)', bg: 'var(--mn-surface)', border: 'var(--mn-border)' },
}
const STATUS_DOT: Record<string, string> = { active: 'bg-emerald-400', away: 'bg-amber-400', offline: 'bg-zinc-500' }
const RECRUITER_ROLES = ['Senior Recruiter', 'Junior Recruiter', 'Account Manager', 'Operations Lead', 'Compliance Manager', 'Business Development']
const PERMISSIONS = ['admin', 'editor', 'viewer']

function aiScore(candidate: any, query: string): number {
  const q = query.toLowerCase()
  let score = 52
  if ((candidate.location || '').toLowerCase().split(',').some((w: string) => q.includes(w.trim()))) score += 20
  if ((candidate.specialty || '').toLowerCase().split(' ').some((w: string) => q.includes(w))) score += 18
  ;(candidate.skills || []).forEach((s: string) => { if (q.includes(s.toLowerCase())) score += 6 })
  if (candidate.available && (q.includes('immediate') || q.includes('available') || q.includes('now'))) score += 10
  if (q.includes('senior') || q.includes('consultant')) score += candidate.experience_years >= 8 ? 9 : 0
  score += Math.floor(Math.random() * 7)
  return Math.min(99, score)
}

function scoreColor(s: number) {
  if (s >= 88) return { text: 'text-emerald-400', bar: 'bg-emerald-500' }
  if (s >= 74) return { text: 'text-amber-400',   bar: 'bg-amber-500' }
  return            { text: 'text-zinc-400',     bar: 'bg-zinc-500' }
}

export default function RecruiterDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const [candidates, setCandidates] = useState<any[]>([])
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set())

  const [teamMembers, setTeamMembers] = useState(RECRUITER_TEAM)
  const [teamFilter, setTeamFilter] = useState<'all' | 'active' | 'admin'>('all')
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState(RECRUITER_ROLES[0])
  const [invitePermission, setInvitePermission] = useState('editor')

  /* gaps AI state */
  const [gapPrompt, setGapPrompt] = useState('')
  const [gapQuery, setGapQuery] = useState('')
  const [gapStage, setGapStage] = useState<'idle' | 'thinking' | 'results'>('idle')
  const [gapStep, setGapStep] = useState(0)
  const [gapMatches, setGapMatches] = useState<any[]>([])

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || user?.role !== 'recruiter') { router.push('/login'); return }
    setCandidates(DEMO_CANDIDATES)
  }, [isLoading, isAuthenticated, user])

  const handleBookmark = (candidateId: string) => {
    setBookmarked(prev => {
      const n = new Set(prev)
      if (n.has(candidateId)) { n.delete(candidateId); toast.info('Removed from bookmarks') }
      else { n.add(candidateId); toast.success('Added to bookmarks') }
      return n
    })
  }

  const runGapAi = (q: string) => {
    if (!q.trim()) return
    setGapQuery(q)
    setGapStage('thinking')
    setGapStep(0)
    let step = 0
    const iv = setInterval(() => {
      step++
      setGapStep(step)
      if (step >= AI_STEPS.length - 1) {
        clearInterval(iv)
        setTimeout(() => {
          const scored = DEMO_CANDIDATES
            .map(c => ({ ...c, _score: aiScore(c, q) }))
            .sort((a, b) => b._score - a._score)
          setGapMatches(scored)
          setGapStage('results')
        }, 350)
      }
    }, 440)
  }

  const sendInvite = () => {
    if (!inviteEmail.trim()) return
    const initials = inviteEmail.slice(0, 2).toUpperCase()
    setTeamMembers(prev => [...prev, {
      id: `r${Date.now()}`, name: inviteEmail, initials,
      role: inviteRole, permission: invitePermission,
      status: 'offline', lastSeen: 'Invited', sector: 'Pending',
    }])
    toast.success(`Invite sent to ${inviteEmail}`)
    setInviteEmail(''); setShowInvite(false)
  }

  const submitGap = () => {
    if (gapPrompt.trim()) { runGapAi(gapPrompt.trim()); setGapPrompt('') }
  }

  const clearGap = () => {
    setGapStage('idle')
    setGapQuery('')
    setGapMatches([])
  }

  if (isLoading || !isAuthenticated) return null

  const filteredTeam = teamMembers.filter(m =>
    teamFilter === 'all' ? true : teamFilter === 'active' ? m.status === 'active' : m.permission === 'admin'
  )

  const nodesActive = candidates.length || 1204
  const scored = candidates.slice(0, 4).map(c => ({
    ...c,
    score: Math.min(99, (c.experience_years || 0) * 4 + (c.available ? 20 : 0) + 68),
  }))

  return (
    <DashboardLayout>
      <div className="space-y-4 w-full">

        {/* ── Network overview ── */}
        <div className="rounded-2xl border p-6" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 rounded-lg border flex items-center justify-center" style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--mn-text-3)' }}>
                <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--mn-text-1)' }}>Network overview</p>
          </div>
          <div className="flex gap-8 flex-wrap">
            {[
              { label: 'Nodes active', value: nodesActive.toLocaleString() },
              { label: 'Uptime',       value: '99.9%' },
              { label: 'Latency',      value: '12ms' },
              { label: 'Velocity',     value: '1.2s' },
            ].map(({ label, value }) => (
              <div key={label} className="flex-1 min-w-[80px]">
                <p className="text-xs mb-1" style={{ color: 'var(--mn-text-3)' }}>{label}</p>
                <p className="text-3xl font-semibold tracking-tight" style={{ color: 'var(--mn-text-1)' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Critical gaps — AI driven ── */}
        <div
          className="relative rounded-2xl border overflow-hidden"
          style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}
        >
          {/* top accent */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

          <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg border flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.25)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.5">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--mn-text-1)' }}>Critical gaps</p>
                <p className="text-[11px]" style={{ color: 'var(--mn-text-3)' }}>
                  {GAP_CARDS.length} open positions · AI match enabled
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full border" style={{ borderColor: 'var(--mn-border)', background: 'var(--mn-surface)' }}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                </span>
                <span className="text-[9px] font-mono tracking-widest uppercase" style={{ ...MONO, color: 'var(--mn-text-3)' }}>
                  {gapStage === 'results' ? 'ai matched' : 'live alerts'}
                </span>
              </div>
            </div>

            {/* Active query pill */}
            <AnimatePresence>
              {gapStage === 'results' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2"
                >
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] flex-1 min-w-0"
                    style={{ borderColor: 'var(--mn-border)', background: 'var(--mn-surface)', color: 'var(--mn-text-3)', ...MONO }}
                  >
                    <Sparkles className="w-3 h-3 text-white/40 flex-shrink-0" strokeWidth={1.5} />
                    <span className="truncate">&ldquo;{gapQuery}&rdquo;</span>
                  </div>
                  <button
                    onClick={clearGap}
                    className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full border transition-all flex-shrink-0"
                    style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)', background: 'var(--mn-surface)' }}
                  >
                    <X className="w-3 h-3" /> reset
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI prompt bar */}
            <div
              className="relative rounded-xl border transition-all duration-200 focus-within:border-white/20"
              style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}
            >
              <div className="absolute left-4 top-3.5 text-white/28">
                <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
              </div>
              <textarea
                ref={inputRef}
                rows={2}
                value={gapPrompt}
                onChange={e => setGapPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitGap() } }}
                placeholder="Describe the gap — e.g. urgent ICU consultant needed in London, GMC-verified…"
                className="w-full bg-transparent resize-none pl-10 pr-12 py-3.5 text-sm focus:outline-none leading-relaxed placeholder:text-[13px]"
                style={{ color: 'var(--mn-text-1)', caretColor: 'var(--mn-text-1)' }}
              />
              <button
                onClick={submitGap}
                disabled={!gapPrompt.trim() || gapStage === 'thinking'}
                className="absolute right-3 bottom-2.5 h-7 w-7 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-30"
                style={{ background: gapPrompt.trim() ? 'rgba(255,255,255,0.16)' : 'var(--mn-nav-hover-bg)' }}
              >
                <ArrowUp className="w-3.5 h-3.5 text-white" strokeWidth={2} />
              </button>
            </div>

            {/* Suggested */}
            <div className="flex flex-wrap gap-2">
              {AI_SUGGESTED.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setGapPrompt(s); inputRef.current?.focus() }}
                  className="text-[11px] px-3 py-1.5 rounded-full border transition-all hover:border-white/15"
                  style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)', background: 'var(--mn-surface)' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* ── AI Thinking ── */}
          <AnimatePresence>
            {gapStage === 'thinking' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-5 pb-5 space-y-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-3.5 h-3.5 text-white/40 animate-pulse" strokeWidth={1.5} />
                  <span className="text-sm font-medium" style={{ color: 'var(--mn-text-1)' }}>Matching candidates to gap…</span>
                  <div className="flex gap-1 ml-auto">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-white/50"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                      />
                    ))}
                  </div>
                </div>
                {AI_STEPS.map((step, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className={`h-1.5 w-1.5 rounded-full ${i <= gapStep ? 'bg-white/50' : 'bg-zinc-700'}`} />
                    <span className="text-xs transition-colors duration-300"
                      style={{ color: i <= gapStep ? 'var(--mn-text-2)' : 'var(--mn-text-3)', ...MONO }}>
                      {step}
                    </span>
                    {i === gapStep && (
                      <motion.span className="text-xs text-white/40" style={MONO}
                        animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>▋</motion.span>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Gap cards (idle) ── */}
          <AnimatePresence>
            {gapStage === 'idle' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-5 pb-5"
              >
                <div className="flex gap-3 overflow-x-auto pb-1" style={{ touchAction: 'pan-x' }}>
                  {GAP_CARDS.map((g, idx) => (
                    <motion.button
                      key={g.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      onClick={() => { setGapPrompt(g.query); inputRef.current?.focus() }}
                      className="flex-shrink-0 w-52 rounded-xl border p-4 text-left hover:border-white/10 transition-all duration-200 group"
                      style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}
                    >
                      {/* urgency + age */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                          style={{ ...MONO, color: g.color, background: `${g.color}18`, border: `1px solid ${g.color}40` }}
                        >
                          {g.urgency}
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--mn-text-3)' }}>{g.age}</span>
                      </div>

                      {/* Role */}
                      <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--mn-text-1)' }}>{g.role}</p>
                      <p className="text-[11px] truncate mb-3" style={{ color: 'var(--mn-text-3)' }}>{g.trust}</p>

                      <div className="h-px mb-3" style={{ background: 'var(--mn-border)' }} />

                      {/* Location + nodes */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" style={{ color: 'var(--mn-text-3)' }} strokeWidth={1.5} />
                          <span className="text-[10px]" style={{ color: 'var(--mn-text-3)' }}>{g.location}</span>
                        </div>
                        <div>
                          <span style={{ color: g.color, ...MONO }} className="text-2xl font-bold">{g.nodes}</span>
                          <span className="text-[10px] ml-1" style={{ color: 'var(--mn-text-3)' }}>open</span>
                        </div>
                      </div>

                      {/* Tap hint */}
                      <div
                        className="mt-3 flex items-center gap-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: 'rgba(255,255,255,0.55)' }}
                      >
                        <Sparkles className="w-2.5 h-2.5" strokeWidth={1.5} />
                        tap to search with AI
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── AI Results ── */}
          <AnimatePresence>
            {gapStage === 'results' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="px-5 pb-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium" style={{ color: 'var(--mn-text-2)' }}>
                    {gapMatches.length} matches
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full border border-white/10 bg-white/6 text-white/40 uppercase tracking-wider" style={MONO}>
                    AI sorted
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  {gapMatches.slice(0, 8).map((c, idx) => {
                    const s = c._score as number
                    const col = scoreColor(s)
                    return (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.04 }}
                        className="rounded-xl border p-4 flex flex-col gap-3 transition-all hover:border-white/8"
                        style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}
                      >
                        {/* Name */}
                        <div className="flex items-center gap-2.5">
                          <div
                            className="h-8 w-8 rounded-full border flex items-center justify-center text-xs font-semibold flex-shrink-0"
                            style={{ background: 'var(--mn-nav-hover-bg)', borderColor: 'var(--mn-border)', color: 'var(--mn-text-1)' }}
                          >
                            {c.name?.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate" style={{ color: 'var(--mn-text-1)' }}>{c.name}</p>
                            <p className="text-[10px] truncate" style={{ color: 'var(--mn-text-3)' }}>{c.specialty}</p>
                          </div>
                        </div>

                        {/* Score */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1">
                              <Sparkles className={`w-2.5 h-2.5 ${col.text}`} strokeWidth={1.5} />
                              <span className={`text-[9px] font-mono ${col.text}`} style={MONO}>match</span>
                            </div>
                            <span className={`text-base font-bold font-mono ${col.text}`} style={MONO}>{s}%</span>
                          </div>
                          <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--mn-border)' }}>
                            <motion.div
                              className={`h-full rounded-full ${col.bar}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${s}%` }}
                              transition={{ duration: 0.5, delay: idx * 0.04 }}
                            />
                          </div>
                        </div>

                        {/* Location + availability */}
                        <div className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1" style={{ color: 'var(--mn-text-3)' }}>
                            <MapPin className="w-2.5 h-2.5" strokeWidth={1.5} />
                            {c.location || '—'}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`h-1 w-1 rounded-full ${c.available ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                            <span style={{ color: 'var(--mn-text-3)' }}>{c.available ? 'Available' : 'Placed'}</span>
                          </div>
                        </div>

                        {/* Bookmark */}
                        <button
                          onClick={() => handleBookmark(c.id)}
                          className="w-full text-[11px] py-1.5 rounded-lg border flex items-center justify-center gap-1.5 transition-all"
                          style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)', background: 'transparent' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--mn-nav-hover-bg)'; e.currentTarget.style.color = 'var(--mn-text-1)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--mn-text-3)' }}
                        >
                          {bookmarked.has(c.id)
                            ? <><BookmarkCheck className="w-3 h-3 text-emerald-400" /> bookmarked</>
                            : <><Plus className="w-3 h-3" /> shortlist</>}
                        </button>
                      </motion.div>
                    )
                  })}
                </div>
                {gapMatches.length > 8 && (
                  <div className="text-center mt-4">
                    <Link href="/recruiter/search" className="text-xs" style={{ color: 'var(--mn-text-3)' }}>
                      View all {gapMatches.length} matches in AI search →
                    </Link>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Verified talent pool ── */}
        <div className="rounded-2xl border p-5" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-lg border flex items-center justify-center" style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--mn-text-3)' }}>
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <p className="text-sm font-medium flex-1" style={{ color: 'var(--mn-text-1)' }}>Verified talent pool</p>
            <Link href="/recruiter/candidates" className="flex items-center gap-1 text-[11px] transition-colors" style={{ color: 'var(--mn-text-3)' }}>
              view all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {scored.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border px-4 py-3 flex items-center gap-3"
                style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}
              >
                <div
                  className="h-10 w-10 rounded-full border flex items-center justify-center text-sm font-semibold flex-shrink-0"
                  style={{ background: 'var(--mn-nav-hover-bg)', borderColor: 'var(--mn-border)', color: 'var(--mn-text-1)' }}
                >
                  {c.name?.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--mn-text-1)' }}>{c.name}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--mn-text-3)' }}>{c.specialty}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-semibold font-mono" style={{ color: 'var(--mn-text-1)', ...MONO }}>{c.score}%</p>
                  <p className="text-[10px]" style={{ color: 'var(--mn-text-3)' }}>score</p>
                </div>
                <button
                  onClick={() => handleBookmark(c.id)}
                  className="transition-colors ml-1"
                  style={{ color: bookmarked.has(c.id) ? '#34d399' : 'var(--mn-text-3)' }}
                >
                  {bookmarked.has(c.id)
                    ? <BookmarkCheck className="w-4 h-4" />
                    : <Plus className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Team / Staff panel ── */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
          <div className="h-0.5 w-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg border flex items-center justify-center flex-shrink-0" style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
                <Users className="w-3.5 h-3.5" style={{ color: 'var(--mn-text-3)' }} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: 'var(--mn-text-1)' }}>Recruitment team</p>
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
                  className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
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
                      <div className="relative flex-shrink-0">
                        <div className="h-9 w-9 rounded-full border flex items-center justify-center text-xs font-semibold"
                          style={{ background: 'var(--mn-nav-hover-bg)', borderColor: 'var(--mn-border)', color: 'var(--mn-text-1)' }}>
                          {m.initials}
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 ${STATUS_DOT[m.status]}`}
                          style={{ borderColor: 'var(--mn-surface)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate leading-tight" style={{ color: 'var(--mn-text-1)' }}>{m.name}</p>
                        <p className="text-[11px] truncate" style={{ color: 'var(--mn-text-3)' }}>{m.role} · {m.sector}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--mn-text-3)', ...MONO }}>{m.lastSeen}</p>
                      </div>
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
                      placeholder="colleague@agency.com" className="flex-1 bg-transparent text-sm focus:outline-none"
                      style={{ color: 'var(--mn-text-1)' }} onKeyDown={e => e.key === 'Enter' && sendInvite()} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs mb-1.5 block" style={{ color: 'var(--mn-text-3)', ...MONO }}>Role</label>
                    <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                      className="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none"
                      style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)', color: 'var(--mn-text-1)' }}>
                      {RECRUITER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs mb-1.5 block" style={{ color: 'var(--mn-text-3)', ...MONO }}>Permission</label>
                    <select value={invitePermission} onChange={e => setInvitePermission(e.target.value)}
                      className="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none"
                      style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)', color: 'var(--mn-text-1)' }}>
                      {PERMISSIONS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
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
    </DashboardLayout>
  )
}
