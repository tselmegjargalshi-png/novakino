import type { Config } from "tailwindcss";

// Colors map to the design tokens in src/styles/tokens.css.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--np-bg-rgb) / <alpha-value>)",
        surface: "rgb(var(--np-surface-rgb) / <alpha-value>)",
        "surface-2": "rgb(var(--np-surface-2-rgb) / <alpha-value>)",
        line: "rgb(var(--np-border-rgb) / <alpha-value>)",
        violet: "rgb(var(--np-violet-rgb) / <alpha-value>)",
        electric: "rgb(var(--np-electric-rgb) / <alpha-value>)",
        deep: "rgb(var(--np-deep-rgb) / <alpha-value>)",
        sky: "rgb(var(--np-blue-rgb) / <alpha-value>)",
        ink: "rgb(var(--np-text-rgb) / <alpha-value>)",
        muted: "rgb(var(--np-muted-rgb) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter Variable", "system-ui", "sans-serif"],
        display: ["Unbounded", "Inter Variable", "sans-serif"],
      },
      borderRadius: { card: "12px" },
      transitionTimingFunction: { nova: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
      maxWidth: { page: "1440px" },
    },
  },
  plugins: [],
};

export default config;
