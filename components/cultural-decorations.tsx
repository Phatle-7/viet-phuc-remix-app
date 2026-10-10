// ============================================================
// FILE: components/cultural-decorations.tsx
// ============================================================

'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

let toastListeners: ((toasts: ToastMessage[]) => void)[] = [];
let currentToasts: ToastMessage[] = [];

export function showToast(message: string, type: ToastType = 'info') {
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const item: ToastMessage = { id, type, message };
  currentToasts = [...currentToasts, item];
  toastListeners.forEach((fn) => fn(currentToasts));

  setTimeout(() => {
    currentToasts = currentToasts.filter((t) => t.id !== id);
    toastListeners.forEach((fn) => fn(currentToasts));
  }, 3600);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler = (next: ToastMessage[]) => setToasts([...next]);
    toastListeners.push(handler);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== handler);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      role="region"
      aria-label="Thông báo hệ thống"
    >
      {toasts.map((t) => {
        const iconMap = {
          success: <CheckCircle2 className="w-5 h-5 text-[#4CAF50] shrink-0" />,
          error: <XCircle className="w-5 h-5 text-[#F44336] shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-[#FF9800] shrink-0" />,
          info: <Info className="w-5 h-5 text-[#C8102E] shrink-0" />,
        };

        const borderMap = {
          success: 'border-[#4CAF50]/40 bg-[#FAF6F0]',
          error: 'border-[#F44336]/40 bg-[#FAF6F0]',
          warning: 'border-[#FF9800]/40 bg-[#FAF6F0]',
          info: 'border-[#D4AF37]/50 bg-[#FAF6F0]',
        };

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border shadow-lg animate-fade-in ${borderMap[t.type]}`}
          >
            <div className="flex items-center gap-2.5 text-sm font-medium text-[#1A1A1A]">
              {iconMap[t.type]}
              <span>{t.message}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                currentToasts = currentToasts.filter((item) => item.id !== t.id);
                toastListeners.forEach((fn) => fn(currentToasts));
              }}
              className="p-1 rounded-full hover:bg-black/5 text-[#615F5A] transition-colors"
              aria-label="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
