import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, Nunito } from 'next/font/google'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })

export const metadata: Metadata = {
  title: 'CalmPath - Your Mental Wellness Journey',
  description: 'Connect with licensed therapists and psychologists. Track your mood, build healthy habits, and find your path to mental wellness.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#2f9e8f',
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
      <body className={`${inter.variable} ${nunito.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
