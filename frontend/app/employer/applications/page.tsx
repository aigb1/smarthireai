'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Shield, FileText, Loader2, X } from 'lucide-react'
import { toast } from '@/lib/toast'

const slideUp = (i = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
})

type CompStatus = 'clear' | 'flagged' | 'pending' | 'expired'

interface CredNode {
  id: string; name: string; role: string; specialty: string
  gmc: string; dbs: string; dbsExpiry: string; indemnity: string
  status: CompStatus; lastShift: string; shiftCount: number; cqcLinked: boolean
}

const CRED_NODES: CredNode[] = [
  { id: 'c1', name: 'Dr. A. Sterling',  role: 'Consultant', specialty: 'Emergency Medicine', gmc: 'GMC-7234891', dbs: 'DBS-A82C', dbsExpiry: '2026-11-01', indemnity: 'MDU Active',    status: 'clear',   lastShift: '28-03-2026', shiftCount: 34, cqcLinked: true },
  { id: 'c2', name: 'Dr. M. Patel',     role: 'Consultant', specialty: 'Intensive Care',     gmc: 'GMC-6118432', dbs: 'DBS-P91X', dbsExpiry: '2026-08-14', indemnity: 'MPS Active',    status: 'clear',   lastShift: '28-03-2026', shiftCount: 22, cqcLinked: true },
  { id: 'c3', name: 'Dr. S. Okafor',    role: 'SpR',        specialty: 'Cardiology',         gmc: 'GMC-5290147', dbs: 'DBS-K44T', dbsExpiry: '2025-12-30', indemnity: 'MDU Active',    status: 'flagged', lastShift: '26-03-2026', shiftCount: 18, cqcLinked: false },
  { id: 'c4', name: 'Dr. R. Williams',  role: 'SpR',        specialty: 'Trauma & Ortho',     gmc: 'GMC-4387562', dbs: 'DBS-R17F', dbsExpiry: '2026-06-22', indemnity: 'MDDUS Active',  status: 'pending', lastShift: '20-03-2026', shiftCount: 9,  cqcLinked: false },
  { id: 'c5', name: 'Dr. C. Nakamura', role: 'Consultant', specialty: 'Obs & Gynaecology',  gmc: 'GMC-8103920', dbs: 'DBS-N55B', dbsExpiry: '2027-02-10', indemnity: 'MDU Active',    status: 'clear',   lastShift: '28-03-2026', shiftCount: 41, cqcLinked: true },
  { id: 'c6', name: 'Dr. B. Hassan',    role: 'Registrar',  specialty: 'Neurology',          gmc: 'GMC-3941028', dbs: 'DBS-H83Q', dbsExpiry: '2024-11-30', indemnity: 'MPS Lapsed',   status: 'expired', lastShift: '15-03-2026', shiftCount: 6,  cqcLinked: false },
  { id: 'c7', name: 'Dr. Y. Kimura',    role: 'SpR',        specialty: 'Paediatrics',        gmc: 'GMC-6720394', dbs: 'DBS-Y22W', dbsExpiry: '2026-09-15', indemnity: 'MDDUS Active',  status: 'clear',   lastShift: '27-03-2026', shiftCount: 29, cqcLinked: true },
  { id: 'c8', name: 'Dr. F. Okonkwo',   role: 'Consultant', specialty: 'Gastroenterology',   gmc: 'GMC-5083716', dbs: 'DBS-F61Z', dbsExpiry: '2026-07-04', indemnity: 'MDU Active',    status: 'clear',   lastShift: '25-03-2026', shiftCount: 15, cqcLinked: true },
]

const statusConfig: Record<CompStatus, { border: string; text: string; bg: string; label: string }> = {
  clear:   { border: 'border-emerald-500/20', text: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Clear' },
  flagged: { border: 'border-amber-500/20',   text: 'text-amber-400',   bg: 'bg-amber-500/10',   label: 'Flagged' },
  pending: { border: 'border-zinc-700/60',    text: 'text-zinc-400',    bg: 'bg-zinc-500/10',    label: 'Pending' },
  expired: { border: 'border-red-500/20',     text: 'text-red-400',     bg: 'bg-red-500/10',     label: 'Expired' },
}

const rotaMatrix = [
  { ward: 'A&E',         shifts: [true, true, true, false, true, true, false] },
  { ward: 'ICU',         shifts: [true, true, false, true, true, false, true] },
  { ward: 'Cardiology',  shifts: [true, false, true, true, false, true, true] },
  { ward: 'Trauma Unit', shifts: [false, true, true, false, false, true, false] },
  { ward: 'Labour Ward', shifts: [true, true, true, true, false, false, true] },
  { ward: 'Theatres',    shifts: [true, false, false, true, true, true, false] },
]
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center px-5 py-3 border-b border-white/5">
      <p className="text-sm font-medium text-white">{label}</p>
    </div>
  )
}

export default function ComplianceRota() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const [auditNode, setAuditNode] = useState<CredNode | null>(null)
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set())
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [cqcLoading, setCqcLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || user?.role !== 'employer') router.push('/login')
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading || !isAuthenticated || user?.role !== 'employer') return null

  const counts = {
    clear:   CRED_NODES.filter(n => n.status === 'clear').length,
    flagged: CRED_NODES.filter(n => n.status === 'flagged').length,
    pending: CRED_NODES.filter(n => n.status === 'pending').length,
    expired: CRED_NODES.filter(n => n.status === 'expired').length,
  }

  const approve = async (id: string) => {
    setApprovingId(id)
    await new Promise(r => setTimeout(r, 1000))
    setApprovedIds(p => new Set([...p, id]))
    setApprovingId(null)
    const node = CRED_NODES.find(n => n.id === id)
    toast.success(`${node?.name ?? 'Clinician'} approved and added to active mesh`)
  }

  const handleCqcReport = async () => {
    setCqcLoading(true)
    const id = toast.loading('Generating CQC audit report…')
    await new Promise(r => setTimeout(r, 2200))
    toast.dismiss(id)
    setCqcLoading(false)
    toast.success('CQC audit report generated — PDF ready for download')
  }

  const handleExport = async () => {
    setExportLoading(true)
    const id = toast.loading('Exporting compliance data…')
    await new Promise(r => setTimeout(r, 1400))
    toast.dismiss(id)
    setExportLoading(false)
    toast.success('Export complete — credential matrix downloaded as CSV')
  }

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* Header */}
        <motion.div {...slideUp(0)} className="rounded-2xl border border-white/5 bg-[#1a1a1a] overflow-hidden">
          <div className="px-6 py-5 flex flex-wrap items-center gap-6">
            <div className="flex-1">
              <p className="text-xs text-zinc-500 mb-1">Compliance status</p>
              <p className="text-4xl font-bold text-white">{CRED_NODES.length}</p>
              <p className="text-xs text-zinc-600 mt-1">Physician nodes in credential matrix</p>
            </div>
            <button onClick={handleExport} disabled={exportLoading}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
              {exportLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />}
              {exportLoading ? 'Exporting…' : 'Export CSV'}
            </button>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Clear',   val: counts.clear,   color: 'text-emerald-400' },
                { label: 'Flagged', val: counts.flagged, color: 'text-amber-400' },
                { label: 'Pending', val: counts.pending, color: 'text-zinc-400' },
                { label: 'Expired', val: counts.expired, color: 'text-red-400' },
              ].map(({ label, val, color }) => (
                <div key={label} className="rounded-xl border border-white/5 bg-zinc-800/30 px-4 py-3 text-right">
                  <p className="text-xs text-zinc-600">{label}</p>
                  <p className={`text-xl font-bold mt-1 ${color}`}>{val}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Alerts */}
        {(counts.flagged > 0 || counts.expired > 0) && (
          <motion.div {...slideUp(1)} className="space-y-2">
            {CRED_NODES.filter(n => n.status === 'expired').map(node => (
              <div key={node.id} className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-3 flex items-center gap-4">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" strokeWidth={1.5} />
                <div className="flex-1">
                  <p className="text-sm text-red-400 font-medium">Credential expired — {node.name}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{node.indemnity} · DBS expired {node.dbsExpiry} · Node suspended from mesh</p>
                </div>
                <span className="text-xs text-red-400 border border-red-500/20 px-2 py-1 rounded-lg">Action required</span>
              </div>
            ))}
            {CRED_NODES.filter(n => n.status === 'flagged').map(node => (
              <div key={node.id} className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-3 flex items-center gap-4">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" strokeWidth={1.5} />
                <div className="flex-1">
                  <p className="text-sm text-amber-400 font-medium">Credential flagged — {node.name}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">CQC link not established · DBS expiring {node.dbsExpiry} · Awaiting re-verification</p>
                </div>
                <span className="text-xs text-amber-400 border border-amber-500/20 px-2 py-1 rounded-lg">Review</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Credential matrix table */}
        <motion.div {...slideUp(2)} className="rounded-2xl border border-white/5 bg-[#1a1a1a] overflow-hidden">
          <SectionHeader label="Credential matrix" />
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5">
                  {['Physician', 'Role', 'GMC ref', 'DBS ref', 'DBS expiry', 'Indemnity', 'Shifts', 'CQC', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-zinc-600 font-normal whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {CRED_NODES.map(node => {
                  const sc = statusConfig[node.status]
                  const approved = approvedIds.has(node.id)
                  return (
                    <tr key={node.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{node.name}</p>
                        <p className="text-zinc-600 text-[10px]">{node.specialty}</p>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{node.role}</td>
                      <td className="px-4 py-3 text-zinc-500 font-mono text-[10px]">{node.gmc}</td>
                      <td className="px-4 py-3 text-zinc-500 font-mono text-[10px]">{node.dbs}</td>
                      <td className={`px-4 py-3 ${new Date(node.dbsExpiry) < new Date('2026-06-01') ? 'text-amber-400' : 'text-zinc-400'}`}>{node.dbsExpiry}</td>
                      <td className={`px-4 py-3 ${node.indemnity.includes('Lapsed') ? 'text-red-400' : 'text-zinc-400'}`}>{node.indemnity}</td>
                      <td className="px-4 py-3 text-zinc-300 font-semibold">{node.shiftCount}</td>
                      <td className="px-4 py-3">
                        {node.cqcLinked
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
                          : <X className="w-3.5 h-3.5 text-zinc-600" strokeWidth={1.5} />}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] border px-2 py-0.5 rounded-full ${sc.border} ${sc.text} ${sc.bg}`}>
                          {approved ? 'Approved' : sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setAuditNode(node)} className="text-zinc-600 hover:text-zinc-400 transition-colors">
                            <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                          {node.status === 'pending' && !approved && (
                            <button onClick={() => approve(node.id)} disabled={approvingId === node.id}
                              className="text-xs text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 rounded-lg hover:bg-emerald-500/20 transition-colors flex items-center gap-1 disabled:opacity-60">
                              {approvingId === node.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Approve'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Rota + CQC auditor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <motion.div {...slideUp(3)} className="rounded-2xl border border-white/5 bg-[#1a1a1a] overflow-hidden">
            <SectionHeader label="Shift rota — week of 30 Mar 2026" />
            <div className="p-5 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-2 pr-4 text-zinc-600 font-normal">Ward</th>
                    {days.map(d => <th key={d} className="text-center py-2 px-2 text-zinc-600 font-normal">{d}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4">
                  {rotaMatrix.map(({ ward, shifts }) => (
                    <tr key={ward}>
                      <td className="py-3 pr-4 text-zinc-400 whitespace-nowrap">{ward}</td>
                      {shifts.map((filled, i) => (
                        <td key={i} className="py-3 px-2 text-center">
                          <span className={`inline-block w-4 h-4 rounded-sm border ${filled ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-red-500/10 border-red-500/20'}`} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm border bg-emerald-500/20 border-emerald-500/30" />
                  <span className="text-xs text-zinc-600">Covered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm border bg-red-500/10 border-red-500/20" />
                  <span className="text-xs text-zinc-600">Gap</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div {...slideUp(4)} className="rounded-2xl border border-white/5 bg-[#1a1a1a] overflow-hidden">
            <SectionHeader label="CQC audit agent" />
            <div className="p-5 space-y-3">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 flex items-center gap-3">
                <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-sm text-emerald-400 font-medium">CQC audit: 75% compliant</p>
                  <p className="text-xs text-zinc-500 mt-0.5">6 of 8 nodes fully verified for CQC inspection</p>
                </div>
              </div>
              {[
                { label: 'GMC registrations verified', val: '8/8', color: 'text-emerald-400' },
                { label: 'DBS checks current',         val: '6/8', color: 'text-amber-400' },
                { label: 'Indemnity active',            val: '7/8', color: 'text-amber-400' },
                { label: 'CQC link established',        val: '5/8', color: 'text-zinc-400' },
                { label: 'Shift clock-in audit',        val: '34/34 match', color: 'text-emerald-400' },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex items-center justify-between rounded-xl border border-white/5 bg-zinc-800/30 px-4 py-3">
                  <span className="text-xs text-zinc-400">{label}</span>
                  <span className={`text-xs font-semibold ${color}`}>{val}</span>
                </div>
              ))}
              <button onClick={handleCqcReport} disabled={cqcLoading}
                className="w-full text-sm text-zinc-400 hover:text-white border border-white/5 hover:border-white/10 transition-all py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                {cqcLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                {cqcLoading ? 'Generating…' : 'Generate CQC audit report →'}
              </button>
            </div>
          </motion.div>
        </div>

      </div>

      {/* Vault audit modal */}
      <AnimatePresence>
        {auditNode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            onClick={() => setAuditNode(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22 }}
              className="rounded-2xl border border-white/8 bg-[#1a1a1a] w-full max-w-md overflow-hidden"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div>
                  <p className="text-sm font-medium text-white">{auditNode.name}</p>
                  <p className="text-xs text-zinc-500">{auditNode.role} · {auditNode.specialty}</p>
                </div>
                <button onClick={() => setAuditNode(null)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-xs text-zinc-500">Credential vault snapshot</p>
                <div className="space-y-2">
                  {[
                    { k: 'GMC reference', v: auditNode.gmc },
                    { k: 'DBS reference', v: auditNode.dbs },
                    { k: 'DBS expiry',    v: auditNode.dbsExpiry },
                    { k: 'Indemnity',     v: auditNode.indemnity },
                    { k: 'Shifts logged', v: String(auditNode.shiftCount) },
                    { k: 'Last shift',    v: auditNode.lastShift },
                    { k: 'CQC linked',    v: auditNode.cqcLinked ? 'Yes — vault verified' : 'No — link required' },
                  ].map(({ k, v }) => (
                    <div key={k} className="flex items-center justify-between rounded-xl border border-white/5 bg-zinc-800/30 px-3 py-2.5">
                      <span className="text-xs text-zinc-600">{k}</span>
                      <span className="text-xs text-white font-medium">{v}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-zinc-600 text-center">
                  Snapshot captured at moment of shift commencement · Immutable audit record
                </p>
                <button onClick={() => setAuditNode(null)}
                  className="w-full text-sm font-medium text-black bg-white hover:bg-zinc-100 py-2.5 rounded-xl transition-colors">
                  Close vault
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
