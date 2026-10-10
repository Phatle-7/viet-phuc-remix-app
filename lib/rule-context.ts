// ============================================================
// FILE: lib/rule-context.ts
// ============================================================

import {
  getAccessoryById,
  getColorNameByHex,
  getCostumeRules,
  getEventById,
  getOutfitById,
  getRulesData,
  getStyleById,
} from './data-loader';

export interface RuleContextInput {
  outfitId: string;
  eventId: string;
  styleId: string;
  colors: string[];
  accessories: string[];
}

export interface AccessoryValidationResult {
  status: 'best' | 'warning' | 'avoid';
  badgeText: string;
  reason: string;
}

export function validateAccessoryForOutfit(
  accessoryId: string,
  outfitId: string,
  eventId?: string
): AccessoryValidationResult {
  const costumeRule = getCostumeRules(outfitId);
  const acc = getAccessoryById(accessoryId);
  const rulesData = getRulesData();

  if (!acc) {
    return {
      status: 'warning',
      badgeText: '⚠️ Cần lưu ý',
      reason: 'Phụ kiện chưa xác định trong danh mục.',
    };
  }

  // Check forbidden rules first
  const forbiddenMatch = rulesData.forbidden.find(
    (f) =>
      f.outfits?.includes(outfitId) &&
      f.accessories?.includes(accessoryId) &&
      (!f.events || !eventId || f.events.includes(eventId))
  );

  if (forbiddenMatch) {
    return {
      status: 'avoid',
      badgeText: '❌ Không phù hợp',
      reason: forbiddenMatch.reason,
    };
  }

  if (costumeRule) {
    if (costumeRule.avoidAccessories.includes(accessoryId)) {
      return {
        status: 'avoid',
        badgeText: '❌ Không phù hợp',
        reason: `Phụ kiện "${acc.name}" nằm trong danh sách tránh kết hợp với ${costumeRule.name} (dễ lệch vùng miền hoặc niên đại).`,
      };
    }

    if (costumeRule.bestAccessories.includes(accessoryId) || acc.bestWith.includes(outfitId)) {
      return {
        status: 'best',
        badgeText: '✓ Phù hợp',
        reason: acc.tip || `Phụ kiện "${acc.name}" tôn lên vẻ đẹp chuẩn mực của ${costumeRule.name}.`,
      };
    }
  }

  if (eventId && acc.occasions && !acc.occasions.includes(eventId)) {
    return {
      status: 'warning',
      badgeText: '⚠️ Cảnh báo',
      reason: `"${acc.name}" ít phổ biến trong dịp này, hãy tiết chế để tổng thể hài hòa.`,
    };
  }

  return {
    status: 'warning',
    badgeText: '⚠️ Phối phá cách',
    reason: `Kết hợp "${acc.name}" theo hướng remix sáng tạo — nên giữ màu sắc đồng điệu.`,
  };
}

export function buildRuleContext(input: RuleContextInput) {
  const outfit = getOutfitById(input.outfitId);
  const event = getEventById(input.eventId);
  const style = getStyleById(input.styleId);
  const costumeRule = getCostumeRules(input.outfitId);
  const rulesData = getRulesData();

  const relevantForbidden = rulesData.forbidden.filter((f) => {
    const matchOutfit = !f.outfits || f.outfits.includes(input.outfitId);
    const matchEvent = !f.events || f.events.includes(input.eventId);
    return matchOutfit && matchEvent;
  });

  const relevantRecommended = rulesData.recommended.filter((r) =>
    r.bestWith.includes(input.outfitId)
  );

  const occasionRule = rulesData.occasions.find((o) => o.event === input.eventId);

  return {
    outfit,
    event,
    style,
    costumeRule,
    relevantForbidden,
    relevantRecommended,
    occasionRule,
    generalPrinciples: rulesData.general.slice(0, 5),
    asPromptText(): string {
      const colorNames = input.colors.map((c) => `${getColorNameByHex(c)} (${c})`).join(', ');
      const accNames = input.accessories
        .map((id) => getAccessoryById(id)?.name || id)
        .join(', ');

      return [
        `=== THÔNG TIN BẢN PHỐI CỦA NGƯỜI DÙNG ===`,
        `- Trang phục: ${outfit?.name || input.outfitId} (${outfit?.category || ''}, vùng ${outfit?.region || ''}, triều đại ${outfit?.dynasty || ''})`,
        `- Sự kiện: ${event?.name || input.eventId} (Tính chất: ${event?.formality || ''})`,
        `- Phong cách Gen Z: ${style?.name || input.styleId} (${style?.description || ''})`,
        `- Màu sắc đã chọn: ${colorNames || 'Mặc định theo trang phục'}`,
        `- Phụ kiện đã chọn: ${accNames || 'Không dùng phụ kiện'}`,
        ``,
        `=== QUY TẮC VĂN HÓA CỦA TRANG PHỤC NÀY (${costumeRule?.name || outfit?.name}) ===`,
        `- Màu sắc tốt nhất: ${costumeRule?.bestColors.join(', ') || 'Tự do'}`,
        `- Màu sắc cần tránh: ${costumeRule?.avoidColors.join(', ') || 'Không có'}`,
        `- Phụ kiện tốt nhất: ${costumeRule?.bestAccessories.join(', ') || 'Tự do'}`,
        `- Phụ kiện cần tránh: ${costumeRule?.avoidAccessories.join(', ') || 'Không có'}`,
        `- Sự kiện phù hợp nhất: ${costumeRule?.bestEvents.join(', ') || 'Tự do'}`,
        `- Sự kiện cần tránh: ${costumeRule?.avoidEvents.join(', ') || 'Không có'}`,
        `- Quy tắc mặc chuẩn: ${costumeRule?.outfitRules.join(' | ') || ''}`,
        ``,
        `=== QUY TẮC SỰ KIỆN (${event?.name || ''}) ===`,
        `- Yêu cầu bắt buộc: ${occasionRule?.mustFollow.join(' | ') || event?.requirements.join(' | ') || ''}`,
        `- Điều cấm kỵ tại sự kiện: ${event?.taboos.join(', ') || ''}`,
        ``,
        `=== CẢNH BÁO VI PHẠM VĂN HÓA LIÊN QUAN ===`,
        ...relevantForbidden.map((f) => `- [${f.id}] ${f.rule}: ${f.reason} (Gợi ý thay thế: ${f.alternatives.join(', ')})`),
        ``,
        `=== CÁCH PHỐI ĐƯỢC KHUYẾN KHÍCH ===`,
        ...relevantRecommended.map((r) => `- [${r.id}] ${r.rule}: ${r.reason}`),
      ].join('\n');
    },
  };
}
