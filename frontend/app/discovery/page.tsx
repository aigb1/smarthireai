'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { MapPin, Activity, Zap, Globe, Users, Briefcase } from 'lucide-react'

const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }

const TYPE_COLOR: Record<string, string> = {
  employer:  'text-blue-400 border-blue-500/40 bg-blue-500/10',
  clinician: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  recruiter: 'text-purple-400 border-purple-500/40 bg-purple-500/10',
}

const STAT_ICON: Record<string, React.FC<any>> = {
  employer:  Briefcase,
  clinician: Users,
  recruiter: Zap,
}

const EVENT_TEMPLATES = [
  { msg: 'new employer node connected',        type: 'employer' },
  { msg: 'clinician verified + matched',       type: 'clinician' },
  { msg: 'placement settled',                  type: 'clinician' },
  { msg: 'new bid posted',                     type: 'employer' },
  { msg: 'recruiter swarm initialized',        type: 'recruiter' },
  { msg: 'credential passport verified',       type: 'clinician' },
  { msg: 'shift filled — 4h coverage',         type: 'employer' },
  { msg: 'GMC credential synced',              type: 'clinician' },
  { msg: 'agency node handshake complete',     type: 'recruiter' },
  { msg: 'ICU locum bid accepted',             type: 'employer' },
  { msg: 'NMC re-validation triggered',        type: 'clinician' },
  { msg: 'settlement payment streamed',        type: 'recruiter' },
  { msg: 'A&E shift — urgent coverage posted', type: 'employer' },
  { msg: 'candidate shortlisted × 3',          type: 'recruiter' },
  { msg: 'node health check passed',           type: 'clinician' },
]

const CITIES = ['london', 'manchester', 'edinburgh', 'birmingham', 'leeds', 'bristol', 'liverpool', 'cardiff']

interface NodeRegion {
  city: string
  nodes: number
  type: 'employer' | 'clinician' | 'recruiter'
  lat: number
  lng: number
  active: boolean
}

interface FeedEvent {
  id: string
  msg: string
  loc: string
  ts: number
  type: string
}

const BASE_NODES: NodeRegion[] = [
  { city: 'London',     nodes: 312, type: 'employer',  lat: 51.5, lng: -0.1, active: true  },
  { city: 'Manchester', nodes: 148, type: 'clinician', lat: 53.5, lng: -2.2, active: true  },
  { city: 'Edinburgh',  nodes: 94,  type: 'recruiter', lat: 55.9, lng: -3.2, active: true  },
  { city: 'Birmingham', nodes: 201, type: 'employer',  lat: 52.5, lng: -1.9, active: true  },
  { city: 'Leeds',      nodes: 117, type: 'clinician', lat: 53.8, lng: -1.5, active: false },
  { city: 'Bristol',    nodes: 89,  type: 'recruiter', lat: 51.5, lng: -2.6, active: true  },
  { city: 'Liverpool',  nodes: 76,  type: 'clinician', lat: 53.4, lng: -3.0, active: true  },
  { city: 'Cardiff',    nodes: 54,  type: 'employer',  lat: 51.5, lng: -3.2, active: false },
]

function elapsed(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export default function DiscoveryPage() {
  const [nodes, setNodes] = useState<NodeRegion[]>(BASE_NODES)
  const [feed, setFeed] = useState<FeedEvent[]>([
    { id: '0', msg: 'new employer node connected',  loc: 'london',     ts: Date.now() - 12000, type: 'employer' },
    { id: '1', msg: 'clinician verified + matched', loc: 'manchester', ts: Date.now() - 34000, type: 'clinician' },
    { id: '2', msg: 'placement settled',            loc: 'edinburgh',  ts: Date.now() - 61000, type: 'clinician' },
    { id: '3', msg: 'new bid posted',               loc: 'birmingham', ts: Date.now() - 122000, type: 'employer' },
  ])
  const [, setTick] = useState(0)          // forces re-render for elapsed time
  const [pulseIdx, setPulseIdx] = useState(0)
  const [uptime, setUptime] = useState(99.9)
  const [telemetry, setTelemetry] = useState({ latency: 12, swarms: 842, connPerSec: 165 })
  const eventIdRef = useRef(10)

  // Tick every second to refresh timestamps
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  // New feed event every 4–8 seconds
  useEffect(() => {
    const schedule = () => {
      const delay = randInt(4000, 8000)
      return setTimeout(() => {
        const tpl = EVENT_TEMPLATES[randInt(0, EVENT_TEMPLATES.length - 1)]
        const city = CITIES[randInt(0, CITIES.length - 1)]
        const id = String(++eventIdRef.current)
        setFeed(prev => [
          { id, msg: tpl.msg, loc: city, ts: Date.now(), type: tpl.type },
          ...prev.slice(0, 6),
        ])
        timer = schedule()
      }, delay)
    }
    let timer = schedule()
    return () => clearTimeout(timer)
  }, [])

  // Fluctuate node counts every 5 seconds
  useEffect(() => {
    const t = setInterval(() => {
      setNodes(prev => prev.map(n => ({
        ...n,
        nodes: Math.max(40, n.nodes + randInt(-3, 4)),
        active: Math.random() > 0.12 ? n.active : !n.active,
      })))
    }, 5000)
    return () => clearInterval(t)
  }, [])

  // Cycle the pulsing map dot
  useEffect(() => {
    const t = setInterval(() => setPulseIdx(i => (i + 1) % BASE_NODES.length), 2000)
    return () => clearInterval(t)
  }, [])

  // Uptime micro-jitter
  useEffect(() => {
    const t = setInterval(() => {
      setUptime(+(99.85 + Math.random() * 0.14).toFixed(2))
    }, 7000)
    return () => clearInterval(t)
  }, [])

  // Telemetry bar fluctuation
  useEffect(() => {
    const t = setInterval(() => {
      setTelemetry({
        latency: randInt(8, 18),
        swarms: randInt(820, 860),
        connPerSec: randInt(140, 190),
      })
    }, 3000)
    return () => clearInterval(t)
  }, [])

  const totalNodes  = nodes.reduce((a, n) => a + n.nodes, 0)
  const activeNodes = nodes.filter(n => n.active).reduce((a, n) => a + n.nodes, 0)

  const DOT_TYPE_COLOR: Record<string, string> = {
    employer:  '#60a5fa',
    clinician: '#34d399',
    recruiter: '#a78bfa',
  }

  return (
    <PublicLayout>
      <div className="min-h-screen relative transition-colors duration-300" style={{ background: 'var(--mn-bg)' }}>
        {/* Grid background */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.08] z-0 mn-grid-bg" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-3 md:pt-20 pb-16 space-y-10">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-zinc-900 border border-zinc-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.25em]" style={MONO}>
                live_map // node_protocol_active
              </span>
            </div>
            <h1 className="text-[clamp(2rem,6vw,4rem)] font-bold tracking-tighter text-white leading-[0.9] lowercase">
              live node map.
            </h1>
            <p className="text-zinc-500 text-sm max-w-xl">
              real-time view of all active employer, recruiter, and clinician nodes on the mesh network.
            </p>
          </motion.div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'total nodes',  value: totalNodes.toLocaleString(),  icon: Globe,     accent: 'text-white' },
              { label: 'active now',   value: activeNodes.toLocaleString(), icon: Activity,  accent: 'text-emerald-400' },
              { label: 'regions',      value: nodes.length.toString(),      icon: MapPin,    accent: 'text-white' },
              { label: 'uptime',       value: `${uptime}%`,                 icon: Zap,       accent: 'text-emerald-400' },
            ].map(({ label, value, icon: Icon, accent }) => (
              <motion.div
                key={label}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
                animate={{ borderColor: label === 'active now' ? ['#27272a', '#10b98140', '#27272a'] : '#27272a' }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-3.5 h-3.5 text-zinc-600" strokeWidth={1.5} />
                  <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-600" style={MONO}>{label}</p>
                </div>
                <motion.p
                  key={value}
                  initial={{ opacity: 0.4, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-2xl font-semibold tracking-tight ${accent}`}
                  style={MONO}
                >
                  {value}
                </motion.p>
              </motion.div>
            ))}
          </div>

          {/* Map + feed + node list */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Map area */}
            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 min-h-[420px] relative overflow-hidden">

              {/* Animated UK map */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <svg viewBox="0 0 400 500" className="w-full h-full max-w-sm">
                  <path
                    d="M200 50 L220 80 L240 120 L250 180 L260 240 L240 300 L220 360 L200 420 L180 360 L160 300 L140 240 L150 180 L160 120 L180 80 Z"
                    fill="none" stroke="#27272a" strokeWidth="1"
                  />
                  {nodes.map((node, i) => {
                    const x = 200 + (node.lng + 3) * 30
                    const y = 450 - (node.lat - 50) * 35
                    const color = node.active ? DOT_TYPE_COLOR[node.type] : '#3f3f46'
                    const isPulsing = i === pulseIdx && node.active
                    return (
                      <g key={i}>
                        {isPulsing && (
                          <circle cx={x} cy={y} r="16" fill={color} opacity="0.15">
                            <animate attributeName="r" values="8;22;8" dur="2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.2;0;0.2" dur="2s" repeatCount="indefinite" />
                          </circle>
                        )}
                        <circle cx={x} cy={y} r="10" fill={color} opacity="0.12" />
                        <circle cx={x} cy={y} r="4" fill={color} opacity={node.active ? 0.9 : 0.35} />
                        {node.active && (
                          <circle cx={x} cy={y} r="4" fill={color} opacity="0.5">
                            <animate attributeName="r" values="4;9;4" dur="3s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
                          </circle>
                        )}
                      </g>
                    )
                  })}
                </svg>
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-600" style={MONO}>
                    uk / ireland mesh — live
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    <span className="text-[9px] text-emerald-600 font-mono uppercase tracking-widest" style={MONO}>live</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  {[
                    { color: 'bg-emerald-400', label: 'active node' },
                    { color: 'bg-zinc-600',    label: 'dormant node' },
                    { color: 'bg-blue-400',    label: 'employer' },
                    { color: 'bg-purple-400',  label: 'recruiter' },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${color}`} />
                      <span className="text-zinc-600 text-[10px] font-mono" style={MONO}>{label}</span>
                    </div>
                  ))}
                </div>

                {/* Live activity feed */}
                <div className="mt-6 space-y-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px flex-1 bg-zinc-800" />
                    <span className="text-zinc-700 text-[10px] font-mono" style={MONO}>live activity feed</span>
                    <div className="h-px flex-1 bg-zinc-800" />
                  </div>
                  <AnimatePresence initial={false} mode="popLayout">
                    {feed.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: -12, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-3 py-2 border-b border-zinc-800/50"
                      >
                        <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                          item.type === 'employer' ? 'bg-blue-400' :
                          item.type === 'recruiter' ? 'bg-purple-400' : 'bg-emerald-500'
                        }`} />
                        <span className="text-zinc-400 text-xs flex-1">{item.msg}</span>
                        <span className="text-zinc-600 text-[10px] font-mono flex-shrink-0" style={MONO}>{item.loc}</span>
                        <span className="text-zinc-700 text-[10px] font-mono flex-shrink-0 min-w-[50px] text-right" style={MONO}>
                          {elapsed(item.ts)}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Active regions list */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-2 overflow-y-auto max-h-[520px]">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-600" style={MONO}>
                  active regions
                </p>
                <span className="text-[9px] text-emerald-600 font-mono uppercase tracking-widest" style={MONO}>
                  {nodes.filter(n => n.active).length} online
                </span>
              </div>
              <AnimatePresence>
                {nodes.map((node, i) => {
                  const Icon = STAT_ICON[node.type] || Globe
                  return (
                    <motion.div
                      key={node.city}
                      layout
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 p-3 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all cursor-default"
                    >
                      <div className="relative flex-shrink-0">
                        <Icon className="w-4 h-4 text-zinc-500" strokeWidth={1.5} />
                        {node.active ? (
                          <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500">
                          </span>
                        ) : (
                          <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-zinc-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium leading-tight">{node.city}</p>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-mono border ${TYPE_COLOR[node.type]}`} style={MONO}>
                          {node.type}
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <motion.p
                          key={node.nodes}
                          initial={{ color: '#10b981' }}
                          animate={{ color: '#ffffff' }}
                          transition={{ duration: 1.5 }}
                          className="text-sm font-semibold"
                          style={MONO}
                        >
                          {node.nodes}
                        </motion.p>
                        <p className="text-zinc-600 text-[9px] font-mono" style={MONO}>nodes</p>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              {/* Protocol status footer */}
              <div className="pt-3 mt-2 border-t border-zinc-800 space-y-1.5">
                {[
                  { label: 'mesh latency',   value: `${telemetry.latency}ms` },
                  { label: 'data region',    value: 'EU-WEST-2' },
                  { label: 'protocol ver',   value: 'v2.4.1' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest" style={MONO}>{label}</span>
                    <span className="text-[9px] text-zinc-500 font-mono" style={MONO}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom telemetry bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-wrap items-center gap-6 border-t border-zinc-900 pt-6"
          >
            {[
              { label: 'global delta',   value: '0.04%' },
              { label: 'active swarms',  value: `${telemetry.swarms}` },
              { label: 'connections/s',  value: `${telemetry.connPerSec}` },
              { label: 'node: MESH_ALPHA', value: '' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-zinc-700" />
                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest" style={MONO}>
                  {label}{value ? `: ${value}` : ''}
                </span>
              </div>
            ))}
          </motion.div>

        </div>
      </div>
    </PublicLayout>
  )
}
