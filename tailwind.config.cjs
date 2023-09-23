const config = {
  content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'],

  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
    },
    extend: {
      fontFamily: {
        sans: ['"Cantarell"', '"Open Sans"', 'ui-sans-serif', 'system-ui', 'san-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },

  plugins: [require('flowbite/plugin')],

  darkMode: 'class',
};

module.exports = config;
