/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // "Galería editorial silenciosa": todas las parejas de texto cumplen WCAG AA.
      colors: {
        paper: '#f5f3ef',
        surface: '#ebe7e0',
        ink: '#141414',
        muted: '#5f5b55',
        line: '#d9d4cc',
        field: '#8c877f',
        accent: '#8a3d1f',
        danger: '#9e2a1c',
        success: '#2f5d3a',
      },
      fontFamily: {
        sans: ['"Inter Tight"', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      maxWidth: {
        page: '1440px',
      },
      transitionTimingFunction: {
        'out-quint': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-up': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'none' } },
        'slide-in': { from: { transform: 'translateX(100%)' }, to: { transform: 'none' } },
        bump: { '0%, 100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.1)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out both',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-in': 'slide-in 0.45s cubic-bezier(0.32, 0.72, 0, 1) both',
        bump: 'bump 0.15s ease-out',
      },
    },
  },
  plugins: [],
};
