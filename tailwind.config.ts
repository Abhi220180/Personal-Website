import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        ink: "var(--ink)",
        graphite: "var(--graphite)",
        mist: "var(--mist)",
        stroke: "var(--stroke)"
      },
      fontFamily: {
        display: [
          "\"Iowan Old Style\"",
          "\"Palatino Linotype\"",
          "\"Book Antiqua\"",
          "Palatino",
          "Georgia",
          "serif"
        ],
        body: [
          "\"Avenir Next\"",
          "\"Segoe UI\"",
          "\"Helvetica Neue\"",
          "Arial",
          "sans-serif"
        ]
      },
      boxShadow: {
        "soft-line": "0 0 0 1px rgba(20, 20, 20, 0.08), 0 18px 40px rgba(20, 20, 20, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
