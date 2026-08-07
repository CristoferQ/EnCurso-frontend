import { type Course, CourseStatus } from '../models';
import { APP_CONFIG } from '../config/app.config';

export class CourseService {
  private static readonly DATA_URL = APP_CONFIG.COURSES_DATA_URL;

  /**
   * Utilidad privada para simular latencia de red en milisegundos.
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Obtiene todos los cursos desde la fuente de datos.
   * @param delayMs Tiempo en ms para simular carga de red. Por defecto usa APP_CONFIG.SIMULATED_NETWORK_DELAY_MS.
   */
  static async getAllCourses(
    delayMs: number = APP_CONFIG.SIMULATED_NETWORK_DELAY_MS,
  ): Promise<Course[]> {
    if (delayMs > 0) {
      await this.delay(delayMs);
    }

    const response = await fetch(this.DATA_URL);

    console.log('status => ', response);
    if (!response.ok) {
      throw new Error(
        `Error HTTP al obtener los conciertos: status ${response.status} (${response.statusText})`,
      );
    }

    const rawData = await response.json();
    console.log('rawData => ', rawData);
    if (!Array.isArray(rawData)) {
      throw new Error(
        'La respuesta de conciertos no tiene un formato válido (se esperaba un array).',
      );
    }

    // Transformación y parseo seguro de datos para cursos
    return rawData.map(
      (item: any): Course => ({
        id: String(item.id),
        title: String(item.title || item.title2 || 'Curso sin título'),
        description: String(item.description || 'Descripción no disponible'),
        status: (Object.values(CourseStatus).includes(
          item.status as CourseStatus,
        )
          ? item.status
          : CourseStatus.BEGINNER) as CourseStatus,
        imageUrl: item.imageUrl ? String(item.imageUrl) : undefined,
        isFeatured: Boolean(item.isFeatured),
      }),
    );
  }

  /**
   * Obtiene el curso destacado o el primero disponible.
   */
  static getFeaturedCourse(courses: Course[]): Course | null {
    if (courses.length === 0) return null;
    return courses.find((c) => c.isFeatured) || courses[0];
  }

  /**
   * Filtra los cursos para la grilla omitiendo el evento destacado si existe.
   */
  static getGridCourses(courses: Course[]): Course[] {
    if (courses.length <= 1) return courses;
    return courses.filter((c) => !c.isFeatured);
  }
}
