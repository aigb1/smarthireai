'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Network, Database, Layers, TrendingUp, ShieldAlert, UserPlus,
  ArrowRight, ArrowUpRight,
} from 'lucide-react'
import { NodeModal, NodeData } from '@/components/ui/NodeModal'
import { Typewriter } from '@/components/ui/Typewriter'
import { PublicLayout } from '@/components/layout/PublicLayout'

const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }

const agentNodes: NodeData[] = [
  {
    id: 'orchestrator',
    title: 'pipeline intelligence',
    icon: Network,
    description: 'Real-time visibility into regional talent supply and demand flows.',
    tag: '[ORCHESTRATION_ACTIVE]',
    tagline: 'Real-time visibility into supply and demand flows.',
    systemLog: 'Your recruitment pipeline is now a live telemetry feed. The agent is tracking 450+ active candidates across the region, predicting when they will become available and automatically preparing re-engagement scripts to keep them within your agency node network.',
    parameters: [
      { label: 'SUPPLY_VELOCITY', value: 'HIGH' },
      { label: 'RETENTION_PREDICTION', value: '88%' },
      { label: 'MARKET_SHARE', value: '14.2%_REGIONAL' },
    ],
  },
  {
    id: 'ledger',
    title: 'settlement ledger',
    icon: Database,
    description: 'Automated margin tracking and instant agency fee settlement.',
    tag: '[LIQUIDITY_STABLE]',
    tagline: 'Automated margin tracking and instant settlement.',
    systemLog: 'All agency margins are calculated and locked at the point of placement. This module eliminates back-office reconciliation by streaming your commission directly to your corporate vault the moment a placement is confirmed.',
    parameters: [
      { label: 'FEE_SETTLEMENT', value: 'INSTANT' },
      { label: 'AUDIT_TRAIL', value: 'BLOCKCHAIN_VERIFIED' },
      { label: 'MARGIN_HEALTH', value: 'OPTIMAL' },
    ],
  },
  {
    id: 'audit',
    title: 'audit protocol',
    icon: Layers,
    description: 'Automated credential verification and node compliance auditing.',
    tag: '[AUDIT_COMPLETE]',
    tagline: 'High-frequency compliance auditing for agency nodes.',
    systemLog: 'Audit protocol is scanning the regional node network. 100% of active placements are currently verified against the latest compliance requirements. Automated re-credentialing triggered for 3 nodes.',
    parameters: [
      { label: 'AUDIT_VELOCITY', value: 'REAL_TIME' },
      { label: 'COMPLIANCE_RATE', value: '100%' },
      { label: 'RE_CRED_TRIGGERS', value: '3_NODES' },
    ],
  },
  {
    id: 'yield',
    title: 'network yield',
    icon: TrendingUp,
    description: 'Financial delta tracking — platform fee optimization and node ROI.',
    tag: '[YIELD_MONITOR]',
    tagline: 'Real-time margin optimization and yield tracking.',
    systemLog: 'Analyzing agency yield across all active contracts. The agent has identified a 2.4% margin optimization opportunity by re-routing demand signals to high-efficiency candidate nodes. Yield projection for Q2 updated.',
    parameters: [
      { label: 'MARGIN_DELTA', value: '+2.4%' },
      { label: 'YIELD_HEALTH', value: 'STRONG' },
      { label: 'ROI_PREDICTION', value: '112%' },
    ],
  },
  {
    id: 'risk',
    title: 'risk shield',
    icon: ShieldAlert,
    description: 'Automated auditing and risk mitigation protocol for multi-client operations.',
    tag: '[RISK_v1.5]',
    tagline: 'Autonomous risk mitigation and compliance telemetry.',
    systemLog: 'Risk shield is monitoring all active placements for compliance signals. No high-risk events detected. Compliance telemetry is being streamed to your agency indemnity provider in real-time.',
    parameters: [
      { label: 'RISK_SCORE', value: 'LOW' },
      { label: 'SAFETY_SIGNALS', value: 'NOMINAL' },
      { label: 'COMPLIANCE_SYNC', value: 'ACTIVE' },
    ],
  },
  {
    id: 'onboarding',
    title: 'sovereign onboarding',
    icon: UserPlus,
    description: 'Direct-to-node onboarding protocol, bypassing manual forms and admin.',
    tag: '[ONBOARD_PROTOCOL]',
    tagline: 'Zero-friction candidate onboarding via Sovereign ID.',
    systemLog: 'Onboarding protocol initialized. 5 new candidate nodes are currently syncing their credentials via the hardware enclave. Average onboarding time reduced to 4.2 minutes per node.',
    parameters: [
      { label: 'ONBOARD_VELOCITY', value: '4.2m' },
      { label: 'SYNC_STATUS', value: 'ACTIVE' },
      { label: 'NODE_HEALTH', value: 'OPTIMAL' },
    ],
  },
]

export default function RecruiterDiscovery() {
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
              [RECRUITER_NODE_v2.4.1]
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
            network intelligence
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
            <Typewriter text="orchestrator suite." speed={40} delay={300} />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-lg md:text-xl text-zinc-400 max-w-xl leading-relaxed"
          >
            <Typewriter
              text="orchestrating talent supply/demand delta via high-frequency agent swarms."
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
            'Global Delta: 0.04%',
            'Active Swarms: 842',
            'Node: RECRUITER_ALPHA',
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
