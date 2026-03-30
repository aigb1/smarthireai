import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Clinician Dashboard',
    template: '%s — Clinician | mednode.cloud',
  },
  description:
    'mednode.cloud clinician workspace. Manage your sovereign NHS profile, track active job applications, upload compliance documents, view your schedule, and access your settlement wallet.',
  alternates: {
    canonical: 'https://mednode.cloud/clinician/dashboard',
  },
  openGraph: {
    type: 'website',
    url: 'https://mednode.cloud/clinician/dashboard',
    title: 'Clinician Dashboard | mednode.cloud',
    description:
      'Manage your sovereign NHS clinical profile, applications, documents, schedule, and settlement wallet.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Clinician Dashboard — mednode.cloud' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clinician Dashboard | mednode.cloud',
    description: 'Sovereign NHS clinician protocol workspace on mednode.cloud.',
    images: ['/og-default.png'],
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function ClinicianLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
