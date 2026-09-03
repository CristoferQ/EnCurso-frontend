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
        `Error HTTP al obtener los cursos: status ${response.status} (${response.statusText})`,
      );
    }

    const rawData = await response.json();
    console.log('rawData => ', rawData);
    if (!Array.isArray(rawData)) {
      throw new Error(
        'La respuesta de cursos no tiene un formato válido (se esperaba un array).',
      );
    }

    // Transformación y parseo seguro de datos para cursos
    const courses = rawData.map(
      (item: any): Course => ({
        id: String(item.id),
        title: String(item.title || item.title2 || 'Curso sin título'),
        description: String(item.description || 'Descripción no disponible'),
        status: (Object.values(CourseStatus).includes(
          (item.level ?? item.status) as CourseStatus,
        )
          ? (item.level ?? item.status)
          : CourseStatus.BEGINNER) as CourseStatus,
        imageUrl: item.imageUrl ? String(item.imageUrl) : undefined,
        isFeatured: Boolean(item.isFeatured),
        price: Number(item.price ?? 0),
        videoUrl: item.videoUrl ? String(item.videoUrl) : undefined,
      }),
    );

    return Promise.all(courses.map(async (course) => ({
      ...course,
      isEnrolled: await this.isEnrolled(course.id).catch(() => false),
    })));
  }

  static async getCourseById(courseId: string): Promise<Course> {
    const response = await fetch(`${this.DATA_URL}/${courseId}`);
    if (!response.ok) {
      throw new Error(`Error al obtener el detalle del curso: status ${response.status}`);
    }
    const item = await response.json();
    return {
      id: String(item.id),
      title: String(item.title || 'Curso sin título'),
      description: String(item.description || ''),
      price: Number(item.price ?? 0),
      status: item.level as CourseStatus,
      videoUrl: item.videoUrl ? String(item.videoUrl) : undefined,
      isEnrolled: await this.isEnrolled(item.id).catch(() => false),
    };
  }

  static async isEnrolled(courseId: string): Promise<boolean> {
    const token = localStorage.getItem('encurso_token');
    // Sin sesión, el usuario no puede estar inscrito
    if (!token) return false;
    const response = await fetch(`${this.DATA_URL}/${courseId}/enroll`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) return false;
    return Boolean((await response.json()).enrolled);
  }


  static async enroll(courseId: string): Promise<void> {
    await this.request(`${this.DATA_URL}/${courseId}/enroll`, 'POST');
  }

  static async unenroll(courseId: string): Promise<void> {
    await this.request(`${this.DATA_URL}/${courseId}/enroll`, 'DELETE');
  }

  static async create(course: Omit<Course, 'id' | 'isEnrolled' | 'isFeatured' | 'imageUrl'>): Promise<void> {
    await this.request(this.DATA_URL, 'POST', this.toRequest(course));
  }

  static async update(course: Course): Promise<void> {
    await this.request(`${this.DATA_URL}/${course.id}`, 'PUT', this.toRequest(course));
  }

  static async delete(courseId: string): Promise<void> {
    await this.request(`${this.DATA_URL}/${courseId}`, 'DELETE');
  }

  private static async request(url: string, method: string, body?: unknown): Promise<void> {
    const token = localStorage.getItem('encurso_token');
    const headers: Record<string, string> = {};
    if (body) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? 'No se pudo completar la operación.');
    }
  }

  private static toRequest(course: Pick<Course, 'title' | 'description' | 'price' | 'status' | 'videoUrl'>) {
    return {
      title: course.title,
      description: course.description,
      price: course.price ?? 0,
      level: course.status,
      videoUrl: course.videoUrl,
    };
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
