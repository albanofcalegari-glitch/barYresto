import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c084fc",
          400: "#a870fc",
          500: "#7c5cfc",
          600: "#6d4aed",
          700: "#5b38d4",
          800: "#4c1d95",
          900: "#2e1065",
        },
        gold: {
          DEFAULT: "#c89454",
          light: "#d4a74a",
          dark: "#9b7f3f",
        },
        surface: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          card: "rgb(var(--color-surface-card) / <alpha-value>)",
          elevated: "rgb(var(--color-surface-elevated) / <alpha-value>)",
        },
        "th-text": {
          primary: "rgb(var(--color-text-primary) / <alpha-value>)",
          secondary: "rgb(var(--color-text-secondary) / <alpha-value>)",
          muted: "rgb(var(--color-text-muted) / <alpha-value>)",
        },
        "th-border": "rgb(var(--color-border) / var(--color-border-alpha))",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        heading: ["var(--font-syne)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
        "3xl": "22px",
      },
      boxShadow: {
        glow: "var(--shadow-glow)",
        "glow-lg": "var(--shadow-glow-lg)",
      },
    },
  },
  plugins: [],
};

export default config;
