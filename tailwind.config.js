/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme colors
        'kodax-dark': '#0a0a0f',
        'kodax-darker': '#050508',
        'kodax-card': '#1a1a2e',
        'kodax-purple': '#7c3aed',
        'kodax-blue': '#3b82f6',
        'kodax-pink': '#ec4899',
        'kodax-green': '#10b981',
        'kodax-orange': '#f59e0b',
        'kodax-glass': 'rgba(255, 255, 255, 0.05)',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'mono': ['Fira Code', 'monospace'],
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(124, 58, 237, 0.4)',
        'glow-lg': '0 0 40px rgba(124, 58, 237, 0.6)',
      },
    },
  },
  plugins: [],
}

