/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          50: '#f7f8f8',
          100: '#edf0ee',
          900: '#1f2a26'
        }
      }
    },
  },
  plugins: [],
};
