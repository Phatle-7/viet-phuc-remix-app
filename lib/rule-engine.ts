// ============================================================
// FILE: lib/rule-engine.ts
// ============================================================

import {
  PRESET_COLORS,
  getAccessoryById,
  getColorNameByHex,
  getCostumeRules,
  getEventById,
  getOutfitById,
  getRulesData,
  getStyleById,
} from './data-loader';
import { RuleContextInput } from './rule-context';

export interface CulturalCheckResult {
  score: number; // 0-10
  status: 'perfect' | 'good' | 'warning' | 'error';
  positives: string[]; // 3-5 items
  concerns: string[]; // 0-5 items
  suggestions: string[]; // 0-5 items
  explanation?: string;
  source: 'ai' | 'rule-engine';
}

export function deriveStatusFromScore(
  score: number
): 'perfect' | 'good' | 'warning' | 'error' {
  if (score >= 9) return 'perfect';
  if (score >= 7) return 'good';
  if (score >= 5) return 'warning';
  return 'error';
}

export function ruleEngineCheck(params: RuleContextInput): CulturalCheckResult {
  const outfit = getOutfitById(params.outfitId);
  const event = getEventById(params.eventId);
  const style = getStyleById(params.styleId);
  const costumeRule = getCostumeRules(params.outfitId);
  const rulesData = getRulesData();

  let score = 8.0;
  const positives: string[] = [];
  const concerns: string[] = [];
  const suggestions: string[] = [];

  if (!costumeRule) {
    return {
      score: 8.0,
      status: 'good',
      positives: [
        `Lựa chọn ${outfit?.name || 'trang phục'} mang đậm bản sắc văn hóa Việt Nam.`,
        `Phong cách ${style?.name || 'Gen Z'} giúp diện mạo trẻ trung và gần gũi.`,
        `Phù hợp để trải nghiệm trong dịp ${event?.name || 'sự kiện đã chọn'}.`,
      ],
      concerns: [],
      suggestions: ['Hãy chọn thêm 1-2 phụ kiện truyền thống để hoàn thiện điểm nhấn.'],
      explanation: 'Đánh giá tự động dựa trên quy tắc văn hóa Việt phục.',
      source: 'rule-engine',
    };
  }

  // 1. Check Event compatibility
  if (costumeRule.bestEvents.includes(params.eventId)) {
    score += 0.6;
    positives.push(
      `${outfit?.name} là lựa chọn rất phù hợp cho dịp "${event?.name}" theo chuẩn mực truyền thống.`
    );
  } else if (costumeRule.avoidEvents.includes(params.eventId)) {
    score -= 2.0;
    concerns.push(
      `${outfit?.name} thường hạn chế mặc trong dịp "${event?.name}" vì khác biệt về độ trang trọng hoặc tính chất hoạt động.`
    );
    if (event?.outfitPriority && event.outfitPriority.length > 0) {
      const altOutfit = getOutfitById(event.outfitPriority[0]);
      suggestions.push(
        `Với dịp "${event.name}", bạn có thể cân nhắc ${altOutfit?.name || event.outfitPriority[0]} để thuận tiện và đúng ngữ cảnh hơn.`
      );
    }
  } else {
    positives.push(
      `Sự kết hợp giữa ${outfit?.name} và dịp "${event?.name}" mang tính ứng dụng linh hoạt.`
    );
  }

  // 2. Check Style compatibility
  if (costumeRule.bestStyles.includes(params.styleId)) {
    score += 0.4;
    positives.push(
      `Phong cách "${style?.name}" tôn lên đường nét nguyên bản của ${outfit?.name} mà vẫn giữ chất Gen Z.`
    );
  } else if (style?.incompatibleOutfits?.includes(params.outfitId)) {
    score -= 1.0;
    concerns.push(
      `Phong cách "${style.name}" có độ tương phản khá mạnh với tính chất cổ truyền của ${outfit?.name}.`
    );
    suggestions.push(
      `Tiết chế chi tiết hiện đại, giữ phom dáng gốc của ${outfit?.name} làm trung tâm.`
    );
  } else {
    positives.push(
      `Cách remix phong cách "${style?.name}" tạo làn gió mới mẻ cho ${outfit?.name}.`
    );
  }

  // 3. Check Colors
  if (params.colors.length > 0) {
    params.colors.forEach((hex) => {
      const upper = hex.toUpperCase();
      const preset = PRESET_COLORS.find((p) => p.hex.toUpperCase() === upper);
      const colorName = getColorNameByHex(hex);

      const isBest =
        costumeRule.bestColorsHex.some((h) => h.toUpperCase() === upper) ||
        (preset &&
          costumeRule.bestColors.some(
            (bc) => bc.includes(preset.slug) || preset.slug.includes(bc)
          ));

      const isAvoid =
        preset &&
        costumeRule.avoidColors.some(
          (ac) =>
            ac.includes(preset.slug) ||
            (preset.id === 'den' && ac.includes('đen')) ||
            (preset.id === 'xam' && ac.includes('xám'))
        );

      if (isBest) {
        score += 0.3;
        positives.push(`Sắc màu ${colorName} nằm trong bảng màu truyền thống đẹp nhất của ${outfit?.name}.`);
      } else if (isAvoid) {
        score -= 1.0;
        concerns.push(`Màu ${colorName} nằm trong nhóm màu cần hạn chế khi diện ${outfit?.name}.`);
      }

      // Check F29: Black in Tet or Wedding
      if (
        (params.eventId === 'le-tet' || params.eventId === 'dam-cuoi') &&
        (upper === '#0A0A0A' || upper === '#000000')
      ) {
        score -= 1.5;
        concerns.push(
          `Tránh diện sắc Đen toàn thân trong dịp "${event?.name}" theo quan niệm may mắn Á Đông.`
        );
        suggestions.push(
          `Hãy phối thêm sắc Đỏ son (#C8102E) hoặc Vàng kim (#D4AF37) để mang lại sinh khí tươi vui.`
        );
      }
    });
  } else {
    suggestions.push(
      `Bạn có thể chọn 1-2 gam màu chủ đạo như ${costumeRule.bestColors.slice(0, 2).join(', ')} để định hình rõ cá tính.`
    );
  }

  // 4. Check Accessories
  if (params.accessories.length > 0) {
    params.accessories.forEach((accId) => {
      const acc = getAccessoryById(accId);
      const accName = acc?.name || accId;

      if (costumeRule.avoidAccessories.includes(accId)) {
        score -= 2.0;
        concerns.push(
          `Phụ kiện "${accName}" không đồng điệu vùng miền hoặc niên đại với ${outfit?.name}.`
        );
      } else if (costumeRule.bestAccessories.includes(accId) || acc?.bestWith.includes(params.outfitId)) {
        score += 0.3;
        positives.push(`Phụ kiện "${accName}" kết hợp ăn ý và tôn vinh nét đẹp của ${outfit?.name}.`);
      }
    });
  } else {
    suggestions.push(
      `Gợi ý kết hợp thêm phụ kiện chuẩn mực của ${outfit?.name} như: ${costumeRule.bestAccessories
        .slice(0, 3)
        .map((id) => getAccessoryById(id)?.name || id)
        .join(', ')}.`
    );
  }

  // 5. Check global forbidden rules
  rulesData.forbidden.forEach((f) => {
    const matchOutfit = f.outfits?.includes(params.outfitId) ?? false;
    const matchEvent = f.events ? f.events.includes(params.eventId) : false;
    const matchAcc = f.accessories
      ? f.accessories.some((a) => params.accessories.includes(a))
      : false;

    if (matchOutfit && ((f.events && matchEvent && !f.accessories) || (f.accessories && matchAcc))) {
      score -= f.severity === 'high' ? 2.0 : 1.0;
      if (!concerns.some((c) => c.includes(f.reason))) {
        concerns.push(`${f.rule}: ${f.reason}`);
      }
      if (f.alternatives.length > 0) {
        suggestions.push(`Thay thế gợi ý: ${f.alternatives.join(', ')}.`);
      }
    }
  });

  // 6. Add costume outfitRules tips into suggestions if needed
  if (costumeRule.outfitRules.length > 0 && suggestions.length < 3) {
    suggestions.push(`Lưu ý cách mặc chuẩn: ${costumeRule.outfitRules[0]}.`);
  }
  if (style?.tips && suggestions.length < 4) {
    suggestions.push(`Mẹo phối đồ ${style.name}: ${style.tips}`);
  }

  // Ensure 3-5 positives
  if (positives.length < 3) {
    positives.push(
      `Giữ gìn tinh thần nguyên bản của ${outfit?.name} (${outfit?.region}) kết hợp thẩm mỹ đương đại.`
    );
  }
  if (positives.length < 3) {
    positives.push(
      `Tôn trọng cấu trúc trang phục truyền thống và hoàn cảnh xuất hiện tại "${event?.name}".`
    );
  }

  const finalScore = Math.max(0, Math.min(10, Math.round(score * 10) / 10));
  const status = deriveStatusFromScore(finalScore);

  return {
    score: finalScore,
    status,
    positives: positives.slice(0, 5),
    concerns: concerns.slice(0, 5),
    suggestions: suggestions.slice(0, 5),
    explanation: `Đánh giá dựa trên hệ thống 247 quy tắc văn hóa Việt phục cho ${outfit?.name} trong bối cảnh ${event?.name}.`,
    source: 'rule-engine',
  };
}
