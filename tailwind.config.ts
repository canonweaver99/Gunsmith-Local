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
        // Core palette - disciplined color system
        'gunsmith-black': '#000000',        // Pure black for page edges only
        'gunsmith-surface-1': '#0C0D0F',    // Primary surface
        'gunsmith-surface-2': '#121317',    // Secondary surface
        'gunsmith-surface-3': '#1A1C22',    // Tertiary surface
        
        // Primary accent - single gold
        'gunsmith-gold': '#F8D23C',         // Primary gold
        
        // Secondary accent
        'gunsmith-gunmetal': '#213041',     // Gunmetal blue for section bands
        
        // Text hierarchy
        'gunsmith-text': '#EAEAEA',         // Primary text on dark
        'gunsmith-text-secondary': '#A8A8A8', // Secondary text
        'gunsmith-text-muted': '#6B6B6B',   // Muted text
        
        // Functional
        'gunsmith-error': '#d4183d',
        'gunsmith-border': 'rgba(255, 255, 255, 0.05)', // 5% white borders
      },
      fontFamily: {
        'bebas': ['var(--font-bebas)', 'Bebas Neue', 'sans-serif'],
        'montserrat': ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
        'inter': ['var(--font-inter)', 'Inter', 'sans-serif'],
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
