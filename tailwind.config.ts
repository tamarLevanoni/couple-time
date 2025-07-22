import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors for couple-time
        brand: {
          50: '#fef7f7',
          100: '#feeaea',
          200: '#fed8d8',
          300: '#fcb8b8',
          400: '#f88b8b',
          500: '#f15555',
          600: '#dc3030',
          700: '#b82323',
          800: '#991f1f',
          900: '#821f1f',
          950: '#470d0d',
        },
        // Semantic colors
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      fontFamily: {
        // Hebrew-focused font stacks
        hebrew: ['var(--font-heebo)', 'Heebo', 'David', 'system-ui', 'sans-serif'],
        sans: ['var(--font-heebo)', 'Heebo', 'David', 'system-ui', 'sans-serif'],
        body: ['var(--font-assistant)', 'Assistant', 'David', 'system-ui', 'sans-serif'],
        display: ['var(--font-heebo)', 'Heebo', 'David', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Hebrew-optimized font sizes
        'xs-he': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.02em' }],
        'sm-he': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        'base-he': ['1rem', { lineHeight: '1.6', letterSpacing: '0.01em' }],
        'lg-he': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'xl-he': ['1.25rem', { lineHeight: '1.6', letterSpacing: '0' }],
        '2xl-he': ['1.5rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        '3xl-he': ['1.875rem', { lineHeight: '1.4', letterSpacing: '-0.02em' }],
        '4xl-he': ['2.25rem', { lineHeight: '1.3', letterSpacing: '-0.03em' }],
      },
      spacing: {
        // RTL-friendly spacing
        'rtl-1': '0.25rem',
        'rtl-2': '0.5rem',
        'rtl-3': '0.75rem',
        'rtl-4': '1rem',
        'rtl-5': '1.25rem',
        'rtl-6': '1.5rem',
        'rtl-8': '2rem',
        'rtl-10': '2.5rem',
        'rtl-12': '3rem',
        'rtl-16': '4rem',
        'rtl-20': '5rem',
        'rtl-24': '6rem',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'bounce-soft': 'bounceSoft 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config