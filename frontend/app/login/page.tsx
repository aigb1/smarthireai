'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { DEMO_USERS } from '@/lib/demo'

const getRedirect = (role: string) => {
  if (role === 'employer') return '/employer/dashboard'
  if (role === 'clinician') return '/clinician/dashboard'
  if (role === 'superadmin') return '/superadmin/dashboard'
  return '/recruiter/dashboard'
}

const NODE_TYPES = [
  { role: 'employer' as const,  label: 'NHS Trust',  sub: 'Post shifts' },
  { role: 'recruiter' as const, label: 'Recruiter',  sub: 'Find talent' },
  { role: 'clinician' as const, label: 'Clinician',  sub: 'Secure bids' },
]

const SANDBOX = [
  { role: 'employer' as const,    label: 'Employer Node',   email: 'trust@mednode.cloud',      hint: 'NHS Trust dashboard' },
  { role: 'recruiter' as const,   label: 'Recruiter Node',  email: 'agent@mednode.cloud',       hint: 'Orchestrator suite' },
  { role: 'clinician' as const,   label: 'Clinician Node',  email: 'dr.morgan@mednode.cloud',   hint: 'Clinician protocol' },
  { role: 'superadmin' as const,  label: 'Super Admin',     email: 'admin@mednode.cloud',        hint: 'Platform oversight' },
]

export default function LoginPage() {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)
  const [selectedRole, setSelectedRole] = useState<'employer' | 'recruiter' | 'clinician'>('employer')
  const [entering, setEntering] = useState<string | null>(null)

  const loginAs = (role: 'employer' | 'recruiter' | 'clinician' | 'superadmin') => {
    setEntering(role)
    setUser(DEMO_USERS[role])
    setTimeout(() => router.push(getRedirect(role)), 300)
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── LEFT — dark hero panel ──────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black flex-col">

        {/* Green orb */}
        <div
          className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 60% 40%, #166534 0%, #14532d 30%, #052e16 60%, transparent 80%)',
            filter: 'blur(40px)',
            opacity: 0.9,
          }}
        />
        <div
          className="absolute top-0 right-0 w-[320px] h-[320px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, #22c55e 0%, #16a34a 20%, transparent 70%)',
            filter: 'blur(80px)',
            opacity: 0.35,
          }}
        />

        {/* Top bar */}
        <div className="relative z-10 flex items-center gap-3 px-10 pt-10">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-white/10 border border-white/15 flex items-center justify-center">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              </svg>
            </div>
            <span className="text-white text-sm font-semibold tracking-tight">mednode.cloud</span>
          </div>
          <div className="h-4 w-px bg-white/15" />
          <div className="flex items-center gap-1.5 text-white/40 text-xs">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            mednode.cloud
          </div>
        </div>

        {/* Main copy */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-10">
          <h1 className="text-white text-[3rem] font-bold leading-[1.05] tracking-tight mb-5">
            The intelligent node<br />for healthcare.
          </h1>
          <p className="text-white/45 text-base leading-relaxed max-w-xs">
            Connecting sovereign physicians to the global medical mesh.
          </p>
        </div>
      </div>

      {/* ── RIGHT — form panel ──────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-[#f5f5f3] p-6 overflow-y-auto min-h-screen lg:min-h-0">
        <div className="w-full max-w-[360px]">

          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-7 w-7 rounded-lg bg-black flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              </svg>
            </div>
            <span className="text-black text-sm font-semibold">mednode.cloud</span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-7">
            <h2 className="text-[#111] text-lg font-semibold mb-1">Connect to your node</h2>
            <p className="text-zinc-400 text-xs mb-6">Select your role to access the mednode.cloud protocol.</p>

            {/* Role selector */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {NODE_TYPES.map(({ role, label, sub }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`py-2.5 px-2 rounded-lg border text-left transition-all ${
                    selectedRole === role
                      ? 'border-black bg-black text-white'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300'
                  }`}
                >
                  <div className="text-xs font-semibold leading-tight">{label}</div>
                  <div className="text-[9px] opacity-50 mt-0.5">{sub}</div>
                </button>
              ))}
            </div>

            {/* Connect button */}
            <button
              onClick={() => loginAs(selectedRole)}
              disabled={!!entering}
              className="w-full h-10 bg-[#111] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors disabled:opacity-60 mb-5"
            >
              {entering === selectedRole
                ? <span className="flex items-center gap-2"><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path d="M9 12l2 2 4-4" /></svg>Connecting…</span>
                : <>Connect to node <span className="text-white/60">↗</span></>
              }
            </button>

            {/* OR divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-zinc-100" />
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest">or enter directly</span>
              <div className="flex-1 h-px bg-zinc-100" />
            </div>

            {/* SSO-style direct role buttons */}
            <div className="space-y-2">
              {NODE_TYPES.map(({ role, label }) => (
                <button
                  key={role}
                  onClick={() => loginAs(role)}
                  disabled={!!entering}
                  className="w-full h-9 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors flex items-center justify-between px-3 text-sm text-zinc-700 disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-sm bg-emerald-700 flex items-center justify-center">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                      </svg>
                    </div>
                    <span className="text-xs">Enter as {label}</span>
                  </div>
                  <span className="text-zinc-400 text-xs">→</span>
                </button>
              ))}
            </div>
          </div>

          {/* Security note */}
          <p className="text-[10px] text-zinc-400 text-center mt-4 leading-relaxed px-2">
            *Note: System utilizes secure, distributed identity protocols.<br />
            <span className="text-zinc-300 font-mono">[SECURE_CONNECTION: ESTABLISHED]*</span>
          </p>

          {/* Sandbox credentials reference */}
          <div className="mt-5 bg-white border border-zinc-200/80 rounded-xl p-4 shadow-sm">
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest text-center mb-3">Demo node identities</p>
            <div className="space-y-2">
              {SANDBOX.map(({ role, label, email, hint }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => loginAs(role)}
                  disabled={!!entering}
                  className="w-full flex items-center justify-between py-1.5 px-0 text-left hover:opacity-70 transition-opacity disabled:opacity-40"
                >
                  <div>
                    <span className="text-xs text-zinc-600 font-medium block">{label}</span>
                    <span className="text-[10px] text-zinc-400">{hint}</span>
                  </div>
                  <code className="text-[10px] text-zinc-400 font-mono">{email}</code>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
