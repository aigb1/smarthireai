'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Mic, MicOff, X, Sparkles, Volume2 } from 'lucide-react'
import { useVoiceStore } from '@/lib/store'

const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }

type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking'

const COMMANDS: Array<{ patterns: RegExp[]; handler: (match: RegExpMatchArray, router: ReturnType<typeof useRouter>) => string }> = [
  {
    patterns: [/employer dashboard|staffing pulse|employer home/i],
    handler: (_, r) => { r.push('/employer/dashboard'); return 'Opening the employer staffing pulse dashboard.' },
  },
  {
    patterns: [/active bids|bid stream|employer jobs/i],
    handler: (_, r) => { r.push('/employer/jobs'); return 'Opening active bids — your live bid stream.' },
  },
  {
    patterns: [/ward analytics|analytics/i],
    handler: (_, r) => { r.push('/employer/analytics'); return 'Opening ward analytics.' },
  },
  {
    patterns: [/compliance|rota/i],
    handler: (_, r) => { r.push('/employer/applications'); return 'Opening the compliance rota.' },
  },
  {
    patterns: [/network velocity|recruiter dashboard|recruiter home/i],
    handler: (_, r) => { r.push('/recruiter/dashboard'); return 'Opening the recruiter network velocity dashboard.' },
  },
  {
    patterns: [/critical gaps?|recruiter search|find candidates?/i],
    handler: (_, r) => { r.push('/recruiter/search'); return 'Opening critical gaps — AI candidate search.' },
  },
  {
    patterns: [/talent pool|candidates?/i],
    handler: (_, r) => { r.push('/recruiter/candidates'); return 'Opening the talent pool.' },
  },
  {
    patterns: [/settlement ledger|bookmarks?|ledger/i],
    handler: (_, r) => { r.push('/recruiter/bookmarks'); return 'Opening the settlement ledger.' },
  },
  {
    patterns: [/neural matches?|clinician dashboard|clinician home/i],
    handler: (_, r) => { r.push('/clinician/dashboard'); return 'Opening your neural job matches.' },
  },
  {
    patterns: [/schedule|shifts?/i],
    handler: (_, r) => { r.push('/clinician/schedule'); return 'Opening your schedule.' },
  },
  {
    patterns: [/wallet|payments?|earnings?/i],
    handler: (_, r) => { r.push('/clinician/wallet'); return 'Opening your wallet.' },
  },
  {
    patterns: [/document vault|documents?|vault/i],
    handler: (_, r) => { r.push('/clinician/documents'); return 'Opening the document vault.' },
  },
  {
    patterns: [/live map|discovery map|map/i],
    handler: (_, r) => { r.push('/discovery'); return 'Opening the live network map.' },
  },
  {
    patterns: [/trust|security|protocol/i],
    handler: (_, r) => { r.push('/trust'); return 'Opening the trust and security protocol.' },
  },
  {
    patterns: [/pricing|fees?|fee structure/i],
    handler: (_, r) => { r.push('/pricing'); return 'Opening the fee structure.' },
  },
  {
    patterns: [/login|sign in|connect node/i],
    handler: (_, r) => { r.push('/login'); return 'Opening the login page.' },
  },
  {
    patterns: [/home|main page|landing/i],
    handler: (_, r) => { r.push('/'); return 'Taking you to the mednode home page.' },
  },
  {
    patterns: [/what (is|are) mednode|tell me about mednode|about this/i],
    handler: () => 'Mednode dot cloud is a neural protocol healthcare staffing platform. It connects NHS employers, clinical recruiters, and verified clinicians through AI-driven matching and real-time bid management.',
  },
  {
    patterns: [/how (does|do) (the )?(ai|search) work/i],
    handler: () => 'Every search page uses a natural language AI prompt. Just type or say what you need — for example, ICU consultant in London, immediate start — and the protocol matches and ranks candidates by score.',
  },
  {
    patterns: [/help|what can you do|commands?/i],
    handler: () => 'I can navigate the platform for you. Say things like: go to employer dashboard, open talent pool, show active bids, open settlement ledger, what is mednode, or how does the AI work.',
  },
]

function processCommand(transcript: string, router: ReturnType<typeof useRouter>): string {
  const text = transcript.trim()
  for (const cmd of COMMANDS) {
    for (const pattern of cmd.patterns) {
      const match = text.match(pattern)
      if (match) return cmd.handler(match, router)
    }
  }
  return `I heard "${text}". I can navigate pages or answer questions about mednode. Say "help" to hear what I can do.`
}

function speak(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !window.speechSynthesis) { onEnd?.(); return }
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.rate = 1.05
  utt.pitch = 1
  utt.volume = 1
  const voices = window.speechSynthesis.getVoices()
  const preferred = voices.find(v =>
    v.name.toLowerCase().includes('google uk english female') ||
    v.name.toLowerCase().includes('samantha') ||
    v.name.toLowerCase().includes('karen') ||
    v.lang === 'en-GB'
  )
  if (preferred) utt.voice = preferred
  utt.onend = () => onEnd?.()
  utt.onerror = () => onEnd?.()
  window.speechSynthesis.speak(utt)
}

// Animated orb rings
function VoiceOrb({ state }: { state: VoiceState }) {
  const colors = {
    idle:      { inner: '#7c3aed', mid: '#8b5cf6', outer: '#a78bfa' },
    listening: { inner: '#7c3aed', mid: '#8b5cf6', outer: '#c4b5fd' },
    thinking:  { inner: '#6d28d9', mid: '#7c3aed', outer: '#8b5cf6' },
    speaking:  { inner: '#5b21b6', mid: '#7c3aed', outer: '#a78bfa' },
  }
  const c = colors[state]

  const pulseSpeed = state === 'listening' ? 0.9 : state === 'speaking' ? 1.1 : 2.2
  const pulseScale = state === 'listening' ? [1, 1.18, 1] : state === 'speaking' ? [1, 1.12, 1.06, 1] : [1, 1.06, 1]

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      {/* Outermost glow ring */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: 144, height: 144, background: `radial-gradient(circle, ${c.outer}18 0%, transparent 70%)` }}
        animate={{ scale: pulseScale, opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: pulseSpeed * 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Outer ring */}
      <motion.div
        className="absolute rounded-full border"
        style={{ width: 128, height: 128, borderColor: `${c.outer}40`, background: `${c.outer}08` }}
        animate={{ scale: pulseScale, opacity: [0.5, 1, 0.5] }}
        transition={{ duration: pulseSpeed, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Mid ring */}
      <motion.div
        className="absolute rounded-full border"
        style={{ width: 100, height: 100, borderColor: `${c.mid}60`, background: `${c.mid}12` }}
        animate={{ scale: pulseScale.map(v => v * 0.96), opacity: [0.6, 1, 0.6] }}
        transition={{ duration: pulseSpeed, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
      />
      {/* Inner filled orb */}
      <motion.div
        className="absolute rounded-full flex items-center justify-center"
        style={{
          width: 72, height: 72,
          background: `radial-gradient(circle at 35% 35%, ${c.mid}, ${c.inner})`,
          boxShadow: `0 0 32px ${c.inner}80, 0 0 64px ${c.inner}30`,
        }}
        animate={{ scale: state === 'thinking' ? [1, 0.92, 1] : [1, 1.04, 1], opacity: [0.9, 1, 0.9] }}
        transition={{ duration: pulseSpeed * 0.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Inner icon */}
        {state === 'listening' && (
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>
            <Mic className="w-6 h-6 text-white" strokeWidth={1.5} />
          </motion.div>
        )}
        {state === 'thinking' && (
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
            <Sparkles className="w-6 h-6 text-white" strokeWidth={1.5} />
          </motion.div>
        )}
        {state === 'speaking' && (
          <Volume2 className="w-6 h-6 text-white" strokeWidth={1.5} />
        )}
        {state === 'idle' && (
          <Mic className="w-6 h-6 text-white/80" strokeWidth={1.5} />
        )}
      </motion.div>

      {/* Waveform bars (listening/speaking only) */}
      {(state === 'listening' || state === 'speaking') && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-8 flex items-end gap-[3px]">
          {Array.from({ length: 9 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-[3px] rounded-full"
              style={{ background: state === 'listening' ? '#a78bfa' : '#8b5cf6' }}
              animate={{ height: ['4px', `${8 + Math.random() * 20}px`, '4px'] }}
              transition={{
                duration: 0.4 + Math.random() * 0.3,
                repeat: Infinity,
                delay: i * 0.06,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const STATE_LABEL: Record<VoiceState, string> = {
  idle:      'Tap the orb to speak',
  listening: 'Listening…',
  thinking:  'Processing…',
  speaking:  'Responding…',
}

export function VoiceAssistant() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { isOpen: storeOpen, close: storeClose } = useVoiceStore()
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [supported, setSupported] = useState(true)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) setSupported(false)
  }, [])

  useEffect(() => {
    if (storeOpen && !open) setOpen(true)
  }, [storeOpen])

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
      recognitionRef.current = null
    }
  }, [])

  const startListening = useCallback(() => {
    if (!supported) return
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return

    setTranscript('')
    setResponse('')
    setVoiceState('listening')

    const recognition = new SR()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-GB'
    recognitionRef.current = recognition

    recognition.onresult = (event: any) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) final += t
        else interim += t
      }
      setTranscript(final || interim)
    }

    recognition.onend = () => {
      setTranscript(prev => {
        if (!prev.trim()) {
          setVoiceState('idle')
          return prev
        }
        setVoiceState('thinking')
        setTimeout(() => {
          const reply = processCommand(prev, router)
          setResponse(reply)
          setVoiceState('speaking')
          speak(reply, () => setVoiceState('idle'))
        }, 800)
        return prev
      })
    }

    recognition.onerror = () => {
      setVoiceState('idle')
      recognitionRef.current = null
    }

    recognition.start()
  }, [supported, router])

  const handleClose = useCallback(() => {
    stopRecognition()
    window.speechSynthesis?.cancel()
    setOpen(false)
    storeClose()
    setVoiceState('idle')
    setTranscript('')
    setResponse('')
  }, [stopRecognition, storeClose])

  const handleOrbClick = useCallback(() => {
    if (voiceState === 'listening') {
      stopRecognition()
      setVoiceState('idle')
    } else if (voiceState === 'idle') {
      startListening()
    } else if (voiceState === 'speaking') {
      window.speechSynthesis?.cancel()
      setVoiceState('idle')
    }
  }, [voiceState, startListening, stopRecognition])

  // Pulse ring on the trigger button
  const showPulse = !open

  return (
    <>
      {/* ── Floating trigger button ── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setOpen(true)}
            title="Voice assistant"
            className="fixed bottom-6 right-6 z-[200] w-12 h-12 rounded-full hidden lg:flex items-center justify-center shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 0 24px #7c3aed60' }}
          >
            {/* Pulse ring */}
            {showPulse && (
              <>
                <motion.span
                  className="absolute inset-0 rounded-full"
                  style={{ border: '2px solid #a78bfa60' }}
                  animate={{ scale: [1, 1.6], opacity: [0.8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                />
                <motion.span
                  className="absolute inset-0 rounded-full"
                  style={{ border: '2px solid #8b5cf640' }}
                  animate={{ scale: [1, 1.9], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
                />
              </>
            )}
            <Mic className="w-5 h-5 text-white relative z-10" strokeWidth={1.5} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Voice modal overlay ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex flex-col items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)' }}
          >
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-[11px] tracking-widest uppercase text-white/40" style={MONO}>mednode voice</span>
              </div>
              <button
                onClick={handleClose}
                className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white/90 hover:border-white/30 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Orb + waveform */}
            <div className="flex flex-col items-center gap-14">
              <motion.button
                onClick={handleOrbClick}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="focus:outline-none cursor-pointer"
                title={voiceState === 'listening' ? 'Stop listening' : voiceState === 'speaking' ? 'Stop speaking' : 'Start listening'}
              >
                <VoiceOrb state={voiceState} />
              </motion.button>

              {/* Status + transcript area */}
              <div className="flex flex-col items-center gap-3 px-8 max-w-sm w-full">
                <motion.p
                  key={voiceState}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[11px] tracking-widest uppercase"
                  style={{ color: '#ffffff50', ...MONO }}
                >
                  {STATE_LABEL[voiceState]}
                </motion.p>

                <AnimatePresence mode="wait">
                  {transcript && (
                    <motion.p
                      key="transcript"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-center text-base font-medium leading-relaxed"
                      style={{ color: voiceState === 'thinking' || voiceState === 'speaking' ? '#e9d5ff' : '#ffffff90' }}
                    >
                      &ldquo;{transcript}&rdquo;
                    </motion.p>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {response && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="w-full rounded-xl border px-4 py-3 text-center text-sm leading-relaxed"
                      style={{ borderColor: '#7c3aed40', background: '#7c3aed14', color: '#c4b5fd' }}
                    >
                      {response}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom action row */}
            <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-3">
              {voiceState === 'idle' && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={startListening}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-all"
                  style={{ borderColor: '#7c3aed60', background: '#7c3aed18', color: '#c4b5fd' }}
                  whileHover={{ borderColor: '#7c3aed', background: '#7c3aed30' }}
                >
                  <Mic className="w-4 h-4" strokeWidth={1.5} />
                  Tap to speak
                </motion.button>
              )}
              {voiceState === 'listening' && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => { stopRecognition(); setVoiceState('idle') }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-all"
                  style={{ borderColor: '#ef444440', background: '#ef444414', color: '#fca5a5' }}
                >
                  <MicOff className="w-4 h-4" strokeWidth={1.5} />
                  Stop
                </motion.button>
              )}
              <p className="text-[10px] tracking-wider text-center" style={{ color: '#ffffff25', ...MONO }}>
                Try: &quot;open talent pool&quot; · &quot;active bids&quot; · &quot;what is mednode&quot;
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
