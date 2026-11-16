import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-sans'
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-mono'
});

export const metadata: Metadata = {
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
  themeColor: '#0f0f14',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen bg-background`}>
        {children}
      </body>
    </html>
  )
}
