import type { Course } from '../../models';
import { CourseStatus } from '../../models';
import { renderIcon } from '../../utils/icon.utils';
import { useI18n } from '../../i18n/i18n.service';
import { Flame, BookOpen } from 'lucide';

function getCourseLevelBadge(status?: CourseStatus) {
  const i18n = useI18n();
  switch (status) {
    case CourseStatus.BEGINNER:
      return {
        label: i18n.levels.BEGINNER,
        badgeClass:
          'bg-emerald-950/90 text-emerald-300 border border-emerald-700 font-black tracking-widest shadow',
        icon: BookOpen,
      };
    case CourseStatus.INTERMEDIATE:
      return {
        label: i18n.levels.INTERMEDIATE,
        badgeClass:
          'bg-amber-950/90 text-amber-300 border border-amber-700 font-black tracking-widest shadow',
        icon: BookOpen,
      };
    case CourseStatus.ADVANCED:
      return {
        label: i18n.levels.ADVANCED,
        badgeClass:
          'bg-red-950/90 text-red-300 border border-red-700 font-black tracking-widest shadow',
        icon: BookOpen,
      };
    default:
      return {
        label: status || i18n.levels.general,
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
  const i18n = useI18n();
  const container = document.createElement('section');
  container.className =
    'w-full mb-6 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-xl relative';

  const imageUrl = course.imageUrl || '/images/course1.png';
  const title = course.title || i18n.catalog.featured;
  const description = course.description || i18n.detailModal.noDescription;
  const levelBadge = getCourseLevelBadge(course.status);
  const formattedPrice = course.price && course.price > 0
    ? new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(course.price)
    : i18n.catalog.free;

  container.innerHTML = `
    <div class="relative min-h-[300px] md:min-h-[350px] flex flex-col justify-end p-5 md:p-7 overflow-hidden">
      <img 
        src="${imageUrl}" 
        alt="${title}" 
        class="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500"
        onerror="this.src='/images/course1.png'"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>

      <div class="relative z-10 max-w-2xl flex flex-col gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-widest bg-sky-700 text-white shadow">
            ${renderIcon(Flame, 'w-3 h-3 fill-current')}
            ${i18n.catalog.featured}
          </span>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${levelBadge.badgeClass}">
            ${renderIcon(levelBadge.icon, 'w-3 h-3')}
            ${levelBadge.label}
          </span>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-zinc-950/90 text-sky-400 border border-sky-800 shadow">
            ${formattedPrice}
          </span>
        </div>

        <h2 class="text-2xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight drop-shadow-md">
          ${title}
        </h2>

        <p class="text-sm md:text-base text-zinc-200 max-w-2xl leading-relaxed">
          ${description}
        </p>
      </div>
    </div>
  `;

  return container;
}
