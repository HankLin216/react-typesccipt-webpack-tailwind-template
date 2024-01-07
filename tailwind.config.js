const { fontFamily } = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['fira-code-regular', 'sans-serif', ...fontFamily.sans],
      },
    },
  },
  plugins: [],
}
