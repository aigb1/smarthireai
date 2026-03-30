'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/lib/store'
import { DEMO_CANDIDATES } from '@/lib/demo'
import {
  ArrowUp, Sparkles, MapPin, BookmarkCheck,
  Bookmark, Zap, X,
} from 'lucide-react'
import { toast } from '@/lib/toast'
import { CandidateModal } from '@/components/ui/CandidateModal'

const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }

const SUGGESTED = [
  'Rank by availability',
  'Senior A&E consultants, London',
  'GMC-verified, 8+ years experience',
  'Paediatrics specialists, immediate start',
  'Anaesthetists, NHS-approved',
  'Sort by highest match score',
]

const AI_THINKING_STEPS = [
  'Parsing intent…',
  'Scanning pool of verified nodes…',
  'Applying rank protocol…',
  'Sorting by match weight…',
]

const EXTRA: Record<string, {
  gmc: string; dbs: string; level: string; indemnity: string
  rightToWork: boolean; languages: string[]; trusts: string[]
  phone: string; email: string; bio: string; placements: number
}> = {
  'cand-01': { gmc: '7412309', dbs: 'Enhanced · Aug 2026', level: 'Consultant', indemnity: 'MPS · active', rightToWork: true, languages: ['English', 'Yoruba'], trusts: ['Barts Health NHS', 'UCLH'], phone: '+44 7700 900 412', email: 's.okafor@mednode.cloud', bio: 'Consultant cardiologist with extensive cath lab experience and subspecialty interest in structural heart disease and complex ACS management.', placements: 14 },
  'cand-02': { gmc: '6834512', dbs: 'Enhanced · Mar 2027', level: 'SpR ST5',    indemnity: 'MDU · active', rightToWork: true, languages: ['English', 'Welsh'],  trusts: ['QEH Birmingham', 'Sandwell NHS'], phone: '+44 7700 900 231', email: 'r.williams@mednode.cloud', bio: 'Trauma & orthopaedics registrar proficient in elective and emergency arthroplasty, with on-call experience at major trauma centres.', placements: 9 },
  'cand-03': { gmc: '7019847', dbs: 'Enhanced · Jun 2026', level: 'Consultant', indemnity: 'MPS · active', rightToWork: true, languages: ['English'],           trusts: ['Royal London', "King's College"], phone: '+44 7700 900 887', email: 'a.sterling@mednode.cloud', bio: 'Emergency medicine consultant with FRCEM distinction and 12 years of high-volume A&E and paediatric emergency experience.', placements: 27 },
  'cand-04': { gmc: '6701234', dbs: 'Enhanced · Jan 2027', level: 'Consultant', indemnity: 'MDU · active', rightToWork: true, languages: ['English', 'Urdu'],   trusts: ['MFT', 'Salford Royal'], phone: '+44 7700 900 553', email: 'm.patel@mednode.cloud', bio: 'Intensive care physician specialising in ECMO, ventilatory support, and multi-organ failure management in Level 3 ICUs.', placements: 18 },
  'cand-05': { gmc: '7234561', dbs: 'Enhanced · Nov 2026', level: 'SpR ST6',   indemnity: 'MPS · active', rightToWork: true, languages: ['English', 'Japanese'], trusts: ['GOSH', 'Evelina London'], phone: '+44 7700 900 119', email: 'y.kimura@mednode.cloud', bio: 'Paediatric registrar with PICU rotation experience, MRCPCH holder, and subspecialty interest in neonatal intensive care.', placements: 6 },
  'cand-06': { gmc: '6892341', dbs: 'Enhanced · Sep 2026', level: 'Consultant', indemnity: 'MDU · active', rightToWork: true, languages: ['English', 'Japanese'], trusts: ['Leeds Teaching Hospitals'], phone: '+44 7700 900 744', email: 'c.nakamura@mednode.cloud', bio: 'Consultant obstetrician with subspecialty in fetal medicine, colposcopy lead, and extensive caesarean section experience.', placements: 11 },
  'cand-07': { gmc: '7341098', dbs: 'Enhanced · Apr 2027', level: 'SpR ST4',   indemnity: 'MPS · active', rightToWork: true, languages: ['English', 'French'],  trusts: ['Homerton Hospital', 'Barts Health'], phone: '+44 7700 900 362', email: 'f.okonkwo@mednode.cloud', bio: 'Gastroenterology registrar with high-volume ERCP and diagnostic endoscopy lists, subspecialty interest in inflammatory bowel disease.', placements: 4 },
  'cand-08': { gmc: '6623847', dbs: 'Enhanced · Feb 2027', level: 'SpR ST3',   indemnity: 'MDU · active', rightToWork: true, languages: ['English', 'Arabic'],  trusts: ['North Bristol NHS', 'UHBW'], phone: '+44 7700 900 091', email: 'b.hassan@mednode.cloud', bio: 'Neurology registrar with stroke thrombolysis experience, EEG reporting, and TIA clinic lead at a busy DGH.', placements: 3 },
}

function aiScore(candidate: any, query: string): number {
  const q = query.toLowerCase()
  let score = 55
  const loc = (candidate.location || '').toLowerCase()
  const spec = (candidate.specialty || '').toLowerCase()
  const skills: string[] = candidate.skills || []
  if (loc && q.includes(loc)) score += 18
  if (spec && q.includes(spec)) score += 16
  skills.forEach(s => { if (q.includes(s.toLowerCase())) score += 5 })
  if (candidate.available && (q.includes('available') || q.includes('immediate') || q.includes('start'))) score += 10
  if (q.includes('senior') || q.includes('consultant')) score += candidate.experience_years >= 8 ? 10 : 0
  if (q.includes('rank') || q.includes('sort')) score += Math.floor(Math.random() * 20)
  score += Math.floor(Math.random() * 6)
  return Math.min(99, score)
}

function baseScore(c: any): number {
  return Math.min(98, (c.experience_years || 0) * 5 + (c.available ? 18 : 0) + 52)
}

function scoreColor(s: number) {
  if (s >= 88) return { cls: 'text-emerald-400', bar: '#10b981', glow: '#10b98130' }
  if (s >= 74) return { cls: 'text-amber-400',   bar: '#f59e0b',  glow: '#f59e0b30' }
  return            { cls: 'text-zinc-400',     bar: '#71717a',  glow: '#71717a20' }
}

/* ─── Section label ─── */
function SLabel({ children }: { children: string }) {
  return (
    <p className="text-[9px] font-semibold uppercase tracking-[0.14em]"
      style={{ color: 'var(--mn-text-3)', ...MONO }}>{children}</p>
  )
}

/* ─── Candidate Card ─── */
function CandidateCard({
  c, idx, isSelected, isBookmarked, stage, onSelect, onBookmark,
}: {
  c: any; idx: number; isSelected: boolean; isBookmarked: boolean
  stage: string; onSelect: () => void; onBookmark: () => void
}) {
  const s = c._score as number
  const col = scoreColor(s)
  const extra = EXTRA[c.id]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04, type: 'spring', damping: 24, stiffness: 260 }}
      onClick={onSelect}
      className="relative rounded-2xl border flex flex-col cursor-pointer transition-all duration-200 overflow-hidden group"
      style={{
        background: isSelected ? 'rgba(255,255,255,0.06)' : 'var(--mn-surface)',
        borderColor: isSelected ? 'rgba(255,255,255,0.18)' : 'var(--mn-border)',
      }}
    >

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="h-10 w-10 rounded-xl border flex items-center justify-center text-sm font-bold"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  borderColor: 'var(--mn-border)',
                  color: 'var(--mn-text-1)',
                }}>
                {c.name?.slice(0, 2).toUpperCase()}
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border ${c.available ? 'bg-emerald-500' : 'bg-zinc-600'}`}
                style={{ borderColor: 'var(--mn-surface)' }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight truncate" style={{ color: 'var(--mn-text-1)' }}>{c.name}</p>
              <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--mn-text-3)' }}>{extra?.level} · {c.specialty}</p>
            </div>
          </div>
          <button onClick={e => { e.stopPropagation(); onBookmark() }}
            className="flex-shrink-0 h-7 w-7 rounded-lg border flex items-center justify-center transition-colors"
            style={{ borderColor: 'var(--mn-border)', color: isBookmarked ? '#34d399' : 'var(--mn-text-3)', background: 'var(--mn-surface)' }}>
            {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Score */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {stage === 'ai'
                ? <><Sparkles className={`w-3 h-3 ${col.cls}`} strokeWidth={1.5} /><span className={`text-[9px] ml-1 ${col.cls}`} style={MONO}>AI match</span></>
                : <span className="text-[9px]" style={{ color: 'var(--mn-text-3)', ...MONO }}>node score</span>
              }
            </div>
            <span className={`text-lg font-bold ${col.cls}`} style={MONO}>{s}%</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--mn-border)' }}>
            <motion.div className="h-full rounded-full" style={{ background: col.bar }}
              initial={{ width: 0 }} animate={{ width: `${s}%` }}
              transition={{ duration: 0.5, delay: idx * 0.04 }} />
          </div>
        </div>

        {/* Skills */}
        {c.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {c.skills.slice(0, 3).map((sk: string) => (
              <span key={sk} className="px-2 py-0.5 rounded-md border text-[10px]"
                style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)', background: 'var(--mn-card)' }}>
                {sk}
              </span>
            ))}
            {c.skills.length > 3 && (
              <span className="px-2 py-0.5 rounded-md border text-[10px]"
                style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)' }}>
                +{c.skills.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 mt-auto pt-3 border-t" style={{ borderColor: 'var(--mn-border)' }}>
          <div className="flex items-center gap-1 min-w-0">
            <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--mn-text-3)' }} strokeWidth={1.5} />
            <span className="text-[11px] truncate" style={{ color: 'var(--mn-text-3)' }}>{c.location}</span>
          </div>
          <span className="text-[11px] font-semibold ml-auto flex-shrink-0" style={{ color: '#34d399', ...MONO }}>{c.rate}</span>
        </div>
      </div>

      {/* View profile hint on hover */}
      <div className="absolute inset-x-0 bottom-0 h-0 group-hover:h-7 overflow-hidden transition-all duration-200 flex items-center justify-center"
        style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.05), transparent)' }}>
        <span className="text-[10px] pb-1" style={{ color: 'rgba(255,255,255,0.45)', ...MONO }}>
          tap to view profile →
        </span>
      </div>
    </motion.div>
  )
}

/* ─── Page ─── */
export default function TalentPoolPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const [candidates, setCandidates] = useState(
    DEMO_CANDIDATES.map(c => ({ ...c, _score: baseScore(c) })).sort((a, b) => b._score - a._score)
  )
  const [prompt, setPrompt] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [stage, setStage] = useState<'browse' | 'thinking' | 'ai'>('browse')
  const [thinkingStep, setThinkingStep] = useState(0)
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set())
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedCandidate = candidates.find(c => c.id === selectedId) ?? null

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || user?.role !== 'recruiter') { router.push('/login'); return }
  }, [isLoading, isAuthenticated, user])

  const runAi = (q: string) => {
    if (!q.trim()) return
    setActiveQuery(q)
    setStage('thinking')
    setThinkingStep(0)
    setSelectedId(null)
    let step = 0
    const iv = setInterval(() => {
      step++
      setThinkingStep(step)
      if (step >= AI_THINKING_STEPS.length - 1) {
        clearInterval(iv)
        setTimeout(() => {
          setCandidates(DEMO_CANDIDATES.map(c => ({ ...c, _score: aiScore(c, q) })).sort((a, b) => b._score - a._score))
          setStage('ai')
        }, 350)
      }
    }, 420)
  }

  const clearAi = () => {
    setStage('browse')
    setActiveQuery('')
    setSelectedId(null)
    setCandidates(DEMO_CANDIDATES.map(c => ({ ...c, _score: baseScore(c) })).sort((a, b) => b._score - a._score))
  }

  const handleBookmark = (id: string) => {
    setBookmarked(prev => {
      const n = new Set(prev)
      if (n.has(id)) { n.delete(id); toast.info('Removed from bookmarks') }
      else { n.add(id); toast.success('Candidate bookmarked') }
      return n
    })
  }

  if (isLoading || !isAuthenticated || user?.role !== 'recruiter') return null

  const extra = selectedCandidate ? (EXTRA as any)[selectedCandidate.id] : null

  return (
    <DashboardLayout>
      <div className="space-y-4 w-full">

        {/* ── AI Prompt ── */}
        <div className="relative rounded-2xl border overflow-hidden"
          style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
          <div className="p-5 md:p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--mn-text-1)' }}>Talent pool</p>
                <p className="text-[11px]" style={{ color: 'var(--mn-text-3)' }}>
                  {candidates.length.toLocaleString()} verified nodes — AI rank &amp; filter
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
                style={{ borderColor: 'var(--mn-border)', background: 'var(--mn-surface)' }}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span className="text-[9px] tracking-widest uppercase" style={{ ...MONO, color: 'var(--mn-text-3)' }}>
                  {stage === 'ai' ? 'ai sorted' : 'browsing'}
                </span>
              </div>
            </div>

            <AnimatePresence>
              {stage === 'ai' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] flex-1 min-w-0"
                    style={{ borderColor: 'var(--mn-border)', background: 'var(--mn-surface)', color: 'var(--mn-text-3)', ...MONO }}>
                    <Sparkles className="w-3 h-3 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }} strokeWidth={1.5} />
                    <span className="truncate">&ldquo;{activeQuery}&rdquo;</span>
                  </div>
                  <button onClick={clearAi}
                    className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full border flex-shrink-0"
                    style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)', background: 'var(--mn-surface)' }}>
                    <X className="w-3 h-3" /> reset
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative rounded-xl border focus-within:border-white/20 transition-colors"
              style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
              <Sparkles className="absolute left-4 top-4 w-4 h-4" style={{ color: 'rgba(255,255,255,0.28)' }} strokeWidth={1.5} />
              <textarea ref={inputRef} rows={2} value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (prompt.trim()) { runAi(prompt.trim()); setPrompt('') } } }}
                placeholder="e.g. Rank by availability, or find me a senior A&E consultant in London…"
                className="w-full bg-transparent resize-none pl-11 pr-14 py-4 text-sm focus:outline-none leading-relaxed placeholder:text-[13px]"
                style={{ color: 'var(--mn-text-1)', caretColor: 'var(--mn-text-1)' }} />
              <button onClick={() => { if (prompt.trim()) { runAi(prompt.trim()); setPrompt('') } }}
                disabled={!prompt.trim() || stage === 'thinking'}
                className="absolute right-3 bottom-3 h-8 w-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                style={{ background: prompt.trim() ? 'rgba(255,255,255,0.16)' : 'var(--mn-nav-hover-bg)' }}>
                <ArrowUp className="w-4 h-4 text-white" strokeWidth={2} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {SUGGESTED.map((s, i) => (
                <button key={i} onClick={() => { setPrompt(s); inputRef.current?.focus() }}
                  className="text-[11px] px-3 py-1.5 rounded-full border transition-all hover:border-white/15"
                  style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)', background: 'var(--mn-surface)' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── AI Thinking ── */}
        <AnimatePresence>
          {stage === 'thinking' && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="rounded-2xl border p-4" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-3.5 h-3.5 animate-pulse" style={{ color: 'rgba(255,255,255,0.5)' }} strokeWidth={1.5} />
                <p className="text-sm font-medium" style={{ color: 'var(--mn-text-1)' }}>Re-ranking pool…</p>
                <div className="flex gap-1 ml-auto">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.5)' }}
                      animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }} />
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                {AI_THINKING_STEPS.map((step, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className={`h-1.5 w-1.5 rounded-full ${i <= thinkingStep ? 'bg-white/60' : 'bg-zinc-700'}`} />
                    <span className="text-xs" style={{ color: i <= thinkingStep ? 'var(--mn-text-2)' : 'var(--mn-text-3)', ...MONO }}>{step}</span>
                    {i === thinkingStep && (
                      <motion.span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', ...MONO }} animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}>▋</motion.span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Cards ── */}
        {stage !== 'thinking' && (
          <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: 'var(--mn-border)' }}>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold" style={{ color: 'var(--mn-text-2)' }}>
                  {candidates.length} candidates
                </p>
                {stage === 'ai' && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider"
                    style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', ...MONO }}>
                    AI sorted
                  </span>
                )}
              </div>
            </div>
            <div className="p-4">
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {candidates.map((c, idx) => (
                  <CandidateCard
                    key={c.id}
                    c={c} idx={idx}
                    isSelected={selectedId === c.id}
                    isBookmarked={bookmarked.has(c.id)}
                    stage={stage}
                    onSelect={() => setSelectedId(prev => prev === c.id ? null : c.id)}
                    onBookmark={() => handleBookmark(c.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Candidate profile modal ── */}
        <AnimatePresence>
          {selectedCandidate && (
            <CandidateModal
              key={selectedCandidate.id}
              candidate={selectedCandidate}
              extra={extra}
              score={selectedCandidate._score as number}
              stage={stage}
              bookmarked={bookmarked.has(selectedCandidate.id)}
              onBookmark={() => handleBookmark(selectedCandidate.id)}
              onClose={() => setSelectedId(null)}
            />
          )}
        </AnimatePresence>

        {/* ── Protocol footer ── */}
        <div className="flex items-center justify-center gap-2 py-2">
          <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-[10px]" style={{ ...MONO, color: 'var(--mn-text-3)' }}>
            sovereign ai protocol · end-to-end encrypted · 12,400+ nodes indexed
          </p>
        </div>

      </div>
    </DashboardLayout>
  )
}
