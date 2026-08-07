import type { Course } from '../models';
import { CourseService } from '../services/course.service';
import { createCourseCardElement } from '../components/CourseCard';
import { createFeaturedBannerElement } from '../components/FeaturedBanner/FeaturedBanner';
import {
  createBannerSkeletonElement,
  createGridSkeletonElement,
} from '../components/LoadingSkeleton/LoadingSkeleton';
import {
  createErrorStateElement,
  createEmptyStateElement,
} from '../components/StateViews/StateViews';
import { createEnrollFormElement } from '../components/EnrollForm';

export class CourseBoardView {
  private bannerContainer: HTMLElement | null;
  private coursesContainer: HTMLElement | null;
  private contadorCoursesContainer: HTMLElement | null;
  private enrollContainer: HTMLElement | null;

  constructor() {
    this.bannerContainer = document.getElementById('banner-container');
    this.coursesContainer = document.getElementById('courses-container');
    this.contadorCoursesContainer = document.getElementById('contador-courses');
    this.enrollContainer = document.getElementById('enroll-container');
  }

  /**
   * Muestra esqueletos de carga visuales en los contenedores e icono de spin en el contador.
   */
  showLoading(): void {
    if (this.contadorCoursesContainer) {
      this.contadorCoursesContainer.innerHTML = `
        <svg class="animate-spin h-3 w-3 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Cargando cursos...</span>
      `;
    }

    if (this.bannerContainer) {
      this.bannerContainer.replaceChildren(createBannerSkeletonElement());
    }

    if (this.coursesContainer) {
      this.coursesContainer.replaceChildren(createGridSkeletonElement(3));
    }

    if (this.enrollContainer) {
      this.enrollContainer.replaceChildren();
    }
  }

  /**
   * Renderiza el formulario de inscripcion de cursos.
   * @param selectedCourse Curso opcional preseleccionado para la inscripcion.
   */
  renderEnrollForm(selectedCourse?: Course, initialEmail = ''): void {
    if (!this.enrollContainer) return;

    try {
      const enrollElement = createEnrollFormElement(
        selectedCourse,
        (data) => {
          console.log('[EnCurso] Inscripcion realizada con éxito:', data);
        },
        (currentEmail) => {
          this.renderEnrollForm(undefined, currentEmail);
        },
        initialEmail,
      );
      this.enrollContainer.replaceChildren(enrollElement);
    } catch (enrollError) {
      console.error(
        '[EnCurso] Error al renderizar el formulario de inscripcion:',
        enrollError,
      );
      this.enrollContainer.replaceChildren();
    }
  }

  /**
   * Renderiza el banner destacado, la grilla de cursos, el formulario de inscripcion y el contador dinámico.
   */
  renderCourses(courses: Course[]): void {
    if (!this.coursesContainer) {
      console.error(
        '[EnCurso] Error crítico: No se encontró "#courses-container" en el DOM.',
      );
      return;
    }

    // Actualizar el contador dinámico de cursos disponibles
    if (this.contadorCoursesContainer) {
      const count = courses.length;
      const label = count === 1 ? 'Curso Disponible' : 'Cursos Disponibles';
      this.contadorCoursesContainer.innerHTML = `<span>${count} ${label}</span>`;
    }

    // 1. Renderizar Banner Destacado
    const featuredCourse = CourseService.getFeaturedCourse(courses);
    if (this.bannerContainer && featuredCourse) {
      try {
        const bannerElement = createFeaturedBannerElement(featuredCourse);
        this.bannerContainer.replaceChildren(bannerElement);
      } catch (bannerError) {
        console.error(
          '[EnCurso] Error al renderizar banner destacado:',
          bannerError,
        );
        this.bannerContainer.replaceChildren();
      }
    }

    // 2. Renderizar Grilla de Cursos
    const gridCourses = CourseService.getGridCourses(courses);
    const fragment = document.createDocumentFragment();

    gridCourses.forEach((course) => {
      try {
        const cardElement = createCourseCardElement(course);
        fragment.appendChild(cardElement);
      } catch (cardError) {
        console.error(
          `[EnCurso] Falló el renderizado del curso ID ${course?.id}:`,
          cardError,
        );
      }
    });

    this.coursesContainer.replaceChildren(fragment);

    // 3. Renderizar Formulario de Inscripcion
    this.renderEnrollForm();

    // 4. Configurar eventos de interacción para seleccionar curso
    this.setupEnrollListeners(courses, featuredCourse);
  }

  /**
   * Configura los escuchadores de evento click para seleccionar un curso y hacer scroll hacia la inscripcion.
   */
  private setupEnrollListeners(courses: Course[], featuredCourse: Course | null): void {
    const handleTicketClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const button = target.closest('button');
      if (!button || button.disabled) return;

      const card = target.closest('[data-id]') as HTMLElement | null;
      const courseId = card?.getAttribute('data-id');

      let selectedCourse: Course | undefined;
      if (courseId) {
        selectedCourse = courses.find((c) => c.id === courseId);
      } else if (this.bannerContainer?.contains(target)) {
        selectedCourse = featuredCourse || undefined;
      }

      if (selectedCourse) {
        const currentEmail = this.enrollContainer
          ?.querySelector<HTMLInputElement>('#email')
          ?.value.trim();
        this.renderEnrollForm(selectedCourse, currentEmail ?? '');
        this.enrollContainer?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    if (this.coursesContainer) {
      this.coursesContainer.addEventListener('click', handleTicketClick);
    }
    if (this.bannerContainer) {
      this.bannerContainer.addEventListener('click', handleTicketClick);
    }
  }

  /**
   * Muestra la vista de estado vacío cuando no hay cursos.
   */
  showEmpty(): void {
    if (this.contadorCoursesContainer) {
      this.contadorCoursesContainer.innerHTML = `<span>0 Cursos</span>`;
    }
    if (this.bannerContainer) {
      this.bannerContainer.replaceChildren();
    }
    if (this.coursesContainer) {
      this.coursesContainer.replaceChildren(createEmptyStateElement());
    }
    if (this.enrollContainer) {
      this.enrollContainer.replaceChildren();
    }
  }

  /**
   * Muestra la vista de estado de error global.
   */
  showError(message: string, onRetry?: () => void): void {
    if (this.contadorCoursesContainer) {
      this.contadorCoursesContainer.innerHTML = `<span>0 Cursos</span>`;
    }
    if (this.bannerContainer) {
      this.bannerContainer.replaceChildren();
    }
    if (this.coursesContainer) {
      this.coursesContainer.replaceChildren(
        createErrorStateElement(message, onRetry),
      );
    }
    if (this.enrollContainer) {
      this.enrollContainer.replaceChildren();
    }
  }
}
