// ============================================================
// FILE: app/error.tsx
// ============================================================

'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-4">
      <div className="text-4xl">🪷</div>
      <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">
        Đã có sự cố nhỏ xảy ra
      </h2>
      <p className="text-sm text-[#615F5A]">
        {error?.message || 'Vui lòng thử tải lại trang để tiếp tục trải nghiệm.'}
      </p>
      <button
        type="button"
        onClick={reset}
        className="btn-primary inline-flex items-center gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Thử lại ngay</span>
      </button>
    </div>
  );
}
