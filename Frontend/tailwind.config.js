/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: '#f6b24a',
        'accent-dark': '#f39c12',
        'accent-light': '#fff4e1',
        'accent-contrast': '#8a4f00'
      }
    },
  },
  plugins: [],
}