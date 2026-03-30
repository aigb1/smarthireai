'use client'

import { useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PublicLayout } from '@/components/layout/PublicLayout'

const MONO: React.CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
}

const BG = '#212121'

const panels = [
  {
    id: 'clinician',
    href: '/discover/clinician',
    image: '/hero-clinician.jpg',
    imgPosition: 'center 12%',
    role: 'Clinical Physician',
    node: 'Clinician Node',
    statusColor: '#4ade80',
    statusLabel: 'ON-SHIFT',
    telemetry: [
      { k: 'GMC',        v: '1234SS7'      },
      { k: 'Specialty',  v: 'Anaesthetics' },
      { k: 'Location',   v: "St Mary's"    },
      { k: 'Shift',      v: 'Active'       },
      { k: 'Compliance', v: '97.2%'        },
      { k: 'Surge',      v: 'Low'          },
    ],
  },
  {
    id: 'employer',
    href: '/discover/employer',
    image: '/hero-employer.jpg',
    imgPosition: 'center 10%',
    role: 'Hospital Administrator',
    node: 'Employer Node',
    statusColor: '#60a5fa',
    statusLabel: 'VERIFIED',
    telemetry: [
      { k: 'Trust',      v: 'NHS Barts Health' },
      { k: 'Posts',      v: '28 Active'        },
      { k: 'Fill Rate',  v: '91.4%'            },
      { k: 'SLA',        v: 'On Track'         },
      { k: 'Budget',     v: '76.3% used'       },
      { k: 'Compliance', v: 'Verified'         },
    ],
  },
  {
    id: 'recruiter',
    href: '/discover/recruiter',
    image: '/hero-recruiter.jpg',
    imgPosition: 'center 15%',
    role: 'Recruitment Agent',
    node: 'Recruiter Node',
    statusColor: '#c084fc',
    statusLabel: 'OPTIMISED',
    telemetry: [
      { k: 'Candidates', v: '2,184'    },
      { k: 'Placed MTD', v: '47'       },
      { k: 'Pipeline',   v: 'Active'   },
      { k: 'Commission', v: '2.85%'    },
      { k: 'Uptime',     v: '99.998%'  },
      { k: 'Handshake',  v: '3m ago'   },
    ],
  },
]

/* ── Shared panel internals ── */
function PanelContent({ p, mobile = false }: { p: typeof panels[number]; mobile?: boolean }) {
  return (
    <>
      {/* Image */}
      <Image
        src={p.image}
        alt={p.node}
        fill
        priority
        sizes={mobile ? '100vw' : '33vw'}
        style={{ objectFit: 'cover', objectPosition: p.imgPosition }}
        className={mobile ? '' : 'group-hover:scale-[1.025] transition-transform duration-700 ease-out'}
      />

      {/* Top gradient — keeps status tag readable */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none z-10"
        style={{ height: '28%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 100%)' }}
      />

      {/* Bottom gradient — taller on mobile to cover nav clearance */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none z-10"
        style={{
          height: mobile ? '70%' : '52%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.65) 50%, transparent 100%)',
        }}
      />

      {/* ── TOP-LEFT: status indicator ── */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5">
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: p.statusColor }}
        />
        <span className="text-[9px] tracking-[0.18em] font-medium" style={{ ...MONO, color: p.statusColor }}>
          {p.statusLabel}
        </span>
      </div>

      {/* ── BOTTOM: role + telemetry block ── */}
      {/* Mobile: lifted above footer nav (60px) + dots (28px) + safe area */}
      {/* Desktop: sits at the very bottom with standard padding */}
      <div
        className="absolute inset-x-0 z-20 px-4 pt-3"
        style={
          mobile
            ? { bottom: 'calc(env(safe-area-inset-bottom, 0px) + 90px)', paddingBottom: '12px' }
            : { bottom: 0, paddingBottom: '20px' }
        }
      >
        {/* Role identifier */}
        <p className="text-[8px] uppercase tracking-[0.22em] mb-1" style={{ ...MONO, color: 'rgba(255,255,255,0.42)' }}>
          {p.role}
        </p>

        {/* Node name */}
        <p className="font-semibold text-white mb-3 tracking-tight" style={{ fontSize: mobile ? '1rem' : '1.05rem' }}>
          {p.node}
        </p>

        {/* Telemetry grid: 2 columns, compact row height */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {p.telemetry.map((t) => (
            <div key={t.k} className="flex items-baseline gap-1.5 min-w-0">
              <span
                className="text-[7px] uppercase tracking-wider flex-shrink-0"
                style={{ ...MONO, color: 'rgba(255,255,255,0.35)' }}
              >
                {t.k}
              </span>
              <span
                className="text-[8px] font-medium truncate"
                style={{ ...MONO, color: p.statusColor }}
              >
                {t.v}
              </span>
            </div>
          ))}
        </div>

        {/* Thin accent line */}
        <div
          className="mt-2.5 h-px rounded-full opacity-30"
          style={{ background: p.statusColor }}
        />
      </div>
    </>
  )
}

export default function ProtocolHome() {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)

  const onScroll = useCallback(() => {
    const el = sliderRef.current
    if (!el) return
    setActiveIdx(Math.round(el.scrollLeft / el.clientWidth))
  }, [])

  const scrollTo = (idx: number) => {
    sliderRef.current?.scrollTo({ left: idx * (sliderRef.current.clientWidth), behavior: 'smooth' })
  }

  return (
    <PublicLayout>
      <div className="h-screen overflow-hidden" style={{ background: BG }}>

        {/* ── Desktop: 3 equal columns, full height ── */}
        <div className="hidden md:grid grid-cols-3 h-full gap-0.5" style={{ background: BG }}>
          {panels.map((p) => (
            <Link
              key={p.id}
              href={p.href}
              className="group relative block overflow-hidden"
              style={{ background: '#1a1a1a' }}
            >
              <PanelContent p={p} />
            </Link>
          ))}
        </div>

        {/* ── Mobile: full-viewport horizontal snap slider ── */}
        <div className="relative md:hidden h-full">
          <div
            ref={sliderRef}
            onScroll={onScroll}
            className="snap-slider flex h-full overflow-x-auto"
            style={{
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {panels.map((p) => (
              <div
                key={p.id}
                className="flex-none w-full h-full relative overflow-hidden"
                style={{ scrollSnapAlign: 'start', background: '#1a1a1a' }}
              >
                <Link href={p.href} className="block w-full h-full relative">
                  <PanelContent p={p} mobile />
                </Link>
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          <div
            className="absolute left-0 right-0 flex justify-center gap-2 z-30 pointer-events-none"
            style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)' }}
          >
            {panels.map((p, i) => (
              <button
                key={p.id}
                onClick={() => scrollTo(i)}
                aria-label={`Go to ${p.node}`}
                className="rounded-full pointer-events-auto transition-all duration-300"
                style={{
                  width: activeIdx === i ? '20px' : '6px',
                  height: '6px',
                  background: activeIdx === i ? panels[activeIdx].statusColor : 'rgba(255,255,255,0.28)',
                }}
              />
            ))}
          </div>
        </div>

      </div>
    </PublicLayout>
  )
}
