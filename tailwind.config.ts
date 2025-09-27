import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#090717',
        indigo: {
          500: '#4C1D95',
          600: '#4338CA',
          900: '#1A1530',
        },
        accent: {
          pink: '#FF3CAC',
          violet: '#784BA0',
          cyan: '#2B86C5',
        },
        glass: 'rgba(16, 11, 36, 0.72)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 20px 45px -10px rgba(120, 75, 160, 0.35)',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #FF3CAC 0%, #784BA0 50%, #2B86C5 100%)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
} satisfies Config
