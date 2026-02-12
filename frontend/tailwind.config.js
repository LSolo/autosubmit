/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: '#020205',
          dark: '#0a0a12',
          gray: '#1a1a2e',
          blue: '#00f3ff',
          purple: '#bc13fe',
          pink: '#ff0055',
          green: '#0aff00',
        }
      },
      fontFamily: {
        'orbitron': ['"Orbitron"', 'sans-serif'],
        'rajdhani': ['"Rajdhani"', 'sans-serif'],
        'tech': ['"Share Tech Mono"', 'monospace'],
      },
      boxShadow: {
        'neon-blue': '0 0 5px #00f3ff, 0 0 10px #00f3ff, 0 0 20px rgba(0, 243, 255, 0.5)',
        'neon-purple': '0 0 5px #bc13fe, 0 0 10px #bc13fe, 0 0 20px rgba(188, 19, 254, 0.5)',
        'neon-pink': '0 0 5px #ff0055, 0 0 10px #ff0055, 0 0 20px rgba(255, 0, 85, 0.5)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(rgba(0, 243, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.1) 1px, transparent 1px)',
        'holo-gradient': 'linear-gradient(135deg, rgba(0, 243, 255, 0.1) 0%, rgba(188, 19, 254, 0.1) 100%)',
      }
    },
  },
  plugins: [],
}
