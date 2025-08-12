/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      width: {
        '3/10': '30%',
        '7/10': '70%'
      },
      colors: {
        'primary-bg': '#f6fafd', // very light blue
        'primary-card': '#e0f2fe', // soft blue
        'primary-accent': '#38bdf8', // sky blue
        'primary-green': '#4ade80', // soft green
        'primary-teal': '#2dd4bf', // teal
        'primary-yellow': '#fde68a', // yellow accent
        'primary-red': '#fca5a5', // soft red
        'primary-gray': '#f3f4f6', // light gray
        'primary-dark': '#334155', // dark blue-gray
        // Dark mode colors
        'dark-bg': '#0f172a', // dark blue
        'dark-card': '#1e293b', // dark slate
        'dark-accent': '#0ea5e9', // bright blue
        'dark-green': '#22c55e', // bright green
        'dark-teal': '#14b8a6', // bright teal
        'dark-yellow': '#eab308', // bright yellow
        'dark-red': '#ef4444', // bright red
        'dark-gray': '#475569', // slate gray
        'dark-text': '#f1f5f9', // light text
      }
    },
  },
  plugins: [],
}

