'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import {
  Wallet, ArrowUpRight, ArrowDownLeft, Shield, Zap, TrendingUp, CheckCircle2,
} from 'lucide-react'
import { toast } from '@/lib/toast'

interface TxRecord {
  id: string; type: 'credit' | 'debit'; hospital: string; ward: string
  hours: number; rate: number; amount: number; date: string; status: 'settled' | 'processing' | 'scheduled'
  nodeRef: string; tax: number
}

const TRANSACTIONS: TxRecord[] = [
  { id: 't1', type: 'credit', hospital: "St. Mary's Trust",    ward: 'A&E',       hours: 12, rate: 100, amount: 1200, date: '2026-03-28', status: 'settled',    nodeRef: 'RLH_AE_001',  tax: 240 },
  { id: 't2', type: 'credit', hospital: 'Royal London',         ward: 'ICU',       hours: 8,  rate: 110, amount: 880,  date: '2026-03-26', status: 'settled',    nodeRef: 'RLH_ICU_004', tax: 176 },
  { id: 't3', type: 'credit', hospital: 'City General',         ward: 'Cardiology',hours: 12, rate: 90,  amount: 1080, date: '2026-03-24', status: 'settled',    nodeRef: 'CG_CARD_002', tax: 216 },
  { id: 't4', type: 'credit', hospital: "King's College Hosp.", ward: 'Trauma',    hours: 12, rate: 107, amount: 1284, date: '2026-04-03', status: 'scheduled',  nodeRef: 'KCH_TR_012',  tax: 257 },
  { id: 't5', type: 'credit', hospital: 'Westside Clinic',      ward: 'Obs',       hours: 6,  rate: 95,  amount: 570,  date: '2026-03-22', status: 'processing', nodeRef: 'WS_OBS_009',  tax: 114 },
  { id: 't6', type: 'debit',  hospital: 'Platform fee',         ward: '—',         hours: 0,  rate: 0,   amount: 180,  date: '2026-03-20', status: 'settled',    nodeRef: 'PLATFORM',    tax: 0 },
  { id: 't7', type: 'credit', hospital: 'North Middlesex',      ward: 'A&E',       hours: 12, rate: 125, amount: 1500, date: '2026-03-18', status: 'settled',    nodeRef: 'NMU_AE_007',  tax: 300 },
  { id: 't8', type: 'credit', hospital: 'Barts Health NHS',     ward: 'Gastro',    hours: 8,  rate: 93,  amount: 744,  date: '2026-03-15', status: 'settled',    nodeRef: 'BARTS_GI_01', tax: 149 },
]

const STATUS_STYLES = {
  settled:    { text: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', label: 'Settled' },
  processing: { text: 'text-blue-400',    border: 'border-blue-500/20',    bg: 'bg-blue-500/10',    label: 'Processing' },
  scheduled:  { text: 'text-amber-400',   border: 'border-amber-500/20',   bg: 'bg-amber-500/10',   label: 'Scheduled' },
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
        className={`h-full rounded-full ${color}`} />
    </div>
  )
}

export default function ClinicianWallet() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawn, setWithdrawn] = useState(false)

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || user?.role !== 'clinician') router.push('/login')
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading || !isAuthenticated || user?.role !== 'clinician') return null

  const handleWithdraw = async () => {
    setWithdrawing(true)
    const id = toast.loading('Initiating bank transfer…')
    await new Promise(r => setTimeout(r, 1800))
    toast.dismiss(id)
    setWithdrawing(false)
    setWithdrawn(true)
    toast.success('£4,280.00 withdrawal initiated — arrives in 1–2 business days')
  }

  const settled      = TRANSACTIONS.filter(t => t.status === 'settled' && t.type === 'credit')
  const totalGross   = settled.reduce((a, t) => a + t.amount, 0)
  const totalTax     = settled.reduce((a, t) => a + t.tax, 0)
  const totalNet     = totalGross - totalTax
  const balance      = 4280
  const scheduled    = TRANSACTIONS.filter(t => t.status === 'scheduled').reduce((a, t) => a + t.amount, 0)
  const maxAmount    = Math.max(...TRANSACTIONS.filter(t => t.type === 'credit').map(t => t.amount))

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* Balance card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/5 bg-[#1a1a1a] overflow-hidden">
          <div className="px-6 py-6 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1">
              <p className="text-xs text-zinc-500 mb-2">Live balance</p>
              <p className="text-5xl font-bold text-white tracking-tight">
                £{balance.toLocaleString()}<span className="text-2xl text-zinc-500">.00</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-xs text-emerald-400">Node confirmed</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {withdrawn ? (
                <div className="flex items-center gap-2 text-sm text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" /> Withdrawal initiated
                </div>
              ) : (
                <button onClick={handleWithdraw} disabled={withdrawing}
                  className="flex items-center gap-2 text-sm font-medium text-black bg-white hover:bg-zinc-100 disabled:opacity-50 px-5 py-2.5 rounded-xl transition-all">
                  {withdrawing ? (
                    <><span className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-950 rounded-full animate-spin" /> Initiating…</>
                  ) : (
                    <><ArrowUpRight className="w-4 h-4" /> Withdraw to bank</>
                  )}
                </button>
              )}
              <div className="flex items-center gap-1.5 text-xs text-zinc-600 border border-zinc-800 px-3 py-2 rounded-xl">
                <Shield className="w-3.5 h-3.5" /> Tier 4 protected
              </div>
            </div>
          </div>
        </motion.div>

        {/* Summary stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total gross',    value: `£${totalGross.toLocaleString()}`, icon: TrendingUp,     color: 'text-white' },
            { label: 'Tax & NI',       value: `£${totalTax.toLocaleString()}`,   icon: Shield,         color: 'text-red-400' },
            { label: 'Net earnings',   value: `£${totalNet.toLocaleString()}`,   icon: Wallet,         color: 'text-emerald-400' },
            { label: 'Scheduled',      value: `£${scheduled.toLocaleString()}`,  icon: Zap,            color: 'text-amber-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl border border-white/5 bg-[#1a1a1a] p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-zinc-800/60 border border-white/8 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                </div>
                <p className="text-xs text-zinc-500">{label}</p>
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Transaction log */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#1a1a1a] overflow-hidden">
            <div className="flex items-center px-5 py-3 border-b border-white/5">
              <p className="text-sm font-medium text-white">Transaction log</p>
            </div>
            <div className="divide-y divide-white/4">
              {TRANSACTIONS.map(tx => {
                const ss = STATUS_STYLES[tx.status]
                return (
                  <div key={tx.id} className="px-5 py-4 flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      tx.type === 'credit' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'
                    }`}>
                      {tx.type === 'credit'
                        ? <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                        : <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium">{tx.hospital}</p>
                      <p className="text-xs text-zinc-500 mt-0.5 font-mono">{tx.nodeRef} · {tx.ward} · {tx.date}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {tx.type === 'credit' && tx.hours > 0 && (
                        <div className="text-right hidden md:block">
                          <p className="text-xs text-zinc-600">{tx.hours}h × £{tx.rate}/hr</p>
                          <p className="text-xs text-zinc-700">Tax: £{tx.tax}</p>
                        </div>
                      )}
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${tx.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {tx.type === 'credit' ? '+' : '-'}£{tx.amount.toLocaleString()}
                        </p>
                      </div>
                      <span className={`text-[10px] border px-2 py-0.5 rounded-full ${ss.bg} ${ss.border} ${ss.text}`}>
                        {ss.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Earnings breakdown */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            className="rounded-2xl border border-white/5 bg-[#1a1a1a] overflow-hidden">
            <div className="flex items-center px-5 py-3 border-b border-white/5">
              <p className="text-sm font-medium text-white">Earnings by shift</p>
            </div>
            <div className="p-5 space-y-4">
              {TRANSACTIONS.filter(t => t.type === 'credit' && t.amount > 0).slice(0, 6).map(tx => (
                <div key={tx.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-zinc-400 truncate flex-1 pr-2">{tx.hospital.split(' ').slice(0, 2).join(' ')}</span>
                    <span className="text-xs text-white font-semibold flex-shrink-0">£{tx.amount.toLocaleString()}</span>
                  </div>
                  <MiniBar value={tx.amount} max={maxAmount}
                    color={tx.status === 'settled' ? 'bg-emerald-400' : tx.status === 'processing' ? 'bg-blue-400' : 'bg-amber-400'} />
                </div>
              ))}
            </div>

            <div className="px-5 pb-5">
              <div className="h-px bg-white/5 mb-4" />
              <div className="space-y-2">
                {[
                  { label: 'Next payout', value: 'April 2, 2026' },
                  { label: 'Payout method', value: 'UK bank transfer' },
                  { label: 'Processing time', value: '1–2 business days' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span className="text-zinc-600">{label}</span>
                    <span className="text-zinc-400 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </DashboardLayout>
  )
}
