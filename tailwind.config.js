/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      transform: {
        none: 'none',
      },
    },
  },
  content: [
    "./src/**/*.{html,ts,css,scss}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'unlogged': "url('/img/background_unlogged.png')",
        'register': "url('/img/register.jpg')",
      },
    },
  },
  plugins: [],
};


