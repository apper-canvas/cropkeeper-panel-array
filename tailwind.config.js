/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2E7D32',
        secondary: '#8D6E63',
        accent: '#FF6F00',
        surface: {
          50: '#FAFAF8',
          100: '#F5F5DC',
          200: '#EEEEC4',
          300: '#E7E7AC',
          400: '#E0E094',
          500: '#D9D97C',
          600: '#C3C361',
          700: '#ADAD45',
          800: '#979729',
          900: '#81810D'
        },
        success: '#43A047',
        warning: '#FFB300',
        error: '#D32F2F',
        info: '#1976D2'
      },
      fontFamily: { 
        sans: ['Inter', 'ui-sans-serif', 'system-ui'], 
        heading: ['Outfit', 'ui-sans-serif', 'system-ui'] 
      }
    },
  },
  plugins: [],
}