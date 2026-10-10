// ============================================================
// FILE: lib/storage.ts
// ============================================================

import { CulturalCheckResult } from './rule-engine';

export interface StudioDraftState {
  outfitId: string;
  eventId: string;
  styleId: string;
  colors: string[];
  accessories: string[];
}

export interface LookbookItem {
  id: string;
  outfit: string;
  event: string;
  style: string;
  accessories: string[];
  colors: string[];
  mockupImage: string;
  tryOnImage?: string;
  culturalCheck?: CulturalCheckResult;
  createdAt: string;
}

const DRAFT_KEY = 'vp_remix_studio_draft_v1';
const LOOKBOOK_KEY = 'vp_remix_lookbooks_v1';
const HIGHSCORE_KEY = 'vp_remix_minigame_highscore_v1';

export const DEFAULT_DRAFT: StudioDraftState = {
  outfitId: 'ao-dai',
  eventId: 'ky-yeu',
  styleId: 'thanh-lich-ha-noi-2026',
  colors: ['#FAF6F0', '#C8102E'],
  accessories: ['hoa-tai-ngoc', 'tui-coi', 'hoa-cai-toc'],
};

export function loadStudioDraft(): StudioDraftState {
  if (typeof window === 'undefined') return DEFAULT_DRAFT;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return DEFAULT_DRAFT;
    const parsed = JSON.parse(raw) as Partial<StudioDraftState>;
    return {
      outfitId: parsed.outfitId || DEFAULT_DRAFT.outfitId,
      eventId: parsed.eventId || DEFAULT_DRAFT.eventId,
      styleId: parsed.styleId || DEFAULT_DRAFT.styleId,
      colors: Array.isArray(parsed.colors) ? parsed.colors : DEFAULT_DRAFT.colors,
      accessories: Array.isArray(parsed.accessories)
        ? parsed.accessories
        : DEFAULT_DRAFT.accessories,
    };
  } catch {
    return DEFAULT_DRAFT;
  }
}

export function saveStudioDraft(draft: Partial<StudioDraftState>): StudioDraftState {
  const current = loadStudioDraft();
  const updated: StudioDraftState = {
    ...current,
    ...draft,
  };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
    } catch {
      // Ignore quota errors
    }
  }
  return updated;
}

export function getLookbooks(): LookbookItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOOKBOOK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LookbookItem[]) : [];
  } catch {
    return [];
  }
}

export function saveLookbookItem(
  item: Omit<LookbookItem, 'id' | 'createdAt'>
): LookbookItem {
  const list = getLookbooks();
  // Never store user portrait tryOnImage in localStorage to honor privacy & storage limits
  const safeItem: LookbookItem = {
    id: `lb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    outfit: item.outfit,
    event: item.event,
    style: item.style,
    accessories: item.accessories,
    colors: item.colors,
    mockupImage: item.mockupImage,
    culturalCheck: item.culturalCheck,
    createdAt: new Date().toISOString(),
  };

  const nextList = [safeItem, ...list].slice(0, 24);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LOOKBOOK_KEY, JSON.stringify(nextList));
    } catch {
      // If mockupImage base64 is large, fallback to saving thumbnail reference
      safeItem.mockupImage = '';
      window.localStorage.setItem(LOOKBOOK_KEY, JSON.stringify([safeItem, ...list.slice(0, 10)]));
    }
  }
  return safeItem;
}

export function deleteLookbookItem(id: string): LookbookItem[] {
  const list = getLookbooks().filter((item) => item.id !== id);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LOOKBOOK_KEY, JSON.stringify(list));
    } catch {
      // Ignore
    }
  }
  return list;
}

export function getMiniGameHighScore(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem(HIGHSCORE_KEY);
    const num = raw ? parseInt(raw, 10) : 0;
    return Number.isNaN(num) ? 0 : num;
  } catch {
    return 0;
  }
}

export function saveMiniGameHighScore(score: number): number {
  const current = getMiniGameHighScore();
  const best = Math.max(current, score);
  if (typeof window !== 'undefined' && best > current) {
    try {
      window.localStorage.setItem(HIGHSCORE_KEY, String(best));
    } catch {
      // Ignore
    }
  }
  return best;
}
