import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import { AuthInit } from '@/components/AuthInit'
import { ThemeProvider } from '@/components/ThemeProvider'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0a0a',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://mednode.cloud'),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'mednode',
    statusBarStyle: 'black-translucent',
  },
  title: {
    default: 'mednode.cloud — Neural Recruitment Protocol',
    template: '%s | mednode.cloud',
  },
  description:
    'Sovereign AI recruitment infrastructure for healthcare. Deploy agentic workflows for NHS talent acquisition, compliance, and automated settlement.',
  keywords: [
    'healthcare recruitment',
    'NHS jobs',
    'clinical staffing',
    'AI recruiter',
    'mednode',
    'agentic hiring',
  ],
  alternates: {
    canonical: 'https://mednode.cloud',
  },
  openGraph: {
    type: 'website',
    url: 'https://mednode.cloud',
    siteName: 'mednode.cloud',
    title: 'mednode.cloud — Neural Recruitment Protocol',
    description:
      'Sovereign AI recruitment infrastructure for healthcare. Agentic matching via high-frequency agent swarms.',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'mednode.cloud — Neural Recruitment Protocol',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'mednode.cloud — Neural Recruitment Protocol',
    description:
      'Sovereign AI recruitment infrastructure for healthcare. Agentic matching via high-frequency agent swarms.',
    images: ['/og-default.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.svg" />
        <link rel="icon" type="image/svg+xml" href="/icons/icon-192.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
      </head>
      <body>
        <ThemeProvider />
        <AuthInit />
        {children}
        <Script id="sw-register" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').catch(function(){});
            });
          }
        `}</Script>
      </body>
    </html>
  )
}
