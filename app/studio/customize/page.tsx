// ============================================================
// FILE: app/studio/customize/page.tsx
// ============================================================

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Plus,
  Check,
  Palette,
  Gem,
} from 'lucide-react';
import {
  PRESET_COLORS,
  getAllAccessories,
  getEventById,
  getOutfitById,
  getStyleById,
} from '../../../lib/data-loader';
import { validateAccessoryForOutfit } from '../../../lib/rule-context';
import { loadStudioDraft, saveStudioDraft } from '../../../lib/storage';
import { ColorHarmonyPreview } from '../../../components/color-harmony-preview';
import { showToast } from '../../../components/cultural-decorations';

export default function CustomizePage() {
  const router = useRouter();

  const [outfitId, setOutfitId] = useState('ao-dai');
  const [eventId, setEventId] = useState('ky-yeu');
  const [styleId, setStyleId] = useState('thanh-lich-ha-noi-2026');
  const [selectedColors, setSelectedColors] = useState<string[]>([
    '#FAF6F0',
    '#C8102E',
  ]);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([
    'hoa-tai-ngoc',
    'tui-coi',
  ]);
  const [customHex, setCustomHex] = useState('');

  useEffect(() => {
    const draft = loadStudioDraft();
    setOutfitId(draft.outfitId);
    setEventId(draft.eventId);
    setStyleId(draft.styleId);
    setSelectedColors(draft.colors);
    setSelectedAccessories(draft.accessories);
  }, []);

  const outfit = useMemo(
    () => getOutfitById(outfitId) || getOutfitById('ao-dai')!,
    [outfitId]
  );
  const event = useMemo(
    () => getEventById(eventId) || getEventById('ky-yeu')!,
    [eventId]
  );
  const style = useMemo(
    () => getStyleById(styleId) || getStyleById('thanh-lich-ha-noi-2026')!,
    [styleId]
  );
  const allAccessories = useMemo(() => getAllAccessories(), []);

  const toggleColor = (hex: string) => {
    const upper = hex.toUpperCase();
    const exists = selectedColors.some((c) => c.toUpperCase() === upper);
    let next: string[];
    if (exists) {
      if (selectedColors.length <= 1) {
        showToast('Cần giữ ít nhất 1 màu chủ đạo cho trang phục', 'warning');
        return;
      }
      next = selectedColors.filter((c) => c.toUpperCase() !== upper);
    } else {
      if (selectedColors.length >= 4) {
        showToast('Chỉ nên phối tối đa 4 màu theo nguyên tắc hài hòa', 'warning');
        return;
      }
      next = [...selectedColors, upper];
    }
    setSelectedColors(next);
    saveStudioDraft({ colors: next });
  };

  const handleAddCustomHex = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customHex.trim().toUpperCase();
    if (!/^#[0-9A-FA-F]{6}$/.test(trimmed)) {
      showToast('Mã màu HEX không hợp lệ (Ví dụ đúng: #C8102E)', 'error');
      return;
    }
    if (!selectedColors.some((c) => c.toUpperCase() === trimmed)) {
      if (selectedColors.length >= 4) {
        showToast('Tối đa 4 màu trong một bản phối', 'warning');
        return;
      }
      const next = [...selectedColors, trimmed];
      setSelectedColors(next);
      saveStudioDraft({ colors: next });
      showToast(`Đã thêm mã màu ${trimmed}`, 'success');
    }
    setCustomHex('');
  };

  const toggleAccessory = (accId: string, accName: string) => {
    const exists = selectedAccessories.includes(accId);
    let next: string[];
    if (exists) {
      next = selectedAccessories.filter((id) => id !== accId);
    } else {
      if (selectedAccessories.length >= 5) {
        showToast('Chỉ nên chọn tối đa 5 phụ kiện để tránh rườm rà', 'warning');
        return;
      }
      next = [...selectedAccessories, accId];
      const check = validateAccessoryForOutfit(accId, outfitId, eventId);
      if (check.status === 'avoid') {
        showToast(`Lưu ý: ${check.reason}`, 'warning');
      } else {
        showToast(`Đã thêm phụ kiện: ${accName}`, 'info');
      }
    }
    setSelectedAccessories(next);
    saveStudioDraft({ accessories: next });
  };

  const handleFinishCustomize = () => {
    saveStudioDraft({
      outfitId,
      eventId,
      styleId,
      colors: selectedColors,
      accessories: selectedAccessories,
    });
    router.push('/studio/result');
  };

  return (
    <div className="min-h-screen pb-28">
      {/* Sticky Summary Card */}
      <div className="sticky top-[57px] md:top-[65px] z-30 glass border-b border-[#E5DED0] px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={outfit.thumbnail}
              alt={outfit.name}
              referrerPolicy="no-referrer"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-[#D4AF37]"
            />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C8102E]">
                TÙY CHỈNH MÀU SẮC & PHỤ KIỆN
              </span>
              <h1 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A]">
                {outfit.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#615F5A]">
                <span>
                  {event.emoji} {event.name}
                </span>
                <span>·</span>
                <span>
                  {style.emoji} {style.name}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-1.5">
              {selectedColors.map((hex) => (
                <span
                  key={hex}
                  className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-[#615F5A]">
              {selectedColors.length} màu · {selectedAccessories.length} phụ kiện
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-10">
        {/* SECTION 1: 12 FIXED COLORS + CUSTOM HEX */}
        <section className="card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C8102E]">
                <Palette className="w-4 h-4" />
                <span>BẢNG 12 SẮC MÀU TRUYỀN THỐNG</span>
              </div>
              <h2 className="section-title mt-1">
                Chọn Bảng Màu Chủ Đạo (Tối đa 4 màu)
              </h2>
            </div>

            {/* Custom HEX Input */}
            <form
              onSubmit={handleAddCustomHex}
              className="flex items-center gap-2 self-start sm:self-auto"
            >
              <input
                type="text"
                value={customHex}
                onChange={(e) => setCustomHex(e.target.value)}
                maxLength={7}
                placeholder="#C8102E"
                aria-label="Nhập mã màu HEX tùy chỉnh"
                className="w-28 px-3.5 py-2 rounded-xl border border-[#E5DED0] bg-[#FAF6F0] text-sm font-mono uppercase focus:outline-none focus:border-[#C8102E] min-h-[44px]"
              />
              <button
                type="submit"
                className="btn-secondary px-4 py-2 text-xs sm:text-sm min-h-[44px] inline-flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm HEX</span>
              </button>
            </form>
          </div>

          {/* 12 Preset Colors Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {PRESET_COLORS.map((color) => {
              const isSelected = selectedColors.some(
                (c) => c.toUpperCase() === color.hex.toUpperCase()
              );
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => toggleColor(color.hex)}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all min-h-[56px] cursor-pointer ${
                    isSelected
                      ? 'border-2 border-[#C8102E] bg-[#FAF6F0] shadow-sm'
                      : 'border-[#E5DED0] bg-white hover:border-[#D4AF37]'
                  }`}
                >
                  <span
                    className="w-8 h-8 rounded-full border border-black/15 shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: color.hex }}
                  >
                    {isSelected && (
                      <Check
                        className={`w-4 h-4 ${
                          color.id === 'trang-sen' || color.id === 'kem'
                            ? 'text-[#1A1A1A]'
                            : 'text-white'
                        }`}
                      />
                    )}
                  </span>
                  <div className="min-w-0">
                    <span className="block text-xs sm:text-sm font-semibold text-[#1A1A1A] truncate">
                      {color.name}
                    </span>
                    <span className="block text-[11px] font-mono text-[#615F5A]">
                      {color.hex}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: COLOR HARMONY PREVIEW */}
        <ColorHarmonyPreview
          colors={selectedColors}
          outfitId={outfitId}
          eventId={eventId}
        />

        {/* SECTION 3: 30 ACCESSORIES WITH REALTIME VALIDATION */}
        <section className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C8102E]">
              <Gem className="w-4 h-4" />
              <span>30 PHỤ KIỆN THỦ CÔNG & ĐƯƠNG ĐẠI</span>
            </div>
            <h2 className="section-title mt-1">
              Phối Phụ Kiện Đi Kèm (Kiểm tra quy tắc thời gian thực)
            </h2>
            <p className="text-sm text-[#615F5A] mt-1">
              Mỗi phụ kiện được đối chiếu tự động với quy tắc của{' '}
              <strong className="text-[#1A1A1A]">{outfit.name}</strong> và dịp{' '}
              <strong className="text-[#1A1A1A]">{event.name}</strong>.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allAccessories.map((acc) => {
              const isSelected = selectedAccessories.includes(acc.id);
              const validation = validateAccessoryForOutfit(
                acc.id,
                outfitId,
                eventId
              );

              const statusColorMap = {
                best: 'text-[#4CAF50]',
                warning: 'text-[#FF9800]',
                avoid: 'text-[#F44336]',
              };

              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => toggleAccessory(acc.id, acc.name)}
                  className={`p-4 text-left flex flex-col justify-between gap-3 cursor-pointer ${
                    isSelected ? 'card-active' : 'card hover:border-[#D4AF37]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-3xl select-none">{acc.emoji}</span>
                      <span
                        className={`text-xs font-semibold ${statusColorMap[validation.status]}`}
                      >
                        {validation.badgeText}
                      </span>
                    </div>

                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#1A1A1A]">
                      {acc.name}
                    </h3>
                    <p className="text-xs text-[#615F5A] line-clamp-2 leading-relaxed">
                      {acc.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E5DED0]/70 text-[11px] text-[#615F5A]">
                    {validation.reason}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Sticky Bottom Navigation Bar */}
      <div className="fixed bottom-0 inset-x-0 z-30 glass border-t border-[#E5DED0] px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push('/studio')}
            className="btn-ghost text-sm px-5 py-2.5 min-h-[44px] inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại 3 bước chọn</span>
          </button>

          <button
            type="button"
            onClick={handleFinishCustomize}
            className="btn-primary text-sm sm:text-base px-6 py-2.5 min-h-[44px] inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Xem bản phối hoàn chỉnh →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
