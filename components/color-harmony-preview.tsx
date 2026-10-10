// ============================================================
// FILE: components/color-harmony-preview.tsx
// ============================================================

'use client';

import React from 'react';
import { Palette, Check, AlertCircle } from 'lucide-react';
import { analyzeColorHarmony } from '../lib/color-harmony';

interface ColorHarmonyPreviewProps {
  colors: string[];
  outfitId: string;
  eventId?: string;
}

export function ColorHarmonyPreview({
  colors,
  outfitId,
  eventId,
}: ColorHarmonyPreviewProps) {
  if (colors.length === 0) return null;

  const analysis = analyzeColorHarmony(colors, outfitId, eventId);

  return (
    <div className="card-elegant p-5 sm:p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DED0]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C8102E]/10 flex items-center justify-center text-[#C8102E]">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
              Phân tích Hài hòa Màu sắc
            </h3>
            <p className="text-xs sm:text-sm text-[#615F5A]">
              Kiểu phối: <span className="font-semibold text-[#2D3561]">{analysis.harmonyType}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-right">
            <span className="block text-xs text-[#615F5A]">Điểm hài hòa</span>
            <span className="font-serif text-2xl font-bold text-[#C8102E] tabular-nums">
              {analysis.score}/100
            </span>
          </div>
          <div className="flex -space-x-2">
            {analysis.colorDetails.map((c) => (
              <span
                key={c.hex}
                className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: c.hex }}
                title={`${c.name} (${c.hex})`}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="text-sm text-[#1A1A1A] mt-4 leading-relaxed">
        {analysis.summary}
      </p>

      {/* Individual color symbolism */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {analysis.colorDetails.map((detail) => (
          <div
            key={detail.hex}
            className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF6F0] border border-[#E5DED0]"
          >
            <span
              className="w-6 h-6 rounded-full shrink-0 border border-black/15 mt-0.5"
              style={{ backgroundColor: detail.hex }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-[#1A1A1A] truncate">
                  {detail.name}
                </span>
                {detail.isBestForOutfit && (
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[#4CAF50] shrink-0">
                    <Check className="w-3.5 h-3.5" /> Hợp chuẩn
                  </span>
                )}
                {detail.isAvoidedForOutfit && (
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[#FF9800] shrink-0">
                    <AlertCircle className="w-3.5 h-3.5" /> Lưu ý
                  </span>
                )}
              </div>
              <p className="text-xs text-[#615F5A] mt-0.5 line-clamp-2">
                {detail.symbolism}
              </p>
            </div>
          </div>
        ))}
      </div>

      {analysis.avoidedConflicts.length > 0 && (
        <div className="mt-4 p-3.5 rounded-xl bg-[#FF9800]/10 border border-[#FF9800]/30 text-xs sm:text-sm text-[#1A1A1A] flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#FF9800] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Lưu ý văn hóa: </span>
            {analysis.avoidedConflicts.join(' · ')}
          </div>
        </div>
      )}
    </div>
  );
}
