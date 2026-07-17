import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'gold': {
          400: '#f4b942',
          500: '#e8a020',
          600: '#c87d0e',
        },
        'zao-dark': '#0a0a0f',
        'zao-card': '#12121a',
        'zao-border': '#1e1e2e',
        'zao-violet': '#6d28d9',
      },
    },
  },
  plugins: [],
}

export default config
