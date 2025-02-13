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
        'logged': "url('/img/background_logged.jpg')",
        'cartaPlist': "url('/img/cartaPlist.webp')",
        'profile': "url('/img/profile.jpg')",
        'coleccion': "url('/img/coleccion.png')",
        'logout': "url('/img/logout.webp')",
        'delete': "url('/img/delete.jpg')",
      },
    },
  },
  plugins: [],
};


