// ============================================================
// FILE: tailwind.config.ts
// ============================================================

const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-spectral)', 'Georgia', 'serif'],
        sans: ['var(--font-be-vietnam)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
