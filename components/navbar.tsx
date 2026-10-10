// ============================================================
// FILE: components/navbar.tsx
// ============================================================

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Trang chủ' },
    { href: '/studio', label: 'Phối đồ' },
    { href: '/studio/customize', label: 'Tùy chỉnh' },
    { href: '/lookbook', label: 'Lookbook' },
    { href: '/mini-game', label: 'Mini-game' },
  ];

  return (
    <header className="sticky top-0 z-40 glass border-b border-[#E5DED0]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 py-3">
        {/* Zone 1: Single text element wordmark */}
        <Link
          href="/"
          className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#1A1A1A] hover:text-[#C8102E] transition-colors whitespace-nowrap shrink-0"
        >
          Việt Phục Remix Studio
        </Link>

        {/* Zone 2: 4-5 concise single-line text nav links */}
        <nav
          className="hidden md:flex items-center gap-6 text-sm font-medium text-[#615F5A]"
          aria-label="Điều hướng chính"
        >
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  isActive
                    ? 'text-[#C8102E] border-[#C8102E] font-semibold'
                    : 'border-transparent hover:text-[#1A1A1A] hover:border-[#D4AF37]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/studio"
            className="btn-primary text-xs sm:text-sm px-4 sm:px-5 py-2.5 min-h-[44px] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Bắt đầu phối đồ</span>
          </Link>
        </div>
      </div>

      {/* Mobile compact navigation strip */}
      <nav
        className="flex md:hidden items-center justify-around border-t border-[#E5DED0]/60 px-2 py-1.5 bg-[#FAF6F0]/95 overflow-x-auto scrollbar-hide"
        aria-label="Điều hướng di động"
      >
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 min-h-[40px] inline-flex items-center ${
                isActive
                  ? 'text-[#C8102E] font-semibold bg-[#C8102E]/10'
                  : 'text-[#615F5A] hover:text-[#1A1A1A]'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
