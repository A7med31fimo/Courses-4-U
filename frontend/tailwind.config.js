/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        ink:   '#0D0F14',
        slate: '#161B26',
        card:  '#1E2536',
        muted: '#2E3750',
        line:  '#353D55',
        dim:   '#6B7699',
        soft:  '#A8B4D8',
        light: '#D8DEF0',
        snow:  '#F0F2FA',
        amber: '#F5A623',
        coral: '#FF6B6B',
        teal:  '#3ECFCF',
        green: '#44C87A',
      },
      animation: {
        'fade-up':   'fadeUp 0.5s ease forwards',
        'fade-in':   'fadeIn 0.4s ease forwards',
        'shimmer':   'shimmer 1.6s infinite',
      },
      keyframes: {
        fadeUp:  { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:  { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        shimmer: { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
      },
    },
  },
  plugins: [],
}
