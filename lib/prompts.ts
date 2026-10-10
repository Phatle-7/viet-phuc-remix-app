// ============================================================
// FILE: lib/prompts.ts
// ============================================================

import {
  getAccessoryById,
  getColorNameByHex,
  getEventById,
  getOutfitById,
  getStyleById,
} from './data-loader';
import { buildRuleContext, RuleContextInput } from './rule-context';

export function buildCulturalCheckPrompt(input: RuleContextInput): string {
  const ctx = buildRuleContext(input);
  return `Bạn là Chuyên gia Văn hóa & Cố vấn Thời trang Việt Phục cho thế hệ Gen Z Việt Nam.
Hãy phân tích bản phối trang phục truyền thống dưới đây dựa trên dữ liệu văn hóa đã cung cấp và trả về kết quả JSON nghiêm ngặt.

${ctx.asPromptText()}

YÊU CẦU ĐÁNH GIÁ:
1. Chấm điểm "score" trên thang 0 đến 10 (số thực 1 chữ số thập phân, ví dụ 8.5, 9.2):
   - 9.0 - 10: status = "perfect" (Hoàn hảo cả về văn hóa, sự kiện, thẩm mỹ Gen Z)
   - 7.0 - 8.9: status = "good" (Tốt, hài hòa, có thể tinh chỉnh nhẹ)
   - 5.0 - 6.9: status = "warning" (Cần chú ý một số chi tiết lệch vùng miền hoặc hoàn cảnh)
   - 0.0 - 4.9: status = "error" (Sai lệch văn hóa hoặc vi phạm điều cấm kỵ của sự kiện)
2. "positives": Mảng 3-5 điểm cộng nổi bật của bản phối này (tiếng Việt, giọng văn trẻ trung, khích lệ, nêu rõ giá trị lịch sử/thẩm mỹ).
3. "concerns": Mảng 0-4 điểm cần lưu ý hoặc cảnh báo nếu có xung đột văn hóa/vùng miền/màu sắc/sự kiện (nếu bản phối đã chuẩn, có thể trả mảng rỗng hoặc 1 lưu ý nhỏ khi mặc).
4. "suggestions": Mảng 2-4 gợi ý thực tế (cách tạo dáng, làm tóc, chọn chất liệu hoặc điều chỉnh phụ kiện) để lên hình đẹp nhất.
5. "explanation": 1-2 câu tổng kết ngắn gọn, truyền cảm hứng về bản phối này.`;
}

export function buildMockupPrompt(input: RuleContextInput): string {
  const outfit = getOutfitById(input.outfitId);
  const style = getStyleById(input.styleId);
  const event = getEventById(input.eventId);
  const colorNames = input.colors.map((hex) => `${getColorNameByHex(hex)} (${hex})`).join(', ');
  const accNames = input.accessories
    .map((id) => getAccessoryById(id)?.name || id)
    .join(', ');

  return `Bạn là nhiếp ảnh gia thời trang và Giám đốc sáng tạo tạp chí Việt Phục. Hãy thiết kế concept chụp studio một người mẫu Gen Z Việt Nam mặc:
- Trang phục: ${outfit?.name || input.outfitId} - ${outfit?.description || ''} (${outfit?.note || ''})
- Bối cảnh sự kiện: ${event?.name || input.eventId}
- Phong cách: ${style?.name || input.styleId} (${style?.nameEn || ''}) - ${style?.description || ''}
- Màu sắc chủ đạo: ${colorNames || 'Đỏ son & Trắng kem truyền thống'}
- Phụ kiện phối kèm: ${accNames || 'Tối giản tinh tế'}
- Bối cảnh chụp: Studio editorial tối giản pha nét Á Đông, ánh sáng tự nhiên, tone kem-vàng ấm
- Phong cách ảnh: Thời trang Gen Z Việt Nam hiện đại, tôn trọng chuẩn mực cổ phục, sạch sẽ, chuyên nghiệp.`;
}

export function buildTryOnPrompt(input: RuleContextInput): string {
  const outfit = getOutfitById(input.outfitId);
  const style = getStyleById(input.styleId);
  const colorNames = input.colors.map((hex) => `${getColorNameByHex(hex)} (${hex})`).join(', ');
  const accNames = input.accessories
    .map((id) => getAccessoryById(id)?.name || id)
    .join(', ');

  return `Bạn là chuyên gia thời trang ảo (AI Virtual Stylist). Hãy phân tích bức ảnh chân dung người dùng tải lên, giữ nguyên khuôn mặt, thần thái và ánh sáng của người trong ảnh, và tư vấn/mô phỏng khi diện bộ trang phục truyền thống Việt Nam sau:
- Trang phục: ${outfit?.name || input.outfitId} - ${outfit?.description || ''}
- Phong cách phối: ${style?.name || input.styleId}
- Màu sắc: ${colorNames || 'Màu truyền thống'}
- Phụ kiện: ${accNames || 'Tối giản'}
- Yêu cầu: Giữ nguyên khuôn mặt, tóc, ánh sáng gốc của ảnh; phân tích độ hợp của tông da, thần thái khuôn mặt với màu sắc và phom dáng bộ Việt phục đã chọn.`;
}
