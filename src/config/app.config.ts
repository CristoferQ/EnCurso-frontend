/**
 * Configuración global de la aplicación Courses.
 */
export const APP_CONFIG = {
  /**
   * Ruta relativa a la fuente de datos de conciertos (JSON / API).
   */
  COURSES_DATA_URL: './data/courses.json',
  // COURSES_DATA_URL: 'http://localhost:3000/api/v1/courses-error',
  // COURSES_DATA_URL: 'http://localhost:3000/api/v1/courses',

  /**
   * Simulación de latencia de red en milisegundos para entornos de desarrollo/demostración.
   * Ajustar a 0 en entornos reales.
   */
  SIMULATED_NETWORK_DELAY_MS: 0,
} as const;
