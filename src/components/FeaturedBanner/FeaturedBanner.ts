import type { Course } from '../../models';
import { CourseStatus } from '../../models';
import { renderIcon } from '../../utils/icon.utils';
import { Flame, BookOpen } from 'lucide';

function getCourseLevelBadge(status?: CourseStatus) {
  switch (status) {
    case CourseStatus.BEGINNER:
      return {
        label: 'Principiante',
        badgeClass:
          'bg-emerald-950/90 text-emerald-300 border border-emerald-700 font-black tracking-widest shadow',
        icon: BookOpen,
      };
    case CourseStatus.INTERMEDIATE:
      return {
        label: 'Intermedio',
        badgeClass:
          'bg-amber-950/90 text-amber-300 border border-amber-700 font-black tracking-widest shadow',
        icon: BookOpen,
      };
    case CourseStatus.ADVANCED:
      return {
        label: 'Avanzado',
        badgeClass:
          'bg-red-950/90 text-red-300 border border-red-700 font-black tracking-widest shadow',
        icon: BookOpen,
      };
    default:
      return {
        label: 'Nivel por confirmar',
        badgeClass:
          'bg-zinc-900/90 text-zinc-200 border border-zinc-700 font-extrabold tracking-wider shadow',
        icon: BookOpen,
      };
  }
}

/**
 * Genera el Banner de curso destacado con estilo moderno y enfocado en aprendizaje.
 */
export function createFeaturedBannerElement(course: Course): HTMLElement {
  const container = document.createElement('section');
  container.className =
    'w-full mb-6 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-xl relative group';

  const imageUrl = course.imageUrl || '/images/punk1.png';
  const title = course.title || 'Curso Destacado';
  const description = course.description || 'Descripción del curso no disponible';
  const levelBadge = getCourseLevelBadge(course.status);

  container.innerHTML = `
    <div class="relative min-h-[300px] md:min-h-[350px] flex flex-col justify-end p-5 md:p-7 overflow-hidden">
      <img 
        src="${imageUrl}" 
        alt="${title}" 
        class="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-75 contrast-125"
        onerror="this.src='/images/punk1.png'"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>

      <div class="relative z-10 max-w-2xl flex flex-col gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-widest bg-sky-700 text-white shadow">
            ${renderIcon(Flame, 'w-3 h-3 fill-current')}
            CURSO DESTACADO
          </span>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${levelBadge.badgeClass}">
            ${renderIcon(levelBadge.icon, 'w-3 h-3')}
            ${levelBadge.label}
          </span>
        </div>

        <h2 class="text-2xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight drop-shadow-md">
          ${title}
        </h2>

        <p class="text-sm md:text-base text-zinc-200 max-w-2xl leading-relaxed">
          ${description}
        </p>

        <div class="pt-2 flex flex-wrap gap-3">
          <button class="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-black text-xs md:text-sm uppercase tracking-wider bg-sky-600 hover:bg-sky-500 text-white border border-sky-500 transition-all duration-150 shadow-[0_0_15px_rgba(56,189,248,0.15)] cursor-pointer">
            ${renderIcon(BookOpen, 'w-4 h-4')}
            <span>Inscribirse</span>
          </button>
        </div>
      </div>
    </div>
  `;

  return container;
}
