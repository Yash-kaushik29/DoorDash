module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}"], // Ensure Tailwind scans all files
  theme: {
    screens: {
      'xs': '480px',   
      'sm': '640px',  
      'md': '768px',   
      'lg': '1024px', 
      'xl': '1280px',  
      '2xl': '1536px', 
    },
    extend: {},
  },
  plugins: [],
};
