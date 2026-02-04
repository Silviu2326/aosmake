/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0D0D0D',
                surface: '#111111',
                surfaceHighlight: '#1a1a1a',
                border: 'rgba(255,255,255,0.05)',
                accent: {
                    DEFAULT: '#06b6d4',
                    hover: '#0891b2',
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            boxShadow: {
                'lg': '0 10px 15px rgba(0,0,0,0.3)',
                'xl': '0 20px 25px rgba(0,0,0,0.4)',
                '2xl': '0 25px 50px rgba(0,0,0,0.5)',
            }
        },
    },
    plugins: [],
}
