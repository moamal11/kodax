/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        kodax: {
          dark: '#0f0f1e',
          medium: '#1a1a3e',
          light: '#252550',
          primary: '#ef4444',
          secondary: '#8b5cf6',
          accent: '#3b82f6',
        },
      },
    },
  },
  plugins: [],
};
