/**
 * Configuración de entorno de la aplicación
 *
 * En modo demo (VITE_APP_MODE=demo), la aplicación usa datos mock locales
 * En modo producción (VITE_APP_MODE=production), conecta a la API real
 */

const config = {
  // Modo de la aplicación: 'demo' | 'production'
  appMode: 'production',

  // URL base de la API (para modo producción)
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://170.239.87.97:3001/api',

  // Tiempo de expiración de sesión (en minutos)
  sessionTimeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT) || 60,

  // Helpers
  isDemoMode: () => config.appMode === 'demo',
  isProductionMode: () => config.appMode === 'production',
};

export default config;
