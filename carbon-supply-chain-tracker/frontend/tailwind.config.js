/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#10b981", // emerald-500
        secondary: "#047857", // emerald-700
        dark: "#0f172a", // slate-900
        darker: "#020617", // slate-950
        card: "rgba(30, 41, 59, 0.7)", // slate-800 with opacity
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
