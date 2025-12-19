import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: '#002060',
          dark: '#001a4d',
          light: '#003399',
        },
        secondary: {
          DEFAULT: '#003399',
          dark: '#002673',
          light: '#0040bf',
        },
        accent: {
          DEFAULT: '#FF8C00',
          dark: '#cc7000',
          light: '#ffa333',
        },
        gray: {
          dark: '#404040',
          light: '#f5f5f5',
        },
      },
    },
  },
  plugins: [],
};

export default config;
