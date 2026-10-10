// ============================================================
// FILE: src/shims/next-font-google.ts
// ============================================================

export interface FontOptions {
  variable?: string;
  subsets?: string[];
  weight?: string | string[];
  display?: string;
}

export function Spectral(_options?: FontOptions) {
  return {
    className: 'font-serif',
    variable: 'font-spectral-var',
    style: { fontFamily: 'var(--font-spectral), Georgia, serif' },
  };
}

export function Be_Vietnam_Pro(_options?: FontOptions) {
  return {
    className: 'font-sans',
    variable: 'font-be-vietnam-var',
    style: { fontFamily: 'var(--font-be-vietnam), system-ui, sans-serif' },
  };
}
