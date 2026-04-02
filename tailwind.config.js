/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        borderThin: "rgb(var(--color-border-thin) / <alpha-value>)",
        textPrimary: "rgb(var(--color-text-primary) / <alpha-value>)",
        textSecondary: "rgb(var(--color-text-secondary) / <alpha-value>)",
        accent: "rgb(var(--color-primary) / <alpha-value>)",
        accentHover: "rgb(var(--color-primary-hover) / <alpha-value>)",
        primary: {
          50: "#f8f0e4",
          100: "#f1e0c0",
          200: "#e7cb97",
          300: "#d9b269",
          400: "#c79a48",
          500: "#b78d45",
          600: "#9e7431",
          700: "#7f5a23",
          800: "#65471d",
          900: "#523a1b",
          950: "#2f1f11",
        },
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
        display: ["Cormorant Garamond", "Georgia", "serif"],
        arabic: ["Cairo", "sans-serif"],
      },
      boxShadow: {
        soft: "0 12px 32px -18px rgba(92, 62, 29, 0.18)",
        "soft-lg": "0 22px 55px -24px rgba(92, 62, 29, 0.24)",
        "dark-soft": "0 10px 28px -18px rgba(0, 0, 0, 0.42)",
        "dark-soft-lg": "0 20px 48px -24px rgba(0, 0, 0, 0.55)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
        "slide-in-right": "slideInRight 0.4s ease-out forwards",
        "scale-in": "scaleIn 0.3s ease-out forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(15px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
