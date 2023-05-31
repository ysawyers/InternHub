/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      screen: { min: "640px" },
      lg: { min: "1024px" },
      md: { max: "1024px" },
      sm: { max: "639px" },
    },
    extend: {},
  },
  plugins: [],
};
