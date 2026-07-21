export default {
  content: [
    "./index.html",
    "./rooms.html",
    "./amenities.html",
    "./gallery.html",
    "./contact.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          dark: '#080C0A', // Even deeper, inkier charcoal-obsidian
          olive: '#111D15', // Rich, dark woodland forest
          gold: '#D4AF37', // Genuine deep metallic gold luster
          cream: '#FAF9F5', // Soft, unbleached limestone cream
          soft: '#D2C9B9', // Warm, weathered-sand khaki
          accent: '#0C1611', // Deep midnight moss
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.25em',
        luxury: '0.3em',
        'luxury-wide': '0.4em',
        'luxury-ultra': '0.5em',
      },
      animation: {
        'fade-in-up': 'fadeInUp 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-up': 'scaleUp 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'line-draw': 'lineDraw 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(60px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(1.08)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        lineDraw: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        }
      }
    },
  },
  plugins: [],
}
