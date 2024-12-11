// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        spin: 'spin 1s linear infinite',
      },
      keyframes: {
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      overscrollBehavior: {
        none: 'none',
      },
    },
  },
  variants: {},
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.overscroll-none': {
          'overscroll-behavior': 'none',
        },
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    },
  ],
};
