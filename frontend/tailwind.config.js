/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gis: {
          sidebar: '#003399',
          'sidebar-dark': '#002266',
          'sidebar-hover': '#1a4bb8',
          accent: '#00d2ff',
          surface: '#f4f6fa',
          card: '#ffffff',
          navy: '#0b192c',
        },
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcdbff',
          300: '#8ec4ff',
          400: '#59a2ff',
          500: '#1d70f8',
          600: '#1455e6',
          700: '#0f3fc4',
          800: '#13359e',
          900: '#152f7c',
          950: '#0c1a45',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)',
        'premium': '0 10px 30px -5px rgba(10, 37, 88, 0.08), 0 4px 12px -2px rgba(10, 37, 88, 0.04)',
        'gis': '0 8px 24px -4px rgba(0, 51, 153, 0.15)',
      }
    },
  },
  plugins: [],
}
