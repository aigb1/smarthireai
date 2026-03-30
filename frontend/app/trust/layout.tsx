import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Trust Protocol — Compliance & Verification',
  description:
    'mednode.cloud trust and compliance framework. NHS-grade verification, GDPR data sovereignty, CQC audit trails, and cryptographic credential anchoring for every clinical role.',
  alternates: {
    canonical: 'https://mednode.cloud/trust',
  },
  openGraph: {
    type: 'website',
    url: 'https://mednode.cloud/trust',
    title: 'Trust Protocol | mednode.cloud',
    description:
      'NHS-grade verification, GDPR data sovereignty, and cryptographic credential anchoring for clinical roles.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Trust Protocol — mednode.cloud' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trust Protocol | mednode.cloud',
    description: 'NHS-grade compliance and verification on mednode.cloud.',
    images: ['/og-default.png'],
  },
}

export default function TrustLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
