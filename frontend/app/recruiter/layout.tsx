import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Recruiter Dashboard',
    template: '%s — Recruiter | mednode.cloud',
  },
  description:
    'mednode.cloud recruiter workspace. Search NHS clinical talent, manage candidate pipelines, track bookmarks, and run high-frequency agent swarms for healthcare placement at scale.',
  alternates: {
    canonical: 'https://mednode.cloud/recruiter/dashboard',
  },
  openGraph: {
    type: 'website',
    url: 'https://mednode.cloud/recruiter/dashboard',
    title: 'Recruiter Dashboard | mednode.cloud',
    description:
      'Search NHS clinical talent and manage candidate pipelines with agentic intelligence on mednode.cloud.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Recruiter Dashboard — mednode.cloud' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recruiter Dashboard | mednode.cloud',
    description: 'Sovereign NHS recruiter orchestration suite on mednode.cloud.',
    images: ['/og-default.png'],
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
