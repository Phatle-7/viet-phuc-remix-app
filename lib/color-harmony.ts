// ============================================================
// FILE: lib/color-harmony.ts
// ============================================================

import {
  PRESET_COLORS,
  getCostumeRules,
  getEventById,
  getRulesData,
} from './data-loader';

export interface ColorHarmonyAnalysis {
  score: number; // 0 - 100
  harmonyType: string;
  summary: string;
  matchedBestColors: string[];
  avoidedConflicts: string[];
  colorDetails: {
    hex: string;
    name: string;
    symbolism: string;
    isBestForOutfit: boolean;
    isAvoidedForOutfit: boolean;
  }[];
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return null;
  const num = parseInt(clean, 16);
  if (Number.isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function analyzeColorHarmony(
  colors: string[],
  outfitId: string,
  eventId?: string
): ColorHarmonyAnalysis {
  const rulesData = getRulesData();
  const costumeRule = getCostumeRules(outfitId);
  const eventItem = eventId ? getEventById(eventId) : undefined;

  if (colors.length === 0) {
    return {
      score: 0,
      harmonyType: 'Chưa chọn màu',
      summary: 'Hãy chọn ít nhất 1 màu sắc để xem phân tích độ hài hòa văn hóa.',
      matchedBestColors: [],
      avoidedConflicts: [],
      colorDetails: [],
    };
  }

  let baseScore = 76;
  const matchedBestColors: string[] = [];
  const avoidedConflicts: string[] = [];

  const colorDetails = colors.map((hex) => {
    const upperHex = hex.toUpperCase();
    const preset = PRESET_COLORS.find((p) => p.hex.toUpperCase() === upperHex);
    const name = preset ? preset.name : hex;
    const meaningObj = preset
      ? rulesData.colorMeanings[preset.meaningKey]
      : undefined;

    const isBestHex =
      costumeRule?.bestColorsHex.some((h) => h.toUpperCase() === upperHex) ?? false;
    const isBestSlug =
      preset && costumeRule
        ? costumeRule.bestColors.some(
            (c) => c.includes(preset.slug) || preset.slug.includes(c)
          )
        : false;
    const isBestForOutfit = isBestHex || isBestSlug;

    const isAvoidedForOutfit =
      preset && costumeRule
        ? costumeRule.avoidColors.some(
            (avoid) =>
              avoid.includes(preset.slug) ||
              (preset.id === 'den' && avoid.includes('đen')) ||
              (preset.id === 'xam' && avoid.includes('xám'))
          )
        : false;

    if (isBestForOutfit) {
      baseScore += 8;
      matchedBestColors.push(name);
    }
    if (isAvoidedForOutfit) {
      baseScore -= 16;
      avoidedConflicts.push(`${name} nằm trong nhóm màu hạn chế của ${costumeRule?.name || 'trang phục này'}`);
    }

    // Event specific color check
    if (eventItem && preset) {
      const eventRec = eventItem.recommendedColors.some(
        (rc) => rc.includes(preset.slug) || preset.slug.includes(rc)
      );
      if (eventRec) {
        baseScore += 4;
      }
      if (
        (eventItem.id === 'le-tet' || eventItem.id === 'dam-cuoi') &&
        preset.id === 'den' &&
        colors.length === 1
      ) {
        baseScore -= 20;
        avoidedConflicts.push(`Màu Đen toàn thân không phù hợp dịp ${eventItem.name}`);
      }
    }

    return {
      hex,
      name,
      symbolism: meaningObj?.symbolism || 'Sắc màu cá nhân hóa tạo điểm nhấn sáng tạo',
      isBestForOutfit,
      isAvoidedForOutfit,
    };
  });

  // Determine harmony type based on HSL angles
  const hslList = colors
    .map(hexToRgb)
    .filter((v): v is { r: number; g: number; b: number } => v !== null)
    .map((rgb) => rgbToHsl(rgb.r, rgb.g, rgb.b));

  let harmonyType = 'Đơn sắc tinh tế (Monochromatic)';
  if (hslList.length === 2) {
    const diff = Math.abs(hslList[0].h - hslList[1].h);
    const angle = diff > 180 ? 360 - diff : diff;
    if (hslList[0].s < 15 || hslList[1].s < 15) {
      harmonyType = 'Tương phản Trung tính - Điểm nhấn';
      baseScore += 5;
    } else if (angle >= 150) {
      harmonyType = 'Tương phản Bổ túc (Complementary)';
      baseScore += 4;
    } else if (angle <= 45) {
      harmonyType = 'Tương đồng Chuyển sắc (Analogous)';
      baseScore += 6;
    } else {
      harmonyType = 'Phối hợp Song sắc Á Đông';
      baseScore += 3;
    }
  } else if (hslList.length === 3) {
    harmonyType = 'Quy tắc 60-30-10 Cân bằng Tam sắc';
    baseScore += 7;
  } else if (hslList.length > 3) {
    harmonyType = 'Đa sắc Lễ hội (Polychromatic)';
    baseScore -= (hslList.length - 3) * 4;
  }

  const finalScore = Math.max(20, Math.min(100, Math.round(baseScore)));

  let summary = '';
  if (finalScore >= 88) {
    summary = `Bảng màu cực kỳ ăn ý với ${costumeRule?.name || 'trang phục'}, tôn lên vẻ đẹp nguyên bản và rất hợp chụp hình.`;
  } else if (finalScore >= 72) {
    summary = 'Cách phối màu hài hòa, cân bằng giữa nét truyền thống và cá tính Gen Z.';
  } else {
    summary = 'Bảng màu khá phá cách nhưng có một số sắc độ cần lưu ý để tránh lệch ngữ cảnh văn hóa.';
  }

  return {
    score: finalScore,
    harmonyType,
    summary,
    matchedBestColors,
    avoidedConflicts,
    colorDetails,
  };
}
