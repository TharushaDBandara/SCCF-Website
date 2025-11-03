/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './sanity/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00796B',
        darkgreen: '#004D40',
        lightaqua: '#E0F2F1',
        darkgray: '#212121',
      },
      fontFamily: {
        sans: ['Poppins', 'Open Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
