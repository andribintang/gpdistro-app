import type { Config } from "tailwindcss";

// Warna memakai channel RGB dari CSS variable (--c-*) supaya bisa ditukar
// per tema lewat [data-theme] sekaligus tetap mendukung modifier opacity (mis. bg-volt/15).
const c = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: c("--c-bg"),
        surface: c("--c-surface"),
        surface2: c("--c-surface2"),
        line: c("--c-line"),
        bone: c("--c-bone"),
        muted: c("--c-muted"),
        volt: { DEFAULT: c("--c-volt"), dark: c("--c-volt-dark") },
      },
      fontFamily: {
        sans: ["var(--ui-sans)", "system-ui", "sans-serif"],
        display: ["var(--ui-disp)", "Impact", "sans-serif"],
      },
      borderRadius: { xl2: "16px" },
      boxShadow: {
        volt: "0 0 0 1px rgb(var(--c-volt) / .3), 0 12px 40px rgb(var(--c-volt) / .08)",
        card: "0 16px 44px rgb(0 0 0 / .18)",
      },
      keyframes: {
        bob: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
        marquee: { to: { transform: "translateX(-50%)" } },
        ticker: { to: { transform: "translateX(-50%)" } },
      },
      animation: {
        bob: "bob 2.6s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
        ticker: "ticker 22s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
