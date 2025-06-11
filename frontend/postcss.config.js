// frontend/postcss.config.js
module.exports = {
  plugins: {
    // Make sure 'tailwindcss' is replaced with '@tailwindcss/postcss' here
    '@tailwindcss/postcss': {}, // This is the new way to include Tailwind CSS as a PostCSS plugin
    autoprefixer: {},
  },
};