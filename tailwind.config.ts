import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      colors: {
        nobl: {
          black:  '#1A1A1A',
          blue:   '#006EC7',
          'blue-light': '#0080E8',
          'blue-dark':  '#005BA3',
          grey:   '#444444',
          'grey-light': '#888888',
          'grey-muted': '#F4F7FB',
          'grey-border': '#E5E7EB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
