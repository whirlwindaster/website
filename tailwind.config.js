/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        term_bg: '#01081f',
        black: '#4f4f4f',
        red: '#ff6c60',
        green: '#a8ff60',
        yellow: '#ffffb6',
        blue: '#96cbf3',
        magenta: '#ff73fd',
        cyan: '#c6c5fe',
        white: '#eeeeee',
        bright_black: '#7c7c7c',
        bright_red: '#ffb6b0',
        bright_green: '#ceffac',
        bright_yellow: '#ffffcc',
        bright_blue: '#b5dcff',
        bright_magenta: '#ff9cfe',
        bright_cyan: '#dfdffe',
        bright_white: '#ffffff',
      },
    },
  },
  safelist: ['text-red'],
  plugins: [],
};
