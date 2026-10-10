import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./features/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces — slightly warmer than the previous version.
        bg: { DEFAULT: "#0A0C0E", surface: "#131619", elevated: "#1B1F23", raised: "#22262B" },
        border: { DEFAULT: "#24282D", strong: "#31363C" },
        text: { DEFAULT: "#F4F5F6", muted: "#A0A6AC", faint: "#7B8288" },
        // Accents.
        accent: { DEFAULT: "#F0A93A", soft: "#8A5F1E", deep: "#B87A1E" },
        teal: { DEFAULT: "#4FBDB0", soft: "#1F5A54" },
        danger: { DEFAULT: "#E05555", soft: "#5A2323" },
        success: { DEFAULT: "#4FBE7A", soft: "#1F5A38" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.04em" }],
      },
      borderRadius: { sm: "4px", md: "6px", lg: "10px", xl: "14px" },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.02) inset, 0 1px 2px 0 rgba(0,0,0,0.4)",
        pop: "0 12px 32px -12px rgba(0,0,0,0.6)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "slide-up": "slide-up 260ms ease-out",
        "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
