/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        wise: {
          green: '#9FE870',
          forest: '#163300',
          orange: '#FFC091',
          yellow: '#FFEB69',
          blue: '#A0E1E1',
          pink: '#FFD7EF',
          purple: '#260A2F',
          gold: '#3A341C',
          charcoal: '#21231D',
          maroon: '#320707'
        },
        primary: {
          50: '#f3ffe6',
          100: '#e5ffc9',
          200: '#ceff99',
          300: '#9fe870',
          400: '#85d147',
          500: '#65ab2c',
          600: '#4d881e',
          700: '#3c691a',
          800: '#33531a',
          900: '#2d4619',
          950: '#163300'
        }
      },
      animation: {
        'skeleton-pulse': 'skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'skeleton-pulse': {
          '0%, 100%': {
            opacity: 1,
          },
          '50%': {
            opacity: .5,
          },
        },
      },
      fontFamily: {
        sans: [
          'Inter var',
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        '2xs': '0.65rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};