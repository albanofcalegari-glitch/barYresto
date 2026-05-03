import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf8f0",
          100: "#f5e6c8",
          200: "#e8cc8e",
          300: "#d4a74a",
          400: "#c89454",
          500: "#b8860b",
          600: "#9b7f3f",
          700: "#7a6432",
          800: "#5a4a25",
          900: "#3a3018",
        },
        gold: {
          DEFAULT: "#c89454",
          light: "#d4a74a",
          dark: "#9b7f3f",
        },
      },
      fontFamily: {
        sans: ["var(--font-raleway)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
