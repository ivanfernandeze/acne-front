/**
 * PostCSS pipeline.
 *
 * Tailwind v4 ships its own PostCSS plugin and handles vendor prefixing itself, so neither
 * `tailwindcss` as a plugin nor `autoprefixer` belong here any more.
 */
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
