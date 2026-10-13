import type { Config } from "tailwindcss";

// Brand tokens for Harbour View Resort: deep harbour ink, champagne gold and warm sand.
// Token names are shared with the template (navy, brand, leaf…) so every component picks them up.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#13262F", deep: "#0B171D", soft: "#22394A" },
        brand: { DEFAULT: "#8A6A3A", dark: "#6E5430", light: "#F5EEE2" },
        sky: { DEFAULT: "#D9B77E", soft: "#F1E4CC" },
        leaf: { DEFAULT: "#C9A46A", dark: "#7E5F33", soft: "#F4ECDD" },
        sun: { DEFAULT: "#E3C285", soft: "#FBF4E6" },
        ink: "#1B1A17",
        slate: "#5C6670",
        mist: "#F7F3EC",
        pearl: "#F4EFE6",
        line: "#E8DFD1",
        danger: "#B3362D",
        whatsapp: "#25D366",
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        card: "28px",
        input: "14px",
      },
      boxShadow: {
        soft: "0 24px 60px -20px rgba(11, 47, 94, 0.28)",
        card: "0 10px 30px -12px rgba(11, 47, 94, 0.16)",
        glow: "0 0 0 6px rgba(46, 155, 234, 0.15)",
      },
      keyframes: {
        twinkle: { "0%,100%": { opacity: "1", transform: "scale(1) rotate(0deg)" }, "50%": { opacity: ".45", transform: "scale(.75) rotate(20deg)" } },
        floaty: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        sweep: { "0%": { transform: "translateX(-10%)" }, "50%": { transform: "translateX(70%)" }, "100%": { transform: "translateX(-10%)" } },
        reveal: { "0%": { clipPath: "inset(0 100% 0 0)" }, "50%": { clipPath: "inset(0 15% 0 0)" }, "100%": { clipPath: "inset(0 100% 0 0)" } },
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        rise: { "0%": { opacity: "0", transform: "translateY(18px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        kenburns: { "0%": { transform: "scale(1.04) translate(0, 0)" }, "100%": { transform: "scale(1.14) translate(-2%, -2%)" } },
        wave: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-1440px)" } },
        bob: { "0%,100%": { transform: "translateY(0) rotate(0deg)" }, "50%": { transform: "translateY(5px) rotate(-1.5deg)" } },
        sway: { "0%,100%": { transform: "rotate(-3deg)" }, "50%": { transform: "rotate(4deg)" } },
        spin: { to: { transform: "rotate(360deg)" } },
        grain: { "0%,100%": { transform: "translate(0,0)" }, "20%": { transform: "translate(-4%,3%)" }, "40%": { transform: "translate(3%,-5%)" }, "60%": { transform: "translate(-3%,5%)" }, "80%": { transform: "translate(5%,-2%)" } },
      },
      animation: {
        twinkle: "twinkle 2.8s ease-in-out infinite",
        floaty: "floaty 6s ease-in-out infinite",
        sweep: "sweep 7s ease-in-out infinite",
        reveal: "reveal 7s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
        rise: "rise .6s ease-out both",
        kenburns: "kenburns 18s ease-in-out infinite alternate",
        wave: "wave 14s linear infinite",
        "wave-slow": "wave 26s linear infinite",
        bob: "bob 4s ease-in-out infinite",
        sway: "sway 7s ease-in-out infinite",
        "spin-slow": "spin 24s linear infinite",
        grain: "grain 1.2s steps(6) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
