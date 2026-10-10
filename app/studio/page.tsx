// ============================================================
// FILE: app/studio/page.tsx
// ============================================================

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Check,
  Sparkles,
  MapPin,
} from 'lucide-react';
import {
  WEATHER_OPTIONS,
  WeatherType,
  getAllEvents,
  getAllOutfits,
  getAllStyles,
  getCostumeRules,
} from '../../lib/data-loader';
import { loadStudioDraft, saveStudioDraft } from '../../lib/storage';
import { showToast } from '../../components/cultural-decorations';

export default function StudioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const allOutfits = useMemo(() => getAllOutfits(), []);
  const allEvents = useMemo(() => getAllEvents(), []);
  const allStyles = useMemo(() => getAllStyles(), []);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedOutfitId, setSelectedOutfitId] = useState<string>('ao-dai');
  const [selectedEventId, setSelectedEventId] = useState<string>('ky-yeu');
  const [selectedStyleId, setSelectedStyleId] = useState<string>('thanh-lich-ha-noi-2026');

  const [weather, setWeather] = useState<WeatherType>('mat-me');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  useEffect(() => {
    const draft = loadStudioDraft();
    const queryOutfit = searchParams?.get('outfit');
    if (queryOutfit && allOutfits.some((o) => o.id === queryOutfit)) {
      setSelectedOutfitId(queryOutfit);
      saveStudioDraft({ outfitId: queryOutfit });
    } else {
      setSelectedOutfitId(draft.outfitId);
    }
    setSelectedEventId(draft.eventId);
    setSelectedStyleId(draft.styleId);
  }, [searchParams, allOutfits]);

  const activeWeatherObj = useMemo(
    () => WEATHER_OPTIONS.find((w) => w.id === weather) || WEATHER_OPTIONS[1],
    [weather]
  );

  const sortedOutfits = useMemo(() => {
    const filtered =
      categoryFilter === 'all'
        ? allOutfits
        : allOutfits.filter((o) => o.category === categoryFilter);

    return [...filtered].sort((a, b) => {
      const aMatch = activeWeatherObj.recommendedOutfits.includes(a.id) ? 1 : 0;
      const bMatch = activeWeatherObj.recommendedOutfits.includes(b.id) ? 1 : 0;
      return bMatch - aMatch;
    });
  }, [allOutfits, categoryFilter, activeWeatherObj]);

  const costumeRule = useMemo(
    () => getCostumeRules(selectedOutfitId),
    [selectedOutfitId]
  );

  const handleSelectOutfit = (id: string, name: string) => {
    setSelectedOutfitId(id);
    saveStudioDraft({ outfitId: id });
    showToast(`Đã chọn trang phục: ${name}`, 'info');
  };

  const handleSelectEvent = (id: string, name: string) => {
    setSelectedEventId(id);
    saveStudioDraft({ eventId: id });
    showToast(`Đã chọn sự kiện: ${name}`, 'info');
  };

  const handleSelectStyle = (id: string, name: string) => {
    setSelectedStyleId(id);
    saveStudioDraft({ styleId: id });
    showToast(`Đã chọn phong cách: ${name}`, 'info');
  };

  const goNextStep = () => {
    if (step === 1) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 2) {
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      saveStudioDraft({
        outfitId: selectedOutfitId,
        eventId: selectedEventId,
        styleId: selectedStyleId,
      });
      router.push('/studio/customize');
    }
  };

  const goPrevStep = () => {
    if (step === 3) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 2) {
      setStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen pb-28">
      {/* Sticky Progress Bar */}
      <div className="sticky top-[57px] md:top-[65px] z-30 glass border-b border-[#E5DED0] px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C8102E]">
              Bước {step}/3
            </span>
            <span className="text-sm font-serif font-bold text-[#1A1A1A]">
              {step === 1 && '1. Chọn Việt Phục Truyền Thống (23 trang phục)'}
              {step === 2 && '2. Chọn Sự Kiện & Hoàn Cảnh (10 sự kiện)'}
              {step === 3 && '3. Chọn Phong Cách Gen Z (17 phong cách)'}
            </span>
          </div>

          {/* Step Tabs & Bar */}
          <div className="flex items-center gap-3 w-full sm:w-72">
            <div className="w-full h-2.5 rounded-full bg-[#E5DED0] overflow-hidden">
              <div
                className="h-full bg-[#C8102E] transition-all duration-300 rounded-full"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-[#615F5A] tabular-nums shrink-0">
              {Math.round((step / 3) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {/* ================= STEP 1: OUTFIT ================= */}
        {step === 1 && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <span className="page-eyebrow">KHÁM PHÁ DI SẢN</span>
                <h1 className="page-title mt-1">Bạn muốn diện Việt phục nào?</h1>
                <p className="text-sm sm:text-base text-[#615F5A] mt-2">
                  Chọn thời tiết hiện tại để hệ thống tự động ưu tiên các trang phục có chất liệu phù hợp nhất.
                </p>
              </div>

              {/* Weather Filter (4 Buttons) */}
              <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-2xl border border-[#E5DED0]">
                {WEATHER_OPTIONS.map((w) => {
                  const active = weather === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setWeather(w.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all min-h-[44px] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-[#C8102E] text-white shadow-sm font-semibold'
                          : 'text-[#615F5A] hover:text-[#1A1A1A] hover:bg-[#FAF6F0]'
                      }`}
                    >
                      <span>{w.emoji}</span>
                      <span>{w.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-[#E5DED0]">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', label: 'Tất cả (23)' },
                  { id: 'cổ-truyền', label: 'Cổ truyền (7)' },
                  { id: 'vùng-miền', label: 'Vùng miền (4)' },
                  { id: 'dân-tộc', label: 'Dân tộc (9)' },
                  { id: 'phụ-kiện', label: 'Biểu tượng (3)' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors min-h-[40px] cursor-pointer ${
                      categoryFilter === cat.id
                        ? 'bg-[#2D3561] text-white font-semibold'
                        : 'bg-white text-[#615F5A] border border-[#E5DED0] hover:text-[#1A1A1A]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <p className="text-xs text-[#615F5A]">
                {activeWeatherObj.emoji} Gợi ý thời tiết ({activeWeatherObj.tempRange}):{' '}
                <strong className="text-[#1A1A1A]">{activeWeatherObj.desc}</strong>
              </p>
            </div>

            {/* Outfits Grid: 2 (mobile) / 3 (tablet) / 4 (desktop) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {sortedOutfits.map((outfit) => {
                const isSelected = selectedOutfitId === outfit.id;
                const matchesWeather = activeWeatherObj.recommendedOutfits.includes(
                  outfit.id
                );

                return (
                  <button
                    key={outfit.id}
                    type="button"
                    onClick={() => handleSelectOutfit(outfit.id, outfit.name)}
                    className={`text-left group overflow-hidden flex flex-col cursor-pointer ${
                      isSelected ? 'card-active' : 'card hover:border-[#D4AF37]'
                    }`}
                  >
                    <div className="relative aspect-[3/4] w-full bg-[#EAE2D3] overflow-hidden">
                      <img
                        src={outfit.thumbnail}
                        alt={outfit.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                      {/* Weather Match Indicator */}
                      {matchesWeather && (
                        <div className="absolute top-2.5 left-2.5 bg-white/95 text-[#1A1A1A] px-2.5 py-1 rounded-lg text-[11px] font-semibold shadow-sm">
                          {activeWeatherObj.emoji} Phù hợp
                        </div>
                      )}

                      {/* Selected Checkmark */}
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-[#C8102E] text-white flex items-center justify-center shadow-md">
                          <Check className="w-4 h-4" />
                        </div>
                      )}

                      <div className="absolute bottom-2.5 inset-x-3 text-white">
                        <span className="text-[11px] text-[#D4AF37] font-semibold">
                          {outfit.region} · {outfit.dynasty}
                        </span>
                        <h3 className="font-serif text-base sm:text-lg font-bold leading-tight">
                          {outfit.name}
                        </h3>
                      </div>
                    </div>

                    <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between gap-2">
                      <p className="text-xs text-[#615F5A] line-clamp-2 leading-relaxed">
                        {outfit.description}
                      </p>
                      <div className="text-[11px] text-[#2D3561] font-medium pt-1 border-t border-[#E5DED0]/60">
                        Nhóm: {outfit.category}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STEP 2: EVENT ================= */}
        {step === 2 && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <span className="page-eyebrow">BỐI CẢNH XUẤT HIỆN</span>
              <h1 className="page-title mt-1">Bạn diện trang phục vào dịp nào?</h1>
              <p className="text-sm sm:text-base text-[#615F5A] mt-2">
                Mỗi sự kiện có quy chuẩn riêng về độ trang trọng, màu sắc khuyến khích và các điều kiêng kỵ cần tránh.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {allEvents.map((ev) => {
                const isSelected = selectedEventId === ev.id;
                const isExpanded = expandedEventId === ev.id;
                const isRecommendedForOutfit =
                  costumeRule?.bestEvents.includes(ev.id) ?? false;

                return (
                  <div
                    key={ev.id}
                    className={`flex flex-col justify-between transition-all ${
                      isSelected ? 'card-active' : 'card hover:border-[#D4AF37]'
                    }`}
                  >
                    <div
                      onClick={() => handleSelectEvent(ev.id, ev.name)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleSelectEvent(ev.id, ev.name);
                        }
                      }}
                      className="p-5 sm:p-6 cursor-pointer flex items-start gap-4"
                    >
                      <div className="text-4xl shrink-0 select-none">{ev.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">
                            {ev.name}
                          </h3>
                          {isSelected && (
                            <span className="w-7 h-7 rounded-full bg-[#C8102E] text-white flex items-center justify-center shrink-0">
                              <Check className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-[#615F5A] mt-1 leading-relaxed">
                          {ev.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-[#615F5A]">
                          <span>Tính chất: {ev.formality}</span>
                          <span>·</span>
                          <span>Mùa: {ev.season}</span>
                          {isRecommendedForOutfit && (
                            <>
                              <span>·</span>
                              <span className="text-[#4CAF50] font-semibold">
                                ✓ Rất hợp với trang phục đã chọn
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Details Toggle */}
                    <div className="px-5 sm:px-6 pb-4 pt-2 border-t border-[#E5DED0]/70">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedEventId(isExpanded ? null : ev.id)
                        }
                        className="w-full flex items-center justify-between text-xs font-semibold text-[#2D3561] hover:text-[#C8102E] py-1.5 transition-colors cursor-pointer"
                      >
                        <span>
                          {isExpanded ? '▲ Thu gọn chi tiết sự kiện' : '▼ Xem chi tiết sự kiện'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-[#E5DED0] space-y-4 text-xs sm:text-sm text-[#1A1A1A] animate-fade-in">
                          <div>
                            <h4 className="font-bold text-[#2D3561] mb-1">
                              Bối cảnh văn hóa:
                            </h4>
                            <p className="text-[#615F5A] whitespace-pre-line leading-relaxed">
                              {ev.context}
                            </p>
                          </div>

                          <div>
                            <h4 className="font-bold text-[#2D3561] mb-1">
                              Yêu cầu trang phục:
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-[#615F5A]">
                              {ev.requirements.map((req, i) => (
                                <li key={i}>{req}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-bold text-[#4CAF50] mb-1">
                              Màu sắc gợi ý ({ev.recommendedColors.join(', ')}):
                            </h4>
                            <p className="text-[#615F5A]">{ev.colorReasoning}</p>
                          </div>

                          <div>
                            <h4 className="font-bold text-[#F44336] mb-1">
                              Điều cần tránh:
                            </h4>
                            <p className="text-[#615F5A]">{ev.taboos.join(' · ')}</p>
                          </div>

                          <div>
                            <h4 className="font-bold text-[#B8941F] mb-1">
                              Mẹo từ chuyên gia:
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-[#615F5A]">
                              {ev.tips.map((tip, i) => (
                                <li key={i}>{tip}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#615F5A]">
                            <MapPin className="w-3.5 h-3.5 text-[#C8102E]" />
                            <span className="font-semibold text-[#1A1A1A]">
                              Địa điểm phổ biến:
                            </span>
                            <span>{ev.locations.join(' · ')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STEP 3: STYLE ================= */}
        {step === 3 && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <span className="page-eyebrow">CÁ TÍNH THỜI TRANG</span>
              <h1 className="page-title mt-1">Chọn Phong cách Gen Z của bạn</h1>
              <p className="text-sm sm:text-base text-[#615F5A] mt-2">
                17 xu hướng thẩm mỹ từ Cổ điển, Hoài niệm Huế, Dark Academia đến Y2K và Street Style.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {allStyles.map((st) => {
                const isSelected = selectedStyleId === st.id;
                const isRecommended =
                  costumeRule?.bestStyles.includes(st.id) ||
                  st.compatibleOutfits.includes(selectedOutfitId);

                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleSelectStyle(st.id, st.name)}
                    className={`text-left p-5 sm:p-6 flex items-start gap-4 cursor-pointer ${
                      isSelected ? 'card-active' : 'card hover:border-[#D4AF37]'
                    }`}
                  >
                    <div className="text-4xl shrink-0 select-none">{st.emoji}</div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">
                            {st.name}
                          </h3>
                          <span className="text-xs text-[#615F5A]">{st.nameEn}</span>
                        </div>
                        {isSelected && (
                          <span className="w-7 h-7 rounded-full bg-[#C8102E] text-white flex items-center justify-center shrink-0">
                            <Check className="w-4 h-4" />
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-[#615F5A] leading-relaxed">
                        {st.description}
                      </p>

                      <div className="text-xs text-[#2D3561] bg-[#FAF6F0] p-2.5 rounded-xl border border-[#E5DED0]">
                        <strong>Mẹo phối:</strong> {st.tips}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#615F5A] pt-1">
                        <span>Chất liệu: {st.fabrics.slice(0, 3).join(', ')}</span>
                        {isRecommended && (
                          <>
                            <span>·</span>
                            <span className="text-[#4CAF50] font-semibold">
                              ✓ Ăn ý với trang phục đã chọn
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Navigation Bar */}
      <div className="fixed bottom-0 inset-x-0 z-30 glass border-t border-[#E5DED0] px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={goPrevStep}
            className="btn-ghost text-sm px-5 py-2.5 min-h-[44px] inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-[#615F5A]">
            <span>Đang chọn:</span>
            <strong className="text-[#1A1A1A]">
              {allOutfits.find((o) => o.id === selectedOutfitId)?.name}
            </strong>
            <span>·</span>
            <strong className="text-[#1A1A1A]">
              {allEvents.find((e) => e.id === selectedEventId)?.name}
            </strong>
            <span>·</span>
            <strong className="text-[#C8102E]">
              {allStyles.find((s) => s.id === selectedStyleId)?.name}
            </strong>
          </div>

          <button
            type="button"
            onClick={goNextStep}
            className="btn-primary text-sm sm:text-base px-6 py-2.5 min-h-[44px] inline-flex items-center gap-2"
          >
            {step < 3 ? (
              <>
                <span>Tiếp theo</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Hoàn thiện bản phối</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
