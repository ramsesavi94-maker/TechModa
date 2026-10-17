/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Estilo urbano juvenil: blanco y negro con un acento lima eléctrico
      // (siempre como fondo, con texto ink encima) y coral para urgencia.
      colors: {
        paper: '#f4f4f1',
        surface: '#e9e9e4',
        ink: '#111111',
        muted: '#5c5c58',
        line: '#dcdcd6',
        field: '#8a8a84',
        lime: '#d7ff3c',
        coral: '#ff5a36',
        accent: '#c2410c',
        danger: '#b42318',
        success: '#2e6b3a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Anton', 'Impact', 'sans-serif'],
      },
      maxWidth: {
        page: '1440px',
      },
      transitionTimingFunction: {
        'out-quint': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-up': { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'none' } },
        'slide-in': { from: { transform: 'translateX(100%)' }, to: { transform: 'none' } },
        bump: { '0%, 100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.25)' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out both',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-in': 'slide-in 0.4s cubic-bezier(0.32, 0.72, 0, 1) both',
        bump: 'bump 0.25s ease-out',
        marquee: 'marquee 28s linear infinite',
      },
    },
  },
  plugins: [],
};
