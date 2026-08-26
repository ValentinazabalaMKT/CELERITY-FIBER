import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["\"Roboto Slab\"", "ui-serif", "Georgia", "serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        // Celerity brand: purple (primary)
        brand: {
          50: "#f6f2fb",
          100: "#ece3f5",
          200: "#d6c2e9",
          300: "#bc9bd9",
          400: "#9d6fc4",
          500: "#7f4cab",
          600: "#663690",
          700: "#582C83",
          800: "#472369",
          900: "#361b50",
          950: "#241236",
        },
        // Celerity brand: teal (secondary/accent)
        teal: {
          50: "#eef9fc",
          100: "#d6f0f7",
          200: "#ade0ee",
          300: "#7ccbe0",
          400: "#43aecc",
          500: "#1c93b3",
          600: "#0087AD",
          700: "#046f90",
          800: "#095c76",
          900: "#0c4c62",
          950: "#063040",
        },
        status: {
          pending: "#8D6E97",
          progress: "#0087AD",
          completed: "#1E8A5F",
          blocked: "#B23A3A",
        },
        priority: {
          low: "#6B7280",
          medium: "#0087AD",
          high: "#D97706",
          urgent: "#DC2626",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(17, 17, 17, 0.04), 0 4px 12px rgba(17, 17, 17, 0.05)",
        popover: "0 8px 30px rgba(17, 17, 17, 0.12)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in-right": {
          from: { transform: "translateX(12px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.97)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.15s ease-out",
        "slide-in-right": "slide-in-right 0.2s ease-out",
        "scale-in": "scale-in 0.12s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
