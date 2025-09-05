/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'gunsmith-black': '#0a0a0a',
        'gunsmith-gold': '#d4af37',
        'gunsmith-goldenrod': '#b8860b',
        'gunsmith-text': '#e5e5e5',
        'gunsmith-text-secondary': '#a0a0a0',
        'gunsmith-accent': '#1a1a1a',
        'gunsmith-card': '#111111',
        'gunsmith-hover': '#1f1f1f',
        'gunsmith-border': '#333333',
        'gunsmith-header': '#0f0f0f',
        'gunsmith-error': '#dc2626',
      },
      fontFamily: {
        'bebas': ['var(--font-bebas)', 'cursive'],
        'oswald': ['var(--font-oswald)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
