/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      colors: {
        navy: {
          950: "#070d1a",
          900: "#080e1d",
          800: "#0a1628",
          700: "#0d2040",
          600: "#1e3a5f",
        },
        sentinel: {
          blue: "#0066cc",
          cyan: "#00d4ff",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
