/** @type {import('tailwindcss').Config} */
const config = {
  // 1. Content tells Tailwind which files to scan for class names
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 2. Custom University Branding Colors
      colors: {
        'uni-blue': {
          DEFAULT: '#1e3a8a',
          light: '#3b82f6',
          dark: '#172554',
        },
        'uni-maroon': {
          DEFAULT: '#800000',
          light: '#a30000',
        },
        'uni-gold': '#d4af37',
      },
      // 3. Optional: Add custom fonts if you imported them in layout.tsx
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
};

export default config;