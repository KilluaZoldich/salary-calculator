import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast'
import { DebugPanel } from '@/components/debug-panel'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
}

export const metadata: Metadata = {
  title: 'Salary Calculator',
  description: 'Calculate your salary including overtime and allowances',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Salary Calculator',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

type RootLayoutProps = {
  children: React.ReactNode;
  params: { locale: string };
}

export default function RootLayout({
  children,
  params: { locale = 'en' }
}: RootLayoutProps) {
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <ToastProvider>
          <div className="min-h-screen bg-background">
            {children}
            {process.env.NODE_ENV === 'development' && <DebugPanel />}
          </div>
        </ToastProvider>
      </body>
    </html>
  )
}
