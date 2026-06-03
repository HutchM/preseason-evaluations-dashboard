import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sport-science navy palette
        navy: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#1e1b4b",
          900: "#0f0e2a",
          950: "#080718",
        },
        accent: {
          green:  "#10b981",
          amber:  "#f59e0b",
          red:    "#ef4444",
          blue:   "#3b82f6",
          purple: "#8b5cf6",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "sidebar-gradient": "linear-gradient(180deg, #0f0e2a 0%, #1e1b4b 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
