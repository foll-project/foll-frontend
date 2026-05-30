/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <-- Esta línea es vital
  ],
  theme: {
    extend: {
      colors: {
        // --- Paleta Principal ---
        primary: {
          DEFAULT: '#375A6E', // Sidebar, Botones primarios, Texto destacado
          // Tailwind generará automáticamente utilidades como bg-primary, text-primary
        },
        secondary: {
          DEFAULT: '#89BAAF', // Botones secundarios, detalles en gráficas
        },
        background: {
          DEFAULT: '#FFFCED', // Fondo crema general de la plataforma
        },
        
        // --- Tonos de Estado y Alertas ---
        warning: {
          light: '#FFEA9A',   // Fondo para badges de "Riesgo Verificado" (suave)
          DEFAULT: '#E8BA62', // Texto o bordes para advertencias
        },
        success: {
          light: '#CAEFE2',   // Fondo para badges de estado "Normal" / "Conectado"
        },
        accent: {
          light: '#F6F8A7',   // Tonos muy suaves para gráficas (ej. la dona de seguridad)
        }
      },
      fontFamily: {
        // Te sugiero una tipografía limpia y altamente legible para los adultos mayores y cuidadores
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        // Una sombra suave para las tarjetas blancas sobre el fondo crema
        'card': '0 4px 6px -1px rgba(55, 90, 110, 0.08), 0 2px 4px -1px rgba(55, 90, 110, 0.04)',
      }
    },
  },
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
