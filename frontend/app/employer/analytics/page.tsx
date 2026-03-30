'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Clock, Download, Loader2, Radio, Shield, Zap } from 'lucide-react'
import { toast } from '@/lib/toast'

const slideUp = (i = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
})

type NodeStatus = 'active' | 'late' | 'standby'

interface ActiveNode {
  id: string; name: string; ward: string; nodeRef: string
  status: NodeStatus; checkinTime: string; elapsed: string
  specialty: string; rate: number; handoverSent: boolean
}

const ACTIVE_NODES: ActiveNode[] = [
  { id: 'n1', name: 'Dr. A. Sterling',  ward: 'A&E',         nodeRef: 'RLH_AE_NORTH',  status: 'active',  checkinTime: '08:02', elapsed: 'T+04:22', specialty: 'Emergency Medicine', rate: 100, handoverSent: true },
  { id: 'n2', name: 'Dr. M. Patel',     ward: 'ICU',         nodeRef: 'STH_ICU_A',     status: 'active',  checkinTime: '09:05', elapsed: 'T+03:19', specialty: 'Intensive Care',     rate: 110, handoverSent: true },
  { id: 'n3', name: 'Dr. S. Okafor',    ward: 'Cardiology',  nodeRef: 'NMU_CARDIO_B',  status: 'active',  checkinTime: '07:58', elapsed: 'T+04:26', specialty: 'Cardiology',         rate: 90,  handoverSent: false },
  { id: 'n4', name: 'Dr. R. Williams',  ward: 'Trauma Unit', nodeRef: 'KCH_TRAUMA_E',  status: 'late',    checkinTime: '—',     elapsed: 'Overdue 00:34', specialty: 'Trauma & Ortho',    rate: 88,  handoverSent: false },
  { id: 'n5', name: 'Dr. C. Nakamura', ward: 'Labour Ward', nodeRef: 'GST_OBSGY_B',   status: 'active',  checkinTime: '08:45', elapsed: 'T+02:39', specialty: 'Obs & Gynaecology',  rate: 102, handoverSent: true },
  { id: 'n6', name: 'Dr. B. Hassan',    ward: 'Neurology',   nodeRef: 'BARTS_NEURO_A', status: 'standby', checkinTime: '—',     elapsed: 'Arriving in 00:15', specialty: 'Neurology',         rate: 84,  handoverSent: false },
]

const wardFill = [
  { ward: 'A&E',         required: 4, deployed: 4, pct: 100, color: 'bg-emerald-400' },
  { ward: 'ICU',         required: 3, deployed: 3, pct: 100, color: 'bg-emerald-400' },
  { ward: 'Cardiology',  required: 3, deployed: 2, pct: 67,  color: 'bg-amber-400' },
  { ward: 'Trauma Unit', required: 2, deployed: 1, pct: 50,  color: 'bg-red-400' },
  { ward: 'Labour Ward', required: 2, deployed: 2, pct: 100, color: 'bg-emerald-400' },
  { ward: 'Neurology',   required: 2, deployed: 1, pct: 50,  color: 'bg-red-400' },
  { ward: 'Paediatrics', required: 3, deployed: 3, pct: 100, color: 'bg-emerald-400' },
  { ward: 'Theatres',    required: 4, deployed: 3, pct: 75,  color: 'bg-amber-400' },
]

const statusDot: Record<NodeStatus, string> = {
  active: 'bg-emerald-400 animate-pulse', late: 'bg-red-500 animate-pulse', standby: 'bg-amber-400',
}
const statusColor: Record<NodeStatus, string> = {
  active: 'text-emerald-400', late: 'text-red-400', standby: 'text-amber-400',
}

function SectionHeader({ label, right }: { label: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
      <p className="text-sm font-medium text-white">{label}</p>
      {right}
    </div>
  )
}

const QUICK_ACTIONS = [
  { label: 'Broadcast ward protocols', success: 'Ward protocols broadcast to all active nodes' },
  { label: 'Send bleep numbers to all nodes', success: 'Bleep numbers sent to 6 active clinicians' },
  { label: 'Request emergency cover', success: 'Emergency cover request sent — AI sourcing candidates' },
  { label: 'View handover log', success: 'Handover log opened — 34 records loaded' },
  { label: "Export today's roster", success: "Roster exported as CSV — check your downloads" },
]

export default function WardAnalytics() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const [urgentSent, setUrgentSent] = useState(false)
  const [handoverIds, setHandoverIds] = useState<Set<string>>(new Set())
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionDone, setActionDone] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || user?.role !== 'employer') router.push('/login')
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading || !isAuthenticated || user?.role !== 'employer') return null

  const sendHandover = async (id: string) => {
    setHandoverIds(p => new Set([...p, id]))
    await new Promise(r => setTimeout(r, 900))
    toast.success('Handover sent to node inbox')
  }

  const handleUrgent = async () => {
    setUrgentSent(true)
    const id = toast.loading('Broadcasting urgent signal…')
    await new Promise(r => setTimeout(r, 1800))
    toast.dismiss(id)
    toast.success('Signal broadcast to 1,204 nodes — responses incoming')
  }

  const handleQuickAction = async (label: string, successMsg: string) => {
    setActionLoading(label)
    await new Promise(r => setTimeout(r, 1100 + Math.random() * 500))
    setActionLoading(null)
    setActionDone(p => new Set([...p, label]))
    toast.success(successMsg)
    setTimeout(() => setActionDone(p => { const n = new Set(p); n.delete(label); return n }), 3000)
  }

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* Stats header */}
        <motion.div {...slideUp(0)} className="rounded-2xl border border-white/5 bg-[#1a1a1a] overflow-hidden">
          <div className="px-6 py-5 flex flex-wrap items-center gap-6">
            <div className="flex-1">
              <p className="text-xs text-zinc-500 mb-1">Active physician nodes</p>
              <p className="text-4xl font-bold text-white">{ACTIVE_NODES.filter(n => n.status === 'active').length}</p>
              <p className="text-xs text-zinc-600 mt-1">Of {ACTIVE_NODES.length} total deployed today</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'On site',   val: ACTIVE_NODES.filter(n => n.status === 'active').length,  color: 'text-emerald-400' },
                { label: 'Overdue',   val: ACTIVE_NODES.filter(n => n.status === 'late').length,    color: 'text-red-400' },
                { label: 'En route',  val: ACTIVE_NODES.filter(n => n.status === 'standby').length, color: 'text-amber-400' },
              ].map(({ label, val, color }) => (
                <div key={label} className="rounded-xl border border-white/5 bg-zinc-800/30 px-4 py-3 text-right">
                  <p className="text-xs text-zinc-600">{label}</p>
                  <p className={`text-2xl font-bold mt-1 ${color}`}>{val}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleUrgent}
                disabled={urgentSent}
                className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl transition-all ${urgentSent ? 'text-zinc-600 border border-zinc-800 cursor-default' : 'font-medium text-black bg-red-400 hover:bg-red-300'}`}
              >
                <Zap className="w-3.5 h-3.5" />
                {urgentSent ? 'Signal broadcast' : 'Urgent signal boost'}
              </button>
              {urgentSent && <p className="text-xs text-red-400 text-center animate-pulse">Broadcasting to mesh…</p>}
            </div>
          </div>
        </motion.div>

        {/* Late arrival alert */}
        {ACTIVE_NODES.some(n => n.status === 'late') && (
          <motion.div {...slideUp(1)} className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-3 flex items-center gap-4">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" strokeWidth={1.5} />
            <div className="flex-1">
              <p className="text-sm text-red-400 font-medium">Node overdue — monitor agent</p>
              <p className="text-xs text-zinc-400 mt-0.5">Dr. R. Williams has not checked in at KCH Trauma. 34 minutes overdue. Escalation initiated.</p>
            </div>
            <span className="text-xs text-zinc-500 border border-zinc-700/60 px-2 py-1 rounded-lg">Escalating</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* Personnel ticker */}
          <motion.div {...slideUp(2)} className="lg:col-span-8 rounded-2xl border border-white/5 bg-[#1a1a1a] overflow-hidden">
            <SectionHeader label="Live personnel" />
            <div className="divide-y divide-white/4">
              {ACTIVE_NODES.map((node, i) => (
                <motion.div key={node.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.06 }}
                  className="px-5 py-4 flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[node.status]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm text-white font-medium">{node.name}</p>
                      <span className="text-zinc-700">·</span>
                      <p className={`text-xs ${statusColor[node.status]}`}>{node.ward}</p>
                      <span className="text-zinc-700">·</span>
                      <p className={`text-xs ${node.status === 'late' ? 'text-red-400' : 'text-zinc-500'}`}>{node.elapsed}</p>
                    </div>
                    <p className="text-xs text-zinc-600 mt-0.5 font-mono">{node.nodeRef} · {node.specialty} · £{node.rate}/hr</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {node.status === 'active' && node.handoverSent && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />Handover sent
                      </span>
                    )}
                    {node.status === 'active' && !node.handoverSent && !handoverIds.has(node.id) && (
                      <button onClick={() => sendHandover(node.id)}
                        className="text-xs text-zinc-400 border border-zinc-700/60 hover:border-zinc-500 hover:text-white px-2.5 py-1.5 rounded-lg transition-colors">
                        Send handover
                      </button>
                    )}
                    {handoverIds.has(node.id) && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />Sent
                      </span>
                    )}
                    {node.status === 'late' && (
                      <span className="text-[10px] text-red-400 border border-red-500/20 bg-red-500/10 px-2 py-1 rounded-full animate-pulse">Overdue</span>
                    )}
                    {node.status === 'standby' && (
                      <span className="text-[10px] text-amber-400 border border-amber-500/20 bg-amber-500/10 px-2 py-1 rounded-full">En route</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Ward fill */}
          <motion.div {...slideUp(3)} className="lg:col-span-4 rounded-2xl border border-white/5 bg-[#1a1a1a] overflow-hidden">
            <SectionHeader label="Ward fill rate" />
            <div className="p-5 space-y-4">
              {wardFill.map(({ ward, required, deployed, pct, color }) => (
                <div key={ward}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-zinc-400">{ward}</span>
                    <span className={`text-xs ${pct === 100 ? 'text-emerald-400' : pct >= 75 ? 'text-amber-400' : 'text-red-400'}`}>
                      {deployed}/{required}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                      className={`h-full rounded-full ${color}`} />
                  </div>
                </div>
              ))}
              <div className="h-px bg-white/5 mt-2" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Overall fill</span>
                <span className="text-sm text-white font-semibold">
                  {Math.round(wardFill.reduce((s, w) => s + w.pct, 0) / wardFill.length)}%
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* AI Monitor + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <motion.div {...slideUp(4)} className="rounded-2xl border border-white/5 bg-[#1a1a1a] overflow-hidden">
            <SectionHeader label="Monitor agent" />
            <div className="p-5 space-y-3">
              {[
                { icon: <Radio className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />, text: 'All mesh connections nominal — 5/6 nodes handshaked', color: 'text-emerald-400' },
                { icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400" strokeWidth={1.5} />, text: 'KCH Trauma node overdue — escalation protocol active', color: 'text-red-400' },
                { icon: <Clock className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.5} />, text: 'Barts Neurology en route — ETA 15 mins', color: 'text-amber-400' },
                { icon: <Shield className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />, text: 'GMC verification complete for all active nodes', color: 'text-zinc-400' },
              ].map(({ icon, text, color }, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-white/5 bg-zinc-800/30 px-4 py-3">
                  <span className="flex-shrink-0 mt-0.5">{icon}</span>
                  <p className={`text-xs ${color}`}>{text}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...slideUp(5)} className="rounded-2xl border border-white/5 bg-[#1a1a1a] overflow-hidden">
            <SectionHeader label="Quick actions" />
            <div className="p-5 space-y-2">
              {QUICK_ACTIONS.map(({ label, success }) => {
                const loading = actionLoading === label
                const done = actionDone.has(label)
                return (
                  <button key={label}
                    onClick={() => handleQuickAction(label, success)}
                    disabled={!!actionLoading || done}
                    className={`w-full text-left text-sm border rounded-xl px-4 py-3 transition-all flex items-center justify-between gap-3 disabled:opacity-60
                      ${done ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' : 'text-zinc-400 hover:text-white border-white/5 hover:border-white/10'}`}
                  >
                    <span>{label}</span>
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0 text-zinc-500" />}
                    {done && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" strokeWidth={1.5} />}
                    {!loading && !done && <span className="text-zinc-600 flex-shrink-0">→</span>}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </div>

      </div>
    </DashboardLayout>
  )
}
