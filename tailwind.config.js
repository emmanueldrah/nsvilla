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
          dark: '#0A120D', // Obsidian Forest-Green
          olive: '#13281B', // Rich Deep Olive
          gold: '#C5A880', // Champagne Gold
          cream: '#FAF9F6', // Warm Alabaster
          soft: '#E6DFD3', // Muted Sand
          accent: '#0E1F15', // Midnight Emerald
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.2em',
        luxury: '0.15em',
      },
      animation: {
        'fade-in-up': 'fadeInUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-up': 'scaleUp 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'line-draw': 'lineDraw 2s cubic-bezier(0.77, 0, 0.175, 1) forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(1.05)', opacity: '0' },
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
