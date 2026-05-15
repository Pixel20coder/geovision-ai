import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, DM_Serif_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-jetbrains'
})

const dmSerifDisplay = DM_Serif_Display({ 
  subsets: ["latin"],
  weight: "400",
  variable: '--font-dm-serif'
})

export const metadata: Metadata = {
  title: 'GeoVision AI | Spatial Intelligence for Railways & Smart Cities',
  description: 'AI-Powered Geospatial Intelligence Platform for Indian Railways and Urban Infrastructure Monitoring. Real-time satellite analysis, drone monitoring, and DIGIT registry integration.',
  generator: 'v0.app',
  keywords: ['geospatial', 'AI', 'railways', 'smart cities', 'infrastructure', 'satellite', 'drone monitoring'],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-[#050505]">
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${dmSerifDisplay.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
