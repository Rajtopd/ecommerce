/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-bg) / <alpha-value>)",
        foreground: "rgb(var(--color-dark) / <alpha-value>)",
        brand: {
          bg: "rgb(var(--color-bg) / <alpha-value>)",
          dark: "rgb(var(--color-dark) / <alpha-value>)",
          accent: "rgb(var(--color-accent) / <alpha-value>)",
          accent2: "rgb(var(--color-accent-2) / <alpha-value>)",
          muted: "rgb(var(--color-muted) / <alpha-value>)",
          soft: "rgb(var(--color-soft) / <alpha-value>)",
          border: "rgb(var(--color-border) / <alpha-value>)",
          card: "rgb(var(--color-card) / <alpha-value>)",
          gold: "rgb(var(--color-gold) / <alpha-value>)",
        },
        border: "rgb(var(--color-border) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        decorative: ["Georgia", "serif"],
      },
      borderRadius: {
        btn: "var(--radius-btn)",
        card: "var(--radius-card)",
      },
      padding: {
        section: "var(--pad-section)",
        card: "var(--pad-card)",
      }
    },
  },
  plugins: [],
};
