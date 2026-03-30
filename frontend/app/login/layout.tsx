import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In',
  description:
    'Connect to the mednode.cloud neural protocol. Sign in as an employer, recruiter, or clinician to access your sovereign healthcare recruitment workspace.',
  alternates: {
    canonical: 'https://mednode.cloud/login',
  },
  openGraph: {
    type: 'website',
    url: 'https://mednode.cloud/login',
    title: 'Sign In | mednode.cloud',
    description:
      'Connect to the mednode.cloud neural protocol. Access your sovereign healthcare recruitment workspace.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'mednode.cloud login' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign In | mednode.cloud',
    description: 'Connect to the mednode.cloud neural protocol.',
    images: ['/og-default.png'],
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
