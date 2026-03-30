'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/lib/store'
import { DEMO_JOBS, DEMO_CANDIDATES } from '@/lib/demo'
import { ArrowLeft, Sparkles, MapPin, Briefcase, Clock, TrendingUp, Mail } from 'lucide-react'
import { toast } from '@/lib/toast'

const DEMO_APPLICATIONS = DEMO_CANDIDATES.slice(0, 4).map((c, i) => ({
  id: `app-${i}`,
  candidate_name: c.name,
  candidate_email: `${c.name.toLowerCase().replace(/[^a-z]/g, '.')}@nhs.net`,
  submitted_at: '2026-03-20',
  rank_score: null as number | null,
  rank_rationale: null as string | null,
  candidate_data: { specialty: c.specialty, experience: `${c.experience_years} years`, location: c.location },
}))

const AI_RATIONALES = [
  'Strong match — extensive procedural experience aligns with the role requirements. Availability and location are ideal.',
  'Good candidate — skill set covers core competencies. Minor gap in subspecialty training, easily mitigated.',
  'Moderate match — broad generalist experience but limited specialist depth. Suitable for a stretch placement.',
  'Developing profile — early-career candidate with strong fundamentals. Suitable if senior supervision is available.',
]

export default function JobDetailClient({ id }: { id: string }) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const [job, setJob] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>(DEMO_APPLICATIONS)
  const [ranking, setRanking] = useState(false)

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || user?.role !== 'employer') { router.push('/login'); return }
    setJob(DEMO_JOBS.find(j => j.id === id) ?? DEMO_JOBS[0])
  }, [isLoading, isAuthenticated, user, id])

  const handleRankCandidates = async () => {
    setRanking(true)
    const tid = toast.loading('AI ranking candidates…')
    await new Promise(r => setTimeout(r, 1400))
    setApplications(prev => prev.map((a, i) => ({
      ...a,
      rank_score: [94, 81, 67, 52][i] ?? 60,
      rank_rationale: AI_RATIONALES[i] ?? AI_RATIONALES[3],
    })).sort((a, b) => (b.rank_score ?? 0) - (a.rank_score ?? 0)))
    toast.dismiss(tid)
    toast.success('Candidates ranked by AI match score')
    setRanking(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    if (score >= 60) return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    if (score >= 40) return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20'
  }

  if (isLoading || !isAuthenticated) return null

  if (!job) return (
    <DashboardLayout>
      <div className="text-center py-20">
        <p className="text-zinc-500 text-sm mb-4">Job not found</p>
        <button onClick={() => router.back()} className="text-sm text-zinc-400 hover:text-white border border-zinc-700/60 rounded-xl px-4 py-2 transition-colors">
          Go back
        </button>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="space-y-5 w-full">

        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to jobs
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Job info */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] border px-2 py-0.5 rounded-full ${
                    job.status === 'published'
                      ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
                      : 'text-amber-400 border-amber-500/20 bg-amber-500/10'
                  }`}>
                    {job.status === 'published' ? 'Live' : 'Draft'}
                  </span>
                </div>
                <h1 className="text-lg font-semibold text-white mb-1">{job.title}</h1>
                <p className="text-xs text-zinc-500 mb-5">{job.company_name}</p>

                <div className="space-y-3">
                  {job.location && (
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-zinc-600" /> {job.location}
                    </div>
                  )}
                  {job.job_type && (
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Briefcase className="w-3.5 h-3.5 flex-shrink-0 text-zinc-600" /> {job.job_type}
                    </div>
                  )}
                  {job.salary_min && (
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <TrendingUp className="w-3.5 h-3.5 flex-shrink-0 text-zinc-600" />
                      £{Number(job.salary_min).toLocaleString()} / yr
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0 text-zinc-600" />
                    Posted 20 Mar 2026
                  </div>
                </div>

                {job.description && (
                  <div className="mt-5 pt-4 border-t border-white/5">
                    <p className="text-xs text-zinc-500 mb-2 font-medium">Description</p>
                    <p className="text-xs text-zinc-400 leading-relaxed">{job.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Applications */}
          <div className="lg:col-span-2">
            <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div>
                  <p className="text-sm font-medium text-white">Applications ({applications.length})</p>
                  <p className="text-xs text-zinc-600 mt-0.5">Review and rank candidate applications</p>
                </div>
                <button onClick={handleRankCandidates} disabled={ranking}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-zinc-950 rounded-xl text-sm font-medium hover:bg-zinc-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  {ranking
                    ? <><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Ranking…</>
                    : <><Sparkles className="w-3.5 h-3.5" /> Rank with AI</>}
                </button>
              </div>
              <div className="p-5 space-y-3">
                {applications.map((app) => (
                  <div key={app.id} className="border border-white/5 bg-zinc-800/20 rounded-xl p-4 hover:bg-zinc-800/40 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-zinc-700/60 border border-white/8 flex items-center justify-center text-xs text-zinc-300 font-medium flex-shrink-0">
                          {app.candidate_name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium text-white">{app.candidate_name}</h4>
                            {app.rank_score && (
                              <span className={`text-[10px] border px-2 py-0.5 rounded-full ${getScoreColor(app.rank_score)}`}>
                                Score: {Math.round(app.rank_score)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{app.candidate_email}</span>
                            <span>Applied {app.submitted_at}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {app.rank_rationale && (
                      <div className="bg-zinc-800/40 border border-white/5 rounded-xl p-3 mb-3">
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          <span className="text-white font-medium">AI analysis:</span> {app.rank_rationale}
                        </p>
                      </div>
                    )}

                    {app.candidate_data && (
                      <details className="text-xs mt-2">
                        <summary className="cursor-pointer text-zinc-500 hover:text-zinc-300 transition-colors">
                          View application details
                        </summary>
                        <div className="mt-2 space-y-1 pl-4 pt-2 border-t border-white/5">
                          {Object.entries(app.candidate_data).map(([key, value]: [string, any]) => (
                            <div key={key} className="flex gap-2">
                              <span className="text-zinc-500">{key}:</span>
                              <span className="text-zinc-400">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
