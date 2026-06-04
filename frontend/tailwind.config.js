export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fffdf0',
          100: '#fffbcf',
          200: '#fff79c',
          300: '#fff15c',
          400: '#ffe81f',
          500: '#FFD400', // GEARBOX Primary Yellow
          600: '#E6BF00', // GEARBOX Hover Yellow
          700: '#cca900',
          800: '#b39400',
          900: '#997f00',
        },
        gray: {
          50: '#F9F9F9',
          100: '#F3F3F3',
          200: '#E6E6E6',
          300: '#CCCCCC',
          400: '#A3A3A3',
          500: '#737373',
          600: '#6B6B6B', // GEARBOX Text Secondary
          700: '#404040',
          800: '#262626',
          900: '#111111', // GEARBOX Text Primary / Dark
        }
      },
      fontFamily: { sans: ['Plus Jakarta Sans','system-ui','sans-serif'] }
    }
  },
  plugins: []
}
