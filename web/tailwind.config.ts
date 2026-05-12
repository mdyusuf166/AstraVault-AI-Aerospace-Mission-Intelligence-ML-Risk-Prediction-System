import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        void: "#030712",
        panel: "#07111f",
        "panel-soft": "#0b1728",
        line: "rgba(148, 163, 184, 0.2)",
        telemetry: "#38bdf8",
        aurora: "#34d399",
        warning: "#f59e0b",
        danger: "#fb7185"
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "ui-monospace", "SFMono-Regular"]
      },
      boxShadow: {
        command: "0 16px 60px rgba(0, 0, 0, 0.38)"
      }
    }
  },
  plugins: []
};

export default config;
