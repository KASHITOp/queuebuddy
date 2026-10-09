import type { Metadata, Viewport } from 'next';
import { Archivo, Onest, Martian_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';

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
    icon: '/icons/icon.svg',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f59e0b',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${archivo.variable} ${onest.variable} ${martianMono.variable} font-sans antialiased bg-[#080b11] text-slate-100 selection:bg-amber-400 selection:text-black`}
      >
        <AuthProvider>
          <AppProvider>{children}</AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
