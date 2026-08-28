/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070a12',
          900: '#0a0e1a',
          850: '#0d1224',
          800: '#111834',
          700: '#182247',
          600: '#22305f',
          500: '#2e4079',
          400: '#4a5f9e',
        },
        accent: {
          DEFAULT: '#5b8def',
          light: '#8ab0f5',
          dark: '#3e6fd1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        fab: '0 8px 24px rgba(91, 141, 239, 0.35)',
      },
    },
  },
  plugins: [],
}
