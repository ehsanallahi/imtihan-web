/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#e3f6f0', 100: '#b8e9d8',
          400: '#1aab7a', 600: '#0e7a57', 900: '#063d2b'
        },
        gold: {
          50: '#fdf4e3', 100: '#fae3b0',
          400: '#e6a817', 600: '#b07d08', 900: '#5a3f02'
        },
        slate: {
          50: '#f0f2f5', 400: '#6b7280',
          600: '#4b5563', 900: '#1e2330'
        },
        crimson: {
          50: '#fceef0', 400: '#d63a4a',
          600: '#a02030', 900: '#4f0f17'
        }
      }
    },
  },
  plugins: [],
}
