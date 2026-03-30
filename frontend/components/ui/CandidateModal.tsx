'use client'

import React from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import {
  X, MapPin, Clock, ShieldCheck, FileCheck,
  CheckCircle2, Award, Phone, Mail,
  TrendingUp, Star, Calendar, Building2, Send,
  Bookmark, BookmarkCheck,
} from 'lucide-react'
import { toast } from '@/lib/toast'

interface CandidateModalProps {
  candidate: any
  extra: any
  score: number
  stage: string
  bookmarked: boolean
  onBookmark: () => void
  onClose: () => void
}

function scoreColor(s: number) {
  if (s >= 88) return { text: 'text-emerald-400', hex: '#34d399' }
  if (s >= 74) return { text: 'text-amber-400',   hex: '#f59e0b' }
  return            { text: 'text-zinc-400',     hex: '#71717a' }
}

function Divider() {
  return <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-xs font-medium uppercase tracking-widest mb-2.5"
      style={{ color: 'rgba(255,255,255,0.28)' }}>
      {children}
    </p>
  )
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      className="flex items-center justify-between px-5 py-3"
      style={!last ? { borderBottom: '1px solid rgba(255,255,255,0.06)' } : undefined}
    >
      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.46)' }}>{label}</span>
      <span className="text-sm font-medium text-white text-right ml-4">{value}</span>
    </div>
  )
}

function Header({ candidate, extra, bookmarked, onBookmark, onClose }: {
  candidate: any; extra: any; bookmarked: boolean
  onBookmark: () => void; onClose: () => void
}) {
  const initials = candidate.name
    ?.replace('Dr. ', '').split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="flex items-start gap-4 px-5 pt-5 pb-4 flex-shrink-0">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.8)' }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <h2 className="text-base font-semibold text-white leading-snug">{candidate.name}</h2>
        <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.42)' }}>
          {extra?.level} · {candidate.specialty}
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} strokeWidth={1.5} />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>{candidate.experience_years} yrs</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} strokeWidth={1.5} />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>{candidate.location}</span>
          </div>
          <span className="text-xs font-semibold text-emerald-400">{candidate.rate}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-0.5">
        <button
          onClick={onBookmark}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          {bookmarked
            ? <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
            : <Bookmark className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.5)' }} />
          }
        </button>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
          style={{ background: 'rgba(255,255,255,0.08)' }}
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.6)' }} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}

function ScoreRow({ score, stage }: { score: number; stage: string }) {
  const col = scoreColor(score)
  return (
    <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>
          {stage === 'ai' ? 'AI match score' : 'Node score'}
        </span>
        <span className={`text-xl font-bold ${col.text}`}>{score}%</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: col.hex }} />
      </div>
    </div>
  )
}

function Body({ candidate, extra, score, stage }: {
  candidate: any; extra: any; score: number; stage: string
}) {
  return (
    <div className="flex-1 overflow-y-auto overscroll-contain">
      <ScoreRow score={score} stage={stage} />

      {/* About */}
      {extra?.bio && (
        <>
          <div className="px-5 py-4">
            <SectionLabel>About</SectionLabel>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{extra.bio}</p>
          </div>
          <Divider />
        </>
      )}

      {/* Compliance */}
      <div className="px-5 py-4">
        <SectionLabel>Compliance</SectionLabel>
        <div className="space-y-0">
          {[
            { label: 'GMC registered', value: `#${extra?.gmc}`,   Icon: ShieldCheck,  ok: true },
            { label: 'DBS check',      value: extra?.dbs,          Icon: FileCheck,    ok: true },
            { label: 'Right to work',  value: extra?.rightToWork ? 'Verified' : 'Pending', Icon: CheckCircle2, ok: extra?.rightToWork },
            { label: 'Indemnity',      value: extra?.indemnity,    Icon: Award,        ok: true },
          ].map(({ label, value, Icon, ok }, i, arr) => (
            <div
              key={label}
              className="flex items-center gap-3 py-2.5"
              style={i < arr.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.06)' } : undefined}
            >
              <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${ok ? 'text-emerald-400' : 'text-amber-400'}`} strokeWidth={1.5} />
              <span className="text-sm flex-1" style={{ color: 'rgba(255,255,255,0.46)' }}>{label}</span>
              <span className="text-sm font-medium text-white">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* Skills */}
      {candidate.skills?.length > 0 && (
        <>
          <div className="px-5 py-4">
            <SectionLabel>Clinical skills</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.map((sk: string) => (
                <span
                  key={sk}
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }}
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>
          <Divider />
        </>
      )}

      {/* Stats */}
      <div className="px-5 py-4">
        <SectionLabel>Stats</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Placements', value: String(extra?.placements ?? 0), Icon: TrendingUp },
            { label: 'Rate',       value: candidate.rate,                  Icon: Star },
            { label: 'Available',  value: candidate.available ? 'Now' : 'Placed', Icon: Calendar },
          ].map(({ label, value, Icon }) => (
            <div
              key={label}
              className="rounded-2xl p-3 text-center"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <Icon className="w-3.5 h-3.5 mx-auto mb-1.5" style={{ color: 'rgba(255,255,255,0.38)' }} strokeWidth={1.5} />
              <p className="text-sm font-semibold text-white">{value}</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.32)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* Trusts */}
      {extra?.trusts?.length > 0 && (
        <>
          <div className="px-5 py-4">
            <SectionLabel>Known trusts</SectionLabel>
            <div className="space-y-2">
              {extra.trusts.map((t: string) => (
                <div key={t} className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.28)' }} strokeWidth={1.5} />
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
          <Divider />
        </>
      )}

      {/* Contact */}
      <div className="py-1">
        <Row label="Phone" value={extra?.phone ?? '—'} />
        <Row label="Email" value={extra?.email ?? '—'} last />
      </div>

      {/* Available dot */}
      <div className="flex items-center gap-2.5 px-5 py-3.5">
        <div className="relative flex items-center justify-center flex-shrink-0">
          <div className={`w-1.5 h-1.5 rounded-full ${candidate.available ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
          {candidate.available && (
            <div className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-50" />
          )}
        </div>
        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.38)' }}>
          {candidate.available ? 'Available now' : 'Currently placed'}
        </span>
      </div>
    </div>
  )
}

function Footer({ candidate, bookmarked, onBookmark, onClose }: {
  candidate: any; bookmarked: boolean; onBookmark: () => void; onClose: () => void
}) {
  return (
    <div
      className="flex-shrink-0 px-5 pt-3 space-y-2"
      style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))' }}
    >
      <button
        onClick={() => { toast.success(`Placement request sent for ${candidate.name}`); onClose() }}
        className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        style={{ background: 'rgba(255,255,255,0.12)' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.18)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)' }}
      >
        <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
        Place candidate
      </button>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => { toast.success(`${candidate.name} shortlisted`); if (!bookmarked) onBookmark() }}
          className="py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
          style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.65)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.11)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)' }}
        >
          <Star className="w-3 h-3" strokeWidth={1.5} /> Shortlist
        </button>
        <button
          onClick={() => toast.info(`Message sent to ${candidate.name}`)}
          className="py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
          style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.65)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.11)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)' }}
        >
          <Mail className="w-3 h-3" strokeWidth={1.5} /> Message
        </button>
      </div>
    </div>
  )
}

export function CandidateModal({ candidate, extra, score, stage, bookmarked, onBookmark, onClose }: CandidateModalProps) {
  if (!candidate) return null

  const inner = (
    <>
      <Header candidate={candidate} extra={extra} bookmarked={bookmarked} onBookmark={onBookmark} onClose={onClose} />
      <Divider />
      <Body candidate={candidate} extra={extra} score={score} stage={stage} />
      <Footer candidate={candidate} bookmarked={bookmarked} onBookmark={onBookmark} onClose={onClose} />
    </>
  )

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

      {/* Mobile: slide up */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 34, stiffness: 320, mass: 0.75 }}
        className="relative z-10 w-full flex flex-col sm:hidden rounded-t-3xl overflow-hidden"
        style={{ background: '#1c1c1e', maxHeight: '92dvh' }}
      >
        <div className="flex justify-center pt-2.5 pb-0.5 flex-shrink-0">
          <div className="w-9 h-[3px] rounded-full" style={{ background: 'rgba(255,255,255,0.16)' }} />
        </div>
        {inner}
      </motion.div>

      {/* Desktop: slide from right */}
      <motion.div
        initial={{ x: 32, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 32, opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 280, mass: 0.85 }}
        className="relative z-10 hidden sm:flex flex-col rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: '#1c1c1e', width: 420, maxHeight: 'calc(100dvh - 48px)', marginRight: 20 }}
      >
        {inner}
      </motion.div>
    </div>,
    document.body
  )
}
