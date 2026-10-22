import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-onest)", "var(--font-archivo)", "system-ui", "sans-serif"],
        display: ["var(--font-archivo)", "sans-serif"],
        mono: ["var(--font-martian-mono)", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // Midnight app palette (customer app, login, demo cockpit)
        night: {
          DEFAULT: "#09090B",
          900: "#09090B",
          800: "#111114",
          700: "#18181C",
          600: "#202026",
          500: "#2A2A31",
        },
        ink: {
          DEFAULT: "#FAFAF7",
          soft: "#C9C9CF",
          mute: "#8B8B94",
          faint: "#5C5C66",
        },
        mint: "#3DDC97",
        coral: "#FF6B4A",
        qb: {
          chalk: "#FFFCF2",
          meter: "#111111",
          yellow: "#FFD60A",
          green: "#0B7A4B",
          coral: "#FF5A36",
          amber: "#F59E0B",
          gold: "#EAB308",
          black: "#111111",
          dark: "#0F172A",
          surface: "#FFFFFF",
          muted: "#F4F0E6",
          border: "#E5E0D5",
        },
        brand: {
          50: "#FEFCE8",
          100: "#FEF9C3",
          200: "#FEF08A",
          300: "#FDE047",
          400: "#FFD60A",
          500: "#EAB308",
          600: "#CA8A04",
          700: "#A16207",
          800: "#854D0E",
          900: "#713F12",
          DEFAULT: "#FFD60A",
        },
        metro: {
          purple: "#6366f1",
          green: "#10b981",
          yellow: "#facc15",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,214,10,0.35), 0 12px 40px -8px rgba(255,214,10,0.35)",
        card: "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 20px 40px -24px rgba(0,0,0,0.8)",
      },
      keyframes: {
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
      },
      animation: {
        "pulse-subtle": "pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
