import React from 'react';
import '../app/globals.css';
import '../app/print.css';
import { NavigationProvider, usePathname } from './shims/next-navigation';
import { Navbar } from '../components/navbar';
import { ToastContainer } from '../components/cultural-decorations';
import LandingPage from '../app/page';
import StudioPage from '../app/studio/page';
import CustomizePage from '../app/studio/customize/page';
import ResultPage from '../app/studio/result/page';
import LookbookPage from '../app/lookbook/page';
import MiniGamePage from '../app/mini-game/page';
import NotFound from '../app/not-found';

function RouteRenderer() {
  const pathname = usePathname();

  if (pathname === '/' || pathname === '') {
    return <LandingPage />;
  }
  if (pathname === '/studio') {
    return <StudioPage />;
  }
  if (pathname === '/studio/customize') {
    return <CustomizePage />;
  }
  if (pathname === '/studio/result') {
    return <ResultPage />;
  }
  if (pathname === '/lookbook') {
    return <LookbookPage />;
  }
  if (pathname === '/mini-game') {
    return <MiniGamePage />;
  }
  return <NotFound />;
}

export default function App() {
  return (
    <NavigationProvider>
      <div className="min-h-screen flex flex-col bg-pattern text-[#1A1A1A]">
        <Navbar />
        <ToastContainer />
        <main className="flex-1">
          <RouteRenderer />
        </main>
        <footer className="border-t border-[#E5DED0] bg-[#FAF6F0] py-8 px-4 sm:px-6 mt-16">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-[#615F5A]">
            <p className="font-serif font-semibold text-[#1A1A1A]">
              Việt Phục Remix Studio · AI Arena Vietnam 2026
            </p>
            <p>Dữ liệu từ Wikipedia và Bảo tàng Phụ nữ Việt Nam</p>
          </div>
        </footer>
      </div>
    </NavigationProvider>
  );
}

