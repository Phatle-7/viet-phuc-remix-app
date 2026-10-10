// ============================================================
// FILE: app/page.tsx
// ============================================================

'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  BookOpen,
  ShieldCheck,
  Palette,
  ArrowRight,
  Gamepad2,
  BookmarkCheck,
} from 'lucide-react';
import { getAllOutfits } from '../lib/data-loader';
import { LotusSeal } from '../components/song-linh-art';

export default function LandingPage() {
  const featuredOutfits = getAllOutfits().slice(0, 4);

  return (
    <div className="bg-pattern">
      {/* SECTION 1: HERO (min-h-[80vh]) */}
      <section className="relative min-h-[80vh] flex items-center py-12 sm:py-20 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left 7 columns: Editorial Hero Copy */}
          <div className="lg:col-span-7 space-y-6 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <span className="page-eyebrow">AI Arena Vietnam 2026</span>
              <span className="text-[#615F5A]" aria-hidden="true">
                ·
              </span>
              <span className="text-xs font-medium text-[#615F5A]">
                Di sản Việt Phục × Thẩm mỹ Gen Z
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1A1A1A] leading-[1.12] text-balance">
              Việt Phục Remix Studio
              <span className="block text-2xl sm:text-3xl lg:text-4xl text-[#C8102E] mt-3 font-semibold">
                Mặc nét Việt. Giữ chất riêng.
              </span>
            </h1>

            <p className="page-lede max-w-2xl">
              Tự phối Việt phục theo phong cách của bạn qua 23 trang phục truyền thống,
              10 sự kiện văn hóa và 17 xu hướng Gen Z. Tích hợp trợ lý Gemini AI chấm điểm
              chuẩn mực văn hóa, tạo ảnh Lookbook và thử đồ ảo ngay tức thì.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/studio"
                className="btn-primary text-base px-7 py-3.5 min-h-[48px] inline-flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>✨ Bắt đầu phối đồ</span>
              </Link>
              <a
                href="#features"
                className="btn-secondary text-base px-6 py-3.5 min-h-[48px] inline-flex items-center gap-2"
              >
                <span>▶ Tìm hiểu thêm</span>
              </a>
            </div>

            {/* Quiet inline cultural metadata */}
            <div className="pt-4 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#615F5A]">
              <span>Áo dài</span>
              <span aria-hidden="true">·</span>
              <span>Áo nhật bình</span>
              <span aria-hidden="true">·</span>
              <span>Áo tấc</span>
              <span aria-hidden="true">·</span>
              <span>Áo ngũ thân</span>
              <span aria-hidden="true">·</span>
              <span>Áo tứ thân</span>
              <span aria-hidden="true">·</span>
              <span>Trang phục 54 dân tộc</span>
            </div>
          </div>

          {/* Right 5 columns: Visual Curated Showcase Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4 animate-fade-in">
            {featuredOutfits.map((item, idx) => (
              <Link
                key={item.id}
                href={`/studio?outfit=${item.id}`}
                className={`group card overflow-hidden flex flex-col ${
                  idx % 2 === 1 ? 'sm:translate-y-5' : ''
                }`}
              >
                <div className="relative aspect-[3/4] w-full bg-[#EAE2D3] overflow-hidden">
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 inset-x-3 text-white">
                    <span className="text-[11px] uppercase tracking-wider text-[#D4AF37] font-semibold">
                      {item.dynasty} · {item.region}
                    </span>
                    <h3 className="font-serif text-base sm:text-lg font-bold leading-snug">
                      {item.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: FEATURES (3 Cards Grid md:grid-cols-3) */}
      <section id="features" className="py-14 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="page-eyebrow">TRẢI NGHIỆM THÔNG MINH</span>
          <h2 className="section-title">
            Ba trụ cột kết nối Di sản & Thế hệ trẻ
          </h2>
          <p className="text-sm sm:text-base text-[#615F5A]">
            Giúp bạn tự tin diện cổ phục và Việt phục đúng hoàn cảnh, hợp thời tiết mà vẫn trọn vẹn cá tính riêng.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="card-elegant p-6 sm:p-8 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#C8102E]/10 text-[#C8102E] flex items-center justify-center text-2xl">
                🎨
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">
                Phối theo ngữ cảnh
              </h3>
              <p className="text-sm sm:text-base text-[#615F5A] leading-relaxed">
                Lọc Việt phục thông minh theo 4 kiểu thời tiết, 10 sự kiện văn hóa
                (Kỷ yếu, Lễ Tết, Đi chùa, Đám cưới, Cafe...) và 17 phong cách Gen Z.
              </p>
            </div>
            <div className="pt-2 text-xs font-semibold text-[#C8102E] flex items-center gap-1">
              <Palette className="w-4 h-4" />
              <span>Bảng 12 sắc màu truyền thống & 30 phụ kiện</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="card-elegant p-6 sm:p-8 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#2D3561]/10 text-[#2D3561] flex items-center justify-center text-2xl">
                📚
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">
                Hiểu điều mình mặc
              </h3>
              <p className="text-sm sm:text-base text-[#615F5A] leading-relaxed">
                Mỗi trang phục và phụ kiện đều đính kèm Thẻ Văn Hóa từ dữ liệu Wikipedia
                và Bảo tàng Phụ nữ Việt Nam: triều đại, vùng miền, ý nghĩa từng tà áo.
              </p>
            </div>
            <div className="pt-2 text-xs font-semibold text-[#2D3561] flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>Tra cứu lịch sử & thử sức cùng Mini-game</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="card-elegant border-2 border-[#D4AF37] p-6 sm:p-8 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/20 text-[#B8941F] flex items-center justify-center text-2xl">
                  🤖
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#B8941F]">
                  ✦ AI HỖ TRỢ
                </span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">
                Kiểm tra trước khi chọn
              </h3>
              <p className="text-sm sm:text-base text-[#615F5A] leading-relaxed">
                Gemini AI đối chiếu 247 quy tắc văn hóa để chấm điểm 0–10, cảnh báo
                các lỗi lệch vùng miền, tạo AI Mockup và ghép thử đồ với ảnh chân dung của bạn.
              </p>
            </div>
            <div className="pt-2 text-xs font-semibold text-[#B8941F] flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              <span>AI Cultural Check · AI Mockup · AI Try-On</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: STATS (vp-indigo bg, white text) */}
      <section className="bg-[#2D3561] text-white py-14 sm:py-16 px-4 sm:px-6 my-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <div className="font-serif text-4xl sm:text-5xl font-bold text-[#D4AF37] tabular-nums">
              23
            </div>
            <div className="text-sm sm:text-base font-medium text-white/90">
              Việt phục truyền thống
            </div>
            <div className="text-xs text-white/65">
              Cổ truyền · Vùng miền · Dân tộc
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-serif text-4xl sm:text-5xl font-bold text-[#D4AF37] tabular-nums">
              10
            </div>
            <div className="text-sm sm:text-base font-medium text-white/90">
              Sự kiện văn hóa
            </div>
            <div className="text-xs text-white/65">
              Lễ Tết · Kỷ yếu · Đền chùa · Cưới hỏi
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-serif text-4xl sm:text-5xl font-bold text-[#D4AF37] tabular-nums">
              17
            </div>
            <div className="text-sm sm:text-base font-medium text-white/90">
              Phong cách Gen Z
            </div>
            <div className="text-xs text-white/65">
              Cổ điển · Y2K · Vintage · Dark Academia
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-serif text-4xl sm:text-5xl font-bold text-[#D4AF37] tabular-nums">
              247
            </div>
            <div className="text-sm sm:text-base font-medium text-white/90">
              Quy tắc văn hóa
            </div>
            <div className="text-xs text-white/65">
              Kiểm chứng riêng cho từng trang phục
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: FINAL CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <div className="card-elegant p-8 sm:p-14 space-y-6">
          <div className="flex justify-center">
            <LotusSeal className="w-20 h-20" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A] text-balance">
            Tạo một bản phối mang dấu ấn của bạn
          </h2>
          <p className="text-sm sm:text-base text-[#615F5A] max-w-xl mx-auto leading-relaxed">
            Chỉ với 3 bước chọn lựa đơn giản, bạn sẽ có ngay Lookbook Việt phục chuẩn văn hóa,
            kèm điểm số đánh giá từ AI và trải nghiệm thử đồ trực quan.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/studio"
              className="btn-primary text-base px-8 py-4 min-h-[48px] inline-flex items-center gap-2"
            >
              <span>Bắt đầu phối đồ ngay</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/lookbook"
              className="btn-ghost text-sm sm:text-base px-6 py-3.5 min-h-[48px] inline-flex items-center gap-2"
            >
              <BookmarkCheck className="w-4 h-4 text-[#C8102E]" />
              <span>Xem Lookbook</span>
            </Link>
            <Link
              href="/mini-game"
              className="btn-ghost text-sm sm:text-base px-6 py-3.5 min-h-[48px] inline-flex items-center gap-2"
            >
              <Gamepad2 className="w-4 h-4 text-[#2D3561]" />
              <span>Thử tài Mini-game</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
