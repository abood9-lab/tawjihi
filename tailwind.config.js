/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

export default {
  content: ["./*.html", "./*.js", "./src/**/*.js"],
  theme: {
    extend: {
      colors: {
        primary: "#00346f",
        secondary: "#2c694e",
        background: "#f8f9ff"
      },
      fontFamily: {
        sans: ["Noto Sans Arabic", "sans-serif"]
      }
    }
  },
  plugins: [forms, containerQueries]
};
