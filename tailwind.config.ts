import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./config/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        panel: "rgb(var(--color-panel) / <alpha-value>)",
        subtle: "rgb(var(--color-subtle) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        "accent-strong": "rgb(var(--color-accent-strong) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)"
      },
      boxShadow: {
        soft: "0 20px 60px rgb(15 23 42 / 0.08)"
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "Segoe UI",
          "Arial",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};

export default config;
