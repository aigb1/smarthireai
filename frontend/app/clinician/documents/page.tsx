'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck, FileText, UploadCloud, Zap,
  Share2, Lock, CreditCard, ArrowRight, FileSearch, Loader2, CheckCircle2,
} from 'lucide-react'
import { toast } from '@/lib/toast'

function IntegrityRing({ score }: { score: number }) {
  const r = 14, circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <svg width="36" height="36" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r={r} fill="none" stroke="#27272a" strokeWidth="3" />
      <circle cx="18" cy="18" r={r} fill="none" stroke="#4ade80" strokeWidth="3"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform="rotate(-90 18 18)" />
      <text x="18" y="22" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">{score}</text>
    </svg>
  )
}

interface DocNode {
  title: string; status: 'Approved' | 'Pending' | 'Verifying'
  details?: string; expiry?: string; icon: React.ElementType; isParsing?: boolean
}

function DocumentNode({ title, status, details, expiry, icon: Icon, isParsing }: DocNode) {
  return (
    <motion.div layout
      className="bg-zinc-800/30 border border-white/5 rounded-xl p-6 flex flex-col justify-between min-h-[180px] relative group transition-all duration-300 hover:bg-zinc-800/50 hover:border-white/10">
      {isParsing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="absolute inset-0 bg-zinc-950/80 z-20 flex flex-col items-center justify-center p-6 text-center rounded-xl">
          <div className="relative w-10 h-10 mb-3">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 border-2 border-dashed border-white/10 rounded-full" />
            <FileSearch className="absolute inset-0 m-auto w-4 h-4 text-zinc-500" />
          </div>
          <p className="text-xs text-zinc-400">Neural parsing…</p>
        </motion.div>
      )}

      <div className="flex items-start justify-between mb-5">
        <div className="w-9 h-9 rounded-full bg-zinc-800/60 flex items-center justify-center border border-white/8 group-hover:bg-white group-hover:text-zinc-950 transition-all duration-300">
          <Icon className="w-4 h-4" strokeWidth={1.5} />
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${status === 'Approved' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <span className="text-[10px] text-zinc-500">{status}</span>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-zinc-100 leading-snug mb-1">{title}</h4>
        {details && <p className="text-xs text-zinc-500">{details}</p>}
      </div>

      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-600">
        {expiry ? <span>Exp: {expiry}</span> : <span />}
        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300 text-white" />
      </div>
    </motion.div>
  )
}

export default function ClinicianDocuments() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const [parsingNode, setParsingNode] = useState<string | null>(null)
  const [completion, setCompletion] = useState(78)
  const [autonomousMatch, setAutonomousMatch] = useState(false)
  const [linkLoading, setLinkLoading] = useState(false)
  const [linkDone, setLinkDone] = useState(false)
  const [auditLoading, setAuditLoading] = useState(false)

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || user?.role !== 'clinician') router.push('/login')
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading || !isAuthenticated || user?.role !== 'clinician') return null

  const handleUpload = () => {
    if (parsingNode) return
    setParsingNode('Clinical References')
    toast.loading('Neural OCR parsing document…')
    setTimeout(() => {
      setParsingNode(null)
      setCompletion(92)
      toast.success('Document parsed — Clinical References updated to 92% integrity')
    }, 3000)
  }

  const handleGenerateLink = async () => {
    setLinkLoading(true)
    const id = toast.loading('Generating secure 24h access link…')
    await new Promise(r => setTimeout(r, 1600))
    toast.dismiss(id)
    setLinkLoading(false)
    setLinkDone(true)
    toast.success('24h access link copied to clipboard — expires tomorrow at 09:41')
    setTimeout(() => setLinkDone(false), 4000)
  }

  const handleAuditLogs = async () => {
    setAuditLoading(true)
    await new Promise(r => setTimeout(r, 900))
    setAuditLoading(false)
    toast.info('Audit log: 14 access events in last 30 days — no anomalies detected')
  }

  const docs: DocNode[] = [
    { title: 'GMC Register',      status: 'Approved',  details: '7492012', expiry: '12/26', icon: ShieldCheck },
    { title: 'DBS Certificate',   status: 'Approved',  details: 'Active',  expiry: '08/25', icon: Lock },
    { title: 'Right to Work',     status: 'Approved',  details: 'Verified',expiry: '05/30', icon: CreditCard },
    {
      title: 'Clinical References',
      status: parsingNode === 'Clinical References' ? 'Verifying' : 'Pending',
      details: parsingNode === 'Clinical References' ? 'Neural parsing…' : '2/3 received',
      icon: FileText,
      isParsing: parsingNode === 'Clinical References',
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* Page header */}
        <div className="rounded-2xl border border-white/5 bg-[#1a1a1a] overflow-hidden">
          <div className="px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl border border-white/8 bg-zinc-800/60 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-zinc-300" strokeWidth={1.2} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-white">Document vault</h1>
                <p className="text-xs text-zinc-500 mt-1">Secure clinician node configuration & identity management</p>
              </div>
            </div>
            <div className="flex items-center gap-3 border border-white/8 rounded-full px-5 py-2.5">
              <IntegrityRing score={completion} />
              <div>
                <p className="text-xs text-zinc-500">Integrity</p>
                <p className="text-sm font-semibold text-white">{completion}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* Main vault */}
          <div className="lg:col-span-8 space-y-5">

            <div className="rounded-2xl border border-white/5 bg-[#1a1a1a] overflow-hidden">
              <div className="flex items-center px-5 py-3 border-b border-white/5">
                <p className="text-sm font-medium text-white">Document nodes</p>
              </div>
              <div className="p-6">
                <p className="text-xs text-zinc-500 mb-5">Verified identity & clinical credentials</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {docs.map((doc) => <DocumentNode key={doc.title} {...doc} />)}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#1a1a1a] overflow-hidden">
              <div className="flex items-center px-5 py-3 border-b border-white/5">
                <p className="text-sm font-medium text-white">Neural ingest</p>
              </div>
              <div className="p-6">
                <div
                  onClick={handleUpload}
                  className="bg-zinc-800/20 border border-white/5 hover:border-white/10 transition-all duration-500 cursor-pointer p-14 flex flex-col items-center justify-center text-center group rounded-xl relative overflow-hidden"
                  style={{
                    backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                >
                  <div className="w-14 h-14 rounded-full bg-zinc-800/60 flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-500 border border-white/8">
                    <UploadCloud className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-semibold text-white leading-none mb-3">Drop files to parse</h3>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                    AI will automatically extract credentials and registry data via high-frequency neural OCR.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-4 space-y-4">

            <div className="rounded-2xl border border-white/5 bg-[#1a1a1a] overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
                <Zap className="w-3.5 h-3.5 text-zinc-300" />
                <p className="text-sm font-medium text-white">AI tools</p>
              </div>
              <div className="p-5 space-y-5">

                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-zinc-100">Autonomous matching</p>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Let the agent bid on high-yield shifts automatically based on your history.
                    </p>
                  </div>
                  <button
                    onClick={() => setAutonomousMatch(!autonomousMatch)}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors mt-1 ${autonomousMatch ? 'bg-white' : 'bg-zinc-700'}`}
                  >
                    <div className={`h-3.5 w-3.5 rounded-full transition-all duration-200 ${autonomousMatch ? 'translate-x-4 bg-zinc-950' : 'translate-x-1 bg-zinc-400'}`} />
                  </button>
                </div>

                <div className="h-px bg-white/5" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-zinc-100">Ledger</p>
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Connected
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">Hardware connection active via Node 0x4f…8a2</p>
                </div>

                <div className="h-px bg-white/5" />

                <div className="space-y-4">
                  <p className="text-sm font-medium text-zinc-100">Universal compliance</p>
                  <button onClick={handleGenerateLink} disabled={linkLoading}
                    className="w-full bg-white text-zinc-950 rounded-xl py-2.5 px-5 flex items-center justify-center gap-2 text-sm font-medium hover:bg-zinc-100 transition-all disabled:opacity-70">
                    {linkLoading
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating…</>
                      : linkDone
                        ? <><CheckCircle2 className="w-3.5 h-3.5" /> Link copied!</>
                        : <><Share2 className="w-3.5 h-3.5" /> Generate 24h access link</>}
                  </button>
                  <p className="text-[10px] text-center text-zinc-600">Secure one-time protocol</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#1a1a1a] overflow-hidden">
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-zinc-800/60 flex items-center justify-center border border-white/8">
                    <ShieldCheck className="w-4 h-4 text-zinc-200" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Security</p>
                    <p className="text-sm font-semibold text-white">Tier 4 protocol</p>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Your documents are encrypted with hardware-level security nodes. Only verified hospital endpoints can access your vault.
                </p>
                <button onClick={handleAuditLogs} disabled={auditLoading}
                  className="w-full bg-zinc-800/60 hover:bg-zinc-800 border border-white/5 text-zinc-300 rounded-xl py-2.5 text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                  {auditLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading…</> : 'Audit logs'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
