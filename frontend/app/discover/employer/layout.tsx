import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Employer Node — Infrastructure Command',
  description:
    'Deploy your healthcare hiring protocol on mednode.cloud. Eliminate manual screening, post NHS clinical roles instantly, and automate candidate compliance at scale.',
  alternates: {
    canonical: 'https://mednode.cloud/discover/employer',
  },
  openGraph: {
    type: 'website',
    url: 'https://mednode.cloud/discover/employer',
    title: 'Employer Node — Infrastructure Command | mednode.cloud',
    description:
      'Deploy your healthcare hiring protocol. Automate NHS clinical role sourcing with agentic demand intelligence.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Employer Node — mednode.cloud' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Employer Node | mednode.cloud',
    description: 'Deploy your healthcare hiring protocol on mednode.cloud.',
    images: ['/og-default.png'],
  },
}

export default function EmployerDiscoverLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
