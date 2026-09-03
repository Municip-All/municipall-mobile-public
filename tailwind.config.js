/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        matcha: {
          100: '#E6F1DC',
          300: '#A3C98F',
          500: '#5C9A4E',
          700: '#3D6B2F',
          900: '#24391C',
        },
        cream: {
          50: '#FEFDFB',
          100: '#F8F6EF',
          200: '#EBE6D9',
        },
        charcoal: '#313B2B',
        muted: '#5C6654',
        sake: '#D2543F',
        amber: '#E09A2D',
        info: '#5B87B0',
        night: {
          bg: '#09090B',
          surface: '#18181B',
          elevated: '#27272A',
          border: '#3F3F46',
          text: '#FAFAFA',
          muted: '#A1A1AA',
        },
      },
      boxShadow: {
        soft: '0 2px 8px rgba(74, 103, 65, 0.08)',
      },
    },
  },
  plugins: [],
};
