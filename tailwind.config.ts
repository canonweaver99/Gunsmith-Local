import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark backgrounds
        'gunsmith-black': '#1a1a1a',
        'gunsmith-header': '#0D0D0D',
        'gunsmith-card': '#2a2a2a',
        'gunsmith-accent': '#3a3a3a',
        
        // Gold variants - Enhanced and more vibrant
        'gunsmith-gold': '#FFE55C',
        'gunsmith-gold-bright': '#FFED4E',
        'gunsmith-gold-deep': '#E6CC00',
        'gunsmith-sandy': '#F4A460',
        'gunsmith-goldenrod': '#E6B800',
        'gunsmith-dark-gold': '#CC9900',
        'gunsmith-peru': '#CD853F',
        
        // Text colors
        'gunsmith-text': '#F5F5F5',
        'gunsmith-text-secondary': '#E5E5E5',
        'gunsmith-error': '#d4183d',
      },
      fontFamily: {
        'bebas': ['var(--font-bebas)', 'Bebas Neue', 'sans-serif'],
        'oswald': ['var(--font-oswald)', 'Oswald', 'sans-serif'],
      },
      borderColor: {
        'gunsmith-border': 'rgba(255, 215, 0, 0.2)',
      },
      backgroundColor: {
        'gunsmith-hover': 'rgba(255, 215, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
export default config
