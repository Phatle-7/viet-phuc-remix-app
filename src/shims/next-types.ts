// ============================================================
// FILE: src/shims/next-types.ts
// ============================================================

export interface Metadata {
  title?: string;
  description?: string;
  keywords?: string[];
  openGraph?: {
    title?: string;
    description?: string;
    type?: string;
    locale?: string;
    images?: string[];
  };
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
    images?: string[];
  };
}
