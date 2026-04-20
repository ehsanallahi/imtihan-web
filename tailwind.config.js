/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#e3f6f0',
          100: '#b8e9d8',
          200: '#5dcaa5',
          400: '#1aab7a',
          600: '#0e7a57',
          900: '#063d2b'
        },
        gold: {
          50: '#fdf4e3',
          100: '#fae3b0',
          200: '#f5c342',
          400: '#e6a817',
          600: '#b07d08',
          900: '#5a3f02'
        },
        crimson: {
          50: '#fceef0',
          100: '#f5c8cd',
          400: '#d63a4a',
          600: '#a02030',
          900: '#4f0f17'
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Sora', 'sans-serif'],
        urdu: ['Noto Nastaliq Urdu', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
