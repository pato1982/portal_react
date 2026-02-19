/**
 * Configuración de entorno de la aplicación
 *
 * En modo demo (VITE_APP_MODE=demo), la aplicación usa datos mock locales
 * En modo producción (VITE_APP_MODE=production), conecta a la API real
 */

const config = {
  // Modo de la aplicación: 'demo' | 'production'
  // Hack: Si estamos en el VPS de demo, forzamos modo demo.
  appMode: (typeof window !== 'undefined' && window.location.hostname === '45.236.130.25')
    ? 'demo'
    : (import.meta.env.VITE_APP_MODE || 'demo'),

  // URL base de la API (para modo producción)
  apiBaseUrl: (import.meta.env.VITE_APP_MODE === 'demo' || (typeof window !== 'undefined' && window.location.hostname === '45.236.130.25'))
    ? 'http://localhost:3001/api'
    : (import.meta.env.VITE_API_BASE_URL || '/api'),

  // Tiempo de expiración de sesión (en minutos)
  sessionTimeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT) || 60,

  // Helpers
  isDemoMode: () => config.appMode === 'demo',
  isProductionMode: () => config.appMode === 'production',
};

export default config;
