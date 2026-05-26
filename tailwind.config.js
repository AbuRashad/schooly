/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
    './dev-tools/src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			/* Gamification & Status Palette */
  			gold: {
  				DEFAULT: 'hsl(var(--gold))',
  				foreground: 'hsl(var(--gold-foreground))',
  			},
  			silver: {
  				DEFAULT: 'hsl(var(--silver))',
  				foreground: 'hsl(var(--silver-foreground))',
  			},
  			bronze: {
  				DEFAULT: 'hsl(var(--bronze))',
  				foreground: 'hsl(var(--bronze-foreground))',
  			},
  			safe: {
  				DEFAULT: 'hsl(var(--safe))',
  				foreground: 'hsl(var(--safe-foreground))',
  			},
  			warning: {
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))',
  			},
  			critical: {
  				DEFAULT: 'hsl(var(--critical))',
  				foreground: 'hsl(var(--critical-foreground))',
  			},
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontFamily: {
  			sans: ['var(--font-sans)'],
  			heading: ['var(--font-heading)'],
  			serif: ['var(--font-serif)'],
  			mono: ['var(--font-mono)']
  		},
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			},
  			float: {
  				'0%, 100%': { transform: 'translateY(0px)' },
  				'50%': { transform: 'translateY(-10px)' }
  			},
  			'rotate-clockwise': {
  				'0%': { transform: 'rotate(0deg)' },
  				'100%': { transform: 'rotate(360deg)' }
  			},
  			'rotate-counter': {
  				'0%': { transform: 'rotate(0deg)' },
  				'100%': { transform: 'rotate(-360deg)' }
  			},
  			'shimmer': {
  				'0%': { backgroundPosition: '-200% 0' },
  				'100%': { backgroundPosition: '200% 0' }
  			},
  			'count-up': {
  				'0%': { opacity: '0', transform: 'translateY(8px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' }
  			},
  			'pulse-glow': {
  				'0%, 100%': { boxShadow: '0 0 5px hsl(var(--primary) / 0.2)' },
  				'50%': { boxShadow: '0 0 20px hsl(var(--primary) / 0.5)' }
  			},
  			'scale-in': {
  				'0%': { opacity: '0', transform: 'scale(0.95)' },
  				'100%': { opacity: '1', transform: 'scale(1)' }
  			},
  			'slide-in-rtl': {
  				'0%': { opacity: '0', transform: 'translateX(20px)' },
  				'100%': { opacity: '1', transform: 'translateX(0)' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'spin-slow': 'spin 3s linear infinite',
  			'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			'bounce-gentle': 'bounce 2s infinite',
  			float: 'float 3s ease-in-out infinite',
  			'rotate-clockwise': 'rotate-clockwise 4s linear infinite',
  			'rotate-counter': 'rotate-counter 3s linear infinite',
  			'shimmer': 'shimmer 2s linear infinite',
  			'count-up': 'count-up 0.5s ease-out forwards',
  			'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
  			'scale-in': 'scale-in 0.3s ease-out forwards',
  			'slide-in-rtl': 'slide-in-rtl 0.4s ease-out forwards'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
