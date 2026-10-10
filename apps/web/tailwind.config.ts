import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./features/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: "#0B0D0F", surface: "#14171A", elevated: "#1A1E22" },
        border: { DEFAULT: "#22262B", strong: "#2E3339" },
        text: { DEFAULT: "#F2F3F4", muted: "#9BA1A6", faint: "#7B8288" },
        accent: { DEFAULT: "#E8A33D", soft: "#8A5F1E" },
        teal: { DEFAULT: "#3FB6A8", soft: "#1F5A54" },
        danger: { DEFAULT: "#D95555", soft: "#5A2323" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.04em" }],
      },
      borderRadius: { md: "6px", lg: "10px" },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 160ms ease-out",
        "slide-up": "slide-up 220ms ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
