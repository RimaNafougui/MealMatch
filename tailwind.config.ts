import { heroui } from "@heroui/theme";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],

  darkMode: "class",

  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
      },

      fontSize: {
        h1: ["3rem", { lineHeight: "1.2" }],
        h2: ["2rem", { lineHeight: "1.2" }],
        h3: ["1.5rem", { lineHeight: "1.2" }],
        body: ["1rem", { lineHeight: "1.6" }],
        small: ["0.875rem", { lineHeight: "1.5" }],
      },

      animation: {
        "fade-in": "fadeIn 0.8s ease-in-out",
        "slide-up": "slideUp 0.6s ease-out",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },

      letterSpacing: {
        tighter: "-0.05em",
        tight: "-0.025em",
        widest: "0.15em",
        "super-wide": "0.2em",
      },
    },
  },

  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            background: {
              DEFAULT: "#F8FAFC",
              foreground: "#1E293B",
            },
            primary: {
              DEFAULT: "#2563EB",
              foreground: "#FFFFFF",
            },
            secondary: {
              DEFAULT: "#64748B",
              foreground: "#FFFFFF",
            },
            warning: {
              DEFAULT: "#F59E0B",
              foreground: "#1E293B",
            },
            danger: {
              DEFAULT: "#EF4444",
              foreground: "#FFFFFF",
            },
            success: {
              50: "#e6f4ee",
              100: "#c2e3d3",
              200: "#9bd1b6",
              300: "#70be97",
              400: "#4daf7e",
              500: "#2a9f65",
              600: "#1d7d4e",
              700: "#125c38",
              800: "#093d25",
              900: "#2E6F40",
              DEFAULT: "#2E6F40",
              foreground: "#FFFFFF",
            },
            focus: "#2563EB",
          },
        },

        dark: {
          colors: {
            background: {
              DEFAULT: "#212121",
              foreground: "#F8FAFC",
            },
            primary: {
              DEFAULT: "#60A5FA",
              foreground: "#0F172A",
            },
            secondary: {
              DEFAULT: "#94A3B8",
              foreground: "#0F172A",
            },
            warning: {
              DEFAULT: "#FBBF24",
              foreground: "#0F172A",
            },
            danger: {
              DEFAULT: "#EF4444",
              foreground: "#FFFFFF",
            },
            success: {
              50: "#e6f4ee",
              100: "#c2e3d3",
              200: "#9bd1b6",
              300: "#70be97",
              400: "#4daf7e",
              500: "#2a9f65",
              600: "#1d7d4e",
              700: "#125c38",
              800: "#093d25",
              900: "#2E6F40",
              DEFAULT: "#2E6F40",
              foreground: "#FFFFFF",
            },
            focus: "#60A5FA",
          },
        },
      },

      layout: {
        radius: {
          small: "0.375rem",
          medium: "0.5rem",
          large: "0.75rem",
        },
        borderWidth: {
          small: "1px",
          medium: "1.5px",
          large: "2px",
        },
      },
    }),
  ],
};

export default config;
