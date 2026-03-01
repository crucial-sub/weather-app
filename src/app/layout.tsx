import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { QueryProvider } from '@/app/providers';
import { Toaster } from '@/shared/ui/sonner';
import { RegisterServiceWorker } from '@/shared/lib';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '날씨 앱',
  description: '현재 위치 기반 날씨 정보 및 즐겨찾기 기능을 제공하는 날씨 앱',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '날씨 앱',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    title: '날씨 앱',
    description: '현재 위치 기반 날씨 정보 및 즐겨찾기 기능을 제공하는 날씨 앱',
    siteName: '날씨 앱',
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} antialiased`}>
        <QueryProvider>
          {children}
          <Toaster position="top-center" />
          <RegisterServiceWorker />
        </QueryProvider>
      </body>
    </html>
  );
}
