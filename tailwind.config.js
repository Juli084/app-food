/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        marca: '#d9480f',
        'marca-claro': '#fff1e8',
        tinta: '#1f1d1a',
        suave: '#6b6660',
        fundo: '#f6f5f2',
        linha: '#e7e3dc',
        verde: '#2b8a3e',
      },
    },
  },
  plugins: [],
};
