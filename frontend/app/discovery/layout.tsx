import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Live Node Map — Protocol Activity',
  description:
    'Real-time view of the mednode.cloud protocol mesh. Monitor active NHS recruitment nodes, live clinician matches, and agent swarm activity across the UK healthcare network.',
  alternates: {
    canonical: 'https://mednode.cloud/discovery',
  },
  openGraph: {
    type: 'website',
    url: 'https://mednode.cloud/discovery',
    title: 'Live Node Map | mednode.cloud',
    description:
      'Real-time view of the mednode.cloud protocol mesh. Monitor active NHS recruitment nodes and agent swarm activity.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Live Node Map — mednode.cloud' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Node Map | mednode.cloud',
    description: 'Real-time view of the mednode.cloud protocol mesh.',
    images: ['/og-default.png'],
  },
}

export default function DiscoveryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
