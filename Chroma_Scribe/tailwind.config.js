/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'vintage-bg': '#28282D',
                'vintage-text': '#EFEFE7',
                'vintage-accent': '#C7A250',
                'vintage-teal': '#598280',
                'vintage-orange': '#B86A4C',
            },
            fontFamily: {
                'heading': ['"League Spartan"', 'sans-serif'],
                'body': ['"Lora"', 'serif'],
            },
            borderColor: {
                'vintage-accent': '#C7A250',
            },
            backgroundColor: {
                'vintage-bg': '#28282D',
            }
        },
    },
    plugins: [],
}