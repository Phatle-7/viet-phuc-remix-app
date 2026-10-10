// ============================================================
// FILE: app/lookbook/page.tsx
// ============================================================

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  Eye,
  GitCompare,
  Sparkles,
  Trophy,
  PlusCircle,
  Check,
  Printer,
} from 'lucide-react';
import {
  getAccessoryById,
  getColorNameByHex,
  getEventById,
  getOutfitById,
  getStyleById,
} from '../../lib/data-loader';
import { ruleEngineCheck } from '../../lib/rule-engine';
import {
  deleteLookbookItem,
  getLookbooks,
  LookbookItem,
  saveLookbookItem,
  saveStudioDraft,
} from '../../lib/storage';
import { showToast } from '../../components/cultural-decorations';

export default function LookbookPage() {
  const router = useRouter();
  const [items, setItems] = useState<LookbookItem[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setItems(getLookbooks());
  }, []);

  const handleDelete = (id: string) => {
    const updated = deleteLookbookItem(id);
    setItems(updated);
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    showToast('Đã xóa bản phối khỏi Lookbook', 'info');
  };

  const handleViewInStudio = (item: LookbookItem) => {
    saveStudioDraft({
      outfitId: item.outfit,
      eventId: item.event,
      styleId: item.style,
      colors: item.colors,
      accessories: item.accessories,
    });
    router.push('/studio/result');
  };

  const toggleCompareItem = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      if (selectedIds.length >= 3) {
        showToast('Chỉ có thể so sánh tối đa 3 bản phối cùng lúc', 'warning');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleGenerateSamples = () => {
    const presets = [
      {
        outfitId: 'ao-dai',
        eventId: 'ky-yeu',
        styleId: 'thanh-lich-ha-noi-2026',
        colors: ['#FAF6F0', '#FFB6C1'],
        accessories: ['hoa-tai-ngoc', 'hoa-cai-toc', 'tui-coi'],
      },
      {
        outfitId: 'ao-nhat-binh',
        eventId: 'le-tet',
        styleId: 'co-trang-hue-modern',
        colors: ['#C8102E', '#D4AF37'],
        accessories: ['man', 'tram-cai-toc', 'quat-co-hue'],
      },
      {
        outfitId: 'ao-ba-ba',
        eventId: 'di-uong-cafe',
        styleId: 'vintage-viet-nam-60s',
        colors: ['#FFF8DC', '#8B4513'],
        accessories: ['khan-ran', 'non-la', 'guoc-moc'],
      },
    ];

    presets.forEach((p) => {
      const outfit = getOutfitById(p.outfitId);
      const check = ruleEngineCheck(p);
      saveLookbookItem({
        outfit: p.outfitId,
        event: p.eventId,
        style: p.styleId,
        colors: p.colors,
        accessories: p.accessories,
        mockupImage: outfit?.thumbnail || '',
        culturalCheck: check,
      });
    });

    const next = getLookbooks();
    setItems(next);
    showToast('Đã tạo 3 bản phối mẫu để bạn trải nghiệm và so sánh!', 'success');
  };

  const comparedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds]
  );

  const highestScoreId = useMemo(() => {
    if (comparedItems.length === 0) return null;
    let bestId = comparedItems[0].id;
    let bestScore = comparedItems[0].culturalCheck?.score ?? 0;
    comparedItems.forEach((item) => {
      const s = item.culturalCheck?.score ?? 0;
      if (s > bestScore) {
        bestScore = s;
        bestId = item.id;
      }
    });
    return bestId;
  }, [comparedItems]);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5DED0]">
        <div>
          <span className="page-eyebrow">BỘ SƯU TẬP CÁ NHÂN</span>
          <h1 className="page-title mt-1">Lookbook Việt Phục</h1>
          <p className="text-sm sm:text-base text-[#615F5A] mt-1">
            Lưu trữ các bản phối tâm đắc và đặt cạnh nhau để so sánh điểm hài hòa văn hóa (Tối đa 3 bản phối).
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 no-print">
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-ghost text-xs sm:text-sm px-4 py-2.5 min-h-[44px] inline-flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-[#C8102E]" />
              <span>🖨️ Xuất PDF</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCompareMode(!compareMode);
                if (!compareMode && selectedIds.length === 0) {
                  setSelectedIds(items.slice(0, Math.min(3, items.length)).map((i) => i.id));
                }
              }}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold min-h-[44px] inline-flex items-center gap-2 transition-colors cursor-pointer ${
                compareMode
                  ? 'bg-[#2D3561] text-white'
                  : 'bg-white border border-[#D4AF37] text-[#1A1A1A] hover:bg-[#FFF8DC]'
              }`}
            >
              <GitCompare className="w-4 h-4" />
              <span>
                {compareMode
                  ? `Đang bật So sánh (${selectedIds.length}/3)`
                  : 'Chế độ So sánh (Compare)'}
              </span>
            </button>

            <Link
              href="/studio"
              className="btn-primary text-xs sm:text-sm px-5 py-2.5 min-h-[44px] inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Phối bộ mới</span>
            </Link>
          </div>
        )}
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="card-elegant p-10 sm:p-16 text-center max-w-xl mx-auto space-y-5 animate-fade-in">
          <div className="text-5xl select-none">🌸</div>
          <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">
            Chưa có bản phối nào được lưu
          </h2>
          <p className="text-sm sm:text-base text-[#615F5A] leading-relaxed">
            Hãy bắt đầu hành trình khám phá 23 trang phục truyền thống và lưu lại những bản phối mang đậm dấu ấn cá nhân của bạn.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/studio"
              className="btn-primary inline-flex items-center gap-2 min-h-[44px]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Tạo bản phối đầu tiên</span>
            </Link>
            <button
              type="button"
              onClick={handleGenerateSamples}
              className="btn-secondary text-sm inline-flex items-center gap-2 min-h-[44px]"
            >
              <span>Tải 3 bản phối mẫu để thử So sánh</span>
            </button>
          </div>
        </div>
      )}

      {/* Compare Mode Panel */}
      {compareMode && comparedItems.length > 0 && (
        <section className="card-elegant border-2 border-[#2D3561]/30 p-6 sm:p-8 space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E5DED0]">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2D3561]">
                SO SÁNH TRỰC QUAN ({comparedItems.length}/3 BẢN PHỐI)
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#1A1A1A] mt-0.5">
                Bảng đối chiếu Điểm Văn Hóa & Cấu Trúc Phối
              </h2>
            </div>
            <p className="text-xs text-[#615F5A]">
              Bấm vào thẻ bên dưới để thêm/bớt bản phối khỏi bảng so sánh
            </p>
          </div>

          {/* Visual Bar Chart Comparison */}
          <div className="space-y-3 bg-white p-5 rounded-2xl border border-[#E5DED0]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#615F5A]">
              Biểu đồ Điểm Phù Hợp Văn Hóa (/10) & Số lượng Phụ kiện
            </h3>
            <div className="space-y-3">
              {comparedItems.map((item) => {
                const outfit = getOutfitById(item.outfit);
                const style = getStyleById(item.style);
                const score = item.culturalCheck?.score ?? 8.5;
                const isWinner = item.id === highestScoreId;

                return (
                  <div key={item.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                        {isWinner && (
                          <span className="text-[#D4AF37]" title="Điểm cao nhất">
                            🏆
                          </span>
                        )}
                        {outfit?.name} × {style?.name}
                      </span>
                      <span className="font-mono font-bold text-[#C8102E] tabular-nums">
                        {score.toFixed(1)}/10 điểm · {item.accessories.length} phụ kiện
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-[#FAF6F0] overflow-hidden border border-[#E5DED0]">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isWinner ? 'bg-[#C8102E]' : 'bg-[#2D3561]'
                        }`}
                        style={{ width: `${(score / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side-by-side Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {comparedItems.map((item) => {
              const outfit = getOutfitById(item.outfit);
              const event = getEventById(item.event);
              const style = getStyleById(item.style);
              const score = item.culturalCheck?.score ?? 8.5;
              const isWinner = item.id === highestScoreId;

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl bg-white border-2 flex flex-col justify-between gap-4 ${
                    isWinner
                      ? 'border-[#D4AF37] shadow-md'
                      : 'border-[#E5DED0]'
                  }`}
                >
                  <div className="space-y-3">
                    {isWinner && (
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B8941F]">
                        <Trophy className="w-4 h-4" />
                        <span>🏆 Bản phối điểm cao nhất</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <img
                        src={item.mockupImage || outfit?.thumbnail}
                        alt={outfit?.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-20 rounded-xl object-cover border border-[#E5DED0] shrink-0"
                      />
                      <div>
                        <h4 className="font-serif text-lg font-bold text-[#1A1A1A]">
                          {outfit?.name}
                        </h4>
                        <p className="text-xs text-[#615F5A]">
                          {event?.emoji} {event?.name}
                        </p>
                        <p className="text-xs font-semibold text-[#C8102E] mt-0.5">
                          {style?.emoji} {style?.name}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E5DED0] space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#615F5A]">Điểm văn hóa:</span>
                        <strong className="text-sm font-serif text-[#C8102E] tabular-nums">
                          {score.toFixed(1)} / 10
                        </strong>
                      </div>

                      <div>
                        <span className="text-[#615F5A] block mb-1">Bảng màu:</span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {item.colors.map((hex) => (
                            <span
                              key={hex}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FAF6F0] border border-[#E5DED0]"
                            >
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: hex }}
                              />
                              <span>{getColorNameByHex(hex)}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[#615F5A] block mb-1">
                          Phụ kiện ({item.accessories.length}):
                        </span>
                        <p className="text-[#1A1A1A] font-medium">
                          {item.accessories
                            .map((id) => getAccessoryById(id)?.name || id)
                            .join(' · ') || 'Không dùng'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleViewInStudio(item)}
                    className="btn-secondary w-full text-xs py-2 min-h-[40px]"
                  >
                    Mở lại bản phối này
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Lookbook Grid (1-4 columns) */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const outfit = getOutfitById(item.outfit);
            const event = getEventById(item.event);
            const style = getStyleById(item.style);
            const score = item.culturalCheck?.score ?? 8.5;
            const isSelectedForCompare = selectedIds.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (compareMode) toggleCompareItem(item.id);
                }}
                className={`lookbook-card overflow-hidden flex flex-col justify-between transition-all ${
                  compareMode ? 'cursor-pointer' : ''
                } ${
                  compareMode && isSelectedForCompare
                    ? 'card-active'
                    : 'card hover:border-[#D4AF37]'
                }`}
              >
                <div>
                  <div className="relative aspect-[4/5] w-full bg-[#EAE2D3] overflow-hidden">
                    <img
                      src={item.mockupImage || outfit?.thumbnail}
                      alt={outfit?.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

                    {/* Score Badge */}
                    <div className="absolute top-3 left-3 bg-white/95 text-[#1A1A1A] px-3 py-1 rounded-xl text-xs font-bold shadow-sm tabular-nums">
                      ⭐ {score.toFixed(1)}/10
                    </div>

                    {compareMode && (
                      <div
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                          isSelectedForCompare
                            ? 'bg-[#C8102E] text-white'
                            : 'bg-white/90 text-[#615F5A]'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </div>
                    )}

                    <div className="absolute bottom-3 inset-x-3 text-white">
                      <span className="text-[11px] text-[#D4AF37] font-semibold">
                        {event?.emoji} {event?.name}
                      </span>
                      <h3 className="font-serif text-lg font-bold leading-snug">
                        {outfit?.name}
                      </h3>
                      <p className="text-xs text-white/85">
                        {style?.emoji} {style?.name}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-1.5">
                        {item.colors.map((hex) => (
                          <span
                            key={hex}
                            className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-[#615F5A]">
                        {item.accessories.length} phụ kiện
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-2 border-t border-[#E5DED0]/60 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewInStudio(item);
                    }}
                    className="flex-1 btn-ghost text-xs py-2 min-h-[40px] inline-flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="p-2 rounded-full border border-[#E5DED0] hover:border-[#F44336] text-[#615F5A] hover:text-[#F44336] transition-colors min-h-[40px] min-w-[40px] inline-flex items-center justify-center cursor-pointer"
                    aria-label="Xóa bản phối"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
