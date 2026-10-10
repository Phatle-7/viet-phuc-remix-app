// ============================================================
// FILE: app/api/ai/route.ts
// ============================================================

import { GoogleGenAI, Type } from '@google/genai';
import { ruleEngineCheck } from '../../../lib/rule-engine';
import { RuleContextInput } from '../../../lib/rule-context';

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      action: 'checkCulture' | 'generateMockup' | 'tryOn';
      prompt: string;
      params: RuleContextInput;
      userImageBase64?: string;
    };

    const ai = getAiClient();

    if (body.action === 'checkCulture') {
      if (!ai) {
        return Response.json(ruleEngineCheck(body.params));
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
      return Response.json({ ...parsed, source: 'ai' });
    }

    if (body.action === 'generateMockup') {
      if (!ai) {
        return Response.json({});
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

      return Response.json(JSON.parse(response.text || '{}'));
    }

    if (body.action === 'tryOn') {
      if (!ai) {
        return Response.json({});
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

      return Response.json(JSON.parse(response.text || '{}'));
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}
