/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'neo-peach': '#FFDAB9',      // Peach Puff
                'neo-peach-dark': '#FFB07C', // Darker Peach
                'neo-pink': '#FF69B4',       // Hot Pink
                'neo-pink-light': '#FFC0CB', // Pink
                'neo-pink-deep': '#C71585',  // Medium Violet Red
                'neo-black': '#1a1a1a',      // Slightly softer black
                'neo-white': '#FFF5EE',      // Seashell (warm white)
            },
            boxShadow: {
                'neo': '4px 4px 0px 0px #1a1a1a',
                'neo-lg': '8px 8px 0px 0px #1a1a1a',
                'neo-sm': '2px 2px 0px 0px #1a1a1a',
            },
            borderWidth: {
                '3': '3px',
            },
            fontFamily: {
                'sans': ['Sora', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
