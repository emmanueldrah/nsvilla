/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./rooms.html",
    "./amenities.html",
    "./gallery.html",
    "./pricing.html",
    "./contact.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#0a0a0a',
        'cream': '#faf9f6',
        'accent': '#a89968',
        'gold': '#d4a574',
        'light': '#f0ebe5',
        'muted': '#888888',
        'border-light': '#e8e6e1'
      },
      fontFamily: {
        'serif': ['Fraunces', 'Georgia', 'serif'],
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']
      },
      fontWeight: {
        '600': '600'
      },
      spacing: {
        'section': '6rem',
        'section-sm': '3rem'
      },
      animation: {
        'scroll': 'scroll 20s linear infinite',
        'fade-up': 'fadeInUp 0.8s ease-out forwards',
        'fade-in': 'fadeIn 0.6s ease-out forwards'
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' }
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      }
    }
  },
  plugins: []
}
