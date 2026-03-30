import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fee Structure — Protocol Pricing',
  description:
    'Transparent pricing for the mednode.cloud neural recruitment protocol. Per-placement settlement, agent swarm licensing, and sovereign node subscription tiers for NHS employers and clinical recruiters.',
  alternates: {
    canonical: 'https://mednode.cloud/pricing',
  },
  openGraph: {
    type: 'website',
    url: 'https://mednode.cloud/pricing',
    title: 'Fee Structure | mednode.cloud',
    description:
      'Transparent pricing for the mednode.cloud protocol. Per-placement settlement and agent swarm licensing.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Fee Structure — mednode.cloud' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fee Structure | mednode.cloud',
    description: 'Transparent pricing for the mednode.cloud neural recruitment protocol.',
    images: ['/og-default.png'],
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
