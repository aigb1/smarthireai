'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/lib/store'
import { DEMO_CANDIDATES } from '@/lib/demo'
import { ArrowUp, Sparkles, MapPin, Briefcase, Bookmark, BookmarkCheck, X, Zap } from 'lucide-react'
import { toast } from '@/lib/toast'

const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }

const SUGGESTED = [
  'ICU locum consultant, London, immediate start',
  'GMC-verified A&E registrar, 5+ years',
  'Paediatric nurse, Manchester, available now',
  'Anaesthetist, NHS trust, senior grade',
  'GP locum, Bristol, flexible rota',
  'Cardiology SpR, Birmingham, 8 years exp',
]

const AI_THINKING_STEPS = [
  'Parsing clinical requirements…',
  'Scanning 12,400+ verified nodes…',
  'Matching credentials & availability…',
  'Ranking by protocol score…',
  'Compiling match report…',
]

function aiScoreCandidate(candidate: any, query: string): number {
  const q = query.toLowerCase()
  let score = 55
  const loc = (candidate.location || '').toLowerCase()
  const spec = (candidate.specialty || '').toLowerCase()
  const skills: string[] = candidate.skills || []

  if (loc && q.includes(loc)) score += 18
  if (spec && q.includes(spec)) score += 16
  skills.forEach(s => { if (q.includes(s.toLowerCase())) score += 5 })
  if (candidate.available && (q.includes('available') || q.includes('immediate') || q.includes('now'))) score += 10
  if (q.match(/\d+\+?\s*years?/) && candidate.experience_years >= 5) score += 8
  if (q.includes('senior') || q.includes('consultant')) score += candidate.experience_years >= 8 ? 8 : 0
  score += Math.floor(Math.random() * 6)
  return Math.min(99, score)
}

function scoreColor(s: number) {
  if (s >= 88) return { text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' }
  if (s >= 74) return { text: 'text-amber-400',   border: 'border-amber-500/30',   bg: 'bg-amber-500/10' }
  return            { text: 'text-zinc-400',     border: 'border-zinc-700/50',    bg: 'bg-zinc-800/40' }
}

export default function RecruiterSearchPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const [prompt, setPrompt] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [stage, setStage] = useState<'idle' | 'thinking' | 'results'>('idle')
  const [thinkingStep, setThinkingStep] = useState(0)
  const [candidates, setCandidates] = useState<any[]>([])
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || user?.role !== 'recruiter') router.push('/login')
  }, [isLoading, isAuthenticated, user])

  const runSearch = (q: string) => {
    if (!q.trim()) return
    setActiveQuery(q)
    setStage('thinking')
    setThinkingStep(0)

    let step = 0
    const interval = setInterval(() => {
      step++
      setThinkingStep(step)
      if (step >= AI_THINKING_STEPS.length - 1) {
        clearInterval(interval)
        setTimeout(() => {
          const scored = DEMO_CANDIDATES
            .map(c => ({ ...c, _score: aiScoreCandidate(c, q) }))
            .sort((a, b) => b._score - a._score)
          setCandidates(scored)
          setStage('results')
        }, 400)
      }
    }, 480)
  }

  const handleSubmit = () => {
    if (prompt.trim()) {
      runSearch(prompt.trim())
      setPrompt('')
    }
  }

  const handleBookmark = (id: string) => {
    setBookmarked(prev => {
      const n = new Set(prev)
      if (n.has(id)) { n.delete(id); toast.info('Removed from bookmarks') }
      else { n.add(id); toast.success('Candidate bookmarked') }
      return n
    })
  }

  const handleViewProfile = async (candidate: any) => {
    const id = toast.loading(`Loading ${candidate.name}'s profile…`)
    await new Promise(r => setTimeout(r, 800))
    toast.dismiss(id)
    toast.success(`Profile loaded — ${candidate.experience_years} yr exp · ${candidate.location || 'Remote'}`)
  }

  if (isLoading || !isAuthenticated || user?.role !== 'recruiter') return null

  return (
    <DashboardLayout>
      <div className="space-y-4 w-full">

        {/* ── AI Prompt Panel ── */}
        <div
          className="relative rounded-2xl border overflow-hidden"
          style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}
        >
          {/* Glow accent */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

          <div className="p-5 md:p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--mn-text-1)' }}>
                  AI candidate intelligence
                </p>
                <p className="text-[11px]" style={{ color: 'var(--mn-text-3)' }}>
                  describe the role, gap, or clinician you need
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full border" style={{ borderColor: 'var(--mn-border)', background: 'var(--mn-surface)' }}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500" />
                </span>
                <span className="text-[9px] font-mono tracking-widest uppercase" style={{ ...MONO, color: 'var(--mn-text-3)' }}>
                  mesh active
                </span>
              </div>
            </div>

            {/* Prompt input */}
            <div
              className="relative rounded-xl border transition-all duration-200 focus-within:border-purple-500/50"
              style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}
            >
              <div className="absolute left-4 top-4 text-purple-500/60">
                <Sparkles className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <textarea
                ref={inputRef}
                rows={2}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
                }}
                placeholder="e.g. Find me a GMC-verified ICU consultant in London, available immediately, 8+ years experience…"
                className="w-full bg-transparent resize-none pl-11 pr-14 py-4 text-sm focus:outline-none leading-relaxed placeholder:text-[13px]"
                style={{ color: 'var(--mn-text-1)', caretColor: 'var(--mn-text-1)' }}
              />
              <button
                onClick={handleSubmit}
                disabled={!prompt.trim() || stage === 'thinking'}
                className="absolute right-3 bottom-3 h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-30"
                style={{ background: prompt.trim() ? 'rgba(255,255,255,0.16)' : 'var(--mn-nav-hover-bg)' }}
              >
                <ArrowUp className="w-4 h-4 text-white" strokeWidth={2} />
              </button>
            </div>

            {/* Suggested queries */}
            <div className="space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-[0.15em]" style={{ ...MONO, color: 'var(--mn-text-3)' }}>
                suggested prompts
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setPrompt(s); inputRef.current?.focus() }}
                    className="text-[11px] px-3 py-1.5 rounded-full border transition-all duration-150 hover:border-purple-500/40 hover:bg-purple-500/8 text-left"
                    style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)', background: 'var(--mn-surface)' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── AI Thinking State ── */}
        <AnimatePresence>
          {stage === 'thinking' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl border p-5"
              style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-7 w-7 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-purple-400 animate-pulse" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--mn-text-1)' }}>
                  AI agent processing…
                </p>
                <div className="flex gap-1 ml-auto">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-purple-500"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                {AI_THINKING_STEPS.map((step, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${i <= thinkingStep ? 'bg-purple-500' : 'bg-zinc-700'}`} />
                    <span
                      className="text-xs transition-colors duration-300"
                      style={{ color: i <= thinkingStep ? 'var(--mn-text-2)' : 'var(--mn-text-3)', ...MONO }}
                    >
                      {step}
                    </span>
                    {i === thinkingStep && (
                      <motion.span
                        className="text-xs text-purple-400 font-mono"
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        style={MONO}
                      >
                        ▋
                      </motion.span>
                    )}
                  </div>
                ))}
              </div>
              <div
                className="mt-4 px-3 py-2 rounded-lg border text-[11px] font-mono"
                style={{ ...MONO, borderColor: 'var(--mn-border)', background: 'var(--mn-surface)', color: 'var(--mn-text-3)' }}
              >
                query: &ldquo;{activeQuery}&rdquo;
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Results ── */}
        <AnimatePresence>
          {stage === 'results' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border overflow-hidden"
              style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}
            >
              {/* Results header */}
              <div
                className="flex items-center justify-between px-5 py-4 border-b"
                style={{ borderColor: 'var(--mn-border)' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-6 w-6 rounded-md bg-purple-500/15 border border-purple-500/25 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-purple-400" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--mn-text-1)' }}>
                      {candidates.length} AI match{candidates.length !== 1 ? 'es' : ''} found
                    </p>
                    <p className="text-[10px] font-mono truncate" style={{ ...MONO, color: 'var(--mn-text-3)' }}>
                      &ldquo;{activeQuery}&rdquo;
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setStage('idle'); setActiveQuery(''); setCandidates([]) }}
                  className="flex-shrink-0 flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border transition-all"
                  style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)', background: 'var(--mn-surface)' }}
                >
                  <X className="w-3 h-3" /> clear
                </button>
              </div>

              {/* Results grid */}
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {candidates.map((candidate, idx) => {
                    const score = candidate._score as number
                    const col = scoreColor(score)
                    return (
                      <motion.div
                        key={candidate.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="rounded-xl border p-4 flex flex-col gap-3 transition-all duration-200 hover:border-purple-500/20"
                        style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}
                      >
                        {/* Name + bookmark */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="h-9 w-9 rounded-full border flex items-center justify-center text-xs font-semibold flex-shrink-0"
                              style={{ background: 'var(--mn-nav-hover-bg)', borderColor: 'var(--mn-border)', color: 'var(--mn-text-1)' }}
                            >
                              {candidate.name?.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-medium truncate" style={{ color: 'var(--mn-text-1)' }}>
                                {candidate.name}
                              </h3>
                              <p className="text-[11px] truncate" style={{ color: 'var(--mn-text-3)' }}>
                                {candidate.specialty || candidate.email}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleBookmark(candidate.id)}
                            className="p-1.5 rounded-lg transition-colors flex-shrink-0"
                            style={{ color: bookmarked.has(candidate.id) ? '#34d399' : 'var(--mn-text-3)' }}
                          >
                            {bookmarked.has(candidate.id)
                              ? <BookmarkCheck className="w-3.5 h-3.5" />
                              : <Bookmark className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* AI Match score */}
                        <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${col.bg} ${col.border}`}>
                          <Sparkles className={`w-3 h-3 flex-shrink-0 ${col.text}`} strokeWidth={1.5} />
                          <span className={`text-[11px] font-semibold font-mono ${col.text}`} style={MONO}>
                            {score}% AI match
                          </span>
                          <div
                            className="flex-1 h-1 rounded-full overflow-hidden ml-1"
                            style={{ background: 'var(--mn-border)' }}
                          >
                            <motion.div
                              className={`h-full rounded-full ${score >= 88 ? 'bg-emerald-500' : score >= 74 ? 'bg-amber-500' : 'bg-zinc-500'}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${score}%` }}
                              transition={{ duration: 0.6, delay: idx * 0.04 + 0.2 }}
                            />
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="space-y-1.5">
                          {candidate.location && (
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--mn-text-3)' }}>
                              <MapPin className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
                              {candidate.location}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--mn-text-3)' }}>
                            <Briefcase className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
                            {candidate.experience_years} years experience
                          </div>
                          {candidate.available
                            ? <span className="inline-block text-[10px] text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded-full">Available</span>
                            : <span className="inline-block text-[10px] border px-2 py-0.5 rounded-full" style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)' }}>Unavailable</span>
                          }
                        </div>

                        {/* Skills */}
                        {candidate.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {candidate.skills.slice(0, 3).map((skill: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 text-[10px] rounded-full border"
                                style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)', background: 'var(--mn-surface)' }}
                              >
                                {skill}
                              </span>
                            ))}
                            {candidate.skills.length > 3 && (
                              <span
                                className="px-2 py-0.5 text-[10px] rounded-full border"
                                style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)' }}
                              >
                                +{candidate.skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Action */}
                        <button
                          onClick={() => handleViewProfile(candidate)}
                          className="w-full text-xs py-2 rounded-lg border transition-all mt-auto font-medium"
                          style={{
                            borderColor: 'var(--mn-border)',
                            color: 'var(--mn-text-2)',
                            background: 'transparent',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'var(--mn-nav-hover-bg)'
                            e.currentTarget.style.color = 'var(--mn-text-1)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.color = 'var(--mn-text-2)'
                          }}
                        >
                          request profile →
                        </button>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Idle state hint ── */}
        {stage === 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 gap-4"
          >
            <div className="h-14 w-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-purple-400" strokeWidth={1} />
            </div>
            <div className="text-center space-y-1.5">
              <p className="text-sm font-medium" style={{ color: 'var(--mn-text-2)' }}>
                AI candidate mesh ready
              </p>
              <p className="text-xs max-w-xs" style={{ color: 'var(--mn-text-3)' }}>
                Describe your clinical gap, role, or ideal candidate above and the protocol will surface ranked matches from 12,400+ verified nodes.
              </p>
            </div>
            <div
              className="flex items-center gap-2 text-[10px] font-mono px-3 py-1.5 rounded-full border"
              style={{ ...MONO, borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)', background: 'var(--mn-surface)' }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              12,400+ nodes indexed · updated live
            </div>
          </motion.div>
        )}

      </div>
    </DashboardLayout>
  )
}
