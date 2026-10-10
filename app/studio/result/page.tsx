// ============================================================
// FILE: app/studio/result/page.tsx
// ============================================================

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bookmark,
  Share2,
  RotateCcw,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import {
  getAccessoryById,
  getColorNameByHex,
  getEventById,
  getOutfitById,
  getStyleById,
} from '../../../lib/data-loader';
import {
  aiCheckCulture,
  aiGenerateMockup,
  aiTryOn,
} from '../../../lib/ai';
import { CulturalCheckResult } from '../../../lib/rule-engine';
import {
  loadStudioDraft,
  saveLookbookItem,
  StudioDraftState,
} from '../../../lib/storage';
import { AiMockup } from '../../../components/ai-mockup';
import { AiTryOn } from '../../../components/ai-tryon';
import { CulturalCheck } from '../../../components/cultural-check';
import { showToast } from '../../../components/cultural-decorations';

export default function ResultPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<StudioDraftState>(() => loadStudioDraft());

  // AI Cultural Check state
  const [culturalCheck, setCulturalCheck] = useState<CulturalCheckResult | null>(
    null
  );
  const [checkingCulture, setCheckingCulture] = useState<boolean>(true);

  // AI Mockup state
  const [mockupUrl, setMockupUrl] = useState<string | null>(null);
  const [mockupCaption, setMockupCaption] = useState<string>('');
  const [mockupNotes, setMockupNotes] = useState<string>('');
  const [generatingMockup, setGeneratingMockup] = useState<boolean>(true);

  // AI Try-On state (kept strictly in React session state, never saved to localStorage)
  const [tryOnUrl, setTryOnUrl] = useState<string | null>(null);
  const [tryOnAnalysis, setTryOnAnalysis] = useState<string>('');
  const [runningTryOn, setRunningTryOn] = useState<boolean>(false);

  const outfit = useMemo(
    () => getOutfitById(draft.outfitId) || getOutfitById('ao-dai')!,
    [draft.outfitId]
  );
  const event = useMemo(
    () => getEventById(draft.eventId) || getEventById('ky-yeu')!,
    [draft.eventId]
  );
  const style = useMemo(
    () => getStyleById(draft.styleId) || getStyleById('thanh-lich-ha-noi-2026')!,
    [draft.styleId]
  );

  const triggerCulturalCheck = useCallback(async (currentDraft: StudioDraftState) => {
    setCheckingCulture(true);
    const res = await aiCheckCulture(currentDraft);
    setCulturalCheck(res);
    setCheckingCulture(false);
  }, []);

  const triggerMockupGeneration = useCallback(
    async (currentDraft: StudioDraftState) => {
      setGeneratingMockup(true);
      const res = await aiGenerateMockup(currentDraft);
      setMockupUrl(res.imageUrl);
      setMockupCaption(res.caption);
      setMockupNotes(res.aiNotes || '');
      setGeneratingMockup(false);
    },
    []
  );

  useEffect(() => {
    const loaded = loadStudioDraft();
    setDraft(loaded);
    triggerCulturalCheck(loaded);
    triggerMockupGeneration(loaded);
  }, [triggerCulturalCheck, triggerMockupGeneration]);

  const handleRunTryOn = async (userImageBase64: string) => {
    setRunningTryOn(true);
    try {
      const res = await aiTryOn({
        ...draft,
        userImageBase64,
      });
      setTryOnUrl(res.imageUrl);
      setTryOnAnalysis(res.fitAnalysis);
      showToast('Đã tạo ảnh thử đồ Việt phục thành công!', 'success');
    } catch {
      showToast('Tạo ảnh thử không thành công, vui lòng thử lại', 'error');
    } finally {
      setRunningTryOn(false);
    }
  };

  const handleSaveToLookbook = () => {
    saveLookbookItem({
      outfit: draft.outfitId,
      event: draft.eventId,
      style: draft.styleId,
      accessories: draft.accessories,
      colors: draft.colors,
      mockupImage: mockupUrl || outfit.thumbnail,
      culturalCheck: culturalCheck || undefined,
    });
    showToast('Đã lưu bản phối vào Lookbook của bạn!', 'success');
  };

  const handleShare = async () => {
    const summaryText = `🌸 Bản phối Việt Phục Remix Studio: ${outfit.name} × ${style.name} cho dịp ${event.name} (Điểm văn hóa: ${
      culturalCheck?.score ?? 9.0
    }/10).`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(summaryText);
      showToast('Đã sao chép thông tin bản phối vào bộ nhớ tạm!', 'success');
    } else {
      showToast('Đã chuẩn bị thông tin chia sẻ!', 'info');
    }
  };

  return (
    <div className="min-h-screen pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-10">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E5DED0]">
          <div>
            <span className="page-eyebrow">HOÀN THIỆN BẢN PHỐI</span>
            <h1 className="page-title mt-1">
              {outfit.name} × {style.name}
            </h1>
            <p className="text-sm sm:text-base text-[#615F5A] mt-1">
              Bối cảnh sự kiện: {event.emoji} <strong className="text-[#1A1A1A]">{event.name}</strong>
            </p>
          </div>
          <Link
            href="/studio/customize"
            className="btn-ghost text-xs sm:text-sm self-start sm:self-auto"
          >
            ← Tinh chỉnh lại màu & phụ kiện
          </Link>
        </div>

        {/* SECTION 1: AI MOCKUP */}
        <AiMockup
          outfit={outfit}
          style={style}
          mockupUrl={mockupUrl}
          mockupCaption={mockupCaption}
          aiNotes={mockupNotes}
          loading={generatingMockup}
          onGenerate={() => triggerMockupGeneration(draft)}
        />

        {/* SECTION 2: AI TRY-ON */}
        <AiTryOn
          outfitName={outfit.name}
          styleName={style.name}
          tryOnResultUrl={tryOnUrl}
          fitAnalysis={tryOnAnalysis}
          loading={runningTryOn}
          onRunTryOn={handleRunTryOn}
          onSaveLookbook={handleSaveToLookbook}
        />

        {/* SECTION 3: CULTURE CARD */}
        <section className="card-elegant p-6 sm:p-8 space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DED0]">
            <div>
              <span className="page-eyebrow">THẺ VĂN HÓA VIỆT PHỤC</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A] mt-1">
                {outfit.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#615F5A] mt-1">
                <span>Vùng miền: {outfit.region}</span>
                <span>·</span>
                <span>Triều đại / Thời kỳ: {outfit.dynasty}</span>
                <span>·</span>
                <span>Phân loại: {outfit.category}</span>
              </div>
            </div>

            <a
              href={outfit.wikipediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs sm:text-sm px-4 py-2.5 min-h-[44px] inline-flex items-center gap-2 self-start sm:self-auto"
            >
              <BookOpen className="w-4 h-4 text-[#C8102E]" />
              <span>Đọc trên Wikipedia</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
                Nguồn gốc & Ý nghĩa lịch sử
              </h3>
              <p className="text-sm sm:text-base text-[#1A1A1A] leading-relaxed">
                {outfit.extract.slice(0, 250)}
                {outfit.extract.length > 250 ? '...' : ''}
              </p>
              {outfit.note && (
                <p className="text-xs sm:text-sm text-[#615F5A] leading-relaxed bg-white p-3.5 rounded-xl border border-[#E5DED0]">
                  <strong className="text-[#2D3561]">Đặc điểm nhận diện: </strong>
                  {outfit.note}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1A1A1A] mb-2">
                  Bảng màu đã chọn
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  {draft.colors.map((hex) => (
                    <div
                      key={hex}
                      className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#E5DED0]"
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-black/15"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="text-xs font-medium text-[#1A1A1A]">
                        {getColorNameByHex(hex)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-[#1A1A1A] mb-2">
                  Phụ kiện phối kèm ({draft.accessories.length})
                </h3>
                {draft.accessories.length === 0 ? (
                  <p className="text-xs text-[#615F5A]">
                    Không sử dụng phụ kiện đi kèm.
                  </p>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#1A1A1A]">
                    {draft.accessories.map((accId, idx) => {
                      const acc = getAccessoryById(accId);
                      return (
                        <React.Fragment key={accId}>
                          {idx > 0 && <span className="text-[#615F5A]">·</span>}
                          <span className="font-medium">
                            {acc?.emoji} {acc?.name || accId}
                          </span>
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: CULTURAL CHECK */}
        <CulturalCheck
          result={culturalCheck}
          loading={checkingCulture}
          onRecheck={() => triggerCulturalCheck(draft)}
        />
      </div>

      {/* SECTION 5: STICKY BOTTOM ACTIONS */}
      <div className="fixed bottom-0 inset-x-0 z-30 glass border-t border-[#E5DED0] px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleSaveToLookbook}
              className="btn-primary text-xs sm:text-sm px-5 py-2.5 min-h-[44px] inline-flex items-center gap-2"
            >
              <Bookmark className="w-4 h-4" />
              <span>💾 Lưu Lookbook</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="btn-secondary text-xs sm:text-sm px-4 py-2.5 min-h-[44px] inline-flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>📤 Chia sẻ</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => router.push('/studio')}
              className="btn-ghost text-xs sm:text-sm px-4 py-2.5 min-h-[44px] inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>🔄 Phối lại</span>
            </button>

            <Link
              href="/lookbook"
              className="btn-ghost text-xs sm:text-sm px-4 py-2.5 min-h-[44px] inline-flex items-center gap-1.5"
            >
              <span>📚 Lookbook</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
