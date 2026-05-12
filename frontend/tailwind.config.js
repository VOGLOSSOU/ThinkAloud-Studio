/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        noir: "#0A0A0A",
        "gris-nuit": "#1A1A1A",
        "gris-studio": "#2E2E2E",
        or: "#C8A96E",
        "bleu-nuit": "#6E8FC8",
        "blanc-brume": "#FAFAFA",
        "gris-cendre": "#9A9A9A",
        ivoire: "#F5F3EF",
      },
      fontFamily: {
        playfair: ["Playfair Display", "serif"],
        lora: ["Lora", "serif"],
        dm: ["DM Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        input: "4px",
        card: "8px",
        modal: "16px",
      },
      animation: {
        "fade-in": "fadeIn 200ms ease-out",
        "slide-up": "slideUp 200ms ease-out",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(8px)" }, to: { opacity: 1, transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
