'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Sparkles, Loader2, Send, ChevronRight, CheckCircle2, ArrowLeft } from 'lucide-react'
import { jobsApi } from '@/lib/api'
import { useRouter } from 'next/navigation'

const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }

interface BidFields {
  title: string
  specialty: string
  location: string
  job_type: string
  shift_pattern: string
  pay_rate: string
  salary_range: string
  requirements: string
  description: string
  company_name: string
}

function extractFromPrompt(prompt: string): Partial<BidFields> {
  const p = prompt.toLowerCase()

  // Specialty / title extraction
  const specialties: Record<string, string> = {
    'a&e': 'A&E Consultant',
    'a & e': 'A&E Consultant',
    'emergency': 'Emergency Medicine Consultant',
    'icu': 'ICU Consultant',
    'intensive care': 'ICU / Intensive Care Consultant',
    'anaesthetist': 'Anaesthetist',
    'anaesthetics': 'Anaesthetist',
    'anesthesia': 'Anaesthetist',
    'cardiology': 'Cardiology Consultant',
    'cardiologist': 'Cardiology Consultant',
    'paediatric': 'Paediatric Consultant',
    'paediatrics': 'Paediatric Consultant',
    'pediatric': 'Paediatric Consultant',
    'psychiatry': 'Psychiatry Consultant',
    'psychiatrist': 'Psychiatry Consultant',
    'oncology': 'Oncology Consultant',
    'oncologist': 'Oncology Consultant',
    'radiology': 'Radiology Consultant',
    'radiologist': 'Radiology Consultant',
    'general surgeon': 'General Surgery Consultant',
    'surgery': 'Surgery Consultant',
    'orthopaedic': 'Orthopaedic Consultant',
    'orthopaedics': 'Orthopaedic Consultant',
    'obstetrician': 'Obstetrics & Gynaecology Consultant',
    'obstetrics': 'Obstetrics & Gynaecology Consultant',
    'geriatric': 'Geriatrics Consultant',
    'palliative': 'Palliative Care Consultant',
    'neurolog': 'Neurology Consultant',
    'gp ': 'GP Locum',
    'general practice': 'GP Locum',
    'locum gp': 'GP Locum',
    'nurse': 'Registered Nurse',
    'nursing': 'Registered Nurse',
    'physician associate': 'Physician Associate',
    'advanced nurse practitioner': 'Advanced Nurse Practitioner',
    'anp ': 'Advanced Nurse Practitioner',
  }

  let title = ''
  for (const [key, val] of Object.entries(specialties)) {
    if (p.includes(key)) { title = val; break }
  }
  if (!title) title = 'Locum Consultant'

  // Location extraction — look for "at <place>" or "in <place>"
  let location = ''
  const locMatch = prompt.match(/(?:at|@|in|for)\s+([A-Z][a-zA-Z\s]{2,30}(?:Hospital|Infirmary|NHS|Trust|Centre|Center|Clinic)?)/i)
  if (locMatch) location = locMatch[1].trim()

  // Pay rate — £X/hr or £X per hour
  let pay_rate = ''
  let salary_range = ''
  const payMatch = prompt.match(/£\s?(\d+(?:\.\d+)?)\s?(?:\/\s?hr|per hour|\/hour|ph\b)/i)
  if (payMatch) {
    pay_rate = `£${payMatch[1]}/hr`
    const rate = parseFloat(payMatch[1])
    const minYr = Math.round(rate * 40 * 48)
    salary_range = `£${Math.round(rate * 0.9 * 40 * 48 / 1000)}k - £${Math.round(rate * 1.1 * 40 * 48 / 1000)}k`
  }

  // Shift pattern
  let shift_pattern = ''
  const dayNames = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
  const foundDays = dayNames.filter(d => p.includes(d)).map(d => d[0].toUpperCase() + d.slice(1))
  if (foundDays.length > 0) shift_pattern = foundDays.join(', ')
  if (p.includes('night')) shift_pattern += (shift_pattern ? ' — ' : '') + 'Night shifts'
  if (p.includes('day shift')) shift_pattern += (shift_pattern ? ' — ' : '') + 'Day shifts'
  if (p.includes('weekend')) shift_pattern += (shift_pattern ? ' — ' : '') + 'Weekends'
  if (!shift_pattern) shift_pattern = 'Flexible'

  // Requirements
  const reqFlags: string[] = []
  if (p.includes('gmc')) reqFlags.push('GMC Registration')
  if (p.includes('dbs')) reqFlags.push('DBS Check')
  if (p.includes('indemnity')) reqFlags.push('Indemnity Insurance')
  if (p.includes('mbbs') || p.includes('md ') || p.includes('m.b.b.s')) reqFlags.push('MBBS / MD')
  if (p.includes('nmc')) reqFlags.push('NMC Registration')
  if (p.includes('aps')) reqFlags.push('APS')
  if (reqFlags.length === 0) reqFlags.push('GMC Registration', 'DBS Check')

  // Job type
  let job_type = 'Locum'
  if (p.includes('permanent') || p.includes('perm ')) job_type = 'Permanent'
  if (p.includes('part-time') || p.includes('part time')) job_type = 'Part-time'
  if (p.includes('contract')) job_type = 'Contract'

  // Build description from prompt
  const description = `${title}${location ? ` at ${location}` : ''}. ${shift_pattern} shifts. ${reqFlags.join(', ')} required.${pay_rate ? ` Rate: ${pay_rate}.` : ''} AI-generated from protocol brief.`

  return { title, location, job_type, shift_pattern, pay_rate, salary_range, requirements: reqFlags.join(', '), description }
}

interface Props {
  onClose: () => void
  onCreated?: () => void
}

type Step = 'prompt' | 'thinking' | 'review' | 'success'

export default function NewBidModal({ onClose, onCreated }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('prompt')
  const [prompt, setPrompt] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [thinkingDots, setThinkingDots] = useState('.')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [fields, setFields] = useState<BidFields>({
    title: '',
    specialty: '',
    location: '',
    job_type: 'Locum',
    shift_pattern: '',
    pay_rate: '',
    salary_range: '',
    requirements: '',
    description: '',
    company_name: '',
  })

  useEffect(() => {
    if (step === 'prompt') textareaRef.current?.focus()
  }, [step])

  useEffect(() => {
    if (step !== 'thinking') return
    const iv = setInterval(() => setThinkingDots(d => d.length >= 3 ? '.' : d + '.'), 400)
    const timeout = setTimeout(() => {
      clearInterval(iv)
      const extracted = extractFromPrompt(prompt)
      setFields(f => ({ ...f, ...extracted }))
      setStep('review')
    }, 2000)
    return () => { clearInterval(iv); clearTimeout(timeout) }
  }, [step, prompt])

  const handleGenerate = () => {
    if (prompt.trim().length < 10) return
    setStep('thinking')
  }

  const handleSubmit = async (publish: boolean) => {
    setError('')
    setSubmitting(true)
    try {
      const payload = {
        title: fields.title,
        description: fields.description,
        company_name: fields.company_name,
        location: fields.location,
        job_type: fields.job_type,
        salary_range: fields.salary_range || fields.pay_rate,
        status: publish ? 'published' : 'draft',
        form_schema: { fields: [
          { id: '1', type: 'text', label: 'Full Name', required: true },
          { id: '2', type: 'email', label: 'Email', required: true },
          { id: '3', type: 'file', label: 'CV / Portfolio', required: true },
        ]},
        ai_prompt: prompt,
        requirements: fields.requirements,
        shift_pattern: fields.shift_pattern,
        pay_rate: fields.pay_rate,
      }
      await jobsApi.create(payload)
      setStep('success')
      onCreated?.()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create bid')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden"
        style={{ background: '#171717' }}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800/60">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-medium">new bid protocol</p>
              <p className="text-zinc-600 text-[10px] font-mono tracking-[0.15em] uppercase" style={MONO}>
                ai_assisted_v2.4 // neural extraction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Step: PROMPT ── */}
        {step === 'prompt' && (
          <div className="px-6 py-5 space-y-4">
            <div>
              <p className="text-zinc-300 text-sm mb-1">describe the role</p>
              <p className="text-zinc-600 text-xs font-mono" style={MONO}>
                the ai will extract title, location, pay rate, shift pattern and requirements automatically
              </p>
            </div>

            <div className="relative">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate()
                }}
                placeholder="e.g. need a locum A&E consultant for Thursday and Friday at Royal London Hospital, MBBS required, GMC registered, DBS needed, paying £120/hr. Indemnity must be in place."
                rows={5}
                className="w-full bg-zinc-900/80 border border-zinc-700/60 rounded-xl px-4 py-3.5 text-sm text-zinc-200 placeholder:text-zinc-700 resize-none focus:outline-none focus:border-zinc-500 transition-colors"
                style={MONO}
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-zinc-700 text-[10px] font-mono" style={MONO}>
                ⌘↵ to generate
              </div>
            </div>

            {/* Example chips */}
            <div className="flex flex-wrap gap-2">
              {[
                'locum ICU consultant, nights',
                'A&E registrar, weekends',
                'GP locum, Fridays',
              ].map(eg => (
                <button
                  key={eg}
                  onClick={() => setPrompt(eg + ', ')}
                  className="text-[10px] font-mono text-zinc-600 hover:text-zinc-400 border border-zinc-800 hover:border-zinc-700 rounded-lg px-2.5 py-1 transition-colors"
                  style={MONO}
                >
                  {eg}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={onClose}
                className="text-zinc-600 hover:text-zinc-400 text-xs font-mono transition-colors"
                style={MONO}
              >
                cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={prompt.trim().length < 10}
                className="flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate bid
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step: THINKING ── */}
        {step === 'thinking' && (
          <div className="px-6 py-16 flex flex-col items-center gap-5">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
              <div className="absolute inset-0 rounded-full border-2 border-t-white/60 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
                </svg>
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-white text-sm font-medium">neural extraction in progress{thinkingDots}</p>
              <p className="text-zinc-600 text-xs font-mono tracking-widest uppercase" style={MONO}>
                parsing role parameters
              </p>
            </div>
            <div className="w-48 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-white/20 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        )}

        {/* ── Step: REVIEW ── */}
        {step === 'review' && (
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
              <p className="text-zinc-300 text-sm">ai extracted — review and confirm</p>
            </div>

            {/* Extracted prompt preview */}
            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl px-4 py-3 flex items-start gap-3">
              <Sparkles className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0 mt-0.5" />
              <p className="text-zinc-500 text-xs font-mono leading-relaxed line-clamp-2" style={MONO}>{prompt}</p>
              <button
                onClick={() => setStep('prompt')}
                className="flex-shrink-0 text-zinc-700 hover:text-zinc-400 text-[10px] font-mono border border-zinc-800 hover:border-zinc-700 rounded px-2 py-0.5 transition-colors"
                style={MONO}
              >
                edit
              </button>
            </div>

            {/* Editable fields grid */}
            <div className="grid grid-cols-2 gap-3">
              {([
                { key: 'title', label: 'role title', placeholder: 'e.g. ICU Consultant' },
                { key: 'location', label: 'location', placeholder: 'e.g. Royal London Hospital' },
                { key: 'job_type', label: 'engagement type', placeholder: 'Locum / Perm / Contract', isSelect: true },
                { key: 'shift_pattern', label: 'shift pattern', placeholder: 'e.g. Thursday, Friday — Nights' },
                { key: 'pay_rate', label: 'pay rate', placeholder: 'e.g. £120/hr' },
                { key: 'company_name', label: 'trust / organisation', placeholder: 'e.g. NHS Foundation Trust' },
              ] as any[]).map(({ key, label, placeholder, isSelect }) => (
                <div key={key} className="space-y-1">
                  <label className="text-[10px] font-mono tracking-[0.15em] uppercase text-zinc-600" style={MONO}>
                    {label}
                  </label>
                  {isSelect ? (
                    <select
                      value={fields[key as keyof BidFields]}
                      onChange={e => setFields(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full bg-zinc-900/80 border border-zinc-700/60 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors appearance-none"
                      style={MONO}
                    >
                      <option>Locum</option>
                      <option>Permanent</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={fields[key as keyof BidFields]}
                      onChange={e => setFields(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full bg-zinc-900/80 border border-zinc-700/60 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors"
                      style={MONO}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Requirements full-width */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono tracking-[0.15em] uppercase text-zinc-600" style={MONO}>
                requirements
              </label>
              <input
                type="text"
                value={fields.requirements}
                onChange={e => setFields(f => ({ ...f, requirements: e.target.value }))}
                placeholder="e.g. GMC Registration, DBS Check, Indemnity Insurance"
                className="w-full bg-zinc-900/80 border border-zinc-700/60 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors"
                style={MONO}
              />
            </div>

            {error && (
              <div className="bg-red-950/30 border border-red-900/40 rounded-xl px-4 py-3">
                <p className="text-red-400 text-xs font-mono" style={MONO}>{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
              <button
                onClick={() => setStep('prompt')}
                className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-400 text-xs font-mono transition-colors"
                style={MONO}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                re-brief
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting || !fields.title}
                  className="text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-xl px-4 py-2 text-xs font-mono transition-colors disabled:opacity-30"
                  style={MONO}
                >
                  {submitting ? '...' : 'save draft'}
                </button>
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={submitting || !fields.title}
                  className="flex items-center gap-1.5 bg-white text-black text-sm font-medium px-4 py-2 rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-30"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  post bid
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step: SUCCESS ── */}
        {step === 'success' && (
          <div className="px-6 py-16 flex flex-col items-center gap-5 text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-950/40 border border-emerald-900/50 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <p className="text-white text-base font-medium">bid posted to mednode.cloud</p>
              <p className="text-zinc-600 text-xs font-mono tracking-widest uppercase" style={MONO}>
                matching candidates // protocol active
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-xl px-4 py-2 text-xs font-mono transition-colors"
                style={MONO}
              >
                close
              </button>
              <button
                onClick={() => { onClose(); router.push('/employer/jobs') }}
                className="flex items-center gap-1.5 bg-white text-black text-sm font-medium px-4 py-2 rounded-xl hover:bg-zinc-100 transition-colors"
              >
                view all bids
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
