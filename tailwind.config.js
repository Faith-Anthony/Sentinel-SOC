/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cybersecurity dark theme
        'dark-bg': '#0f172a',
        'dark-surface': '#1a202c',
        'dark-border': '#2d3748',
        'cyber-cyan': '#00d9ff',
        'cyber-blue': '#0099ff',
        'cyber-purple': '#9d4edd',
        'cyber-accent': '#ff006e',
        'success-green': '#10b981',
        'warning-orange': '#f59e0b',
        'danger-red': '#ef4444',
      },
      backgroundColor: {
        'dark-primary': '#0f172a',
        'dark-secondary': '#1a202c',
        'dark-tertiary': '#2d3748',
      },
      borderColor: {
        'dark-border': '#2d3748',
        'cyber-glow': '#00d9ff',
      },
      textColor: {
        'dark-primary': '#f1f5f9',
        'dark-secondary': '#cbd5e1',
        'dark-tertiary': '#94a3b8',
      },
      boxShadow: {
        'cyber-glow': '0 0 20px rgba(0, 217, 255, 0.3)',
        'cyber-glow-lg': '0 0 30px rgba(0, 217, 255, 0.5)',
        'danger-glow': '0 0 15px rgba(255, 0, 110, 0.3)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slide-in 0.3s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { 'box-shadow': '0 0 20px rgba(0, 217, 255, 0.3)' },
          '50%': { 'box-shadow': '0 0 30px rgba(0, 217, 255, 0.5)' },
        },
        'slide-in': {
          'from': { transform: 'translateX(-100%)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        }
      },
    },
  },
  plugins: [],
}
