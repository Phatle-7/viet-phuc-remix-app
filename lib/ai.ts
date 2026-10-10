// ============================================================
// FILE: lib/ai.ts
// ============================================================

import {
  getAccessoryById,
  getColorNameByHex,
  getEventById,
  getOutfitById,
  getStyleById,
} from './data-loader';
import {
  buildCulturalCheckPrompt,
  buildMockupPrompt,
  buildTryOnPrompt,
} from './prompts';
import { RuleContextInput } from './rule-context';
import {
  CulturalCheckResult,
  deriveStatusFromScore,
  ruleEngineCheck,
} from './rule-engine';

export interface MockupGenerationResult {
  imageUrl: string;
  caption: string;
  aiNotes?: string;
}

export interface TryOnGenerationResult {
  imageUrl: string;
  fitAnalysis: string;
}

interface AiMockupDirection {
  headline: string;
  vibeCaption: string;
  fabricNote: string;
  lightingNote: string;
  imageBase64?: string;
}

interface AiTryOnDirection {
  fitHeadline: string;
  auraComment: string;
  stylingTip: string;
  imageBase64?: string;
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 3
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  let linesCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      linesCount++;
      if (linesCount >= maxLines) {
        ctx.fillText(line.trim() + '...', x, currentY);
        return currentY + lineHeight;
      }
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line.trim()) {
    ctx.fillText(line.trim(), x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

async function renderEditorialMockupCanvas(
  input: RuleContextInput,
  direction: AiMockupDirection
): Promise<string> {
  const outfit = getOutfitById(input.outfitId);
  const style = getStyleById(input.styleId);
  const event = getEventById(input.eventId);

  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d');
  if (!ctx) return outfit?.thumbnail || '';

  const primaryColor = input.colors[0] || '#C8102E';
  const secondaryColor = input.colors[1] || '#D4AF37';

  // 1. Background editorial gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 800, 1000);
  bgGrad.addColorStop(0, '#FAF6F0');
  bgGrad.addColorStop(0.55, '#FFF8DC');
  bgGrad.addColorStop(1, '#F3ECE0');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 800, 1000);

  // 2. Soft radial color aura from user's chosen palette
  ctx.save();
  const auraGrad = ctx.createRadialGradient(400, 420, 40, 400, 420, 360);
  auraGrad.addColorStop(0, `${primaryColor}38`);
  auraGrad.addColorStop(0.6, `${secondaryColor}22`);
  auraGrad.addColorStop(1, 'rgba(250, 246, 240, 0)');
  ctx.fillStyle = auraGrad;
  ctx.fillRect(0, 0, 800, 1000);
  ctx.restore();

  // 3. Decorative border frame
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, 744, 944);
  ctx.strokeStyle = 'rgba(200, 16, 46, 0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(36, 36, 728, 928);

  // 4. Top Editorial Header
  ctx.fillStyle = '#C8102E';
  ctx.font = '600 15px "Be Vietnam Pro", sans-serif';
  ctx.fillText('VIỆT PHỤC REMIX STUDIO · AI LOOKBOOK EDITION', 56, 72);

  ctx.fillStyle = '#1A1A1A';
  ctx.font = '700 32px "Spectral", Georgia, serif';
  ctx.fillText(direction.headline || `${outfit?.name} × ${style?.name}`, 56, 114);

  ctx.fillStyle = '#615F5A';
  ctx.font = '500 16px "Be Vietnam Pro", sans-serif';
  ctx.fillText(
    `${event?.emoji || '🌸'} ${event?.name || ''}  ·  ${style?.emoji || '✨'} ${style?.name || ''}`,
    56,
    144
  );

  // 5. Center Outfit Frame with color-graded overlay
  const frameX = 56;
  const frameY = 168;
  const frameW = 688;
  const frameH = 540;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(frameX, frameY, frameW, frameH, 20);
  ctx.clip();

  ctx.fillStyle = '#EAE2D3';
  ctx.fillRect(frameX, frameY, frameW, frameH);

  if (outfit?.thumbnail) {
    try {
      const img = await loadImageElement(outfit.thumbnail);
      const scale = Math.max(frameW / img.width, frameH / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const drawX = frameX + (frameW - drawW) / 2;
      const drawY = frameY + (frameH - drawH) / 2;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    } catch {
      // Fallback silhouette if image fails
    }
  }

  // Subtle color remix tint overlay
  const tintGrad = ctx.createLinearGradient(frameX, frameY, frameX, frameY + frameH);
  tintGrad.addColorStop(0, `${primaryColor}18`);
  tintGrad.addColorStop(0.65, 'rgba(0,0,0,0.05)');
  tintGrad.addColorStop(1, 'rgba(26,26,26,0.78)');
  ctx.fillStyle = tintGrad;
  ctx.fillRect(frameX, frameY, frameW, frameH);

  // Palette swatches inside bottom-left of image frame
  const colorsToShow = input.colors.length > 0 ? input.colors : ['#C8102E', '#FAF6F0', '#D4AF37'];
  colorsToShow.slice(0, 5).forEach((hex, idx) => {
    const cx = frameX + 36 + idx * 46;
    const cy = frameY + frameH - 42;
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    ctx.fillStyle = hex;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();
  });

  // Style badge inside bottom-right of image frame
  ctx.fillStyle = 'rgba(250, 246, 240, 0.92)';
  ctx.beginPath();
  ctx.roundRect(frameX + frameW - 250, frameY + frameH - 58, 226, 36, 18);
  ctx.fill();
  ctx.fillStyle = '#1A1A1A';
  ctx.font = '600 14px "Be Vietnam Pro", sans-serif';
  ctx.fillText(`✨ Remix: ${style?.name || 'Gen Z'}`, frameX + frameW - 234, frameY + frameH - 35);

  ctx.restore();

  // 6. Accessories strip
  ctx.fillStyle = '#2D3561';
  ctx.font = '700 14px "Be Vietnam Pro", sans-serif';
  ctx.fillText('PHỤ KIỆN & ĐIỂM NHẤN PHỐI KÈM:', 56, 742);

  const accList =
    input.accessories.length > 0
      ? input.accessories
          .slice(0, 5)
          .map((id) => {
            const a = getAccessoryById(id);
            return a ? `${a.emoji} ${a.name}` : id;
          })
          .join('   ·   ')
      : '🪷 Tinh giản tự nhiên, tập trung vào phom dáng nguyên bản';

  ctx.fillStyle = '#1A1A1A';
  ctx.font = '500 16px "Be Vietnam Pro", sans-serif';
  ctx.fillText(accList, 56, 768);

  // 7. AI Editorial Styling Notes Box
  ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
  ctx.strokeStyle = '#E5DED0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(56, 792, 688, 144, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#C8102E';
  ctx.font = '700 14px "Be Vietnam Pro", sans-serif';
  ctx.fillText('🤖 NHẬN ĐỊNH TỪ GEMINI AI STYLIST:', 76, 822);

  ctx.fillStyle = '#1A1A1A';
  ctx.font = '400 15px "Be Vietnam Pro", sans-serif';
  const nextY = wrapCanvasText(
    ctx,
    direction.vibeCaption ||
      `Bản phối ${outfit?.name} theo phong cách ${style?.name} tạo nên sự giao thoa hài hòa giữa di sản và hơi thở Gen Z.`,
    76,
    848,
    648,
    22,
    2
  );

  ctx.fillStyle = '#615F5A';
  ctx.font = '500 13px "Be Vietnam Pro", sans-serif';
  wrapCanvasText(
    ctx,
    `Chất liệu & Ánh sáng: ${direction.fabricNote || 'Lụa mềm tự nhiên'} · ${direction.lightingNote || 'Ánh sáng studio ấm áp'}`,
    76,
    nextY + 8,
    648,
    20,
    2
  );

  return canvas.toDataURL('image/png');
}

async function renderTryOnCompositeCanvas(
  userImageBase64: string,
  input: RuleContextInput,
  direction: AiTryOnDirection
): Promise<string> {
  const outfit = getOutfitById(input.outfitId);
  const style = getStyleById(input.styleId);
  const primaryColor = input.colors[0] || '#C8102E';
  const secondaryColor = input.colors[1] || '#D4AF37';

  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d');
  if (!ctx) return userImageBase64;

  // 1. Studio Backdrop
  const bgGrad = ctx.createLinearGradient(0, 0, 800, 1000);
  bgGrad.addColorStop(0, '#FAF6F0');
  bgGrad.addColorStop(0.5, '#FFF8DC');
  bgGrad.addColorStop(1, '#EFE6D5');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 800, 1000);

  // Aura glow behind portrait
  const aura = ctx.createRadialGradient(400, 420, 50, 400, 420, 380);
  aura.addColorStop(0, `${primaryColor}45`);
  aura.addColorStop(0.6, `${secondaryColor}25`);
  aura.addColorStop(1, 'rgba(250,246,240,0)');
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, 800, 1000);

  // Border
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, 752, 952);

  // Header
  ctx.fillStyle = '#C8102E';
  ctx.font = '700 14px "Be Vietnam Pro", sans-serif';
  ctx.fillText('✨ AI VIRTUAL TRY-ON · VIỆT PHỤC REMIX STUDIO', 52, 64);

  ctx.fillStyle = '#1A1A1A';
  ctx.font = '700 28px "Spectral", Georgia, serif';
  ctx.fillText(direction.fitHeadline || `Thử đồ: ${outfit?.name}`, 52, 102);

  // Main Portrait + Outfit Try-On Composite Area
  const cardX = 52;
  const cardY = 126;
  const cardW = 696;
  const cardH = 620;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 24);
  ctx.clip();

  // Draw Outfit Reference on Right Half & User Portrait with Viet Phuc Collar/Aura Frame on Left/Center
  ctx.fillStyle = '#1F1D1A';
  ctx.fillRect(cardX, cardY, cardW, cardH);

  // Draw user photo filling the main portrait frame with studio color harmony
  try {
    const userImg = await loadImageElement(userImageBase64);
    const scale = Math.max(cardW / userImg.width, cardH / userImg.height);
    const dw = userImg.width * scale;
    const dh = userImg.height * scale;
    const dx = cardX + (cardW - dw) / 2;
    const dy = cardY + (cardH - dh) / 2;
    ctx.drawImage(userImg, dx, dy, dw, dh);
  } catch {
    // Ignore
  }

  // Draw traditional silhouette garment overlay at the lower torso/shoulders area
  const garmentGrad = ctx.createLinearGradient(cardX, cardY + cardH * 0.48, cardX, cardY + cardH);
  garmentGrad.addColorStop(0, 'rgba(0,0,0,0)');
  garmentGrad.addColorStop(0.25, `${primaryColor}95`);
  garmentGrad.addColorStop(1, `${primaryColor}E8`);
  ctx.fillStyle = garmentGrad;
  ctx.fillRect(cardX, cardY + cardH * 0.45, cardW, cardH * 0.55);

  // Draw traditional collar / lapel motif lines in gold
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cardX + cardW * 0.36, cardY + cardH * 0.58);
  ctx.lineTo(cardX + cardW * 0.5, cardY + cardH * 0.68);
  ctx.lineTo(cardX + cardW * 0.64, cardY + cardH * 0.58);
  ctx.stroke();

  // Inset miniature of the selected traditional outfit in top-right corner of the canvas card
  if (outfit?.thumbnail) {
    try {
      const outfitImg = await loadImageElement(outfit.thumbnail);
      const insetW = 160;
      const insetH = 210;
      const insetX = cardX + cardW - insetW - 20;
      const insetY = cardY + 20;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(insetX, insetY, insetW, insetH, 14);
      ctx.clip();
      ctx.fillStyle = '#FAF6F0';
      ctx.fillRect(insetX, insetY, insetW, insetH);
      const s = Math.max(insetW / outfitImg.width, insetH / outfitImg.height);
      ctx.drawImage(
        outfitImg,
        insetX + (insetW - outfitImg.width * s) / 2,
        insetY + (insetH - outfitImg.height * s) / 2,
        outfitImg.width * s,
        outfitImg.height * s
      );
      ctx.restore();

      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(insetX, insetY, insetW, insetH, 14);
      ctx.stroke();

      ctx.fillStyle = 'rgba(26, 26, 26, 0.82)';
      ctx.beginPath();
      ctx.roundRect(insetX + 8, insetY + insetH - 32, insetW - 16, 24, 8);
      ctx.fill();
      ctx.fillStyle = '#FAF6F0';
      ctx.font = '600 11px "Be Vietnam Pro", sans-serif';
      ctx.fillText(outfit.name, insetX + 16, insetY + insetH - 16);
    } catch {
      // Ignore
    }
  }

  // Bottom overlay inside portrait frame with outfit & palette info
  ctx.fillStyle = 'rgba(26, 26, 26, 0.75)';
  ctx.fillRect(cardX, cardY + cardH - 86, cardW, 86);

  ctx.fillStyle = '#FAF6F0';
  ctx.font = '700 20px "Spectral", Georgia, serif';
  ctx.fillText(`${outfit?.name} · Phong cách ${style?.name}`, cardX + 24, cardY + cardH - 48);

  const accLabels = input.accessories
    .slice(0, 4)
    .map((id) => getAccessoryById(id)?.name || id)
    .join(' · ');
  ctx.fillStyle = '#D4AF37';
  ctx.font = '500 14px "Be Vietnam Pro", sans-serif';
  ctx.fillText(
    `Phụ kiện: ${accLabels || 'Nguyên bản'} | Bảng màu: ${input.colors.map(getColorNameByHex).join(', ')}`,
    cardX + 24,
    cardY + cardH - 22
  );

  ctx.restore();

  // AI Fit Analysis Card at bottom
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#E5DED0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(52, 768, 696, 180, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#C8102E';
  ctx.font = '700 14px "Be Vietnam Pro", sans-serif';
  ctx.fillText('✨ PHÂN TÍCH HỢP DÁNG & THẦN THÁI TỪ GEMINI AI:', 74, 800);

  ctx.fillStyle = '#1A1A1A';
  ctx.font = '400 15px "Be Vietnam Pro", sans-serif';
  const yAfterAura = wrapCanvasText(
    ctx,
    direction.auraComment ||
      `Thần thái và ánh sáng khuôn mặt rất hài hòa với sắc độ của ${outfit?.name}.`,
    74,
    828,
    652,
    22,
    3
  );

  ctx.fillStyle = '#2D3561';
  ctx.font = '600 14px "Be Vietnam Pro", sans-serif';
  wrapCanvasText(
    ctx,
    `💡 Gợi ý tạo dáng: ${direction.stylingTip || 'Giữ nét cười tự nhiên, hơi nghiêng vai để tôn đường cắt cổ áo truyền thống.'}`,
    74,
    yAfterAura + 10,
    652,
    20,
    2
  );

  return canvas.toDataURL('image/png');
}

export async function aiCheckCulture(
  params: RuleContextInput
): Promise<CulturalCheckResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const prompt = buildCulturalCheckPrompt(params);
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'checkCulture',
        prompt,
        params,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return ruleEngineCheck(params);
    }

    const data = (await response.json()) as Partial<CulturalCheckResult>;
    if (
      typeof data.score !== 'number' ||
      Number.isNaN(data.score) ||
      !Array.isArray(data.positives)
    ) {
      return ruleEngineCheck(params);
    }

    const clampedScore = Math.max(0, Math.min(10, Math.round(data.score * 10) / 10));
    const validStatuses = ['perfect', 'good', 'warning', 'error'] as const;
    const status =
      data.status && validStatuses.includes(data.status)
        ? data.status
        : deriveStatusFromScore(clampedScore);

    return {
      score: clampedScore,
      status,
      positives: data.positives.slice(0, 5),
      concerns: Array.isArray(data.concerns) ? data.concerns.slice(0, 5) : [],
      suggestions: Array.isArray(data.suggestions) ? data.suggestions.slice(0, 5) : [],
      explanation: data.explanation || 'Phân tích văn hóa từ trợ lý Gemini AI.',
      source: 'ai',
    };
  } catch {
    clearTimeout(timeoutId);
    return ruleEngineCheck(params);
  }
}

export async function aiGenerateMockup(
  params: RuleContextInput
): Promise<MockupGenerationResult> {
  const style = getStyleById(params.styleId);
  const outfit = getOutfitById(params.outfitId);
  const prompt = buildMockupPrompt(params);

  let direction: AiMockupDirection = {
    headline: `${outfit?.name || 'Việt Phục'} · ${style?.name || 'Remix'}`,
    vibeCaption: `Bản phối ${outfit?.name || 'Việt phục'} mang đậm dấu ấn ${style?.name || 'Gen Z'}, giữ trọn đường nét di sản kết hợp bảng màu hiện đại.`,
    fabricNote: 'Lụa tơ tằm phối chất liệu đương đại thoáng mát',
    lightingNote: 'Ánh sáng tự nhiên tôn sắc độ truyền thống',
  };

  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generateMockup',
        prompt,
        params,
      }),
    });

    if (response.ok) {
      const data = (await response.json()) as Partial<AiMockupDirection>;
      direction = {
        headline: data.headline || direction.headline,
        vibeCaption: data.vibeCaption || direction.vibeCaption,
        fabricNote: data.fabricNote || direction.fabricNote,
        lightingNote: data.lightingNote || direction.lightingNote,
        imageBase64: data.imageBase64,
      };
    }
  } catch {
    // Use default direction for canvas rendering
  }

  if (direction.imageBase64) {
    return {
      imageUrl: direction.imageBase64,
      caption: `Phối theo phong cách ${style?.name || params.styleId}`,
      aiNotes: direction.vibeCaption,
    };
  }

  const compositeUrl = await renderEditorialMockupCanvas(params, direction);
  return {
    imageUrl: compositeUrl,
    caption: `Phối theo phong cách ${style?.name || params.styleId}`,
    aiNotes: direction.vibeCaption,
  };
}

export async function aiTryOn(
  params: RuleContextInput & { userImageBase64: string }
): Promise<TryOnGenerationResult> {
  const outfit = getOutfitById(params.outfitId);
  const style = getStyleById(params.styleId);
  const prompt = buildTryOnPrompt(params);

  let direction: AiTryOnDirection = {
    fitHeadline: `${outfit?.name || 'Việt Phục'} × ${style?.name || 'Gen Z'}`,
    auraComment: `Khuôn mặt và ánh sáng gốc trong ảnh rất hợp với phom cổ đứng thanh lịch của ${outfit?.name || 'trang phục'} cùng tông màu đã chọn.`,
    stylingTip: `Kết hợp kiểu tóc gọn gàng và tạo dáng nghiêng 45 độ để khoe trọn chi tiết tà áo và phụ kiện.`,
  };

  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'tryOn',
        prompt,
        params,
        userImageBase64: params.userImageBase64,
      }),
    });

    if (response.ok) {
      const data = (await response.json()) as Partial<AiTryOnDirection>;
      direction = {
        fitHeadline: data.fitHeadline || direction.fitHeadline,
        auraComment: data.auraComment || direction.auraComment,
        stylingTip: data.stylingTip || direction.stylingTip,
        imageBase64: data.imageBase64,
      };
    }
  } catch {
    // Fallback to local composite with default direction
  }

  if (direction.imageBase64) {
    return {
      imageUrl: direction.imageBase64,
      fitAnalysis: `${direction.auraComment} ${direction.stylingTip}`,
    };
  }

  const compositeUrl = await renderTryOnCompositeCanvas(
    params.userImageBase64,
    params,
    direction
  );

  return {
    imageUrl: compositeUrl,
    fitAnalysis: `${direction.auraComment} — ${direction.stylingTip}`,
  };
}

export const checkCulture = aiCheckCulture;
export const generateMockup = aiGenerateMockup;
export const tryOn = aiTryOn;
