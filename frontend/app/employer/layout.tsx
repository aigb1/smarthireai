import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Employer Dashboard',
    template: '%s — Employer | mednode.cloud',
  },
  description:
    'mednode.cloud employer workspace. Manage NHS clinical job postings, review shortlisted candidates, track applications, and access recruitment analytics — all in one sovereign protocol dashboard.',
  alternates: {
    canonical: 'https://mednode.cloud/employer/dashboard',
  },
  openGraph: {
    type: 'website',
    url: 'https://mednode.cloud/employer/dashboard',
    title: 'Employer Dashboard | mednode.cloud',
    description:
      'Manage NHS clinical job postings, review candidates, and track applications in your sovereign employer workspace.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Employer Dashboard — mednode.cloud' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Employer Dashboard | mednode.cloud',
    description: 'Sovereign NHS employer recruitment workspace on mednode.cloud.',
    images: ['/og-default.png'],
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
