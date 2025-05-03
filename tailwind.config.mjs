const config = {
    darkMode: "class",
    content: [
        "./src/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                neonPink: "#ff0077",
                neonCyan: "#00eaff",
                neonPurple: "#c800ff",
            },
            boxShadow: {
                neon: "0 0 8px rgba(255,0,119,.8),0 0 20px rgba(0,234,255,.6)",
            },
            keyframes: {
                gradientBg: {
                    "0%": { backgroundPosition: "0% 50%" },
                    "50%": { backgroundPosition: "100% 50%" },
                    "100%": { backgroundPosition: "0% 50%" },
                },
                glitch: {
                    "0%,100%": { clipPath: "inset(0 0 0 0)", transform: "translate(0)" },
                    "20%": { clipPath: "inset(30% 0 30% 0)", transform: "translate(-2px,-2px)" },
                    "40%": { clipPath: "inset(10% 0 60% 0)", transform: "translate(2px,2px)" },
                    "60%": { clipPath: "inset(50% 0 10% 0)", transform: "translate(-1px,1px)" },
                    "80%": { clipPath: "inset(20% 0 40% 0)", transform: "translate(1px,-1px)" },
                },
            },
            animation: {
                gradientBg: "gradientBg 15s ease infinite",
                glitch: "glitch 1.2s steps(2,end) infinite",
            },
        },
    },
    plugins: [],
};

export default config; 