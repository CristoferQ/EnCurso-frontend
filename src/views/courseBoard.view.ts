import type { Course } from '../models';
import { CourseService } from '../services/course.service';
import { AuthService } from '../services/auth.service';
import { useI18n, I18nService } from '../i18n/i18n.service';
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
import { createCourseModalElement } from '../components/CourseModal';
import { createCourseDetailModalElement } from '../components/CourseDetailModal';
import { createAuthModalElement } from '../components/AuthModal';
import { confirmAction } from '../components/ConfirmModal';

export class CourseBoardView {
  private bannerContainer: HTMLElement | null;
  private coursesContainer: HTMLElement | null;
  private contadorCoursesContainer: HTMLElement | null;
  private enrollContainer: HTMLElement | null;
  private courseModalContainer: HTMLElement | null;
  private authModalContainer: HTMLElement | null;
  private authHeaderContainer: HTMLElement | null;
  private addCourseButton: HTMLButtonElement | null;
  private headerSlogan: HTMLElement | null;
  private sectionTitle: HTMLElement | null;
  private lastCourses: Course[] = [];
  private currentViewState: 'loading' | 'courses' | 'empty' | 'error' = 'loading';
  private lastErrorMessage = '';
  private lastRetryHandler?: () => void;
  private readonly reload: () => Promise<void>;

  constructor(reload: () => Promise<void>) {
    this.bannerContainer = document.getElementById('banner-container');
    this.coursesContainer = document.getElementById('courses-container');
    this.contadorCoursesContainer = document.getElementById('contador-courses');
    this.enrollContainer = document.getElementById('enroll-container');
    this.courseModalContainer = document.getElementById('course-modal-container');
    this.authModalContainer = document.getElementById('auth-modal-container');
    this.authHeaderContainer = document.getElementById('auth-header-container');
    this.addCourseButton = document.getElementById('add-course-button') as HTMLButtonElement | null;
    this.headerSlogan = document.getElementById('header-slogan');
    this.sectionTitle = document.getElementById('section-title');
    this.reload = reload;

    if (this.addCourseButton) {
      this.addCourseButton.onclick = () => this.showCourseModal();
      this.addCourseButton.classList.toggle('hidden', !AuthService.isAdmin());
    }

    this.updateStaticTexts();
    this.renderAuthHeader();

    AuthService.subscribe(() => {
      this.renderAuthHeader();
      if (this.addCourseButton) {
        this.addCourseButton.classList.toggle('hidden', !AuthService.isAdmin());
      }
    });

    I18nService.subscribe(() => {
      this.updateStaticTexts();
      this.renderAuthHeader();

      switch (this.currentViewState) {
        case 'loading':
          this.showLoading();
          break;
        case 'courses':
          if (this.lastCourses.length > 0) {
            this.renderCourses(this.lastCourses);
          } else {
            this.showEmpty();
          }
          break;
        case 'empty':
          this.showEmpty();
          break;
        case 'error':
          this.showError(this.lastErrorMessage, this.lastRetryHandler);
          break;
        default:
          break;
      }
    });
  }

  private updateStaticTexts(): void {
    const i18n = useI18n();

    if (this.headerSlogan) {
      this.headerSlogan.textContent = i18n.header.slogan;
    }

    if (this.sectionTitle) {
      this.sectionTitle.innerHTML = `
        <span class="w-2 h-5 bg-sky-600 rounded-xs inline-block"></span>
        <span>${i18n.catalog.title}</span>
      `;
    }

    if (this.addCourseButton) {
      this.addCourseButton.textContent = i18n.catalog.addCourse;
    }
  }

  private renderAuthHeader(): void {
    if (!this.authHeaderContainer) return;
    const user = AuthService.getStoredUser();
    const i18n = useI18n();

    if (user && AuthService.isAuthenticated()) {
      this.authHeaderContainer.innerHTML = `
        <div class="flex items-center gap-2 bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1">
          <div class="w-6 h-6 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
            ${user.name.charAt(0).toUpperCase()}
          </div>
          <span class="text-xs font-semibold text-zinc-200 hidden sm:inline max-w-[120px] truncate">${user.name}</span>
          <button id="logout-btn" class="text-xs text-red-400 hover:text-red-300 font-medium px-1.5 py-0.5 rounded hover:bg-zinc-800 transition-colors" title="${i18n.header.logout}">
            ${i18n.header.logout}
          </button>
        </div>
      `;

      this.authHeaderContainer.querySelector('#logout-btn')?.addEventListener('click', () => {
        AuthService.logout();
        this.reload();
      });
    } else {
      this.authHeaderContainer.innerHTML = `
        <button id="open-login-btn" class="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold uppercase px-3 py-1.5 rounded transition-colors shadow-sm inline-flex items-center gap-1.5">
          <span>🔑</span>
          <span>${i18n.header.login}</span>
        </button>
      `;

      this.authHeaderContainer.querySelector('#open-login-btn')?.addEventListener('click', () => {
        this.showAuthModal('login');
      });
    }
  }

  public showAuthModal(mode: 'login' | 'register' = 'login'): void {
    if (!this.authModalContainer) return;
    const modal = createAuthModalElement(
      mode,
      async () => {
        this.renderAuthHeader();
        await this.reload();
      },
      () => this.authModalContainer?.replaceChildren()
    );
    this.authModalContainer.replaceChildren(modal);
  }

  private showCourseModal(course?: Course): void {
    if (!this.courseModalContainer) return;
    const modal = createCourseModalElement(
      course,
      async (data) => {
        if (course) {
          await CourseService.update({ ...course, ...data });
        } else {
          await CourseService.create(data);
        }
        await this.reload();
      },
      () => this.courseModalContainer?.replaceChildren()
    );
    this.courseModalContainer.replaceChildren(modal);
  }

  private showCourseDetailModal(course: Course): void {
    if (!this.courseModalContainer) return;
    const modal = createCourseDetailModalElement(
      course,
      (c) => this.showCourseModal(c),
      () => this.courseModalContainer?.replaceChildren(),
      () => this.reload(),
      () => this.showAuthModal('login')
    );
    this.courseModalContainer.replaceChildren(modal);
  }

  /**
   * Muestra esqueletos de carga visuales en los contenedores e icono de spin en el contador.
   */
  showLoading(): void {
    this.currentViewState = 'loading';
    const i18n = useI18n();

    if (this.contadorCoursesContainer) {
      this.contadorCoursesContainer.innerHTML = `
        <svg class="animate-spin h-3 w-3 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>${i18n.catalog.loadingCourses}</span>
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
   * Renderiza el banner destacado, la grilla de cursos, el formulario de inscripcion y el contador dinámico.
   */
  renderCourses(courses: Course[]): void {
    this.currentViewState = 'courses';
    this.lastCourses = courses;
    const i18n = useI18n();

    if (!this.coursesContainer) {
      console.error(
        '[EnCurso] Error crítico: No se encontró "#courses-container" en el DOM.',
      );
      return;
    }

    // Actualizar el contador dinámico de cursos disponibles
    if (this.contadorCoursesContainer) {
      const count = courses.length;
      const label = count === 1 ? 'Curso' : 'Cursos';
      const lang = I18nService.getLanguage();
      const countText = lang === 'en'
        ? `${count} ${count === 1 ? 'Course Available' : 'Courses Available'}`
        : `${count} ${count === 1 ? 'Curso Disponible' : 'Cursos Disponibles'}`;
      this.contadorCoursesContainer.innerHTML = `<span>${countText}</span>`;
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

    // 4. Configurar eventos de interacción para seleccionar curso
    this.setupCourseListeners(courses);
  }

  /**
   * Configura los escuchadores de evento click para las tarjetas de la grilla.
   */
  private setupCourseListeners(courses: Course[]): void {
    const handleCourseClick = async (event: Event) => {
      const target = event.target as HTMLElement;
      const button = target.closest('button');
      if (button && button.disabled) return;

      const card = target.closest('[data-id]') as HTMLElement | null;
      const courseId = card?.getAttribute('data-id');

      const action = button?.dataset.action;

      let selectedCourse: Course | undefined;
      if (courseId) {
        selectedCourse = courses.find((c) => c.id === courseId);
      }

      if (!selectedCourse) return;

      const i18n = useI18n();

      try {
        if (action === 'enroll') {
          if (!AuthService.isAuthenticated()) {
            this.showAuthModal('login');
            return;
          }
          await CourseService.enroll(selectedCourse.id);
          await this.reload();
          return;
        }
        if (action === 'cancel') {
          if (!AuthService.isAuthenticated()) {
            this.showAuthModal('login');
            return;
          }
          await CourseService.unenroll(selectedCourse.id);
          await this.reload();
          return;
        }
        if (action === 'edit') {
          if (!AuthService.isAuthenticated()) {
            this.showAuthModal('login');
            return;
          }
          this.showCourseModal(selectedCourse);
          return;
        }
        if (action === 'delete') {
          if (!AuthService.isAuthenticated()) {
            this.showAuthModal('login');
            return;
          }
          const confirmed = await confirmAction({
            title: i18n.confirmModal.deleteCourseTitle,
            message: i18n.confirmModal.deleteCourseMessage.replace('{title}', selectedCourse.title),
            confirmText: i18n.confirmModal.confirmDelete,
            cancelText: i18n.confirmModal.cancel,
            isDestructive: true,
          });

          if (confirmed) {
            await CourseService.delete(selectedCourse.id);
            await this.reload();
          }
          return;
        }

        if (!action) {
          this.showCourseDetailModal(selectedCourse);
        }

      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'No se pudo completar la operación.');
      }
    };

    if (this.coursesContainer) {
      this.coursesContainer.onclick = handleCourseClick;
    }
  }

  /**
   * Muestra la vista de estado vacío cuando no hay cursos.
   */
  showEmpty(): void {
    this.currentViewState = 'empty';
    const lang = I18nService.getLanguage();
    const emptyText = lang === 'en' ? '0 Courses' : '0 Cursos';

    if (this.contadorCoursesContainer) {
      this.contadorCoursesContainer.innerHTML = `<span>${emptyText}</span>`;
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
    this.currentViewState = 'error';
    this.lastErrorMessage = message;
    this.lastRetryHandler = onRetry;

    const lang = I18nService.getLanguage();
    const emptyText = lang === 'en' ? '0 Courses' : '0 Cursos';

    if (this.contadorCoursesContainer) {
      this.contadorCoursesContainer.innerHTML = `<span>${emptyText}</span>`;
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
