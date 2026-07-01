import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211d",
        moss: "#426653",
        mint: "#dff4e9",
        clay: "#c66f4e",
        butter: "#f4d36c"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(23, 33, 29, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
