'use client'

import React from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

export interface NodeParameter {
  label: string
  value: string
}

export interface NodeData {
  id: string
  title: string
  tagline: string
  description: string
  tag: string
  systemLog: string
  parameters: NodeParameter[]
  icon: React.ElementType
}

interface NodeModalProps {
  node: NodeData
  onClose: () => void
}

function fmtLabel(raw: string) {
  return raw.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

function fmtValue(raw: string) {
  return raw.replace(/_/g, ' ')
}

/* ─── Sub-components ─────────────────────────────────────────────── */

function Divider() {
  return <div className="mx-0 flex-shrink-0" style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />
}

function Header({ node, onClose }: { node: NodeData; onClose: () => void }) {
  return (
    <div className="flex items-start gap-4 px-5 pt-5 pb-4 flex-shrink-0">
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.09)' }}
      >
        <node.icon className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.72)' }} strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <h2 className="text-base font-semibold text-white leading-snug capitalize">{node.title}</h2>
        <p className="text-sm mt-0.5 leading-snug" style={{ color: 'rgba(255,255,255,0.42)' }}>
          {node.tagline}
        </p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 transition-opacity hover:opacity-70"
        style={{ background: 'rgba(255,255,255,0.1)' }}
        aria-label="Close"
      >
        <X className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.7)' }} strokeWidth={2.5} />
      </button>
    </div>
  )
}

function ParameterRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      className="flex items-center justify-between px-5 py-3"
      style={!last ? { borderBottom: '1px solid rgba(255,255,255,0.06)' } : undefined}
    >
      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.46)' }}>{fmtLabel(label)}</span>
      <span className="text-sm font-medium text-white ml-6 text-right">{fmtValue(value)}</span>
    </div>
  )
}

function Body({ node }: { node: NodeData }) {
  return (
    <div className="flex-1 overflow-y-auto overscroll-contain">
      {/* Parameters */}
      <div className="py-1">
        {node.parameters?.map((p, i) => (
          <ParameterRow
            key={i}
            label={p.label}
            value={p.value}
            last={i === node.parameters.length - 1}
          />
        ))}
      </div>

      <Divider />

      {/* About */}
      <div className="px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.28)' }}>
          About
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {node.systemLog}
        </p>
      </div>

      <Divider />

      {/* Live status pill */}
      <div className="flex items-center gap-2.5 px-5 py-3.5">
        <div className="relative flex items-center justify-center flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <div className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-50" />
        </div>
        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.38)' }}>Live · Active</span>
        <span
          className="ml-auto text-[11px] px-2.5 py-0.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }}
        >
          {node.tag.replace(/[\[\]]/g, '')}
        </span>
      </div>
    </div>
  )
}

function Footer({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="flex-shrink-0 px-5 pt-3"
      style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))' }}
    >
      <button
        onClick={onClose}
        className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white transition-all active:scale-[0.98]"
        style={{ background: 'rgba(255,255,255,0.11)' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.17)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.11)' }}
      >
        Initialize Node Session
      </button>
    </div>
  )
}

/* ─── Main export ────────────────────────────────────────────────── */

export function NodeModal({ node, onClose }: NodeModalProps) {
  if (!node) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center sm:justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
      />

      {/* Mobile — slides up */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 34, stiffness: 320, mass: 0.75 }}
        className="relative z-10 w-full flex flex-col sm:hidden rounded-t-3xl overflow-hidden"
        style={{ background: '#1c1c1e', maxHeight: '91dvh' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2.5 pb-0.5 flex-shrink-0">
          <div className="w-9 h-[3px] rounded-full" style={{ background: 'rgba(255,255,255,0.16)' }} />
        </div>
        <Header node={node} onClose={onClose} />
        <Divider />
        <Body node={node} />
        <Footer onClose={onClose} />
      </motion.div>

      {/* Desktop — slides from right */}
      <motion.div
        initial={{ x: 32, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 32, opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 280, mass: 0.85 }}
        className="relative z-10 hidden sm:flex flex-col rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: '#1c1c1e',
          width: 420,
          maxHeight: 'calc(100dvh - 48px)',
          marginRight: 20,
        }}
      >
        <Header node={node} onClose={onClose} />
        <Divider />
        <Body node={node} />
        <Footer onClose={onClose} />
      </motion.div>
    </div>,
    document.body
  )
}
