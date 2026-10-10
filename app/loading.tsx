// ============================================================
// FILE: app/loading.tsx
// ============================================================

import React from 'react';
import { LotusSeal } from '../components/song-linh-art';

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <LotusSeal className="w-20 h-20 mb-4" />
      <p className="font-serif text-xl font-bold text-[#1A1A1A]">
        Đang tải không gian Việt Phục...
      </p>
    </div>
  );
}
