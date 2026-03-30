'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Radio, Users, CreditCard, Shield, FileText, BarChart3,
  ArrowRight, ArrowUpRight,
} from 'lucide-react'
import { NodeModal, NodeData } from '@/components/ui/NodeModal'
import { Typewriter } from '@/components/ui/Typewriter'
import { PublicLayout } from '@/components/layout/PublicLayout'

const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }

const agentNodes: NodeData[] = [
  {
    id: 'broadcast',
    title: 'demand broadcast',
    icon: Radio,
    description: 'AI agent scanning for open roles and broadcasting requirements to verified candidate nodes.',
    tag: '[BROADCAST_ACTIVE]',
    tagline: 'AI agent broadcasting your open roles in real-time.',
    systemLog: 'The engine is performing a sub-millisecond scan of your job requirements. It has identified three high-priority roles unfilled in the current cycle. The agent is now broadcasting these requirements directly to verified "Platinum Tier" candidate nodes within your target market.',
    parameters: [
      { label: 'SCAN_VELOCITY', value: '0.4ms' },
      { label: 'ACTIVE_BROADCASTS', value: '3_NODES' },
      { label: 'RELIABILITY_SCORE', value: '99.9%' },
    ],
  },
  {
    id: 'matching',
    title: 'neural matching',
    icon: Users,
    description: 'High-frequency talent demand orchestration via autonomous agent swarms.',
    tag: '[SWARM_READY]',
    tagline: 'High-frequency matching via autonomous agent swarms.',
    systemLog: 'Neural matching layer cross-references job requirements with real-time candidate performance data. Instead of manual CV sorting, the swarm autonomously selects the top candidates based on skill fit scores and application history.',
    parameters: [
      { label: 'MATCH_CONFIDENCE', value: '98.4%' },
      { label: 'SWARM_COUNT', value: '1,024_AGENTS' },
      { label: 'HEURISTIC_MODE', value: 'AUTONOMOUS' },
    ],
  },
  {
    id: 'hiring',
    title: 'instant hiring',
    icon: CreditCard,
    description: 'Instant candidate shortlisting and offer generation upon job post.',
    tag: '[HIRING_LIVE]',
    tagline: 'Real-time hiring orchestration for recruitment teams.',
    systemLog: 'Hiring protocol initialized. All verified candidate applications are triggering instant shortlist scoring via the AI backbone. Zero-latency processing confirmed.',
    parameters: [
      { label: 'SHORTLIST_SPEED', value: 'INSTANT' },
      { label: 'BACKBONE', value: 'AI_SCORING_v4' },
      { label: 'CLEARANCE_RATE', value: '100%' },
    ],
  },
  {
    id: 'verification',
    title: 'verification gateway',
    icon: Shield,
    description: 'Encrypted gateway that automatically blocks unverified candidate nodes from your pipeline.',
    tag: '[GATEWAY_v2.0]',
    tagline: 'Hardware-secured compliance enforcement.',
    systemLog: 'Verification gateway is active. 14 unverified connection attempts were blocked in the last 60 seconds. Only nodes with valid "Sovereign ID" signatures are permitted to view your demand signals.',
    parameters: [
      { label: 'BLOCK_RATE', value: '100%' },
      { label: 'ENCRYPTION', value: 'AES_256_GCM' },
      { label: 'THREAT_LEVEL', value: 'MINIMAL' },
    ],
  },
  {
    id: 'audit',
    title: 'audit trail',
    icon: FileText,
    description: 'AI agent generating automated, unalterable transaction logs for all hiring activity.',
    tag: '[LOG_SCRIBE]',
    tagline: 'Immutable ledgering of all recruitment transactions.',
    systemLog: 'Audit agent is active. Every interaction, broadcast, and hire is being hashed and written to the unalterable protocol ledger. Audit-ready telemetry is being streamed to your vault.',
    parameters: [
      { label: 'LOG_INTEGRITY', value: 'VERIFIED' },
      { label: 'HASH_ALGO', value: 'SHA_256' },
      { label: 'AUDIT_STATUS', value: 'CONTINUOUS' },
    ],
  },
  {
    id: 'analytics',
    title: 'analytics dashboard',
    icon: BarChart3,
    description: 'High-frequency data visualization showing active versus filled roles in real-time.',
    tag: '[DELTA_MONITOR]',
    tagline: 'Real-time telemetry of hiring pipeline liquidity.',
    systemLog: 'Visualizing the delta between open demand and available candidate supply. Current liquidity levels are optimal. Predictive modeling suggests a 12% increase in applications for the next 48-hour cycle.',
    parameters: [
      { label: 'GLOBAL_DELTA', value: '0.04%' },
      { label: 'LIQUIDITY', value: 'OPTIMAL' },
      { label: 'PREDICTION_ACC', value: '94.2%' },
    ],
  },
]

export default function EmployerDiscovery() {
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
              [EMPLOYER_NODE_v2.4.1]
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
            agentic demand
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
            <Typewriter text="infrastructure command." speed={40} delay={300} />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-lg md:text-xl text-zinc-400 max-w-xl leading-relaxed"
          >
            <Typewriter
              text="orchestrating talent demand via high-frequency agent swarms and auto-shortlisting."
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
              Initialize Session
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
                  {/* Icon + tag */}
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
                  {/* Text */}
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-white mb-1.5 capitalize">{node.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.46)' }}>{node.description}</p>
                  </div>
                  {/* Footer */}
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
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-zinc-700" />
            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest" style={MONO}>Latency: 12ms</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-zinc-700" />
            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest" style={MONO}>Region: GLOBAL_1</span>
          </div>
        </motion.div>
      </div>
    </div>
    </PublicLayout>
  )
}
