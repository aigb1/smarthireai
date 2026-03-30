'use client'

import { useState, useRef } from 'react'
import { Paperclip, Mic, Send, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const AI_POOL = [
  "I've analysed your request. Based on current roster data, I recommend prioritising ICU coverage first — urgency score 9.2/10.",
  "Found 14 available candidates matching your criteria. Top match: Dr. A. Sterling at 98% compatibility. Shall I shortlist them?",
  "Fill rate is trending +8% week-on-week. Recommending 3 new bid slots in Cardiology and A&E to maintain momentum.",
  "Processing... All 6 active nodes are GMC-verified. 2 DBS records expire within 60 days — I can trigger the renewal flow now.",
  "Compliance check complete. Your shift rota has 94% coverage for next week. One gap in Thursday Neurology — I've found 3 available candidates.",
  "Understood. Initiating mesh broadcast to 1,204 verified nodes. Estimated response within 4 minutes.",
  "I've cross-referenced your requirements. 8 candidates match on specialty + proximity. Ranked by match score and sent to your bookmark queue.",
  "Ward analytics updated. A&E has highest demand this weekend (+22%). Recommend increasing the rate ceiling by £5/hr to attract faster bids.",
  "AI signal boost sent to your top 50 candidates by proximity score. Expect 6–12 inbound applications within the hour.",
  "Handover documents generated for all confirmed shifts. Sent to clinicians' encrypted node inboxes. Audit trail logged.",
]

interface InteractiveAiBarProps {
  placeholder?: string
}

export function InteractiveAiBar({ placeholder = 'Ask AI anything…' }: InteractiveAiBarProps) {
  const [query, setQuery] = useState('')
  const [thinking, setThinking] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSend = async () => {
    if (!query.trim() || thinking) return
    setQuery('')
    setResponse(null)
    setThinking(true)
    await new Promise(r => setTimeout(r, 900 + Math.random() * 700))
    setThinking(false)
    setResponse(AI_POOL[Math.floor(Math.random() * AI_POOL.length)])
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 bg-zinc-800/40 border border-zinc-700/30 rounded-xl px-4 py-3 focus-within:border-zinc-500/60 transition-colors">
        <div className="h-7 w-7 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center flex-shrink-0">
          {thinking
            ? <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin" />
            : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5">
                <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              </svg>
            )
          }
        </div>
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none min-w-0"
        />
        <div className="flex items-center gap-2 flex-shrink-0">
          <Paperclip className="w-4 h-4 text-zinc-600 cursor-pointer hover:text-zinc-400 transition-colors" />
          <Mic className="w-4 h-4 text-zinc-600 cursor-pointer hover:text-zinc-400 transition-colors" />
          <button
            onClick={handleSend}
            disabled={!query.trim() || thinking}
            className="h-7 w-7 rounded-lg bg-white/8 border border-white/8 flex items-center justify-center hover:bg-white/15 transition-colors disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {(thinking || response) && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-zinc-800/30 border border-white/5 rounded-xl px-4 py-3 flex items-start gap-3">
              <div className="h-5 w-5 rounded-md bg-zinc-700/60 border border-white/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                {thinking
                  ? <Loader2 className="w-3 h-3 text-zinc-400 animate-spin" />
                  : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>
                }
              </div>
              <p className={`text-xs flex-1 leading-relaxed ${thinking ? 'text-zinc-600 animate-pulse' : 'text-zinc-300'}`}>
                {thinking ? 'AI is analysing your query…' : response}
              </p>
              {response && (
                <button onClick={() => setResponse(null)} className="text-zinc-700 hover:text-zinc-400 transition-colors flex-shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
