// ============================================================
// FILE: next.config.ts
// ============================================================

const nextConfig = {
  images: {
    unoptimized: true, // Tắt optimization để tránh lỗi build với webp local
  },
};

export default nextConfig;
