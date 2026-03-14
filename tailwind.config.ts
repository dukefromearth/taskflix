import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#f3eee5',
        panel: '#fdfaf4',
        ink: '#211f1c',
        muted: '#5d5a55',
        accent: '#b91c1c',
        danger: '#b42318'
      },
      boxShadow: {
        card: '0 14px 36px rgba(36,20,8,0.08)'
      }
    }
  },
  plugins: []
};

export default config;
