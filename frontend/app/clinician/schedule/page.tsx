'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, CheckCircle2, Clock, Zap, Star, TrendingUp,
} from 'lucide-react'
import { toast } from '@/lib/toast'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = ['07:00', '09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00']

interface Shift {
  id: string; day: string; start: number; duration: number
  hospital: string; ward: string; rate: number; status: 'confirmed' | 'available' | 'processing'
  nodeRef: string; specialty: string
}

const SHIFTS: Shift[] = [
  { id: 's1', day: 'Mon', start: 7,  duration: 12, hospital: "St. Mary's Trust",    ward: 'A&E',       rate: 100, status: 'confirmed',  nodeRef: 'RLH_AE_001',  specialty: 'Emergency' },
  { id: 's2', day: 'Wed', start: 9,  duration: 8,  hospital: 'Royal London',         ward: 'ICU',       rate: 110, status: 'confirmed',  nodeRef: 'RLH_ICU_004', specialty: 'Intensive Care' },
  { id: 's3', day: 'Fri', start: 7,  duration: 12, hospital: 'City General',         ward: 'Cardiology',rate: 90,  status: 'confirmed',  nodeRef: 'CG_CARD_002', specialty: 'Cardiology' },
  { id: 's4', day: 'Sat', start: 19, duration: 12, hospital: 'North Middlesex',      ward: 'A&E',       rate: 125, status: 'available',  nodeRef: 'NMU_AE_007',  specialty: 'Emergency' },
  { id: 's5', day: 'Tue', start: 13, duration: 6,  hospital: 'Westside Clinic',      ward: 'Obs',       rate: 95,  status: 'processing', nodeRef: 'WS_OBS_009',  specialty: 'Obs & Gynae' },
  { id: 's6', day: 'Thu', start: 7,  duration: 12, hospital: "King's College Hosp.", ward: 'Trauma',    rate: 107, status: 'confirmed',  nodeRef: 'KCH_TR_012',  specialty: 'Trauma' },
]

const STATUS_STYLES = {
  confirmed:  { dot: 'bg-emerald-400', label: 'Confirmed', text: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10' },
  available:  { dot: 'bg-amber-400 animate-pulse', label: 'Open', text: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/10' },
  processing: { dot: 'bg-blue-400 animate-pulse', label: 'Processing', text: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/10' },
}

function CalGrid({ shifts }: { shifts: Shift[] }) {
  const hourHeight = 40
  const getTop    = (start: number) => (start - 7) * hourHeight
  const getHeight = (dur: number) => dur * hourHeight

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-[720px]">
        <div className="flex-shrink-0 w-14 border-r border-white/5">
          <div className="h-8" />
          {HOURS.map(h => (
            <div key={h} style={{ height: hourHeight * 2 }} className="flex items-start justify-end pr-3 pt-1">
              <span className="text-[9px] text-zinc-700">{h}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-1">
          {DAYS.map(day => {
            const dayShifts = shifts.filter(s => s.day === day)
            return (
              <div key={day} className="flex-1 min-w-[80px] relative border-r border-white/4 last:border-0">
                <div className="h-8 flex items-center justify-center border-b border-white/5">
                  <span className="text-[10px] text-zinc-500">{day}</span>
                </div>
                <div style={{ height: HOURS.length * hourHeight * 2 }} className="relative">
                  {HOURS.map((_, i) => (
                    <div key={i} style={{ top: i * hourHeight * 2, height: hourHeight * 2 }}
                      className="absolute inset-x-0 border-b border-white/4" />
                  ))}
                  {dayShifts.map(shift => (
                    <div key={shift.id}
                      style={{ top: getTop(shift.start), height: getHeight(shift.duration), left: 2, right: 2 }}
                      className={`absolute rounded-lg overflow-hidden cursor-pointer transition-colors ${
                        shift.status === 'confirmed'
                          ? 'bg-emerald-500/15 border border-emerald-500/20 hover:bg-emerald-500/25'
                          : shift.status === 'available'
                          ? 'bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20'
                          : 'bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20'
                      }`}
                    >
                      <div className="p-1.5 flex flex-col h-full">
                        <span className="text-[8px] font-medium text-white/80 truncate">{shift.hospital}</span>
                        {shift.duration >= 4 && (
                          <span className="text-[8px] text-white/50 mt-0.5 truncate">{shift.ward}</span>
                        )}
                        {shift.duration >= 6 && (
                          <span className="text-[9px] font-semibold text-white mt-auto">£{shift.rate}/hr</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function ClinicianSchedule() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const [biddingId, setBiddingId] = useState<string | null>(null)
  const [bidSent, setBidSent] = useState<Set<string>>(new Set())
  const [weekOffset, setWeekOffset] = useState(0)

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || user?.role !== 'clinician') router.push('/login')
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading || !isAuthenticated || user?.role !== 'clinician') return null

  const handleBid = async (shiftId: string) => {
    setBiddingId(shiftId)
    const shift = SHIFTS.find(s => s.id === shiftId)
    const loadId = toast.loading(`Submitting bid for ${shift?.hospital ?? 'shift'}…`)
    await new Promise(r => setTimeout(r, 1400))
    toast.dismiss(loadId)
    setBidSent(p => new Set([...p, shiftId]))
    setBiddingId(null)
    toast.success(`Bid submitted — ${shift?.hospital ?? 'Hospital'} will confirm within 4 minutes`)
  }

  const confirmedShifts = SHIFTS.filter(s => s.status === 'confirmed')
  const openShifts      = SHIFTS.filter(s => s.status === 'available')
  const totalHours      = confirmedShifts.reduce((a, s) => a + s.duration, 0)
  const totalEarnings   = confirmedShifts.reduce((a, s) => a + s.rate * s.duration, 0)

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* Stats header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/5 bg-[#1a1a1a] overflow-hidden">
          <div className="px-6 py-5 flex flex-wrap items-center gap-6">
            <div className="flex-1">
              <p className="text-xs text-zinc-500 mb-1">This week</p>
              <p className="text-4xl font-bold text-white">
                {totalHours}<span className="text-xl text-zinc-500 ml-1">hrs</span>
              </p>
              <p className="text-xs text-zinc-600 mt-1">{confirmedShifts.length} confirmed shifts</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Projected earnings', value: `£${totalEarnings.toLocaleString()}`, color: 'text-white' },
                { label: 'Open shifts',         value: openShifts.length.toString(),         color: 'text-amber-400' },
                { label: 'AI match score',       value: '96%',                                color: 'text-emerald-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl border border-white/5 bg-zinc-800/30 px-4 py-3 text-right">
                  <p className="text-xs text-zinc-600">{label}</p>
                  <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Calendar */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
          className="rounded-2xl border border-white/5 bg-[#1a1a1a] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <div>
              <p className="text-sm font-medium text-white">Week calendar</p>
              <p className="text-xs text-zinc-600 mt-0.5">Week of 30 Mar 2026</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setWeekOffset(w => w - 1)}
                className="w-7 h-7 rounded-lg border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-600 transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setWeekOffset(0)}
                className="text-xs text-zinc-600 hover:text-white border border-zinc-800 rounded-lg px-2 py-1 transition-colors">
                Today
              </button>
              <button onClick={() => setWeekOffset(w => w + 1)}
                className="w-7 h-7 rounded-lg border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-600 transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-4">
            <CalGrid shifts={SHIFTS} />
            <div className="flex items-center gap-5 mt-3 pt-3 border-t border-white/5 flex-wrap">
              {Object.entries(STATUS_STYLES).map(([k, v]) => (
                <div key={k} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${v.dot.replace(' animate-pulse', '')}`} />
                  <span className="text-xs text-zinc-500">{v.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Confirmed shifts */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}
          className="rounded-2xl border border-white/5 bg-[#1a1a1a] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <p className="text-sm font-medium text-white">Confirmed shifts</p>
            <span className="text-xs text-zinc-600 border border-zinc-800 px-2 py-1 rounded-lg">{confirmedShifts.length} shifts</span>
          </div>
          <div className="divide-y divide-white/4">
            {confirmedShifts.map(shift => (
              <div key={shift.id} className="px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-zinc-800/60 border border-white/8 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">{shift.hospital}</p>
                  <p className="text-xs text-zinc-500 mt-0.5 font-mono">{shift.nodeRef} · {shift.ward} · {shift.day} {String(shift.start).padStart(2,'0')}:00–{String(shift.start + shift.duration).padStart(2,'0')}:00</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">£{shift.rate}/hr</p>
                    <p className="text-xs text-zinc-600">{shift.duration} hr shift</p>
                  </div>
                  <span className="text-[10px] text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 rounded-full">
                    Confirmed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Open shifts to bid */}
        {openShifts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.19 }}
            className="rounded-2xl border border-white/5 bg-[#1a1a1a] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
              <div>
                <p className="text-sm font-medium text-white">Open shifts</p>
                <p className="text-xs text-zinc-600 mt-0.5">Bid now to secure your slot</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Live
              </span>
            </div>
            <div className="divide-y divide-white/4">
              {openShifts.map(shift => {
                const sent    = bidSent.has(shift.id)
                const bidding = biddingId === shift.id
                return (
                  <div key={shift.id} className="px-5 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800/60 border border-white/8 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium">{shift.hospital}</p>
                      <p className="text-xs text-zinc-500 mt-0.5 font-mono">{shift.nodeRef} · {shift.ward} · {shift.day} {String(shift.start).padStart(2,'0')}:00</p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">£{shift.rate}/hr</p>
                        <p className="text-xs text-zinc-600">{shift.duration} hr shift</p>
                      </div>
                      {sent ? (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Bid sent
                        </span>
                      ) : (
                        <button onClick={() => handleBid(shift.id)} disabled={!!biddingId}
                          className="flex items-center gap-1.5 text-sm font-medium text-black bg-white px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50">
                          {bidding ? (
                            <><span className="w-3 h-3 rounded-full border-2 border-zinc-400 border-t-zinc-950 animate-spin" /> Bidding…</>
                          ) : (
                            <><Zap className="w-3.5 h-3.5" /> Bid</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Leaderboard */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl border border-white/5 bg-[#1a1a1a] overflow-hidden">
          <div className="flex items-center px-5 py-3 border-b border-white/5">
            <p className="text-sm font-medium text-white">Clinician rankings</p>
          </div>
          <div className="p-5 flex items-center gap-6">
            <div className="w-16 h-16 rounded-xl bg-zinc-800/60 border border-white/8 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-7 h-7 text-zinc-400" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Dr. {user?.name?.split(' ')[0] || 'You'}</p>
              <p className="text-xs text-zinc-500 mt-0.5">Top 3% of clinicians this month</p>
              <div className="flex items-center gap-3 mt-3">
                {[
                  { label: 'Rank',       value: '#12' },
                  { label: 'Avg rating', value: '4.9' },
                  { label: 'Shifts',     value: '24'  },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg border border-white/5 bg-zinc-800/30 px-3 py-2 text-center">
                    <p className="text-xs text-zinc-600">{label}</p>
                    <p className="text-sm font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
          </div>
        </motion.div>

      </div>
    </DashboardLayout>
  )
}
