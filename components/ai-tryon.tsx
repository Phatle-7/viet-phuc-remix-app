// ============================================================
// FILE: components/ai-tryon.tsx
// ============================================================

'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Upload,
  Sparkles,
  X,
  Download,
  RefreshCw,
  ShieldCheck,
  Bookmark,
  ArrowRight,
} from 'lucide-react';
import { validateAndCompressImage } from '../lib/image-helpers';
import { showToast } from './cultural-decorations';

interface AiTryOnProps {
  outfitName: string;
  styleName: string;
  tryOnResultUrl: string | null;
  fitAnalysis?: string;
  loading: boolean;
  onRunTryOn: (userImageBase64: string) => void;
  onSaveLookbook: () => void;
}

const PROGRESS_STEPS = [
  'Đang phân tích trang phục...',
  'Đang điều chỉnh tư thế & ánh sáng...',
  'Đang hoàn thiện chi tiết Việt phục...',
];

export function AiTryOn({
  outfitName,
  styleName,
  tryOnResultUrl,
  fitAnalysis,
  loading,
  onRunTryOn,
  onSaveLookbook,
}: AiTryOnProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [progressIdx, setProgressIdx] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!loading) {
      setProgressIdx(0);
      return;
    }
    const interval = setInterval(() => {
      setProgressIdx((prev) => (prev + 1) % PROGRESS_STEPS.length);
    }, 1100);
    return () => clearInterval(interval);
  }, [loading]);

  const handleFileChange = async (file: File | undefined) => {
    if (!file) return;
    const validated = await validateAndCompressImage(file);
    if (!validated.valid || !validated.dataUrl) {
      showToast(validated.error || 'Ảnh không hợp lệ', 'error');
      return;
    }
    setUploadedImage(validated.dataUrl);
    showToast('Đã tải ảnh chân dung lên thành công!', 'success');
  };

  return (
    <section className="card-elegant border-2 border-[#D4AF37] p-6 sm:p-8 animate-fade-in">
      {/* Header with MỚI Gold Accent */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B8941F]">
            <span>✨ TÍNH NĂNG NỔI BẬT · MỚI</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
            Thử đồ với ảnh của bạn (AI Virtual Try-On)
          </h2>
          <p className="text-sm text-[#615F5A]">
            Upload ảnh chân dung, Gemini AI sẽ ghép và phân tích diện mạo của bạn trong bộ{' '}
            <strong className="text-[#1A1A1A]">{outfitName}</strong> phối theo phong cách{' '}
            <strong className="text-[#C8102E]">{styleName}</strong>.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs text-[#615F5A] bg-[#FAF6F0] px-3.5 py-2 rounded-xl border border-[#E5DED0]">
          <ShieldCheck className="w-4 h-4 text-[#4CAF50] shrink-0" />
          <span>Ảnh của bạn chỉ được dùng để thử đồ và không được lưu trữ</span>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFileChange(e.target.files?.[0])}
      />

      {/* State 1: Empty Upload Zone */}
      {!uploadedImage && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            handleFileChange(e.dataTransfer.files?.[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              fileInputRef.current?.click();
            }
          }}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-10 text-center transition-all ${
            dragActive
              ? 'border-[#C8102E] bg-[#C8102E]/5'
              : 'border-[#D4AF37]/60 hover:border-[#C8102E] bg-[#FAF6F0]/70'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-[#C8102E]/10 text-[#C8102E] flex items-center justify-center mx-auto mb-4">
            <Upload className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#1A1A1A] mb-1">
            Kéo thả ảnh chân dung vào đây hoặc bấm để chọn ảnh
          </h3>
          <p className="text-xs sm:text-sm text-[#615F5A] max-w-md mx-auto">
            Hỗ trợ định dạng JPG, PNG, WebP (tối đa 5MB). Nên chọn ảnh chụp rõ khuôn mặt và nửa thân trên dưới ánh sáng tự nhiên.
          </p>
        </div>
      )}

      {/* State 2: Uploaded & Ready / Generating / Result */}
      {uploadedImage && (
        <div className="space-y-6">
          {/* If not yet generated or currently generating */}
          {!tryOnResultUrl && (
            <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-[#FAF6F0] border border-[#E5DED0]">
              <div className="relative w-48 h-48 rounded-2xl overflow-hidden border-2 border-[#D4AF37] shrink-0">
                <img
                  src={uploadedImage}
                  alt="Ảnh chân dung xem trước"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setUploadedImage(null)}
                  disabled={loading}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors"
                  aria-label="Xóa ảnh đã chọn"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 space-y-4 text-center sm:text-left">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#4CAF50]">
                    ✓ Ảnh đã sẵn sàng
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#1A1A1A] mt-0.5">
                    Sẵn sàng thử bộ {outfitName}
                  </h3>
                  <p className="text-sm text-[#615F5A] mt-1">
                    Bấm nút bên dưới để AI phân tích khuôn mặt, ánh sáng và tạo bản xem trước.
                  </p>
                </div>

                {loading ? (
                  <div className="p-4 rounded-xl bg-white border border-[#D4AF37]/40 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-[#C8102E] animate-spin" />
                    <span className="text-sm font-medium text-[#1A1A1A]">
                      {PROGRESS_STEPS[progressIdx]}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <button
                      type="button"
                      onClick={() => onRunTryOn(uploadedImage)}
                      className="btn-primary inline-flex items-center gap-2 min-h-[44px]"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>✨ Thử đồ ngay</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-ghost text-sm min-h-[44px]"
                    >
                      Đổi ảnh khác
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* State 3: Side-by-side Try-On Result */}
          {tryOnResultUrl && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                {/* Original photo */}
                <div className="rounded-2xl overflow-hidden border border-[#E5DED0] bg-[#FAF6F0]">
                  <div className="aspect-[4/5] w-full overflow-hidden">
                    <img
                      src={uploadedImage}
                      alt="Ảnh chân dung gốc"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 text-center text-xs font-medium text-[#615F5A]">
                    Ảnh chân dung gốc của bạn
                  </div>
                </div>

                {/* Arrow divider */}
                <div className="flex items-center justify-center py-2">
                  <div className="w-10 h-10 rounded-full bg-[#C8102E]/10 text-[#C8102E] flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 rotate-90 md:rotate-0" />
                  </div>
                </div>

                {/* Try-on result photo */}
                <div className="rounded-2xl overflow-hidden border-2 border-[#C8102E] bg-[#FAF6F0] shadow-md">
                  <div className="aspect-[4/5] w-full overflow-hidden">
                    <img
                      src={tryOnResultUrl}
                      alt={`Ảnh thử đồ ${outfitName}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 text-center text-xs font-semibold text-[#C8102E]">
                    ✨ Kết quả AI Try-On: {outfitName}
                  </div>
                </div>
              </div>

              {fitAnalysis && (
                <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#D4AF37]/40 text-sm text-[#1A1A1A]">
                  <strong className="text-[#C8102E]">Nhận xét từ AI Stylist: </strong>
                  <span>{fitAnalysis}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onSaveLookbook}
                  className="btn-primary inline-flex items-center gap-2 min-h-[44px]"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>💾 Lưu vào Lookbook</span>
                </button>
                <a
                  href={tryOnResultUrl}
                  download={`vietphuc-tryon-${Date.now()}.png`}
                  className="btn-secondary inline-flex items-center gap-2 min-h-[44px]"
                >
                  <Download className="w-4 h-4" />
                  <span>⬇️ Tải về</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedImage(null);
                    fileInputRef.current?.click();
                  }}
                  className="btn-ghost inline-flex items-center gap-2 min-h-[44px]"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>🔄 Thử lại với ảnh khác</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
