import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
})

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Stock Screener: long, short or neutral signals for any stock',
  description:
    'Search a ticker or company name to get a long, short or neutral signal with a confidence score, plus the technical, fundamental and momentum analysis behind it.',
  keywords: ['stock screener', 'stock analysis', 'short candidates', 'technical analysis'],
  openGraph: {
    title: 'Stock Screener',
    description:
      'A long, short or neutral signal with a confidence score and the analysis behind it, for any stock you search.',
    type: 'website',
    siteName: 'Stock Screener',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stock Screener',
    description:
      'A long, short or neutral signal with a confidence score and the analysis behind it, for any stock you search.',
  },
}

export const viewport: Viewport = {
  themeColor: '#fafaf8',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${plexSans.variable} ${plexMono.variable} font-sans antialiased min-h-screen bg-background text-[14px]`}>
        {children}
      </body>
    </html>
  )
}
