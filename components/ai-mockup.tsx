// ============================================================
// FILE: components/ai-mockup.tsx
// ============================================================

'use client';

import React from 'react';
import { Sparkles, RefreshCw, Download } from 'lucide-react';
import { Outfit, StyleItem } from '../lib/data-loader';

interface AiMockupProps {
  outfit: Outfit;
  style: StyleItem;
  mockupUrl: string | null;
  mockupCaption?: string;
  aiNotes?: string;
  loading: boolean;
  onGenerate: () => void;
}

export function AiMockup({
  outfit,
  style,
  mockupUrl,
  mockupCaption,
  aiNotes,
  loading,
  onGenerate,
}: AiMockupProps) {
  return (
    <section className="card p-6 sm:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="page-eyebrow">AI LOOKBOOK MOCKUP</span>
          <h2 className="section-title mt-1">
            Trực quan hóa Bản phối Việt Phục × Gen Z
          </h2>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={loading}
          className="btn-secondary text-xs sm:text-sm px-4 py-2.5 min-h-[44px] inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{mockupUrl ? 'Tạo lại ảnh phối đồ' : '✨ Tạo ảnh phối đồ'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Card 1: Original Outfit */}
        <div className="flex flex-col rounded-2xl overflow-hidden border border-[#E5DED0] bg-[#FAF6F0]">
          <div className="relative aspect-[4/5] w-full bg-[#EAE2D3] overflow-hidden">
            <img
              src={outfit.thumbnail}
              alt={outfit.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-4 text-white">
              <span className="text-xs uppercase tracking-wider text-[#D4AF37] font-semibold">
                Trang phục nguyên bản
              </span>
              <h3 className="font-serif text-xl font-bold mt-0.5">
                {outfit.name}
              </h3>
            </div>
          </div>
          <div className="p-4 text-xs sm:text-sm text-[#615F5A] flex items-center justify-between">
            <span>Vùng miền: {outfit.region}</span>
            <span>·</span>
            <span>Triều đại: {outfit.dynasty}</span>
          </div>
        </div>

        {/* Card 2: AI Generated Mockup */}
        <div className="flex flex-col rounded-2xl overflow-hidden border-2 border-[#D4AF37]/50 bg-[#FAF6F0]">
          <div className="relative aspect-[4/5] w-full bg-[#F5EDE0] flex items-center justify-center overflow-hidden">
            {loading ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4 skeleton">
                <Sparkles className="w-10 h-10 text-[#C8102E] animate-spin-slow" />
                <p className="font-serif text-lg font-bold text-[#1A1A1A]">
                  Đang phối trang phục theo phong cách {style.name}...
                </p>
                <p className="text-xs text-[#615F5A] max-w-xs">
                  Gemini AI đang kết hợp bảng màu và phụ kiện của bạn thành thẻ Lookbook Studio.
                </p>
              </div>
            ) : mockupUrl ? (
              <>
                <img
                  src={mockupUrl}
                  alt={mockupCaption || `Phối theo phong cách ${style.name}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <a
                  href={mockupUrl}
                  download={`vietphuc-mockup-${outfit.id}.png`}
                  className="absolute top-3 right-3 px-3 py-2 rounded-xl bg-white/90 hover:bg-white text-xs font-semibold text-[#1A1A1A] shadow-md inline-flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#C8102E]" />
                  <span>Tải Mockup</span>
                </a>
              </>
            ) : (
              <div className="p-8 text-center space-y-4">
                <p className="text-sm text-[#615F5A]">
                  Chưa có ảnh phối đồ AI cho tổ hợp này.
                </p>
                <button
                  type="button"
                  onClick={onGenerate}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>✨ Tạo ảnh phối đồ</span>
                </button>
              </div>
            )}
          </div>
          <div className="p-4 flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#C8102E]">
              {mockupCaption || `Phối theo phong cách ${style.name}`}
            </span>
            {aiNotes && (
              <p className="text-xs text-[#615F5A] line-clamp-2">{aiNotes}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
