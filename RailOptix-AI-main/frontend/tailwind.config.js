/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        railBg: "#020617", // slate-950
        railDark: "#0b132b", // deep command center blue/slate
        railCard: "rgba(15, 23, 42, 0.45)", // glassmorphism card background
        railBorder: "rgba(148, 163, 184, 0.12)", // subtle slate-400 glass border
        railBorderHover: "rgba(6, 182, 212, 0.4)", // glowing cyan hover border
        railCyan: "#06b6d4",
        railEmerald: "#10b981",
        railAmber: "#f59e0b",
        railRose: "#f43f5e",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(6, 182, 212, 0.2), 0 0 10px rgba(6, 182, 212, 0.2)' },
          '100%': { boxShadow: '0 0 15px rgba(6, 182, 212, 0.6), 0 0 25px rgba(6, 182, 212, 0.4)' },
        }
      }
    },
  },
  plugins: [],
}
