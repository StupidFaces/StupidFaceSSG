module.exports = {
    purge: ['./src/**/*.njk', './src/**/*.md'],
    safelist: [
        'rand-logo',
    ],
    theme: {
        fontFamily: {
            itim: 'Itim, "Comic Neue", "Comic Sans MS", sans-serif',
            comic: '"Comic Neue", "Comic Sans MS", sans-serif',
        },
        fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem',
            '5xl': '3rem',
            '6xl': '4rem',
        },
        extend: {
            colors: {
                blue: {
                    100: '#ebf8ff',
                    200: '#bee3f8',
                    300: '#90cdf4',
                    400: '#63b3ed',
                    500: '#4299e1',
                    600: '#3182ce',
                    700: '#2b6cb0',
                    800: '#2c5282',
                    900: '#2a4365',
                },
                gray: {
                    100: '#f7fafc',
                    200: '#edf2f7',
                    300: '#e2e8f0',
                    400: '#cbd5e0',
                    500: '#a0aec0',
                    600: '#718096',
                    700: '#4a5568',
                    800: '#2d3748',
                    900: '#1a202c',
                },
                stupid: {
                    primary: '#fff5db',
                    secondary: '#524d41',
                },
            },
        },
        scale: {
            0: '0',
            25: '.25',
            50: '.5',
            75: '.75',
            90: '.9',
            95: '.95',
            100: '1',
            105: '1.02',
            110: '1.1',
            125: '1.25',
            150: '1.5',
            200: '2',
        },
    },
    variants: {},
    plugins: [],

};
