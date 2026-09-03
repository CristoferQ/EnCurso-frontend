import type { Course } from '../../models';
import { CourseStatus } from '../../models';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { useI18n, I18nService } from '../../i18n/i18n.service';
import { renderIcon } from '../../utils/icon.utils';
import { BookOpen, Video, DollarSign, CheckCircle2, Lock } from 'lucide';

function getLevelBadge(status?: CourseStatus) {
  const i18n = useI18n();
  switch (status) {
    case CourseStatus.BEGINNER:
      return {
        label: i18n.levels.BEGINNER,
        badgeClass: 'bg-emerald-950/90 text-emerald-300 border border-emerald-700 font-black',
      };
    case CourseStatus.INTERMEDIATE:
      return {
        label: i18n.levels.INTERMEDIATE,
        badgeClass: 'bg-amber-950/90 text-amber-300 border border-amber-700 font-black',
      };
    case CourseStatus.ADVANCED:
      return {
        label: i18n.levels.ADVANCED,
        badgeClass: 'bg-red-950/90 text-red-300 border border-red-700 font-black',
      };
    default:
      return {
        label: i18n.levels.general,
        badgeClass: 'bg-zinc-900 text-zinc-300 border border-zinc-700 font-bold',
      };
  }
}

export function createCourseDetailModalElement(
  course: Course,
  onEdit: (course: Course) => void,
  onClose: () => void,
  onStateChanged?: () => void,
  onAuthRequired?: () => void,
): HTMLElement {
  const backdrop = document.createElement('div');
  backdrop.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in';

  const imageUrl = course.imageUrl || '/images/course1.png';
  let isEnrolled = Boolean(course.isEnrolled);

  const renderContent = () => {
    const i18n = useI18n();
    const levelInfo = getLevelBadge(course.status);
    const formattedPrice = course.price && course.price > 0
      ? new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(course.price)
      : i18n.catalog.free;

    backdrop.innerHTML = `
      <div class="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-4xl lg:max-w-5xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-zinc-100 transform transition-all scale-100">
        
        <!-- Header con Banner e Imagen -->
        <div class="relative w-full h-60 sm:h-72 md:h-80 overflow-hidden shrink-0 bg-zinc-950">
          <img 
            src="${imageUrl}" 
            alt="${course.title}" 
            class="w-full h-full object-cover object-top"
            onerror="this.src='/images/course1.png'"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent"></div>
          
          <!-- Botón de Cerrar Flotante -->
          <button id="close-modal-x-btn" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-zinc-300 hover:text-white flex items-center justify-center border border-white/10 backdrop-blur-md transition-colors text-lg font-bold z-10" aria-label="${i18n.detailModal.close}">
            ✕
          </button>

          <!-- Badges sobre la imagen -->
          <div class="absolute bottom-5 left-6 right-6 flex flex-wrap items-center gap-2.5 z-10">
            <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs uppercase tracking-wider ${levelInfo.badgeClass} shadow-lg">
              ${renderIcon(BookOpen, 'w-4 h-4')}
              ${levelInfo.label}
            </span>
            <span class="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-zinc-950/90 text-sky-400 border border-sky-800 shadow-lg font-mono">
              ${renderIcon(DollarSign, 'w-4 h-4')}
              ${formattedPrice}
            </span>
            ${
              isEnrolled
                ? `<span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-700 shadow-lg">
                    ${renderIcon(CheckCircle2, 'w-4 h-4')}
                    ${i18n.catalog.enrolled}
                  </span>`
                : `<span class="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-zinc-950/80 text-zinc-400 border border-zinc-700 shadow-lg">
                    ${i18n.catalog.notEnrolled}
                  </span>`
            }
          </div>
        </div>

        <!-- Cuerpo del Modal -->
        <div class="overflow-y-auto flex-1 p-6 sm:p-8 space-y-6">
          <div>
            <h2 class="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight leading-tight mb-3">
              ${course.title}
            </h2>
          </div>

          <!-- Sección de Descripción -->
          <div class="space-y-2">
            <h3 class="text-xs font-black uppercase tracking-wider text-sky-400">${i18n.detailModal.descriptionTitle}</h3>
            <p class="text-sm sm:text-base text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/80">
              ${course.description || i18n.detailModal.noDescription}
            </p>
          </div>

          <!-- Sección de Contenido en Video / Recursos -->
          <div class="space-y-2">
            <h3 class="text-xs font-black uppercase tracking-wider text-zinc-400">${i18n.detailModal.audiovisualTitle}</h3>
            
            ${
              isEnrolled
                ? `
                <div class="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center justify-center shrink-0">
                      ${renderIcon(Video, 'w-5 h-5')}
                    </div>
                    <div>
                      <p class="text-sm font-bold text-white">${i18n.detailModal.videoAvailable}</p>
                      <p class="text-xs text-emerald-300/80 font-mono truncate max-w-xs sm:max-w-md">${course.videoUrl || i18n.detailModal.noVideoConfigured}</p>
                    </div>
                  </div>
                  ${
                    course.videoUrl
                      ? `<a href="${course.videoUrl}" target="_blank" rel="noopener noreferrer" class="px-4 py-2 text-xs font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors inline-flex items-center gap-1.5 shrink-0 shadow-lg shadow-emerald-950/50">
                          ${i18n.detailModal.watchClass}
                        </a>`
                      : ''
                  }
                </div>
              `
                : `
                <div class="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-500 flex items-center justify-center shrink-0">
                    ${renderIcon(Lock, 'w-5 h-5')}
                  </div>
                  <div>
                    <p class="text-sm font-bold text-zinc-300">${i18n.detailModal.restrictedContent}</p>
                    <p class="text-xs text-zinc-500">${i18n.detailModal.restrictedMessage}</p>
                  </div>
                </div>
              `
            }
          </div>
        </div>

        <!-- Footer con Acciones -->
        <div class="p-4 sm:p-5 bg-zinc-950/90 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          ${
            AuthService.isAdmin()
              ? `<button id="edit-course-btn" class="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-lg transition-colors inline-flex items-center gap-1.5">
                  ${i18n.detailModal.editCourse}
                </button>`
              : '<div></div>'
          }

          <div class="flex items-center gap-2 ml-auto">
            ${
              isEnrolled
                ? `
                <button id="toggle-enroll-btn" class="px-5 py-2 text-xs font-black uppercase tracking-wider bg-red-700 hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg shadow-red-950/50 flex items-center gap-1.5">
                  ${i18n.detailModal.cancelEnrollBtn}
                </button>
              `
                : `
                <button id="toggle-enroll-btn" class="px-6 py-2 text-xs font-black uppercase tracking-wider bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors shadow-lg shadow-sky-950/50 flex items-center gap-1.5">
                  ${renderIcon(BookOpen, 'w-4 h-4')}
                  ${i18n.detailModal.enrollBtn}
                </button>
              `
            }
          </div>
        </div>
      </div>
    `;

    bindEvents();
  };

  const bindEvents = () => {
    backdrop.querySelector('#close-modal-x-btn')?.addEventListener('click', handleClose);

    backdrop.querySelector('#edit-course-btn')?.addEventListener('click', () => {
      handleClose();
      onEdit(course);
    });

    const toggleEnrollBtn = backdrop.querySelector<HTMLButtonElement>('#toggle-enroll-btn');
    toggleEnrollBtn?.addEventListener('click', async () => {
      const i18n = useI18n();
      // Si no está autenticado, abrir modal de login
      if (!AuthService.isAuthenticated()) {
        handleClose();
        onAuthRequired?.();
        return;
      }

      toggleEnrollBtn.disabled = true;
      toggleEnrollBtn.classList.add('opacity-50', 'cursor-wait');

      try {
        if (isEnrolled) {
          await CourseService.unenroll(course.id);
          isEnrolled = false;
        } else {
          await CourseService.enroll(course.id);
          isEnrolled = true;
        }
        course.isEnrolled = isEnrolled;
        onStateChanged?.();
        renderContent();
      } catch (err) {
        window.alert(err instanceof Error ? err.message : i18n.detailModal.enrollError);
        toggleEnrollBtn.disabled = false;
        toggleEnrollBtn.classList.remove('opacity-50', 'cursor-wait');
      }
    });
  };

  const handleClose = () => {
    unsubscribeLang();
    backdrop.remove();
    document.removeEventListener('keydown', handleKeyDown);
    onClose();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') handleClose();
  };

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) handleClose();
  });
  document.addEventListener('keydown', handleKeyDown);

  const unsubscribeLang = I18nService.subscribe(() => {
    renderContent();
  });

  // Inicializar render
  renderContent();

  return backdrop;
}
