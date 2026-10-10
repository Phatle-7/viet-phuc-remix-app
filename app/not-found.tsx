// ============================================================
// FILE: app/not-found.tsx
// ============================================================

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-4">
      <div className="text-5xl">🏮</div>
      <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">
        Không tìm thấy trang
      </h1>
      <p className="text-sm text-[#615F5A]">
        Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
      </p>
      <Link href="/" className="btn-primary inline-flex items-center">
        Quay về Trang chủ
      </Link>
    </div>
  );
}
