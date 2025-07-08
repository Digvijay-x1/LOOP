/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}","./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--color-values))",// black
      },
    },
  },
  plugins: [
        // Set a default value on the `:root` element
        ({ addBase }) =>
          addBase({
            ":root": {
              "--color-values": "0 0 0", // black
              "--color-rgb": "rgb(0 0 0)",
            },
          }),
    
  ],
}