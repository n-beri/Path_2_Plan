/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "hsl(30, 50%, 40%)", // Dark Brown
          hover: "hsl(30, 50%, 35%)",   // Darker Brown
          foreground: "hsl(30, 100%, 98%)", // Very Light Brown/Cream
        },
        secondary: {
          DEFAULT: "hsl(30, 30%, 60%)", // Medium Brown
          hover: "hsl(30, 30%, 55%)",   // Slightly Darker Medium Brown
          foreground: "hsl(30, 100%, 98%)", // Very Light Brown/Cream
        },
        background: "hsl(30, 20%, 95%)", // Light Beige/Off-white
        foreground: "hsl(30, 60%, 20%)", // Very Dark Brown (for text)
        muted: {
          DEFAULT: "hsl(30, 25%, 90%)",    // Light Grayish Brown
          foreground: "hsl(30, 20%, 45%)", // Medium Grayish Brown
        },
        accent: {
          DEFAULT: "hsl(45, 70%, 55%)", // Warm Gold/Yellow-Brown
          hover: "hsl(45, 70%, 50%)",   // Darker Gold
          foreground: "hsl(45, 100%, 10%)", // Dark Brown for text on accent
        },
        destructive: {
          DEFAULT: "hsl(0, 60%, 50%)",   // Muted Red
          hover: "hsl(0, 60%, 45%)",     // Darker Muted Red
          foreground: "hsl(0, 100%, 98%)", // Very Light Red/Cream
        },
        border: "hsl(30, 20%, 80%)",    // Light Brownish Gray
        input: "hsl(30, 20%, 75%)",     // Slightly Darker Brownish Gray for input borders
        ring: "hsl(30, 50%, 50%)",      // Medium Brown for focus rings
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
        container: "0.75rem", // For main containers/cards
      },
      spacing: {
        section: "3rem", // Consistent spacing between sections
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        md: '0 6px 10px 0 rgba(0, 0, 0, 0.1), 0 3px 6px 0 rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '3xl': '0 35px 60px -12px rgba(0, 0, 0, 0.3)',
        glow: '0 0 20px rgba(139, 92, 246, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'slide-in-right': 'slideInRight 0.8s ease-out',
        'slide-in-left': 'slideInLeft 0.8s ease-out',
        'scale-in': 'scaleIn 0.6s ease-out',
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      backdropBlur: {
        xs: '2px',
        '3xl': '64px',
      },
    },
  },
  plugins: [],
};
