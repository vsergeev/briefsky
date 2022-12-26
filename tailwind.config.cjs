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
        gray: {},
      },
    },
  },

  plugins: [require('flowbite/plugin')],

  darkMode: 'class',
};

module.exports = config;
