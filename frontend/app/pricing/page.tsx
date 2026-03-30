'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { CreditCard, CheckCircle2, Zap, Building2, Users, Stethoscope, ArrowUpRight } from 'lucide-react'

const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }

const tiers = [
  {
    role: 'clinician',
    icon: Stethoscope,
    title: 'Clinician node',
    tag: 'FREE FOREVER',
    price: '£0',
    period: 'always',
    color: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/5',
    cta: 'connect free',
    ctaStyle: 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950',
    features: [
      'Verified clinician profile',
      'AI-matched job shifts',
      'Smart schedule management',
      'Integrated e-wallet & payroll',
      'Document vault (DBS, GMC, indemnity)',
      'Real-time shift notifications',
      'NHS Pension Form A/B — AI auto-fill',
      'Member digital signature & submission',
      'Zero placement fees ever',
    ],
  },
  {
    role: 'employer',
    icon: Building2,
    title: 'Employer node',
    tag: 'MOST POPULAR',
    price: '£299',
    period: 'per month',
    color: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/5',
    cta: 'start free trial',
    ctaStyle: 'bg-white hover:bg-zinc-100 text-zinc-950',
    features: [
      'Unlimited shift postings',
      'Unlimited team members',
      'AI candidate screening & ranking',
      'Compliance rota management',
      'Ward analytics dashboard',
      'Automated DBS & GMC verification',
      'Bid ledger & settlement tracking',
      'NHS Pension Form A — AI auto-fill & employer sign',
      '14-day free trial included',
    ],
  },
  {
    role: 'recruiter',
    icon: Users,
    title: 'Recruiter node',
    tag: 'ENTERPRISE',
    price: '£799',
    period: 'per month',
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/5',
    cta: 'book demo',
    ctaStyle: 'bg-purple-500 hover:bg-purple-400 text-white',
    features: [
      'Full talent pool access (12k+ nodes)',
      'Unlimited team members',
      'Network velocity dashboard',
      'Critical gap intelligence',
      'Candidate bookmark & shortlist',
      'Settlement ledger & commission tracking',
      'AI-powered candidate matching',
      'Dedicated protocol manager',
    ],
  },
]

const addons = [
  { name: 'AI screening suite', price: '£149/mo', desc: 'Advanced ML ranking & shortlisting' },
  { name: 'Enhanced verification', price: '£99/mo', desc: 'Live GMC, DBS, indemnity checks' },
  { name: 'Analytics pro', price: '£79/mo', desc: 'Deep workforce analytics & reporting' },
  { name: 'API access', price: '£249/mo', desc: 'Full REST API with webhook support' },
]

export default function PricingPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen relative transition-colors duration-300" style={{ background: 'var(--mn-bg)' }}>
        {/* Grid background */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.08] z-0 mn-grid-bg" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-3 md:pt-20 pb-16 space-y-14">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-zinc-900 border border-zinc-800">
              <CreditCard className="w-3 h-3 text-zinc-400" />
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.25em]" style={MONO}>
                fee_structure // protocol_v2.4
              </span>
            </div>
            <h1 className="text-[clamp(2rem,6vw,4rem)] font-bold tracking-tighter text-white leading-[0.9] lowercase">
              fee structure.
            </h1>
            <p className="text-zinc-500 text-sm max-w-xl mx-auto leading-relaxed">
              transparent, sovereign pricing. no hidden fees, no recruitment commissions, no surprises.
            </p>
          </motion.div>

          {/* Pricing tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.role}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex flex-col p-6 rounded-2xl border ${tier.border} ${tier.bg}`}
              >
                {/* Icon + tag */}
                <div className="flex items-start justify-between mb-5">
                  <tier.icon className={`w-6 h-6 ${tier.color}`} strokeWidth={1.5} />
                  <span className={`text-[9px] font-mono border px-2 py-0.5 rounded-full uppercase tracking-wider ${tier.color} border-current opacity-60`} style={MONO}>
                    {tier.tag}
                  </span>
                </div>

                {/* Title & price */}
                <h2 className="text-white text-base font-semibold mb-1 lowercase">{tier.title}</h2>
                <div className="mb-5">
                  <span className="text-white text-4xl font-bold tracking-tight" style={MONO}>{tier.price}</span>
                  <span className="text-zinc-600 text-sm ml-1.5" style={MONO}>/{tier.period}</span>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 flex-1 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${tier.color}`} strokeWidth={2} />
                      <span className="text-zinc-400 text-xs leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href="/login">
                  <div className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all ${tier.ctaStyle}`}>
                    {tier.cta}
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Add-ons */}
          <div>
            <p className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-600 mb-5" style={MONO}>
              optional add-ons
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {addons.map((addon, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.07 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-white text-sm font-medium">{addon.name}</p>
                    <span className="text-zinc-300 text-sm font-semibold flex-shrink-0 ml-2" style={MONO}>{addon.price}</span>
                  </div>
                  <p className="text-zinc-600 text-xs">{addon.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* FAQ strip */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8">
            <p className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-600 mb-6" style={MONO}>common questions</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { q: 'Are there placement commissions?', a: 'No. The protocol charges a flat monthly fee. There are zero placement commissions or success fees taken from either employer or clinician.' },
                { q: 'Can clinicians really use this for free?', a: 'Yes, forever. Clinicians connect, verify, and find shifts at zero cost. The platform is funded by employer and recruiter subscriptions.' },
                { q: 'What happens after my trial ends?', a: 'You will be prompted to choose a plan. If you do not upgrade, your node is paused — all your data is retained for 30 days.' },
                { q: 'Is there a contract lock-in?', a: 'No. All plans are monthly and cancellable at any time. Enterprise plans have optional annual pricing with a 20% discount.' },
              ].map(({ q, a }, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" strokeWidth={1.5} />
                    <p className="text-white text-sm font-medium">{q}</p>
                  </div>
                  <p className="text-zinc-500 text-xs leading-relaxed pl-5">{a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </PublicLayout>
  )
}
