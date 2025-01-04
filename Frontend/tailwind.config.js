/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

//                        Kanha added 

module.exports = {
  theme: {
      extend: {
          boxShadow: {
              custom: '0px 10px 20px rgba(0, 0, 0, 0.3)',
          },
          animation: {
              bounceSlow: 'bounce 3s infinite',
          },
      },
  },
  plugins: [],
};
