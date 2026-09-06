import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        "border-strong": "hsl(var(--border-strong))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        "background-subtle": "hsl(var(--background-subtle))",
        "background-muted": "hsl(var(--background-muted))",
        foreground: "hsl(var(--foreground))",
        "foreground-muted": "hsl(var(--foreground-muted))",
        "foreground-subtle": "hsl(var(--foreground-subtle))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          hover: "hsl(var(--primary-hover))",
          subtle: "hsl(var(--primary-subtle))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
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
          bg: "hsl(var(--destructive-bg))",
          border: "hsl(var(--destructive-border))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          bg: "hsl(var(--success-bg))",
          border: "hsl(var(--success-border))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          bg: "hsl(var(--warning-bg))",
          border: "hsl(var(--warning-border))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          bg: "hsl(var(--info-bg))",
          border: "hsl(var(--info-border))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.8125rem", { lineHeight: "1.125rem" }],
        base: ["0.875rem", { lineHeight: "1.25rem" }],
        md: ["0.9375rem", { lineHeight: "1.375rem" }],
        lg: ["1rem", { lineHeight: "1.5rem" }],
        xl: ["1.125rem", { lineHeight: "1.625rem" }],
        "2xl": ["1.25rem", { lineHeight: "1.75rem" }],
        "3xl": ["1.5rem", { lineHeight: "2rem" }],
        "4xl": ["1.875rem", { lineHeight: "2.25rem" }],
      },
      borderWidth: {
        DEFAULT: "1px",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "card-md":
          "0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)",
        none: "none",
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
