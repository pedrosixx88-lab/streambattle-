import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // StreamBattle Design System
        background: "#0D0D0F",
        surface: "#1A1A1F",
        border: "#2A2A32",
        "brand-red": "#FF0050",
        "brand-blue": "#00B4FF",
        "text-primary": "#F0F0F5",
        "text-muted": "#6B6B80",
        success: "#00D084",
        warning: "#FFB800",
        // shadcn/ui compatibility
        foreground: "#F0F0F5",
        card: {
          DEFAULT: "#1A1A1F",
          foreground: "#F0F0F5",
        },
        popover: {
          DEFAULT: "#1A1A1F",
          foreground: "#F0F0F5",
        },
        primary: {
          DEFAULT: "#FF0050",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#00B4FF",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#2A2A32",
          foreground: "#6B6B80",
        },
        accent: {
          DEFAULT: "#2A2A32",
          foreground: "#F0F0F5",
        },
        destructive: {
          DEFAULT: "#FF3B30",
          foreground: "#FFFFFF",
        },
        input: "#2A2A32",
        ring: "#FF0050",
      },
      borderRadius: {
        lg: "0.625rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "battle-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "gift-pop-in": {
          "0%": { opacity: "0", transform: "translateY(20px) scale(0.8)" },
          "20%": { opacity: "1", transform: "translateY(0) scale(1.1)" },
          "80%": { opacity: "1", transform: "translateY(-10px) scale(1)" },
          "100%": { opacity: "0", transform: "translateY(-40px) scale(0.9)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "battle-pulse": "battle-pulse 1.5s ease-in-out infinite",
        "gift-pop-in": "gift-pop-in 3s ease-out forwards",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
