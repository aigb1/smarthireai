import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recruiter Node — Orchestrator Suite',
  description:
    'High-velocity clinical talent coordination on mednode.cloud. Manage complex NHS hiring requirements with global agentic intelligence and a full settlement ledger.',
  alternates: {
    canonical: 'https://mednode.cloud/discover/recruiter',
  },
  openGraph: {
    type: 'website',
    url: 'https://mednode.cloud/discover/recruiter',
    title: 'Recruiter Node — Orchestrator Suite | mednode.cloud',
    description:
      'High-velocity clinical talent coordination. Manage NHS hiring with global agentic intelligence and settlement ledger.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Recruiter Node — mednode.cloud' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recruiter Node | mednode.cloud',
    description: 'High-velocity clinical talent coordination on mednode.cloud.',
    images: ['/og-default.png'],
  },
}

export default function RecruiterDiscoverLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
