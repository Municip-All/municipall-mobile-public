/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        matcha: {
          100: '#E3EDDE',
          300: '#A8C69F',
          500: '#7A9B6D',
          700: '#4A6741',
          900: '#2E4029',
        },
        cream: {
          50: '#FDFCF9',
          100: '#F7F4EC',
          200: '#EFEAE0',
        },
        charcoal: '#3A4238',
        muted: '#7C8378',
        sake: '#C65D4E',
        amber: '#D9A441',
        info: '#7A8FA6',
        night: {
          bg: '#1C241A',
          surface: '#252E22',
          elevated: '#2A3426',
          border: '#39442F',
          text: '#E8EDE4',
          muted: '#9FAA96',
        },
      },
      boxShadow: {
        soft: '0 2px 8px rgba(74, 103, 65, 0.08)',
      },
    },
  },
  plugins: [],
};
