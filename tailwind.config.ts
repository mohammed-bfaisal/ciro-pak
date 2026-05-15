import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void:    '#080808',
        base:    '#111111',
        raised:  '#1a1a1a',
        overlay: '#222222',
        overlay2: '#2a2a2a',
        amber: {
          DEFAULT: '#f59e0b',
          dim:     '#d97706',
          muted:   'rgba(245,158,11,0.15)',
          glow:    'rgba(245,158,11,0.25)',
        },
        orange: {
          DEFAULT: '#ea580c',
          muted:   'rgba(234,88,12,0.12)',
        },
      },
      fontFamily: {
        display: ['DM Serif Display', 'serif'],
        mono:    ['IBM Plex Mono', 'monospace'],
        body:    ['Inter', 'sans-serif'],
      },
      screens: {
        'mobile': {'max': '768px'},
        'tablet': '768px',
        'desktop': '1024px',
      },
    },
  },
  plugins: [],
} satisfies Config
