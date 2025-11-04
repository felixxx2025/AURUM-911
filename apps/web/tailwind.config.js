/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--primary-50)',
          500: 'var(--primary-500)',
          900: 'var(--primary-900)',
        },
        gray: {
          50: 'var(--gray-50)',
          500: 'var(--gray-500)',
          900: 'var(--gray-900)',
        }
      }
    },
  },
  plugins: [],
}