'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { toast } from '@/lib/toast'

const matches = [
  { hospital: "St. Mary's Trust",      specialty: 'Cardiology',      score: 98, distance: '12 min', rate: '£95/hr',  urgent: true  },
  { hospital: 'City General',          specialty: 'Emergency',       score: 92, distance: '25 min', rate: '£85/hr',  urgent: false },
  { hospital: 'Westside Clinic',       specialty: 'ICU',             score: 95, distance: '15 min', rate: '£102/hr', urgent: true  },
  { hospital: 'Royal Brompton',        specialty: 'Respiratory',     score: 89, distance: '32 min', rate: '£88/hr',  urgent: false },
  { hospital: 'North Middlesex',       specialty: 'Paediatrics',     score: 94, distance: '18 min', rate: '£91/hr',  urgent: true  },
  { hospital: 'Hammersmith Hospital',  specialty: 'Neurology',       score: 87, distance: '40 min', rate: '£96/hr',  urgent: false },
  { hospital: 'Chelsea & Westminster', specialty: 'Oncology',        score: 91, distance: '22 min', rate: '£99/hr',  urgent: false },
  { hospital: 'Whittington Health',    specialty: 'General Surgery', score: 85, distance: '35 min', rate: '£82/hr',  urgent: false },
  { hospital: "King's College Hosp.",  specialty: 'Trauma & Ortho',  score: 96, distance: '28 min', rate: '£107/hr', urgent: true  },
  { hospital: 'Barts Health NHS',      specialty: 'Gastroenterology',score: 90, distance: '19 min', rate: '£93/hr',  urgent: false },
]

const schedule = [
  { hospital: 'Royal London', ward: 'Emergency', note: 'Starts in 2 days', rate: '£90/hr',  tag: 'Confirmed' },
  { hospital: 'St. Thomas',   ward: 'ICU',       note: 'Repeat booking',   rate: '£110/hr', tag: 'Confirmed' },
]

function ScoreArc({ score }: { score: number }) {
  const r = 22, circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="flex-shrink-0">
      <circle cx="28" cy="28" r={r} fill="none" stroke="#27272a" strokeWidth="4" />
      <circle cx="28" cy="28" r={r} fill="none"
        stroke={score >= 95 ? '#4ade80' : score >= 90 ? '#a3e635' : '#facc15'}
        strokeWidth="4" strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 28 28)" />
      <text x="28" y="33" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">{score}</text>
    </svg>
  )
}

export default function ClinicianDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const sliderRef = useRef<HTMLDivElement>(null)
  const [biddingOn, setBiddingOn] = useState<string | null>(null)
  const [bidDone, setBidDone] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || user?.role !== 'clinician') router.push('/login')
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading || !isAuthenticated || user?.role !== 'clinician') return null

  const scroll = (dir: 'left' | 'right') =>
    sliderRef.current?.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' })

  const handleBid = async (hospital: string, rate: string) => {
    setBiddingOn(hospital)
    const id = toast.loading(`Submitting bid to ${hospital}…`)
    await new Promise(r => setTimeout(r, 1300))
    toast.dismiss(id)
    setBiddingOn(null)
    setBidDone(p => new Set([...p, hospital]))
    toast.success(`Bid submitted — ${hospital} will confirm within 4 minutes`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* ── Earnings panel ── */}
        <div className="rounded-2xl border border-white/5 bg-[#1a1a1a] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <p className="text-sm font-medium text-white">Earnings overview</p>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
            </div>
          </div>
          <div className="p-6 grid grid-cols-3 gap-6">
            <div className="col-span-1">
              <p className="text-xs text-zinc-500 mb-1">Live balance</p>
              <p className="text-4xl font-bold text-white tracking-tight">
                £4,280<span className="text-2xl text-zinc-500">.00</span>
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-xs text-emerald-400">Live</span>
              </div>
            </div>
            <div className="border-l border-white/5 pl-6 flex flex-col justify-center">
              <p className="text-xs text-zinc-500 mb-1">Next payout</p>
              <p className="text-xl text-white font-semibold">April 02</p>
              <p className="text-xs text-zinc-600 mt-1">2026</p>
            </div>
            <div className="border-l border-white/5 pl-6 flex flex-col justify-center">
              <p className="text-xs text-zinc-500 mb-1">Match velocity</p>
              <p className="text-xl text-white font-semibold">12<span className="text-sm text-zinc-500">ms</span></p>
              <p className="text-xs text-zinc-600 mt-1">latency</p>
            </div>
          </div>
        </div>

        {/* ── Neural match slider ── */}
        <div className="rounded-2xl border border-white/5 bg-[#1a1a1a] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <div>
              <p className="text-sm font-medium text-white">AI matches</p>
              <p className="text-xs text-zinc-600 mt-0.5">Ranked by compatibility score</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-600 border border-zinc-800 px-2 py-1 rounded-lg">10 active</span>
              <button onClick={() => scroll('left')} className="w-7 h-7 rounded-lg border border-zinc-800 flex items-center justify-center text-zinc-500 hover:border-zinc-600 hover:text-white transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => scroll('right')} className="w-7 h-7 rounded-lg border border-zinc-800 flex items-center justify-center text-zinc-500 hover:border-zinc-600 hover:text-white transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="p-5 pb-4">
            <div ref={sliderRef} className="flex gap-4 overflow-x-auto pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', touchAction: 'pan-x' }}>
              {matches.map((m, i) => (
                <div key={m.hospital}
                  className="relative rounded-xl border border-white/5 bg-zinc-800/30 p-5 flex flex-col gap-4 hover:border-white/10 hover:bg-zinc-800/60 transition-all group"
                  style={{ minWidth: '240px', maxWidth: '240px', flexShrink: 0 }}>
                  <div className="flex items-start justify-between">
                    <span className="text-xs text-zinc-600">#{String(i + 1).padStart(2, '0')}</span>
                    {m.urgent
                      ? <span className="text-[10px] text-orange-400 border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 rounded-full">Urgent</span>
                      : <span className="text-[10px] text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded-full">Open</span>
                    }
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium leading-snug">{m.hospital}</p>
                    <p className="text-xs text-zinc-500 mt-1">{m.specialty}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <ScoreArc score={m.score} />
                    <div>
                      <p className="text-xs text-zinc-600 mb-1">Distance</p>
                      <p className="text-sm text-zinc-300">{m.distance}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
                    <span className="text-sm text-white font-semibold">{m.rate}</span>
                    {bidDone.has(m.hospital) ? (
                      <span className="text-xs text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg">Bid sent</span>
                    ) : (
                      <button
                        onClick={() => handleBid(m.hospital, m.rate)}
                        disabled={biddingOn === m.hospital}
                        className="text-xs text-black bg-white px-2.5 py-1.5 rounded-lg hover:bg-zinc-200 transition-colors font-medium flex items-center gap-1.5 disabled:opacity-70"
                      >
                        {biddingOn === m.hospital ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Bid →'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-4">
              {matches.map((_, i) => (
                <span key={i} className={`rounded-full transition-all ${i < 3 ? 'w-3 h-1 bg-zinc-600' : 'w-1 h-1 bg-zinc-800'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Schedule panel ── */}
        <div className="rounded-2xl border border-white/5 bg-[#1a1a1a] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <div>
              <p className="text-sm font-medium text-white">Schedule</p>
              <p className="text-xs text-zinc-600 mt-0.5">Confirmed bookings</p>
            </div>
          </div>
          <div className="p-5 space-y-3">
            {schedule.map((s) => (
              <div key={s.hospital + s.ward}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-zinc-800/30 px-5 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800/60 border border-white/8 flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{s.hospital}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{s.ward} · {s.note}</p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <span className="text-sm text-white font-semibold">{s.rate}</span>
                  <span className="text-[10px] text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 rounded-full">
                    {s.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Summary footer ── */}
        <div className="rounded-2xl border border-white/5 bg-[#1a1a1a] overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs text-zinc-500">All systems nominal</span>
            </div>
            <div className="flex items-center gap-6">
              {[
                { label: 'Shifts completed', value: '24' },
                { label: 'Avg rating',       value: '4.9' },
                { label: 'Total earned',     value: '£18,420' },
              ].map(({ label, value }) => (
                <div key={label} className="text-right">
                  <p className="text-xs text-zinc-600">{label}</p>
                  <p className="text-sm text-white font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}
