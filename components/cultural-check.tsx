// ============================================================
// FILE: components/cultural-check.tsx
// ============================================================

'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Lightbulb,
  RefreshCw,
} from 'lucide-react';
import { CulturalCheckResult } from '../lib/rule-engine';

interface CulturalCheckProps {
  result: CulturalCheckResult | null;
  loading: boolean;
  onRecheck?: () => void;
}

export function CulturalCheck({
  result,
  loading,
  onRecheck,
}: CulturalCheckProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (!result || loading) {
      setAnimatedScore(0);
      return;
    }

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setAnimatedScore(result.score);
      return;
    }

    const totalSteps = 30;
    const stepTime = 1200 / totalSteps; // 1.2s total
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep += 1;
      const progress = currentStep / totalSteps;
      const nextVal = Math.round(result.score * progress * 10) / 10;
      setAnimatedScore(nextVal);

      if (currentStep >= totalSteps) {
        setAnimatedScore(result.score);
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [result, loading]);

  if (loading || !result) {
    return (
      <section
        className="card border-2 border-[#D4AF37]/30 p-6 sm:p-8 animate-fade-in"
        aria-busy="true"
      >
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <span className="page-eyebrow">AI CULTURAL CHECK</span>
            <h2 className="section-title mt-1">
              Đang phân tích chuẩn mực văn hóa...
            </h2>
          </div>
          <div className="w-16 h-16 rounded-full skeleton" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-36 rounded-2xl skeleton" />
          <div className="h-36 rounded-2xl skeleton" />
          <div className="h-36 rounded-2xl skeleton" />
        </div>
      </section>
    );
  }

  const statusConfig = {
    perfect: {
      label: '✅ Hoàn hảo',
      color: '#4CAF50',
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    },
    good: {
      label: '👍 Tốt',
      color: '#2D3561',
      bg: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    },
    warning: {
      label: '⚠️ Cần chú ý',
      color: '#FF9800',
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
    },
    error: {
      label: '❌ Sai lệch',
      color: '#F44336',
      bg: 'bg-red-50 border-red-200 text-red-800',
    },
  }[result.status];

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset =
    circumference - (Math.min(10, animatedScore) / 10) * circumference;

  return (
    <section className="card border-2 border-[#D4AF37]/30 p-6 sm:p-8 animate-fade-in">
      {/* Header + Score Ring */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E5DED0]">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold tracking-wider uppercase text-[#C8102E]">
            <Sparkles className="w-4 h-4" />
            <span>KIỂM DUYỆT VĂN HÓA CÙNG GEMINI AI</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#615F5A]">
              {result.source === 'ai' ? 'Gemini AI + 247 Rules' : 'Rule Engine 247 Rules'}
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
            Đánh giá Độ Phù Hợp Văn Hóa & Sự Kiện
          </h2>
          {result.explanation && (
            <p className="text-sm sm:text-base text-[#615F5A] leading-relaxed">
              {result.explanation}
            </p>
          )}
        </div>

        {/* Circular SVG Score Meter */}
        <div className="flex items-center gap-5 self-start md:self-center shrink-0">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="#E5DED0"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke={statusConfig.color}
                strokeWidth="10"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-all duration-150"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-serif text-3xl font-bold text-[#1A1A1A] tabular-nums">
                {animatedScore.toFixed(1)}
              </span>
              <span className="text-xs text-[#615F5A] font-medium">/ 10 điểm</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span
              className={`inline-flex items-center px-3.5 py-1.5 rounded-xl border text-sm font-semibold ${statusConfig.bg}`}
            >
              {statusConfig.label}
            </span>
            {onRecheck && (
              <button
                type="button"
                onClick={onRecheck}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#615F5A] hover:text-[#C8102E] transition-colors py-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Chấm điểm lại</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3 Columns Feedback */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
        {/* Column 1: Positives (Emerald) */}
        <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
          <div className="flex items-center gap-2 text-emerald-800 font-serif font-bold text-lg mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <h3>Điểm phù hợp ({result.positives.length})</h3>
          </div>
          <ul className="space-y-2.5 text-sm text-[#1A1A1A]">
            {result.positives.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-emerald-600 font-bold mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 2: Concerns (Amber) */}
        <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
          <div className="flex items-center gap-2 text-amber-900 font-serif font-bold text-lg mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <h3>Cần chú ý ({result.concerns.length})</h3>
          </div>
          {result.concerns.length === 0 ? (
            <p className="text-sm text-amber-900/80 leading-relaxed">
              Không phát hiện xung đột văn hóa hay điều cấm kỵ nào trong bản phối của bạn.
            </p>
          ) : (
            <ul className="space-y-2.5 text-sm text-[#1A1A1A]">
              {result.concerns.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-amber-600 font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Column 3: Suggestions (Sky) */}
        <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200/80">
          <div className="flex items-center gap-2 text-sky-900 font-serif font-bold text-lg mb-3">
            <Lightbulb className="w-5 h-5 text-sky-600 shrink-0" />
            <h3>Gợi ý nâng tầm ({result.suggestions.length})</h3>
          </div>
          {result.suggestions.length === 0 ? (
            <p className="text-sm text-sky-900/80 leading-relaxed">
              Bản phối đã sẵn sàng để bạn tự tin diện trong sự kiện!
            </p>
          ) : (
            <ul className="space-y-2.5 text-sm text-[#1A1A1A]">
              {result.suggestions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-sky-600 font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
