/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'edu-bg': '#F3F4F6',
        'edu-primary': '#3B82F6',
        'edu-secondary': '#10B981',
        'edu-text': '#1F2937',
      },
    },
  },
  plugins: [],
}