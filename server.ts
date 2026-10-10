// ============================================================
// FILE: server.ts
// ============================================================

import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { getOutfitById } from './lib/data-loader.ts';
import { ruleEngineCheck } from './lib/rule-engine.ts';
import { RuleContextInput } from './lib/rule-context.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '12mb' }));

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Bespoke Editorial SVG Illustration generator for /vietphuc/:filename
const PALETTE_BY_ID: Record<string, { primary: string; secondary: string; bg: string; accent: string }> = {
  'ao-dai': { primary: '#C8102E', secondary: '#FAF6F0', bg: '#F7EFE4', accent: '#D4AF37' },
  'ao-nhat-binh': { primary: '#D4AF37', secondary: '#C8102E', bg: '#3B1822', accent: '#FFB6C1' },
  'ao-tac': { primary: '#1B2B5E', secondary: '#D4AF37', bg: '#EAE4D8', accent: '#C8102E' },
  'ao-ngu-than-tay-chen': { primary: '#8B4513', secondary: '#FAF6F0', bg: '#F2E9DC', accent: '#D4AF37' },
  'ao-tu-than': { primary: '#8B4513', secondary: '#C8102E', bg: '#EFE6D8', accent: '#50C878' },
  'ao-giao-linh': { primary: '#8B0000', secondary: '#D4AF37', bg: '#2C1D1A', accent: '#FAF6F0' },
  'ao-gam': { primary: '#C8102E', secondary: '#D4AF37', bg: '#1E243B', accent: '#FAF6F0' },
  'ao-ba-ba': { primary: '#50C878', secondary: '#0A0A0A', bg: '#ECF4EE', accent: '#D4AF37' },
  'bo-quan-hoa-dao': { primary: '#C8102E', secondary: '#FFB6C1', bg: '#F9ECEC', accent: '#D4AF37' },
  'yem': { primary: '#C8102E', secondary: '#FAF6F0', bg: '#FBEAE7', accent: '#D4AF37' },
  'khan-ran': { primary: '#1A1A1A', secondary: '#FAF6F0', bg: '#EBE6DD', accent: '#8B4513' },
  'non-la': { primary: '#D4AF37', secondary: '#8B4513', bg: '#F8F2E4', accent: '#C8102E' },
  'non-quai-thao': { primary: '#8B4513', secondary: '#D4AF37', bg: '#F3EBDD', accent: '#C8102E' },
  'mu-canh-chuon': { primary: '#0A0A0A', secondary: '#D4AF37', bg: '#252838', accent: '#C8102E' },
  'trang-phuc-cham': { primary: '#FAF6F0', secondary: '#C8102E', bg: '#F6E6D8', accent: '#D4AF37' },
  'trang-phuc-dao': { primary: '#C8102E', secondary: '#1B2B5E', bg: '#222842', accent: '#D4AF37' },
  'trang-phuc-khmer': { primary: '#D4AF37', secondary: '#C8102E', bg: '#3A2314', accent: '#50C878' },
  'trang-phuc-muong': { primary: '#FAF6F0', secondary: '#1B2B5E', bg: '#E6ECE8', accent: '#C8102E' },
  'trang-phuc-thai': { primary: '#1B2B5E', secondary: '#C8102E', bg: '#E8ECF4', accent: '#D4AF37' },
  'trang-phuc-tay': { primary: '#1B2B5E', secondary: '#FAF6F0', bg: '#202B3D', accent: '#87CEEB' },
  'trang-phuc-e-de': { primary: '#0A0A0A', secondary: '#C8102E', bg: '#2D221E', accent: '#D4AF37' },
  'trang-phuc-hmong': { primary: '#C8102E', secondary: '#D4AF37', bg: '#1D2642', accent: '#50C878' },
  'trang-phuc-gia-rai': { primary: '#0A0A0A', secondary: '#C8102E', bg: '#2A2321', accent: '#D4AF37' },
};

app.get('/vietphuc/:filename', (req, res) => {
  const rawName = req.params.filename.replace(/\.(webp|jpg|png|svg)$/i, '');
  const outfit = getOutfitById(rawName);
  const colors = PALETTE_BY_ID[rawName] || {
    primary: '#C8102E',
    secondary: '#D4AF37',
    bg: '#FAF6F0',
    accent: '#2D3561',
  };

  const title = outfit?.name || rawName;
  const region = outfit?.region || 'Việt Nam';
  const dynasty = outfit?.dynasty || 'Truyền thống';
  const category = outfit?.category || 'Di sản';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${colors.bg}" />
        <stop offset="100%" stop-color="#1A1A1A" stop-opacity="0.35" />
      </linearGradient>
      <radialGradient id="halo" cx="50%" cy="38%" r="42%">
        <stop offset="0%" stop-color="${colors.accent}" stop-opacity="0.45" />
        <stop offset="100%" stop-color="${colors.accent}" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="robe" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${colors.primary}" />
        <stop offset="100%" stop-color="${colors.secondary}" />
      </linearGradient>
    </defs>

    <rect width="600" height="800" fill="${colors.bg}" />
    <rect width="600" height="800" fill="url(#bg)" />
    <circle cx="300" cy="310" r="230" fill="url(#halo)" />

    <!-- Decorative Frame -->
    <rect x="24" y="24" width="552" height="752" rx="16" fill="none" stroke="#D4AF37" stroke-width="2" stroke-opacity="0.65" />
    <rect x="34" y="34" width="532" height="732" rx="12" fill="none" stroke="#D4AF37" stroke-width="1" stroke-opacity="0.3" />

    <!-- Traditional Halo & Cloud Motif -->
    <circle cx="300" cy="270" r="135" fill="none" stroke="#D4AF37" stroke-width="1.5" stroke-dasharray="6 6" opacity="0.7" />
    <circle cx="300" cy="270" r="110" fill="#FAF6F0" fill-opacity="0.15" />

    <!-- Stylized Vietnamese Costume Silhouette -->
    <g transform="translate(0, 15)">
      <!-- Headpiece / Mấn / Nón -->
      <ellipse cx="300" cy="165" rx="48" ry="26" fill="${colors.secondary}" stroke="#D4AF37" stroke-width="2" />
      <!-- Head & Neck -->
      <circle cx="300" cy="195" r="30" fill="#F5DEC9" />
      <rect x="290" y="220" width="20" height="22" rx="6" fill="#EED2B8" />

      <!-- Standing Collar (Cổ đứng / Giao lĩnh) -->
      <path d="M284 234 L316 234 L322 252 L278 252 Z" fill="${colors.primary}" stroke="#D4AF37" stroke-width="2" />

      <!-- Wide Sleeves / Tay áo -->
      <path d="M278 245 C220 265 175 330 160 420 L225 435 C238 375 255 335 274 305 Z" fill="url(#robe)" stroke="#D4AF37" stroke-width="1.8" />
      <path d="M322 245 C380 265 425 330 440 420 L375 435 C362 375 345 335 326 305 Z" fill="url(#robe)" stroke="#D4AF37" stroke-width="1.8" />

      <!-- Lower Pants / Skirt (Quần lụa / Xiêm y) -->
      <path d="M242 450 L358 450 L382 650 L218 650 Z" fill="#FAF6F0" opacity="0.92" />

      <!-- Main Tunic Panels (Tà áo) -->
      <path d="M270 245 L330 245 L366 615 L234 615 Z" fill="url(#robe)" stroke="#D4AF37" stroke-width="2" />

      <!-- Ngũ thân / Nhật bình lapel line -->
      <path d="M288 246 L328 295 L324 615" fill="none" stroke="#D4AF37" stroke-width="2.2" stroke-dasharray="4 2" />
      <circle cx="305" cy="265" r="3.5" fill="#D4AF37" />
      <circle cx="322" cy="288" r="3.5" fill="#D4AF37" />
      <circle cx="326" cy="325" r="3.5" fill="#D4AF37" />
      <circle cx="326" cy="365" r="3.5" fill="#D4AF37" />
      <circle cx="325" cy="405" r="3.5" fill="#D4AF37" />

      <!-- Embroidery chest medallion -->
      <circle cx="300" cy="318" r="22" fill="none" stroke="#D4AF37" stroke-width="1.8" opacity="0.85" />
      <circle cx="300" cy="318" r="10" fill="#D4AF37" opacity="0.55" />
    </g>

    <!-- Top Label -->
    <text x="300" y="72" text-anchor="middle" fill="#D4AF37" font-family="sans-serif" font-size="13" font-weight="700" letter-spacing="3">
      DI SẢN VIỆT PHỤC · ${category.toUpperCase()}
    </text>

    <!-- Bottom Caption Banner -->
    <rect x="44" y="655" width="512" height="96" rx="14" fill="#1A1A1A" fill-opacity="0.78" stroke="#D4AF37" stroke-width="1.2" />
    <text x="300" y="694" text-anchor="middle" fill="#FAF6F0" font-family="Georgia, serif" font-size="26" font-weight="700">
      ${title}
    </text>
    <text x="300" y="726" text-anchor="middle" fill="#D4AF37" font-family="sans-serif" font-size="14" font-weight="500">
      Vùng: ${region}  ·  Thời kỳ: ${dynasty}
    </text>
  </svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(svg);
});

// API Endpoint for the 3 Gemini AI features
app.post('/api/ai', async (req, res) => {
  try {
    const body = req.body as {
      action: 'checkCulture' | 'generateMockup' | 'tryOn';
      prompt: string;
      params: RuleContextInput;
      userImageBase64?: string;
    };

    const ai = getAiClient();

    if (body.action === 'checkCulture') {
      if (!ai) {
        return res.json(ruleEngineCheck(body.params));
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: body.prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: {
                type: Type.NUMBER,
                description: 'Điểm phù hợp văn hóa từ 0 đến 10',
              },
              status: {
                type: Type.STRING,
                description: 'Trạng thái: perfect, good, warning, hoặc error',
              },
              positives: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3-5 điểm phù hợp nổi bật',
              },
              concerns: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '0-5 điểm cần lưu ý về văn hóa/sự kiện',
              },
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2-5 gợi ý nâng tầm bản phối',
              },
              explanation: {
                type: Type.STRING,
                description: 'Nhận xét tổng quan 1-2 câu',
              },
            },
            required: ['score', 'status', 'positives', 'concerns', 'suggestions'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ ...parsed, source: 'ai' });
    }

    if (body.action === 'generateMockup') {
      if (!ai) {
        return res.json({});
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `${body.prompt}\nHãy trả về JSON hướng dẫn thiết kế thẻ Lookbook gồm: headline (tiêu đề ngắn ấn tượng), vibeCaption (mô tả vẻ đẹp bản phối 2 câu), fabricNote (gợi ý chất liệu vải), lightingNote (gợi ý ánh sáng chụp).`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              vibeCaption: { type: Type.STRING },
              fabricNote: { type: Type.STRING },
              lightingNote: { type: Type.STRING },
            },
            required: ['headline', 'vibeCaption', 'fabricNote', 'lightingNote'],
          },
        },
      });

      return res.json(JSON.parse(response.text || '{}'));
    }

    if (body.action === 'tryOn') {
      if (!ai) {
        return res.json({});
      }

      const parts: Array<
        | { text: string }
        | { inlineData: { mimeType: string; data: string } }
      > = [
        {
          text: `${body.prompt}\nHãy trả về JSON nhận xét khi ghép trang phục lên ảnh chân dung gồm: fitHeadline (tiêu đề ngắn), auraComment (nhận xét độ hợp của khuôn mặt/ánh sáng với bộ Việt phục này), stylingTip (1 mẹo tạo dáng hoặc làm tóc).`,
        },
      ];

      if (body.userImageBase64 && body.userImageBase64.includes('base64,')) {
        const [header, base64Data] = body.userImageBase64.split('base64,');
        const mimeMatch = header.match(/data:(.*?);/);
        parts.unshift({
          inlineData: {
            mimeType: mimeMatch ? mimeMatch[1] : 'image/jpeg',
            data: base64Data,
          },
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              fitHeadline: { type: Type.STRING },
              auraComment: { type: Type.STRING },
              stylingTip: { type: Type.STRING },
            },
            required: ['fitHeadline', 'auraComment', 'stylingTip'],
          },
        },
      });

      return res.json(JSON.parse(response.text || '{}'));
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Internal server error',
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Việt Phục Remix Studio running on http://0.0.0.0:${port}`);
  });
}

startServer();
