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
        
        // Gold variants
        'gunsmith-gold': '#FFD700',
        'gunsmith-sandy': '#F4A460',
        'gunsmith-goldenrod': '#DAA520',
        'gunsmith-dark-gold': '#B8860B',
        'gunsmith-peru': '#CD853F',
        
        // Text colors
        'gunsmith-text': '#F5F5F5',
        'gunsmith-text-secondary': '#E5E5E5',
        'gunsmith-error': '#d4183d',
      },
      fontFamily: {
        'bebas': ['Bebas Neue', 'sans-serif'],
        'oswald': ['Oswald', 'sans-serif'],
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
