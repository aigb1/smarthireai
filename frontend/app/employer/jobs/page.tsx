'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Loader2, MapPin, Plus, X, ArrowUp, Sparkles, Zap } from 'lucide-react'
import { toast } from '@/lib/toast'
import NewBidModal from '@/components/employer/NewBidModal'

const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }

type BidStatus = 'live' | 'urgent' | 'draft' | 'closed'

interface Bid {
  id: string; title: string; ward: string; hospital: string; nodeRef: string
  rate: number; rateUnit: string; candidates: number; status: BidStatus
  specialty: string; posted: string; closingDate: string
  description: string; shiftType: string
}

const MOCK_BIDS: Bid[] = [
  { id: 'b01', title: 'Emergency Medicine Consultant', ward: 'A&E', hospital: 'Royal London Hospital', nodeRef: 'RLH_AE_NORTH', rate: 1200, rateUnit: '/day', candidates: 12, status: 'live', specialty: 'Emergency Medicine', posted: '25-03-2026', closingDate: '05-04-2026', description: 'Experienced EM consultant required for A&E cover. FRCEM essential. Night and weekend shifts included.', shiftType: 'Full-time' },
  { id: 'b02', title: 'Cardiology SpR', ward: 'Cardiology', hospital: 'North Middlesex University', nodeRef: 'NMU_CARDIO_B', rate: 980, rateUnit: '/day', candidates: 8, status: 'live', specialty: 'Cardiology', posted: '24-03-2026', closingDate: '03-04-2026', description: 'ST6+ Cardiology registrar needed for inpatient ward cover and cath lab support. Echo skills desirable.', shiftType: 'Part-time' },
  { id: 'b03', title: 'Anaesthesiology Clinician', ward: 'Theatres', hospital: "St Thomas' Hospital", nodeRef: 'STH_ANAES_C', rate: 1450, rateUnit: '/day', candidates: 3, status: 'urgent', specialty: 'Anaesthesiology', posted: '27-03-2026', closingDate: '29-03-2026', description: 'URGENT: Immediate theatre cover required. GA and regional experience essential. Start 30 March.', shiftType: 'Emergency' },
  { id: 'b04', title: 'Trauma & Orthopaedics SpR', ward: 'Trauma Unit', hospital: "King's College Hospital", nodeRef: 'KCH_TRAUMA_E', rate: 880, rateUnit: '/day', candidates: 15, status: 'live', specialty: 'Trauma & Ortho', posted: '22-03-2026', closingDate: '06-04-2026', description: 'T&O registrar for busy major trauma centre. On-call commitment required. ATLS holder preferred.', shiftType: 'Full-time' },
  { id: 'b05', title: 'Intensive Care Physician', ward: 'ICU', hospital: 'University College Hospital', nodeRef: 'UCH_ICU_D', rate: 1320, rateUnit: '/day', candidates: 0, status: 'draft', specialty: 'Intensive Care', posted: '28-03-2026', closingDate: '10-04-2026', description: 'Level 3 ICU physician cover. FFICM or equivalent required. 1-in-4 on-call rota.', shiftType: 'Full-time' },
  { id: 'b06', title: 'Paediatric A&E Registrar', ward: 'Paediatric A&E', hospital: 'Chelsea & Westminster', nodeRef: 'CW_PAEDS_AE', rate: 920, rateUnit: '/day', candidates: 6, status: 'live', specialty: 'Paediatric EM', posted: '23-03-2026', closingDate: '04-04-2026', description: 'Paediatric A&E registrar for busy Level 1 centre. MRCPCH or FCEM required.', shiftType: 'Part-time' },
  { id: 'b07', title: 'Neurology Registrar', ward: 'Neurology', hospital: 'Barts Health NHS Trust', nodeRef: 'BARTS_NEURO_A', rate: 840, rateUnit: '/day', candidates: 11, status: 'live', specialty: 'Neurology', posted: '20-03-2026', closingDate: '08-04-2026', description: 'Neurology registrar for inpatient ward and acute stroke pathway. TIA clinic involvement expected.', shiftType: 'Full-time' },
  { id: 'b08', title: 'Obs & Gynae Consultant', ward: 'Labour Ward', hospital: "Guy's & St Thomas'", nodeRef: 'GST_OBSGY_B', rate: 1100, rateUnit: '/day', candidates: 4, status: 'urgent', specialty: 'Obs & Gynaecology', posted: '26-03-2026', closingDate: '01-04-2026', description: 'URGENT: Labour ward consultant cover required. Category-1 C-section competency essential.', shiftType: 'Emergency' },
  { id: 'b09', title: 'Gastroenterology Consultant', ward: 'Gastro', hospital: 'UCLH NHS Foundation Trust', nodeRef: 'UCLH_GASTRO_C', rate: 1050, rateUnit: '/day', candidates: 7, status: 'live', specialty: 'Gastroenterology', posted: '21-03-2026', closingDate: '09-04-2026', description: 'Gastroenterology consultant for inpatient cover and on-call GI bleed pathway. ERCP skills a plus.', shiftType: 'Full-time' },
  { id: 'b10', title: 'Psychiatry Consultant', ward: 'Acute Psych', hospital: 'Maudsley Hospital', nodeRef: 'MH_PSYCH_ACUTE', rate: 760, rateUnit: '/day', candidates: 0, status: 'draft', specialty: 'Psychiatry', posted: '28-03-2026', closingDate: '15-04-2026', description: 'Psychiatry consultant for acute admission ward cover. MRCPsych required. Section 12 approved.', shiftType: 'Part-time' },
]

const AI_SUGGESTED = [
  'Show urgent bids only',
  'Highest daily rate first',
  'Live bids with candidates',
  'Draft bids needing publish',
  'Emergency and theatres',
  'Cardiology and neurology',
]

const AI_STEPS = [
  'Parsing intent…',
  'Scanning bid ledger…',
  'Applying rank protocol…',
]

function aiFilter(query: string, bids: Bid[]): Bid[] {
  const q = query.toLowerCase()
  let result = [...bids]

  if (q.includes('urgent') || q.includes('emergency')) result = result.filter(b => b.status === 'urgent')
  else if (q.includes('draft') || q.includes('publish')) result = result.filter(b => b.status === 'draft')
  else if (q.includes('live')) result = result.filter(b => b.status === 'live')

  if (q.includes('candidate')) result = [...result].filter(b => b.candidates > 0).sort((a, b) => b.candidates - a.candidates)
  if (q.includes('highest') || q.includes('rate')) result = [...result].sort((a, b) => b.rate - a.rate)

  const specialties = ['cardiology', 'neurology', 'anaes', 'trauma', 'paed', 'gastro', 'psychiatry', 'icu', 'obstet']
  const specMatch = specialties.find(s => q.includes(s))
  if (specMatch) {
    const bySpec = bids.filter(b => b.specialty.toLowerCase().includes(specMatch) || b.title.toLowerCase().includes(specMatch))
    if (bySpec.length) result = bySpec
  }

  const wards = ['theatre', 'icu', 'a&e', 'labour']
  const wardMatch = wards.find(w => q.includes(w))
  if (wardMatch) {
    const byWard = bids.filter(b => b.ward.toLowerCase().includes(wardMatch))
    if (byWard.length) result = byWard
  }

  if (result.length === 0) return bids
  return result
}

const statusConfig: Record<BidStatus, { label: string; cls: string }> = {
  live:   { label: 'Live',   cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  urgent: { label: 'Urgent', cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
  draft:  { label: 'Draft',  cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  closed: { label: 'Closed', cls: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20' },
}

function BidCard({ bid, index, onView }: { bid: Bid; index: number; onView: (b: Bid) => void }) {
  const initials = bid.title.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const sc = statusConfig[bid.status]
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      layout
      onClick={() => onView(bid)}
      className="rounded-xl border hover:border-purple-500/20 transition-all cursor-pointer flex flex-col"
      style={{ minWidth: '256px', maxWidth: '256px', flexShrink: 0, background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}
    >
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full border flex items-center justify-center text-xs font-medium flex-shrink-0"
              style={{ background: 'var(--mn-nav-hover-bg)', borderColor: 'var(--mn-border)', color: 'var(--mn-text-1)' }}>
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate max-w-[120px]" style={{ color: 'var(--mn-text-1)' }}>{bid.title}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--mn-text-3)' }}>{bid.shiftType}</p>
            </div>
          </div>
          <span className={`text-[10px] border px-2 py-0.5 rounded-full flex-shrink-0 ${sc.cls}`}>{sc.label}</span>
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--mn-text-3)' }}>Ward</span>
            <span style={{ color: 'var(--mn-text-2)' }}>{bid.ward}</span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--mn-text-3)' }}>Specialty</span>
            <span className="truncate max-w-[110px] text-right" style={{ color: 'var(--mn-text-2)' }}>{bid.specialty}</span>
          </div>
        </div>

        <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: 'var(--mn-text-3)' }}>{bid.description}</p>

        <div className="flex items-end justify-between pt-2 border-t mt-auto" style={{ borderColor: 'var(--mn-border)' }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--mn-text-1)' }}>
              £{bid.rate.toLocaleString()}<span className="text-xs ml-0.5" style={{ color: 'var(--mn-text-3)' }}>{bid.rateUnit}</span>
            </p>
            <p className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: 'var(--mn-text-3)' }}>
              <MapPin className="w-2.5 h-2.5" />{bid.hospital.split(' ').slice(0, 2).join(' ')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px]" style={{ color: 'var(--mn-text-3)' }}>Candidates</p>
            <p className={`text-sm font-semibold ${bid.candidates > 0 ? '' : 'opacity-40'}`} style={{ color: 'var(--mn-text-1)' }}>{bid.candidates}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function BidModal({ bid, onClose, onPublish }: { bid: Bid; onClose: () => void; onPublish?: (id: string) => void }) {
  const router = useRouter()
  const sc = statusConfig[bid.status]
  const [publishing, setPublishing] = useState(false)

  const handleViewCandidates = () => {
    toast.success(`Loading ${bid.candidates} candidates for ${bid.title}`)
    setTimeout(() => router.push('/employer/applications'), 800)
  }

  const handlePublish = async () => {
    setPublishing(true)
    const id = toast.loading(`Publishing ${bid.title}…`)
    await new Promise(r => setTimeout(r, 1400))
    toast.dismiss(id)
    toast.success(`${bid.title} is now live on mednode.cloud`)
    setPublishing(false)
    onPublish?.(bid.id)
    onClose()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.22 }}
        className="rounded-2xl border w-full max-w-lg overflow-hidden"
        style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--mn-border)' }}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: 'var(--mn-text-1)' }}>{bid.title}</span>
            <span className={`text-[10px] border px-2 py-0.5 rounded-full ${sc.cls}`}>{sc.label}</span>
          </div>
          <button onClick={onClose} className="transition-colors" style={{ color: 'var(--mn-text-3)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs mb-0.5" style={{ color: 'var(--mn-text-3)' }}>{bid.hospital}</p>
            <p className="text-xs" style={{ color: 'var(--mn-text-3)' }}>Posted {bid.posted} · Closes {bid.closingDate}</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[['Ref', bid.nodeRef], ['Ward', bid.ward], ['Specialty', bid.specialty], ['Shift type', bid.shiftType], ['Rate', `£${bid.rate.toLocaleString()}${bid.rateUnit}`], ['Candidates', String(bid.candidates)]].map(([k, v]) => (
              <div key={k} className="rounded-xl border px-3 py-2.5" style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
                <p className="text-[10px] mb-0.5" style={{ color: 'var(--mn-text-3)' }}>{k}</p>
                <p className="text-xs font-medium" style={{ color: 'var(--mn-text-1)' }}>{v}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border p-4" style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
            <p className="text-[10px] mb-2" style={{ color: 'var(--mn-text-3)' }}>Brief</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--mn-text-2)' }}>{bid.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={onClose} className="text-sm border py-2.5 rounded-xl transition-colors"
              style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)' }}>Close</button>
            {bid.status === 'draft' ? (
              <button onClick={handlePublish} disabled={publishing}
                className="text-sm font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                style={{ background: 'var(--mn-text-1)', color: 'var(--mn-bg)' }}>
                {publishing ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Publishing…</> : 'Publish draft →'}
              </button>
            ) : (
              <button onClick={handleViewCandidates} className="text-sm font-medium py-2.5 rounded-xl transition-colors"
                style={{ background: 'var(--mn-text-1)', color: 'var(--mn-bg)' }}>View candidates →</button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function ActiveBids() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const sliderRef = useRef<HTMLDivElement>(null)
  const ledgerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const [selectedBid, setSelectedBid] = useState<Bid | null>(null)
  const [showNewBid, setShowNewBid] = useState(false)

  const [prompt, setPrompt] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [stage, setStage] = useState<'browse' | 'thinking' | 'ai'>('browse')
  const [aiStep, setAiStep] = useState(0)
  const [filtered, setFiltered] = useState<Bid[]>(MOCK_BIDS)

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || user?.role !== 'employer') router.push('/login')
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading || !isAuthenticated || user?.role !== 'employer') return null

  const scroll = (ref: React.RefObject<HTMLDivElement>, dir: 'left' | 'right') =>
    ref.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' })

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
          setFiltered(aiFilter(q, MOCK_BIDS))
          setStage('ai')
          sliderRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
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
    setFiltered(MOCK_BIDS)
  }

  const counts = {
    live: MOCK_BIDS.filter(b => b.status === 'live').length,
    urgent: MOCK_BIDS.filter(b => b.status === 'urgent').length,
    draft: MOCK_BIDS.filter(b => b.status === 'draft').length,
  }

  return (
    <DashboardLayout>
      {showNewBid && <NewBidModal onClose={() => setShowNewBid(false)} />}

      <div className="space-y-5">

        {/* ── Stats header ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
          className="rounded-2xl border overflow-hidden" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
          <div className="px-6 py-5 flex flex-wrap items-center gap-6">
            <div className="flex-1 min-w-0">
              <p className="text-xs mb-1" style={{ color: 'var(--mn-text-3)' }}>Total active bids</p>
              <p className="text-4xl font-bold" style={{ color: 'var(--mn-text-1)' }}>{MOCK_BIDS.length}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--mn-text-3)' }}>Across 8 NHS infrastructure nodes</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Live',       val: counts.live,   color: 'text-emerald-400' },
                { label: 'Urgent',     val: counts.urgent, color: 'text-red-400' },
                { label: 'Draft',      val: counts.draft,  color: 'text-amber-400' },
                { label: 'Candidates', val: MOCK_BIDS.reduce((s, b) => s + b.candidates, 0), color: '' },
              ].map(({ label, val, color }) => (
                <div key={label} className="rounded-xl border px-4 py-3 text-right"
                  style={{ background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
                  <p className="text-[10px]" style={{ color: 'var(--mn-text-3)' }}>{label}</p>
                  <p className={`text-xl font-bold mt-1 ${color}`} style={color ? {} : { color: 'var(--mn-text-1)' }}>{val}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setShowNewBid(true)}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl flex-shrink-0 transition-colors"
              style={{ background: 'var(--mn-text-1)', color: 'var(--mn-bg)' }}>
              <Plus className="w-4 h-4" /> New bid
            </button>
          </div>
        </motion.div>

        {/* ── AI Bid stream ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.07 }}
          className="relative rounded-2xl border overflow-hidden" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--mn-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium" style={{ color: 'var(--mn-text-1)' }}>Bid stream</p>
                {stage === 'ai' && (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 uppercase tracking-wider" style={MONO}>
                    AI filtered · {filtered.length} results
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {stage === 'browse' && (
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--mn-text-3)' }}>
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                    AI active
                  </div>
                )}
                <button onClick={() => scroll(sliderRef, 'left')} className="w-7 h-7 rounded-lg border flex items-center justify-center transition-colors"
                  style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)' }}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => scroll(sliderRef, 'right')} className="w-7 h-7 rounded-lg border flex items-center justify-center transition-colors"
                  style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)' }}>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* AI prompt bar */}
            <div className="space-y-3">
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
                  placeholder="Filter by specialty, urgency, rate, or hospital — e.g. urgent cardiology bids, highest rate…"
                  className="w-full bg-transparent resize-none pl-10 pr-12 py-3 text-sm focus:outline-none leading-relaxed placeholder:text-[12px]"
                  style={{ color: 'var(--mn-text-1)', caretColor: 'var(--mn-text-1)' }}
                />
                <button onClick={submitAi} disabled={!prompt.trim() || stage === 'thinking'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-30"
                  style={{ background: prompt.trim() ? 'rgba(255,255,255,0.16)' : 'var(--mn-nav-hover-bg)' }}>
                  <ArrowUp className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {AI_SUGGESTED.map((s, i) => (
                  <button key={i} onClick={() => { setPrompt(s); inputRef.current?.focus() }}
                    className="text-[11px] px-2.5 py-1 rounded-full border transition-all hover:border-purple-500/40"
                    style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)', background: 'var(--mn-surface)' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Thinking */}
          <AnimatePresence>
            {stage === 'thinking' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-5 py-4 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-3.5 h-3.5 text-purple-400 animate-pulse" strokeWidth={1.5} />
                  <span className="text-sm" style={{ color: 'var(--mn-text-1)' }}>Filtering bid stream…</span>
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
            <div className="p-5 pb-4">
              {filtered.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm" style={{ color: 'var(--mn-text-3)' }}>No bids matched — try a different query</p>
                </div>
              ) : (
                <>
                  <div ref={sliderRef} className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', touchAction: 'pan-x' }}>
                    {filtered.map((bid, i) => <BidCard key={bid.id} bid={bid} index={i} onView={setSelectedBid} />)}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 mt-4">
                    {filtered.slice(0, 8).map((_, i) => (
                      <span key={i} className="rounded-full transition-all"
                        style={{ width: i < 5 ? 12 : 6, height: 4, background: i < 5 ? (stage === 'ai' ? 'rgba(255,255,255,0.5)' : 'var(--mn-text-3)') : 'var(--mn-border)' }} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>

        {/* ── Bid ledger ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.14 }}
          className="rounded-2xl border overflow-hidden" style={{ background: 'var(--mn-card)', borderColor: 'var(--mn-border)' }}>
          <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--mn-border)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--mn-text-1)' }}>Bid ledger</p>
            <div className="flex items-center gap-2">
              <span className="text-xs border rounded-lg px-2 py-1" style={{ color: 'var(--mn-text-3)', borderColor: 'var(--mn-border)' }}>{MOCK_BIDS.length} records</span>
              <button onClick={() => scroll(ledgerRef, 'left')} className="w-7 h-7 rounded-lg border flex items-center justify-center transition-colors"
                style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)' }}><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => scroll(ledgerRef, 'right')} className="w-7 h-7 rounded-lg border flex items-center justify-center transition-colors"
                style={{ borderColor: 'var(--mn-border)', color: 'var(--mn-text-3)' }}><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="p-5 pb-4">
            <div ref={ledgerRef} className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', touchAction: 'pan-x' }}>
              {MOCK_BIDS.map((bid, i) => {
                const sc = statusConfig[bid.status]
                return (
                  <motion.div key={bid.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.32, delay: i * 0.03 }}
                    onClick={() => setSelectedBid(bid)}
                    className="rounded-xl border hover:border-purple-500/20 transition-all cursor-pointer flex-shrink-0"
                    style={{ minWidth: '220px', maxWidth: '220px', background: 'var(--mn-surface)', borderColor: 'var(--mn-border)' }}>
                    <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--mn-border)' }}>
                      <span className="text-[10px] font-mono" style={{ ...MONO, color: 'var(--mn-text-3)' }}>{bid.nodeRef}</span>
                      <span className={`text-[10px] border px-2 py-0.5 rounded-full ${sc.cls}`}>{sc.label}</span>
                    </div>
                    <div className="p-4 space-y-2.5">
                      <p className="text-xs font-medium leading-tight" style={{ color: 'var(--mn-text-1)' }}>{bid.title}</p>
                      <div className="space-y-1 text-xs">
                        {[['Ward', bid.ward], ['Rate', `£${bid.rate.toLocaleString()}${bid.rateUnit}`], ['Candidates', String(bid.candidates)], ['Closes', bid.closingDate]].map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between">
                            <span style={{ color: 'var(--mn-text-3)' }}>{k}</span>
                            <span className={k === 'Rate' ? 'text-emerald-400 font-semibold' : ''} style={k !== 'Rate' ? { color: 'var(--mn-text-2)' } : {}}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {MOCK_BIDS.map((_, i) => <span key={i} className="rounded-full" style={{ width: i < 4 ? 12 : 6, height: 4, background: i < 4 ? 'var(--mn-text-3)' : 'var(--mn-border)' }} />)}
            </div>
          </div>
        </motion.div>

      </div>

      <AnimatePresence>{selectedBid && <BidModal bid={selectedBid} onClose={() => setSelectedBid(null)} onPublish={() => setSelectedBid(null)} />}</AnimatePresence>
    </DashboardLayout>
  )
}
