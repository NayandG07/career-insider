/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        appBg: "#F6F8FC",
        surface: "#FFFFFF",
        textPrimary: "#111827",
        textSecondary: "#4B5563",
        textMuted: "#6B7280",
        textDisabled: "#9CA3AF",
        brandPurple: {
          light: "#8B5CF6",
          DEFAULT: "#7C3AED",
          dark: "#6366F1"
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      },
      backgroundImage: {
        brandGrad: "linear-gradient(135deg, #6366F1, #7C3AED, #8B5CF6)",
        analyticsGrad: "linear-gradient(135deg, #06B6D4, #3B82F6)",
        successGrad: "linear-gradient(135deg, #10B981, #34D399)",
        warningGrad: "linear-gradient(135deg, #F59E0B, #FB923C)",
        dangerGrad: "linear-gradient(135deg, #EF4444, #F87171)",
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.04)",
      }
    },
  },
  plugins: [],
}
