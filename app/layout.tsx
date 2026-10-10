// ============================================================
// FILE: app/layout.tsx
// ============================================================

import React from 'react';
import type { Metadata } from 'next';
import { Spectral, Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
import './print.css';
import { Navbar } from '../components/navbar';
import { ToastContainer } from '../components/cultural-decorations';

const spectral = Be_Vietnam_Pro({
  variable: '--font-spectral',
  subsets: ['latin', 'vietnamese'],
  weight: ['500', '600', '700', '800'],
  display: 'swap',
});

const beVietnam = Be_Vietnam_Pro({
  variable: '--font-be-vietnam',
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Việt Phục Remix Studio — Mặc nét Việt, giữ chất riêng',
  description:
    'Tự phối trang phục truyền thống Việt Nam theo phong cách Gen Z, kèm gợi ý văn hóa từ AI.',
  keywords: [
    'áo dài',
    'việt phục',
    'trang phục truyền thống',
    'AI Arena',
    'Gen Z',
  ],
  openGraph: {
    title: 'Việt Phục Remix Studio',
    description: 'Tự phối Việt phục theo phong cách của bạn.',
    type: 'website',
    locale: 'vi_VN',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Việt Phục Remix Studio',
    description: 'Tự phối Việt phục theo phong cách của bạn.',
    images: ['/og-image.svg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${spectral.variable} ${beVietnam.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Spectral:ital,wght@0,500;0,600;0,700;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${spectral.variable} ${beVietnam.variable} font-sans antialiased min-h-screen flex flex-col bg-pattern text-[#1A1A1A]`}
      >
        <Navbar />
        <ToastContainer />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[#E5DED0] bg-[#FAF6F0] py-8 px-4 sm:px-6 mt-16">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-[#615F5A]">
            <p className="font-serif font-semibold text-[#1A1A1A]">
              Việt Phục Remix Studio · AI Arena Vietnam 2026
            </p>
            <p>Dữ liệu từ Wikipedia và Bảo tàng Phụ nữ Việt Nam</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
