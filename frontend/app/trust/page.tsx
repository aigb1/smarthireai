'use client'

import { motion } from 'framer-motion'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { ShieldCheck, Lock, Eye, FileCheck, Cpu, Globe, CheckCircle2 } from 'lucide-react'

const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }

const pillars = [
  {
    icon: Lock,
    title: 'end-to-end encryption',
    desc: 'All data transmitted between nodes is encrypted using AES-256-GCM with perfect forward secrecy. No plaintext ever leaves your device.',
    tag: 'CRYPTO_v4.2',
    color: 'text-blue-400',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
  },
  {
    icon: FileCheck,
    title: 'credential verification',
    desc: 'Every clinician credential — GMC registration, DBS, indemnity — is verified against live regulatory databases before being added to the mesh.',
    tag: 'VERIFY_v3.1',
    color: 'text-emerald-400',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
  },
  {
    icon: Eye,
    title: 'zero-knowledge privacy',
    desc: 'Employers never see personal data until a match is confirmed. Candidate identity is cryptographically masked during the discovery phase.',
    tag: 'PRIVACY_v2.8',
    color: 'text-purple-400',
    border: 'border-purple-500/20',
    bg: 'bg-purple-500/5',
  },
  {
    icon: Cpu,
    title: 'AI audit trail',
    desc: 'Every AI-assisted decision is logged with full explainability. Hiring decisions are auditable, transparent, and compliant with NHS and CQC standards.',
    tag: 'AUDIT_v1.9',
    color: 'text-amber-400',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/5',
  },
  {
    icon: Globe,
    title: 'GDPR & CQC compliance',
    desc: 'The protocol is designed to be compliant with UK GDPR, Care Quality Commission guidelines, and NHS Digital Data Security standards from the ground up.',
    tag: 'COMPLY_v5.0',
    color: 'text-rose-400',
    border: 'border-rose-500/20',
    bg: 'bg-rose-500/5',
  },
  {
    icon: ShieldCheck,
    title: 'sovereign data ownership',
    desc: 'Your data belongs to you. Delete your node at any time and all associated data is cryptographically erased from the mesh within 72 hours.',
    tag: 'SOVEREIGN_v2.4',
    color: 'text-cyan-400',
    border: 'border-cyan-500/20',
    bg: 'bg-cyan-500/5',
  },
]

const certifications = [
  { name: 'ISO 27001', status: 'certified', desc: 'Information security management' },
  { name: 'Cyber Essentials+', status: 'certified', desc: 'UK government backed scheme' },
  { name: 'NHS DSP Toolkit', status: 'compliant', desc: 'Data Security & Protection' },
  { name: 'CQC Standards', status: 'aligned', desc: 'Care Quality Commission' },
  { name: 'UK GDPR', status: 'compliant', desc: 'Data protection regulation' },
  { name: 'SOC 2 Type II', status: 'in progress', desc: 'Security & availability' },
]

const STATUS_COLOR: Record<string, string> = {
  'certified':    'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  'compliant':    'text-blue-400 border-blue-500/30 bg-blue-500/10',
  'aligned':      'text-amber-400 border-amber-500/30 bg-amber-500/10',
  'in progress':  'text-zinc-400 border-zinc-600 bg-zinc-700/20',
}

export default function TrustPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen relative transition-colors duration-300" style={{ background: 'var(--mn-bg)' }}>
        {/* Grid background */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.08] z-0 mn-grid-bg" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-3 md:pt-20 pb-16 space-y-12">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-zinc-900 border border-zinc-800">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.25em]" style={MONO}>
                trust_protocol // sovereign_mesh
              </span>
            </div>
            <h1 className="text-[clamp(2rem,6vw,4rem)] font-bold tracking-tighter text-white leading-[0.9] lowercase">
              trust protocol.
            </h1>
            <p className="text-zinc-500 text-sm max-w-2xl leading-relaxed">
              mednode.cloud operates on a zero-compromise security architecture. every interaction — credential, payment, identity — is protected by sovereign cryptographic protocols.
            </p>
          </motion.div>

          {/* Security pillars */}
          <div>
            <p className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-600 mb-5" style={MONO}>
              security pillars
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pillars.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`p-5 rounded-2xl border ${p.border} ${p.bg}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <p.icon className={`w-5 h-5 ${p.color}`} strokeWidth={1.5} />
                    <span className="text-[9px] font-mono text-zinc-600 border border-zinc-800 px-1.5 py-0.5 rounded" style={MONO}>
                      {p.tag}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-2">{p.title}</h3>
                  <p className="text-zinc-500 text-xs leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div>
            <p className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-600 mb-5" style={MONO}>
              certifications &amp; compliance
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {certifications.map((cert, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all"
                >
                  <CheckCircle2 className="w-5 h-5 text-zinc-600 flex-shrink-0" strokeWidth={1.5} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold">{cert.name}</p>
                    <p className="text-zinc-600 text-[10px] font-mono truncate" style={MONO}>{cert.desc}</p>
                  </div>
                  <span className={`flex-shrink-0 text-[9px] font-mono border px-2 py-0.5 rounded-full uppercase tracking-wide ${STATUS_COLOR[cert.status]}`} style={MONO}>
                    {cert.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" strokeWidth={1.5} />
            <h2 className="text-white text-lg font-semibold">sovereign by design</h2>
            <p className="text-zinc-500 text-sm max-w-md mx-auto">
              security is not a feature — it is the foundation. every node in the protocol is audited, verified, and encrypted.
            </p>
            <p className="text-zinc-700 text-[10px] font-mono tracking-[0.2em] uppercase pt-2" style={MONO}>
              contact: security@thenode.protocol
            </p>
          </div>

        </div>
      </div>
    </PublicLayout>
  )
}
