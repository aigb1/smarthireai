import { DEMO_JOBS } from '@/lib/demo'
import JobDetailClient from './JobDetailClient'

export function generateStaticParams() {
  return DEMO_JOBS.map(j => ({ id: j.id }))
}

export default function JobDetailsPage({ params }: { params: { id: string } }) {
  return <JobDetailClient id={params.id} />
}
