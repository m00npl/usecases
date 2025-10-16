import type { Config } from "tailwindcss"

export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx,ts,tsx,json}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0B0F14",
        surface: "#121722",
        border: "#1F2632",
        text: "#DCE3EA",
        muted: "#8EA0B3",
        primary: {
          DEFAULT: "#36D399",
          foreground: "#00110b"
        }
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem"
      },
      boxShadow: {
        soft: "0 6px 30px rgba(0,0,0,0.25)"
      }
    }
  },
  plugins: []
} satisfies Config
