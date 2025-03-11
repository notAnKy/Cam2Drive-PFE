/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html', 
    './src/**/*.{js,ts,jsx,tsx}', // Ensure this covers all your JSX/TSX files
    './src/**/*.css', 
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
