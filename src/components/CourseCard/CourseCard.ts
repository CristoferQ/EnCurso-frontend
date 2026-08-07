import type { Course } from '../../models';
import { CourseStatus } from '../../models';
import { renderIcon } from '../../utils/icon.utils';
import { BookOpen, AlertTriangle } from 'lucide';

/**
 * Obtiene la configuración del badge y botón según el nivel de dificultad del curso.
 */
function getStatusConfig(status?: CourseStatus) {
  switch (status) {
    case CourseStatus.BEGINNER:
      return {
        label: 'Principiante',
        badgeClass:
          'bg-emerald-950/90 text-emerald-300 border border-emerald-700 font-black tracking-widest shadow',
        buttonText: 'Inscribirse',
        buttonDisabled: false,
        buttonClass:
          'bg-sky-600 hover:bg-sky-500 text-white font-black uppercase tracking-wider border border-sky-500 shadow-[0_0_12px_rgba(56,189,248,0.3)] cursor-pointer',
        icon: BookOpen,
      };
    case CourseStatus.INTERMEDIATE:
      return {
        label: 'Intermedio',
        badgeClass:
          'bg-amber-950/90 text-amber-300 border border-amber-700 font-black tracking-widest shadow',
        buttonText: 'Inscribirse',
        buttonDisabled: false,
        buttonClass:
          'bg-sky-600 hover:bg-sky-500 text-white font-black uppercase tracking-wider border border-sky-500 shadow-[0_0_12px_rgba(56,189,248,0.3)] cursor-pointer',
        icon: BookOpen,
      };
    case CourseStatus.ADVANCED:
      return {
        label: 'Avanzado',
        badgeClass:
          'bg-red-950/90 text-red-300 border border-red-700 font-black tracking-widest shadow',
        buttonText: 'Inscribirse',
        buttonDisabled: false,
        buttonClass:
          'bg-sky-600 hover:bg-sky-500 text-white font-black uppercase tracking-wider border border-sky-500 shadow-[0_0_12px_rgba(56,189,248,0.3)] cursor-pointer',
        icon: BookOpen,
      };
    default:
      return {
        label: status || 'Nivel por confirmar',
        badgeClass:
          'bg-zinc-900/90 text-zinc-200 border border-zinc-700 font-extrabold tracking-wider shadow',
        buttonText: 'Ver Curso',
        buttonDisabled: false,
        buttonClass:
          'bg-zinc-100 hover:bg-white text-zinc-950 font-black uppercase tracking-wider border border-zinc-200 shadow-[0_0_12px_rgba(255,255,255,0.12)] cursor-pointer',
        icon: BookOpen,
      };
  }
}

/**
 * Genera el HTML declarativo y seguro de la tarjeta del curso.
 */
export function generateCourseCardHtml(course: Course): string {
  if (!course) {
    return `
      <article class="h-full bg-zinc-950 border border-red-600/40 rounded-xl p-5 text-center text-red-400 flex flex-col justify-center">
        <p class="font-bold uppercase text-sm">Información de curso no disponible</p>
      </article>
    `;
  }

  const config = getStatusConfig(course.status); 
  const title = course.title || 'Curso sin título';
  const description = course.description || 'Descripción del curso no disponible';
  const id = course.id || 'desconocido';
  const imageUrl = course.imageUrl || '/images/course1.png';

  return `
    <article 
      class="group bg-zinc-950 border border-zinc-800/90 rounded-xl overflow-hidden shadow-sm hover:border-zinc-500 transition-all duration-200 flex flex-col justify-between h-full relative" 
      data-id="${id}"
    >
      <!-- Cabecera con Imagen de Portada Compacta -->
      <div class="relative w-full h-40 overflow-hidden shrink-0">
        <img 
          src="${imageUrl}" 
          alt="${title}" 
          class="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
          onerror="this.src='/images/course1.png'"
        />
        <span class="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${config.badgeClass}">
          ${renderIcon(config.icon, 'w-3 h-3')}
          ${config.label}
        </span>
      </div>

      <!-- Cuerpo de la Tarjeta -->
      <div class="p-4 flex flex-col justify-between flex-grow gap-3">
        <header class="flex flex-col gap-3">
          <h3 class="text-base md:text-lg font-black text-white uppercase tracking-tight leading-snug group-hover:text-sky-400 transition-colors duration-150 line-clamp-2">
            ${title}
          </h3>
          <p class="text-sm text-zinc-300 line-clamp-3">
            ${description}
          </p>
        </header>

        <footer class="mt-auto pt-1">
          <button 
            class="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-black text-xs uppercase tracking-wider transition-all duration-150 ${config.buttonClass}" 
            ${config.buttonDisabled ? 'disabled' : ''}
            aria-label="${config.buttonText} para ${title}"
          >
            ${renderIcon(BookOpen, 'w-3.5 h-3.5')}
            <span>${config.buttonText}</span>
          </button>
        </footer>
      </div>
    </article>
  `;
}

/**
 * Crea e instancia un nodo HTMLElement seguro para la tarjeta del curso.
 */
export function createCourseCardElement(course: Course): HTMLElement {
  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = generateCourseCardHtml(course).trim();
    const element = tempDiv.firstElementChild as HTMLElement | null;

    if (!element) {
      throw new Error('No se pudo generar el elemento del DOM.');
    }

    return element;
  } catch (error) {
    let courseId = 'desconocido';
    try {
      courseId = String(course?.id ?? 'desconocido');
    } catch {
      /* id getter también lanzó */
    }
    console.error(
      `[EnCurso] Error al crear la tarjeta del curso (${courseId}):`,
      error,
    );

    const fallbackArticle = document.createElement('article');
    fallbackArticle.className =
      'h-full bg-zinc-950 border border-red-600/40 rounded-xl p-4 text-center text-red-400 flex flex-col justify-center items-center gap-2';

    const icon = renderIcon(AlertTriangle, 'w-5 h-5 text-red-400');
    fallbackArticle.innerHTML = `
      ${icon}
      <p class="text-xs font-black uppercase">No se pudo cargar este curso.</p>
    `;
    return fallbackArticle;
  }
}
