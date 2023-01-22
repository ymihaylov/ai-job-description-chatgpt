/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chatgpt-green': '#4fa581',
        'chatgpt-darkgrey': '#343542',
        'chatgpt-grey': '#444655',
      }
    },
  },
  plugins: [],
}
