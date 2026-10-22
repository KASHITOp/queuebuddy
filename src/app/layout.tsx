import type { Metadata, Viewport } from 'next';
import { Archivo, Onest, Martian_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { PwaInstallPrompt } from '@/components/pwa/PwaInstallPrompt';

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
});

const onest = Onest({
  subsets: ['latin'],
  variable: '--font-onest',
  display: 'swap',
});

const martianMono = Martian_Mono({
  subsets: ['latin'],
  variable: '--font-martian-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'QueueBuddy – Bengaluru | Verified Line Assistance',
  description:
    'Book a verified Queue Buddy to hold your spot at RTO, Sub-Registrar, PSK, and Civic offices in Bengaluru. Arrive when your turn is near.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'QueueBuddy',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#09090B',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="QueueBuddy" />
      </head>
      <body
        className={`${archivo.variable} ${onest.variable} ${martianMono.variable} font-sans antialiased bg-night text-ink selection:bg-brand selection:text-night`}
      >
        <AuthProvider>
          <AppProvider>
            {children}
            <PwaInstallPrompt />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
