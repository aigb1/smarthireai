import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clinician Node — Sovereign Identity Protocol',
  description:
    'Own your clinical credentials on mednode.cloud. NHS-verified sovereign identity, automated job matching, and direct mesh connectivity for doctors, nurses, and allied health professionals.',
  alternates: {
    canonical: 'https://mednode.cloud/discover/clinician',
  },
  openGraph: {
    type: 'website',
    url: 'https://mednode.cloud/discover/clinician',
    title: 'Clinician Node — Sovereign Identity Protocol | mednode.cloud',
    description:
      'Own your clinical credentials. NHS-verified sovereign identity and automated job matching for healthcare professionals.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Clinician Node — mednode.cloud' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clinician Node | mednode.cloud',
    description: 'Own your clinical credentials on mednode.cloud.',
    images: ['/og-default.png'],
  },
}

export default function ClinicianDiscoverLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
