/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: '#F2F2F7',
        'surface-auth': '#F8FAFC',
        municipall: {
          blue: '#0B0080',
        },
      },
    },
  },
  plugins: [],
};
