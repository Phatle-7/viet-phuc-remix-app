// ============================================================
// FILE: lib/data-loader.ts
// ============================================================

import vietphucRaw from '../data/vietphuc.json';
import eventsRaw from '../data/events.json';
import stylesRaw from '../data/styles.json';
import accessoriesRaw from '../data/accessories.json';
import rulesRaw from '../data/rules.json';

export interface Outfit {
  id: string;
  name: string;
  category: 'cổ-truyền' | 'vùng-miền' | 'dân-tộc' | 'phụ-kiện' | string;
  region: string;
  era: string;
  dynasty: string;
  gender: string;
  wikipediaTitle: string;
  wikipediaUrl: string;
  thumbnail: string;
  description: string;
  extract: string;
  wikibaseItem?: string;
  pageId?: number;
  note?: string;
  verified?: boolean;
}

export interface EventItem {
  id: string;
  name: string;
  description: string;
  emoji: string;
  weather: string[];
  formality: string;
  season: string;
  vibe: string;
  context: string;
  requirements: string[];
  layout: string;
  recommendedColors: string[];
  colorReasoning: string;
  outfitPriority: string[];
  outfitNotes: string;
  compatibleStyles: string[];
  taboos: string[];
  tips: string[];
  realExamples: string[];
  duration: string;
  locations: string[];
}

export interface StyleItem {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  description: string;
  vibe: string;
  keywords: string[];
  colors: string[];
  fabrics: string[];
  accessories: string[];
  hairstyles: string[];
  makeup: string[];
  compatibleOutfits: string[];
  incompatibleOutfits: string[];
  ageRange: string;
  occasionMatch: string[];
  tips: string;
  references: string[];
}

export interface AccessoryItem {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  emoji: string;
  description: string;
  origin: string;
  bestWith: string[];
  occasions: string[];
  styles: string[];
  gender: string;
  material: string | string[];
  color: string[];
  tip: string;
}

export interface PerCostumeRule {
  name: string;
  bestColors: string[];
  bestColorsHex: string[];
  avoidColors: string[];
  bestAccessories: string[];
  avoidAccessories: string[];
  bestEvents: string[];
  avoidEvents: string[];
  bestStyles: string[];
  lengthRules?: Record<string, string>;
  outfitRules: string[];
}

export interface ForbiddenRule {
  id: string;
  rule: string;
  severity: 'high' | 'medium' | 'low';
  reason: string;
  outfits?: string[];
  accessories?: string[];
  events?: string[];
  colors?: string[];
  alternatives: string[];
}

export interface RecommendedRule {
  id: string;
  rule: string;
  severity: 'positive';
  reason: string;
  bestWith: string[];
}

export interface OccasionRule {
  id: string;
  event: string;
  name: string;
  mustFollow: string[];
  bestOutfits: string[];
  worstOutfits: string[];
}

export interface GeneralPrinciple {
  id: string;
  principle: string;
  description: string;
}

export interface ColorMeaning {
  symbolism: string;
  bestFor: string[];
  avoidFor?: string[];
  note?: string;
}

export interface RulesData {
  metadata: {
    version: string;
    compiledDate: string;
    source: string;
    totalRules: number;
    totalCostumes: number;
  };
  perCostume: Record<string, PerCostumeRule>;
  forbidden: ForbiddenRule[];
  recommended: RecommendedRule[];
  occasions: OccasionRule[];
  general: GeneralPrinciple[];
  colorMeanings: Record<string, ColorMeaning>;
}

export interface PresetColor {
  id: string;
  name: string;
  hex: string;
  meaningKey: string;
  slug: string;
}

export const PRESET_COLORS: PresetColor[] = [
  { id: 'do-son', name: 'Đỏ son', hex: '#C8102E', meaningKey: 'red', slug: 'đỏ' },
  { id: 'hong-phan', name: 'Hồng phấn', hex: '#FFB6C1', meaningKey: 'pink', slug: 'hồng-phấn' },
  { id: 'trang-sen', name: 'Trắng sen', hex: '#FAF6F0', meaningKey: 'white', slug: 'trắng' },
  { id: 'vang-kim', name: 'Vàng kim', hex: '#D4AF37', meaningKey: 'yellow', slug: 'vàng' },
  { id: 'xanh-ngoc', name: 'Xanh ngọc', hex: '#50C878', meaningKey: 'green', slug: 'xanh-ngọc' },
  { id: 'xanh-da-troi', name: 'Xanh da trời', hex: '#87CEEB', meaningKey: 'blue', slug: 'xanh-nhạt' },
  { id: 'tim-lavender', name: 'Tím lavender', hex: '#B57ED8', meaningKey: 'purple', slug: 'tím-lavender' },
  { id: 'den', name: 'Đen', hex: '#0A0A0A', meaningKey: 'black', slug: 'đen' },
  { id: 'nau', name: 'Nâu', hex: '#8B4513', meaningKey: 'brown', slug: 'nâu-trầm' },
  { id: 'kem', name: 'Kem', hex: '#FFF8DC', meaningKey: 'cream', slug: 'kem' },
  { id: 'xam', name: 'Xám', hex: '#808080', meaningKey: 'black', slug: 'xám' },
  { id: 'xanh-navy', name: 'Xanh navy', hex: '#1B2B5E', meaningKey: 'blue', slug: 'xanh-navy' },
];

export type WeatherType = 'nang-nong' | 'mat-me' | 'am-ap' | 'mua-lanh';

export interface WeatherOption {
  id: WeatherType;
  label: string;
  emoji: string;
  tempRange: string;
  desc: string;
  recommendedOutfits: string[];
}

export const WEATHER_OPTIONS: WeatherOption[] = [
  {
    id: 'nang-nong',
    label: 'Nắng nóng',
    emoji: '☀️',
    tempRange: '30°C - 37°C',
    desc: 'Ưu tiên lụa mỏng, vải lanh, cotton thoáng mát',
    recommendedOutfits: ['ao-ba-ba', 'ao-dai', 'yem', 'non-la', 'non-quai-thao', 'khan-ran', 'trang-phuc-cham'],
  },
  {
    id: 'mat-me',
    label: 'Mát mẻ',
    emoji: '🌤️',
    tempRange: '22°C - 28°C',
    desc: 'Thời tiết lý tưởng cho hầu hết các loại Việt phục',
    recommendedOutfits: ['ao-dai', 'ao-ngu-than-tay-chen', 'ao-tu-than', 'bo-quan-hoa-dao', 'ao-ba-ba', 'trang-phuc-thai', 'trang-phuc-muong'],
  },
  {
    id: 'am-ap',
    label: 'Ấm áp',
    emoji: '🌸',
    tempRange: '18°C - 24°C',
    desc: 'Tiết trời mùa xuân hợp với cổ phục nhiều lớp, gấm lụa',
    recommendedOutfits: ['ao-tac', 'ao-nhat-binh', 'ao-ngu-than-tay-chen', 'ao-tu-than', 'ao-gam', 'bo-quan-hoa-dao', 'trang-phuc-khmer'],
  },
  {
    id: 'mua-lanh',
    label: 'Mưa / Lạnh',
    emoji: '🌧️',
    tempRange: '12°C - 18°C',
    desc: 'Ưu tiên vải gấm dày, chàm lanh nhiều lớp hoặc áo tấc, giao lĩnh',
    recommendedOutfits: ['ao-nhat-binh', 'ao-giao-linh', 'ao-gam', 'ao-tac', 'trang-phuc-hmong', 'trang-phuc-dao', 'trang-phuc-tay', 'trang-phuc-e-de', 'trang-phuc-gia-rai'],
  },
];

export function getAllOutfits(): Outfit[] {
  return (vietphucRaw as { vietphuc: Outfit[] }).vietphuc;
}

export function getOutfitById(id: string): Outfit | undefined {
  return getAllOutfits().find((item) => item.id === id);
}

export function getAllEvents(): EventItem[] {
  return eventsRaw as EventItem[];
}

export function getEventById(id: string): EventItem | undefined {
  return getAllEvents().find((item) => item.id === id);
}

export function getAllStyles(): StyleItem[] {
  return stylesRaw as StyleItem[];
}

export function getStyleById(id: string): StyleItem | undefined {
  return getAllStyles().find((item) => item.id === id);
}

export function getAllAccessories(): AccessoryItem[] {
  return accessoriesRaw as AccessoryItem[];
}

export function getAccessoryById(id: string): AccessoryItem | undefined {
  return getAllAccessories().find((item) => item.id === id);
}

export function getRulesData(): RulesData {
  return rulesRaw as unknown as RulesData;
}

export function getCostumeRules(outfitId: string): PerCostumeRule | undefined {
  const rules = getRulesData();
  return rules.perCostume[outfitId];
}

export function getColorNameByHex(hex: string): string {
  const normalized = hex.trim().toUpperCase();
  const found = PRESET_COLORS.find((c) => c.hex.toUpperCase() === normalized);
  return found ? found.name : hex;
}

const REGION_LABELS: Record<string, string> = {
  'toàn-quốc': 'Toàn Quốc',
  'Bắc': 'Miền Bắc',
  'Trung': 'Miền Trung',
  'Nam': 'Miền Nam',
  'Tây-Bắc': 'Tây Bắc',
  'Đông-Bắc': 'Đông Bắc',
  'Tây-Nguyên': 'Tây Nguyên',
  'Tây-Nam-Bộ': 'Tây Nam Bộ',
};

const DYNASTY_LABELS: Record<string, string> = {
  'Nguyễn': 'Triều Nguyễn',
  'Lê-Trần': 'Thời Lê – Trần',
  'Lê': 'Thời Lê',
  'trước-Lý': 'Thời Tiền Lý',
  'Lê-Nguyễn': 'Thời Lê – Nguyễn',
  'Pháp-thuộc': 'Thời Cận Đại',
  'Champa': 'Vương Quốc Champa',
  'nhiều': 'Truyền Thống Lâu Đời',
};

const CATEGORY_LABELS: Record<string, string> = {
  'cổ-truyền': 'Cổ Truyền',
  'vùng-miền': 'Vùng Miền',
  'dân-tộc': 'Dân Tộc',
  'phụ-kiện': 'Biểu Tượng',
};

export function formatRegion(region: string): string {
  return REGION_LABELS[region] || formatSlugLabel(region);
}

export function formatDynasty(dynasty: string): string {
  return DYNASTY_LABELS[dynasty] || formatSlugLabel(dynasty);
}

export function formatCategory(category: string): string {
  return CATEGORY_LABELS[category] || formatSlugLabel(category);
}

export function formatSlugLabel(slug: string): string {
  if (!slug) return '';
  return slug
    .split('-')
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
    .join(' ');
}
