'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/lib/store'
import { DEMO_BOOKMARKS } from '@/lib/demo'
import {
  Receipt, BookmarkCheck, X, MapPin,
  ChevronLeft, ChevronRight, Wallet, ArrowUp, Sparkles, Zap,
} from 'lucide-react'
import { toast } from '@/lib/toast'

const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }

const STATUS_LABELS = ['pipeline', 'shortlisted', 'placed', 'settled']
const STATUS_COLORS: Record<string, string> = {
  pipeline:    'text-zinc-400 border-zinc-600/40 bg-zinc-500/10',
  shortlisted: 'text-blue-400 border-blue-500/20 bg-blue-500/10',
  placed:      'text-amber-400 border-amber-500/20 bg-amber-500/10',
  settled:     'text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
}

const getStatus = (id: string) => STATUS_LABELS[id.charCodeAt(0) % STATUS_LABELS.length]
const getFee = (exp: number) => `£${((exp || 1) * 1200 + 4800).toLocaleString()}`
const getFeeNum = (exp: number) => (exp || 1) * 1200 + 4800

const AI_SUGGESTED = [
  'Sort by highest fee',
  'Show placed and settled only',
  'Pipeline candidates',
  'Available candidates first',
  'Shortlisted this week',
]

const AI_STEPS = [
  'Parsing sort criteria…',
  'Scanning ledger nodes…',
  'Applying pipeline filter…',
]

function aiSort(query: string, list: any[]): any[] {
  const q = query.toLowerCase()
  let result = [...list]

  if (q.includes('highest') || q.includes('fee')) result = result.sort((a, b) => getFeeNum(b.experience_years) - getFeeNum(a.experience_years))
  if (q.includes('placed') || q.includes('settled')) result = result.filter(b => ['placed', 'settled'].includes(getStatus(b.id)))
  else if (q.includes('pipeline')) result = result.filter(b => getStatus(b.id) === 'pipeline')
  else if (q.includes('shortlisted')) result = result.filter(b => getStatus(b.id) === 'shortlisted')

  if (q.includes('available')) result = [...result].sort((a, b) => (b.available ? 1 : 0) - (a.available ? 1 : 0))

  return result.length ? result : list
}

export default function SettlementLedgerPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const [allBookmarks] = useState<any[]>(DEMO_BOOKMARKS)
  const [bookmarks, setBookmarks] = useState<any[]>(DEMO_BOOKMARKS)
  const [removing, setRemoving] = useState<string | null>(null)

  const [prompt, setPrompt] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [stage, setStage] = useState<'browse' | 'thinking' | 'ai'>('browse')
  const [aiStep, setAiStep] = useState(0)

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || user?.role !== 'recruiter') { router.push('/login'); return }
  }, [isLoading, isAuthenticated, user])

  const handleRemove = (candidateId: string) => {
    setRemoving(candidateId)
    setTimeout(() => {
      setBookmarks(prev => prev.filter(b => b.id !== candidateId))
      toast.info('Removed from settlement ledger')
      setRemoving(null)
    }, 600)
  }

  const scrollBy = (dir: number) =>
    scrollRef.current?.scrollBy({ left: dir * 340, behavior: 'smooth' })

  const runAi = (q: string) => {
    if (!q.trim()) return
    setActiveQuery(q)
    setStage('thinking')
    setAiStep(0)
    let step = 0
    const iv = setInterval(() => {
      step++
      setAiStep(step)
      if (step >= AI_STEPS.length - 1) {
        clearInterval(iv)
        setTimeout(() => {
          setBookmarks(aiSort(q, allBookmarks))
          setStage('ai')
          scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
        }, 300)
      }
    }, 380)
  }

  const submitAi = () => {
    if (prompt.trim()) { runAi(prompt.trim()); setPrompt('') }
  }

  const clearAi = () => {
    setStage('browse')
    setActiveQuery('')
    setBookmarks(allBookmarks)
  }

  if (isLoading || !isAuthenticated) return null

  const totalNodes = allBookmarks.length
  const totalFees = allBookmarks.reduce((acc, b) => acc + getFeeNum(b.experience_years), 0)
  const placedCount = allBookmarks.filter(b => getStatus(b.id) === 'placed' || getStatus(b.id) === 'settled').length
  const settledCount = allBookmarks.filter(b => getStatus(b.id) === 'settled').length

  return (
    <DashboardLayout>
      <div className="space-y-4 w-full">

        {/* ── Ledger stats ── */}
        <div className="rounded-2xl border p-6" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 rounded-lg border flex items-center justify-center" style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
              <Receipt className="w-4 h-4" style={{ color: 'var(--mn-text-3)' }} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--mn-text-1)' }}>Settlement ledger</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--mn-text-3)' }}>Recruiter commission pipeline</p>
            </div>
          </div>

          <div className="flex gap-0 divide-x" style={{ borderColor: 'var(--mn-border)' }}>
            {[
              { label: 'Bookmarked',       value: totalNodes.toString() },
              { label: 'Placed / settled',  value: `${placedCount} / ${settledCount}` },
              { label: 'Pipeline value',    value: `£${totalFees.toLocaleString()}` },
              { label: 'Settled value',     value: `£${(settledCount * 7200).toLocaleString()}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex-1 px-5 first:pl-0 last:pr-0" style={{ borderColor: 'var(--mn-border)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--mn-text-3)' }}>{label}</p>
                <p className="text-2xl font-semibold" style={{ color: 'var(--mn-text-1)' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bookmarked candidates — AI driven ── */}
        <div
          className="relative rounded-2xl border overflow-hidden"
          style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

          <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
                <p className="text-sm font-medium" style={{ color: 'var(--mn-text-1)' }}>Bookmarked candidates</p>
                {stage === 'ai' && (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 uppercase tracking-wider" style={MONO}>
                    AI sorted
                  </span>
                )}
              </div>
              <div className="flex gap-1 ml-auto">
                <button onClick={() => scrollBy(-1)} className="h-7 w-7 rounded-lg border flex items-center justify-center transition-all"
                  style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)' }}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => scrollBy(1)} className="h-7 w-7 rounded-lg border flex items-center justify-center transition-all"
                  style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)' }}>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Active query pill */}
            <AnimatePresence>
              {stage === 'ai' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] flex-1 min-w-0"
                    style={{ borderColor: 'var(--mn-border)', background: 'var(--mn-surface)', color: 'var(--mn-text-3)', ...MONO }}>
                    <Sparkles className="w-3 h-3 text-purple-400 flex-shrink-0" strokeWidth={1.5} />
                    <span className="truncate">&ldquo;{activeQuery}&rdquo;</span>
                  </div>
                  <button onClick={clearAi} className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full border transition-all flex-shrink-0"
                    style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)', background: 'var(--mn-surface)' }}>
                    <X className="w-3 h-3" /> reset
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI prompt bar */}
            <div className="relative rounded-xl border transition-all duration-200 focus-within:border-purple-500/50"
              style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
              <div className="absolute left-4 top-3.5 text-purple-500/60">
                <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
              </div>
              <textarea
                ref={inputRef}
                rows={1}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitAi() } }}
                placeholder="Sort or filter candidates — e.g. highest fee, show placed only, available first…"
                className="w-full bg-transparent resize-none pl-10 pr-12 py-3 text-sm focus:outline-none leading-relaxed placeholder:text-[12px]"
                style={{ color: 'var(--mn-text-1)', caretColor: 'var(--mn-text-1)' }}
              />
              <button onClick={submitAi} disabled={!prompt.trim() || stage === 'thinking'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-30"
                style={{ background: prompt.trim() ? 'rgba(255,255,255,0.16)' : 'var(--mn-nav-hover-bg)' }}>
                <ArrowUp className="w-3.5 h-3.5 text-white" strokeWidth={2} />
              </button>
            </div>

            {/* Suggested */}
            <div className="flex flex-wrap gap-2">
              {AI_SUGGESTED.map((s, i) => (
                <button key={i} onClick={() => { setPrompt(s); inputRef.current?.focus() }}
                  className="text-[11px] px-3 py-1.5 rounded-full border transition-all hover:border-purple-500/40"
                  style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)', background: 'var(--mn-surface)' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* AI thinking */}
          <AnimatePresence>
            {stage === 'thinking' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-5 pb-4 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-3.5 h-3.5 text-purple-400 animate-pulse" strokeWidth={1.5} />
                  <span className="text-sm" style={{ color: 'var(--mn-text-1)' }}>Sorting ledger…</span>
                  <div className="flex gap-1 ml-auto">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-500"
                        animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }} />
                    ))}
                  </div>
                </div>
                {AI_STEPS.map((step, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className={`h-1.5 w-1.5 rounded-full ${i <= aiStep ? 'bg-purple-500' : 'bg-zinc-700'}`} />
                    <span className="text-xs" style={{ color: i <= aiStep ? 'var(--mn-text-2)' : 'var(--mn-text-3)', ...MONO }}>{step}</span>
                    {i === aiStep && <motion.span className="text-xs text-purple-400" style={MONO} animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>▋</motion.span>}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cards */}
          {stage !== 'thinking' && (
            <div className="px-5 pb-5">
              {bookmarks.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <BookmarkCheck className="w-8 h-8 mx-auto" style={{ color: 'var(--mn-text-3)' }} />
                  <p className="text-sm" style={{ color: 'var(--mn-text-3)' }}>No candidates bookmarked yet</p>
                  <button onClick={() => router.push('/recruiter/candidates')}
                    className="text-sm border rounded-xl px-4 py-2 transition-all"
                    style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)' }}>
                    Browse talent pool →
                  </button>
                </div>
              ) : (
                <>
                  <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', touchAction: 'pan-x' }}>
                    {bookmarks.map((b, idx) => {
                      const status = getStatus(b.id)
                      const fee = getFee(b.experience_years)
                      const initials = b.name?.slice(0, 2).toUpperCase() || '??'
                      return (
                        <motion.div
                          key={b.bookmark_id || b.id}
                          layout
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.04 }}
                          className="flex-shrink-0 w-72 rounded-xl border flex flex-col gap-4 p-5 hover:border-purple-500/20 transition-all"
                          style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full border flex items-center justify-center text-sm font-medium flex-shrink-0"
                                style={{ background: 'var(--mn-nav-hover-bg)', borderColor: 'var(--mn-border)', color: 'var(--mn-text-1)' }}>
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate" style={{ color: 'var(--mn-text-1)' }}>{b.name}</p>
                                <p className="text-xs" style={{ color: 'var(--mn-text-3)' }}>{b.experience_years || 0} yr exp</p>
                              </div>
                            </div>
                            <button onClick={() => handleRemove(b.id)} disabled={removing === b.id}
                              className="flex-shrink-0 transition-colors" style={{ color: 'var(--mn-text-3)' }}>
                              {removing === b.id
                                ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                : <X className="w-4 h-4 hover:text-red-400 transition-colors" />}
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className={`px-2.5 py-1 rounded-full border text-[10px] font-medium ${STATUS_COLORS[status]}`}>
                              {status[0].toUpperCase() + status.slice(1)}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <Wallet className="w-3.5 h-3.5" style={{ color: 'var(--mn-text-3)' }} strokeWidth={1.5} />
                              <span className="text-sm font-semibold" style={{ color: 'var(--mn-text-1)' }}>{fee}</span>
                            </div>
                          </div>

                          {b.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {b.skills.slice(0, 3).map((s: string) => (
                                <span key={s} className="px-2 py-0.5 rounded-full border text-[10px]"
                                  style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)' }}>{s}</span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-3 pt-2 border-t mt-auto" style={{ borderColor: 'var(--mn-border)' }}>
                            {b.location && (
                              <div className="flex items-center gap-1 min-w-0">
                                <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--mn-text-3)' }} strokeWidth={1.5} />
                                <span className="text-xs truncate" style={{ color: 'var(--mn-text-3)' }}>{b.location}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 ml-auto flex-shrink-0">
                              <span className={`h-1.5 w-1.5 rounded-full ${b.available ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                              <span className="text-xs" style={{ color: 'var(--mn-text-3)' }}>{b.available ? 'Available' : 'Placed'}</span>
                            </div>
                          </div>

                          {b.bookmarked_at && (
                            <p className="text-[10px]" style={{ color: 'var(--mn-text-3)' }}>
                              Bookmarked {new Date(b.bookmarked_at).toLocaleDateString()}
                            </p>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>

                  <div className="flex justify-center gap-1.5 mt-3">
                    {Array.from({ length: Math.min(bookmarks.length, 8) }).map((_, i) => (
                      <span key={i} className="rounded-full transition-all duration-200"
                        style={{ width: i === 0 ? 16 : 6, height: 4, background: i === 0 ? (stage === 'ai' ? '#8b5cf6' : 'var(--mn-text-3)') : 'var(--mn-border)' }} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
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
