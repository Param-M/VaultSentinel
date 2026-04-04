import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--bg-color)",
        foreground: "var(--text-color)",
        alt: "var(--bg-alt)",
        muted: "var(--text-muted)",
        accent: {
          blue: "var(--accent-blue)",
          cyan: "var(--accent-cyan)",
          purple: "var(--accent-purple)",
          pink: "var(--accent-pink)",
          green: "var(--accent-green)",
          orange: "var(--accent-orange)",
        },
        borderLight: "var(--border-color)",
      },
    },
  },
  plugins: [],
};
export default config;
