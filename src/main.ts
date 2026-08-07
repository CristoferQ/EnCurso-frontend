import './styles/global.css';
import { CourseService } from './services/course.service';
import { CourseBoardView } from './views/courseBoard.view';

/**
 * Inicializa y orquesta la aplicación EnCurso con Top-Level Await.
 */
async function bootstrap(): Promise<void> {
  const view = new CourseBoardView();

  try {
    // 1. Mostrar estado de carga (skeleton loaders)
    view.showLoading();

    // 2. Obtener datos de la fuente asíncrona
    const courses = await CourseService.getAllCourses();

    // 3. Manejo de estado vacío
    if (courses.length === 0) {
      view.showEmpty();
      return;
    }

    // 4. Renderizado exitoso de la cartelera
    view.renderCourses(courses);
  } catch (error) {
    console.error('[En Curso] Error crítico durante la inicialización:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Error al cargar los cursos.';
    view.showError(errorMessage, () => bootstrap());
  }
}

// Inicializar la aplicación utilizando Top-Level Await
await bootstrap();
