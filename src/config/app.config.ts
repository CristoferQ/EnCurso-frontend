/**
 * Configuración global de la aplicación Courses.
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
const DELAY = Number(import.meta.env.VITE_SIMULATED_NETWORK_DELAY_MS ?? 0);

export const APP_CONFIG = {
  /**
   * Endpoint base de la API.
   */
  API_BASE_URL: API_BASE,

  /**
   * Endpoint del catálogo expuesto por EnCurso Backend.
   */
  COURSES_DATA_URL: `${API_BASE}/courses`,

  /**
   * Endpoint de usuarios expuesto por EnCurso Backend.
   */
  USERS_DATA_URL: `${API_BASE}/users`,

  /**
   * Endpoint de autenticación expuesto por EnCurso Backend.
   */
  AUTH_DATA_URL: `${API_BASE}/auth`,

  /**
   * Simulación de latencia de red en milisegundos para entornos de desarrollo/demostración.
   */
  SIMULATED_NETWORK_DELAY_MS: isNaN(DELAY) ? 0 : DELAY,
} as const;
