import tailwindcssAnimate from 'tailwindcss-animate'
import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: ['class'],
    content: [
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './shared/**/*.{js,ts,jsx,tsx}'
    ],
    theme: {
        extend: {
            /*
             * Escala de texto do sistema: só a tipografia cresce, os espaçamentos continuam nos valores
             * padrão. Em rem para acompanhar a escala fluida do desktop (ver globals.css); os dois menores
             * têm piso em px para não ficarem ilegíveis quando o rem diminui. Eles não definem line-height
             * de propósito: herdam do contexto, pois são usados em selos e rótulos de altura fixa.
             */
            fontSize: {
                '3xs': 'max(10px, 0.6875rem)',
                '2xs': 'max(11px, 0.75rem)',
                xs: ['0.8125rem', { lineHeight: '1.125rem' }],
                sm: ['0.9375rem', { lineHeight: '1.375rem' }],
                base: ['1.0625rem', { lineHeight: '1.625rem' }],
                lg: ['1.1875rem', { lineHeight: '1.75rem' }],
                xl: ['1.3125rem', { lineHeight: '1.875rem' }],
                '2xl': ['1.5625rem', { lineHeight: '2.125rem' }]
            },
            colors: {
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                topbar: 'hsl(var(--topbar))',
                sidebar: {
                    DEFAULT: 'hsl(var(--sidebar))',
                    foreground: 'hsl(var(--sidebar-foreground))',
                    muted: 'hsl(var(--sidebar-muted))',
                    accent: 'hsl(var(--sidebar-accent))'
                }
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            }
        }
    },
    plugins: [tailwindcssAnimate]
}
export default config
