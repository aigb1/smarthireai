'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  ShieldCheck, CreditCard, Zap, Lock, Activity, Database,
  ArrowRight, ArrowUpRight,
} from 'lucide-react'
import { NodeModal, NodeData } from '@/components/ui/NodeModal'
import { Typewriter } from '@/components/ui/Typewriter'
import { PublicLayout } from '@/components/layout/PublicLayout'

const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }

const agentNodes: NodeData[] = [
  {
    id: 'passport',
    title: 'candidate passport',
    icon: ShieldCheck,
    description: 'Hardware-secured credentials verified once, accepted everywhere.',
    tag: '[PASSPORT_VERIFIED]',
    tagline: 'Hardware-secured credentials verified once, accepted everywhere.',
    systemLog: 'Your professional identity is locked into a secure hardware enclave. The AI agent has successfully mapped your qualifications, certifications, and mandatory training into a single Sovereign ID that employers can verify instantly without manual paperwork.',
    parameters: [
      { label: 'VERIFICATION_STATUS', value: '100%_VALIDATED' },
      { label: 'REVALIDATION_SYNC', value: 'ACTIVE' },
      { label: 'PASSPORT_ENCRYPTION', value: 'BIOMETRIC_HARDWARE' },
    ],
  },
  {
    id: 'settlement',
    title: 'instant settlement',
    icon: CreditCard,
    description: 'Real-time payment streaming upon placement confirmation via ledger.',
    tag: '[SETTLEMENT_LIVE]',
    tagline: 'Real-time payment streaming upon placement confirmation.',
    systemLog: 'Traditional delayed payroll is replaced by a live streaming ledger. As soon as a placement is digitally confirmed, your earnings are calculated and streamed to your vault in real-time. No agency delays, full transparency.',
    parameters: [
      { label: 'SETTLEMENT_SPEED', value: 'INSTANT' },
      { label: 'TAX_ESTIMATION', value: 'AUTOMATED' },
      { label: 'FEE_TRANSPARENCY', value: '0%_AGENCY_TAX' },
    ],
  },
  {
    id: 'matching',
    title: 'autonomous matching',
    icon: Zap,
    description: 'Direct connection to employer demand without agency intermediaries.',
    tag: '[MATCHING_ACTIVE]',
    tagline: 'Direct connection to employer demand without agency tax.',
    systemLog: 'A high-frequency agent swarm constantly scans employer demand databases. It matches your specific skills and availability against open roles, bidding on your behalf for the highest-value positions before they hit the public market.',
    parameters: [
      { label: 'MATCH_ACCURACY', value: '98.4%' },
      { label: 'BIDDING_STRATEGY', value: 'OPTIMAL_YIELD' },
      { label: 'ROLE_PRIORITY', value: 'HIGH_URGENCY' },
    ],
  },
  {
    id: 'sovereign-id',
    title: 'self-sovereign id',
    icon: Lock,
    description: 'Encrypted, zero-knowledge credential wallet you control entirely.',
    tag: '[SOVEREIGN_ID_v1.0]',
    tagline: 'Encrypted credential wallet that is fully zero-knowledge.',
    systemLog: 'You own your data. When an employer requests background check documents, the AI provides a Zero-Knowledge Proof — verifying you are compliant without sending copies of your documents across the open web.',
    parameters: [
      { label: 'PRIVACY_PROTOCOL', value: 'ZK_PROOFS' },
      { label: 'DATA_OWNERSHIP', value: '100%_USER' },
      { label: 'ACCESS_HISTORY', value: 'AUDITED_BLOCKCHAIN' },
    ],
  },
  {
    id: 'compliance',
    title: 'compliance auditor',
    icon: Activity,
    description: 'AI agent continuously verifying credentials and certification status.',
    tag: '[ACTIVE_AUDIT]',
    tagline: 'AI agent continuously verifying your professional standing.',
    systemLog: 'This background process monitors your professional standing. It proactively alerts you 90 days before a certification expires or an insurance certificate lapses, ensuring you are never non-compliant and unable to work.',
    parameters: [
      { label: 'AUDIT_FREQUENCY', value: 'CONTINUOUS_REALTIME' },
      { label: 'RISK_SCORE', value: 'MINIMAL' },
      { label: 'ALERTS', value: 'NO_PENDING_ACTION' },
    ],
  },
  {
    id: 'ledger',
    title: 'earnings ledger',
    icon: Database,
    description: 'High-frequency, transparent ledger tracking all autonomous payments.',
    tag: '[LEDGER_v1.1]',
    tagline: 'Transparent ledger tracking all autonomous placements and pay.',
    systemLog: 'A complete historical audit of every hour worked and every payment earned. This provides a clean, machine-readable financial statement suitable for professional mortgage applications or independent accounting.',
    parameters: [
      { label: 'YTD_EARNINGS', value: '$24,800.00' },
      { label: 'PAYMENT_SUCCESS', value: '100%' },
      { label: 'EXPORT_FORMAT', value: 'DIGITAL_PDF_ENCRYPTED' },
    ],
  },
]

export default function ClinicianDiscovery() {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null)

  useEffect(() => {
    document.body.style.overflow = selectedNode ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [selectedNode])

  return (
    <PublicLayout>
    <div className="relative min-h-screen w-full bg-zinc-950 overflow-x-hidden font-sans text-white selection:bg-white selection:text-zinc-950">
      {/* Grid bg */}
      <div className="absolute inset-0 pointer-events-none opacity-20 mn-grid-bg" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-3 md:pt-24 pb-16 md:pb-32">
        {/* Metadata tag */}
        <div className="flex items-center justify-between mb-5 md:mb-12">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white bg-zinc-900 px-3 py-1.5 border border-zinc-800 rounded-sm" style={MONO}>
              [CLINICIAN_NODE_v2.4.1]
            </span>
          </motion.div>
          <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700 transition-all text-[10px] font-mono uppercase tracking-widest" style={MONO}>
            ← back
          </Link>
        </div>

        {/* Hero */}
        <div className="relative mb-32">
          {/* Ghost watermark */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.05 }}
            transition={{ duration: 2 }}
            className="absolute -top-24 -left-8 text-[18vw] font-bold text-white tracking-tighter leading-none select-none pointer-events-none whitespace-nowrap"
          >
            agentic matching
          </motion.div>

          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative text-[clamp(1rem,3vw,2.4rem)] font-bold text-zinc-500 tracking-tighter leading-[1.1] lowercase"
          >
            mednode.cloud /
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
            className="relative text-[clamp(2rem,8vw,7rem)] font-bold text-white tracking-tighter leading-[0.88] lowercase max-w-4xl"
          >
            <Typewriter text="clinician protocol." speed={40} delay={300} />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-lg md:text-xl text-zinc-400 max-w-xl leading-relaxed"
          >
            <Typewriter
              text="orchestrating candidate identity and matching via high-frequency agent swarms."
              speed={15}
              delay={800}
            />
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12"
          >
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 bg-white text-zinc-950 rounded-full px-10 py-4 text-sm font-medium hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/10"
            >
              Connect Passport
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
            </Link>
          </motion.div>
        </div>

        {/* Agent nodes grid */}
        <div>
          <div className="mb-5">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest" style={MONO}>{agentNodes.length} agent modules</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agentNodes.map((node, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 * index + 0.5, type: 'spring', damping: 28, stiffness: 240 }}
                onClick={() => setSelectedNode(node)}
                className="group relative flex flex-col cursor-pointer overflow-hidden rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
              >
                <div className="p-6 flex flex-col gap-4 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.09)' }}>
                      <node.icon className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.72)' }} strokeWidth={1.5} />
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full mt-0.5"
                      style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.32)', letterSpacing: '0.1em' }}>
                      {node.tag.replace(/[\[\]]/g, '')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-white mb-1.5 capitalize">{node.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.46)' }}>{node.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <div className="relative flex-shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-50" />
                      </div>
                      <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.32)' }}>Live</span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ color: 'rgba(255,255,255,0.5)' }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {selectedNode && (
            <NodeModal key="node-modal" node={selectedNode} onClose={() => setSelectedNode(null)} />
          )}
        </AnimatePresence>

        {/* Bottom metadata */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-24 flex items-center gap-4 border-t border-zinc-800 pt-8"
        >
          {[
            'Identity: SECURE',
            'Matching: 12ms',
            'Node: CLINICIAN_ALPHA',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-zinc-700" />
              <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest" style={MONO}>{item}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
    </PublicLayout>
  )
}
