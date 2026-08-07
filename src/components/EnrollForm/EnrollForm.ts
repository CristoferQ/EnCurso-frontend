import type { Course } from '../../models';
import { renderIcon } from '../../utils/icon.utils';
import { Mail, CheckCircle2, AlertCircle, BookOpen } from 'lucide';

/**
 * Genera la estructura HTML declarativa del formulario de inscripcion de cursos.
 * @param course Curso opcional preseleccionado para la reserva.
 */
export function renderBookingForm(course?: Course): string {
  const courseBadge = course
    ? `
      <div class="mb-4 p-3 bg-zinc-900/90 border border-zinc-800 rounded-lg flex flex-col gap-3">
        <div class="flex items-center gap-2 overflow-hidden">
          <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-sky-950 text-white border border-sky-800 shrink-0">
            SELECCIONADO
          </span>
          <span class="text-xs font-bold text-white truncate">${course.title}</span>
        </div>
        <p class="text-xs text-zinc-400 line-clamp-3">${course.description}</p>
      </div>
    `
    : '';

  const mailIcon = renderIcon(Mail, 'w-3.5 h-3.5 text-zinc-400');

  return `
    <section class="w-full bg-zinc-950 border border-zinc-800/90 rounded-xl p-5 md:p-6 shadow-xl relative overflow-hidden">
      <div class="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none"></div>

      <header class="mb-4">
        <div class="flex items-center gap-2 mb-1">
          ${renderIcon(BookOpen, 'w-4 h-4')}
          <h2 class="text-lg md:text-xl font-black uppercase tracking-tight text-white">
            Inscripción al curso
          </h2>
        </div>
        <p class="text-xs text-zinc-400">
          Asegura tu lugar en los mejores cursos de desarrollo.
        </p>
      </header>

      ${courseBadge}

      <form id="form-reserva" class="space-y-4" novalidate>
        <div class="space-y-1.5">
          <label for="email" class="block text-xs font-extrabold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            ${mailIcon}
            <span>Email</span>
          </label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all duration-150" 
            placeholder="ejemplo@correo.com" 
            required
          />
        </div>

        <div id="bloque-error" class="hidden text-xs font-bold text-red-400 bg-red-950/70 border border-red-800/80 rounded-lg p-3 flex items-center gap-2"></div>

        <button 
          type="submit" 
          class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-black text-xs md:text-sm uppercase tracking-wider border border-sky-600 shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all duration-150 cursor-pointer"
        >
          ${renderIcon(BookOpen, 'w-4 h-4')}
          <span>Inscribirme</span>
        </button>
      </form>
    </section>
  `;
}

/**
 * Muestra el estado de éxito tras completar la reserva.
 */
function renderSuccessState(
  sectionElement: HTMLElement,
  email: string,
  course?: Course,
): void {
  const checkIcon = renderIcon(CheckCircle2, 'w-8 h-8 text-sky-500 mb-1');
  const courseName = course ? course.title : 'Evento EnCurso';

  sectionElement.innerHTML = `
    <div class="text-center py-6 px-4 flex flex-col items-center gap-2">
      ${checkIcon}
      <h3 class="text-lg font-black text-white uppercase tracking-tight">
        ¡Inscripción Confirmada!
      </h3>
      <p class="text-xs text-zinc-300 max-w-md">
        <strong class="text-sky-400 font-bold">${courseName}</strong>.
      </p>
      <p class="text-[11px] text-zinc-400 mt-1">
        Enviamos un correo de confirmación a <span class="text-zinc-200 font-semibold">${email}</span>.
      </p>
      <button 
        type="button" 
        id="btn-nueva-reserva" 
        class="mt-4 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-extrabold uppercase tracking-wider rounded-lg border border-zinc-700 transition-colors cursor-pointer"
      >
        Inscribirse en otro curso
      </button>
    </div>
  `;

  const btnNuevaReserva = sectionElement.querySelector('#btn-nueva-reserva');
  btnNuevaReserva?.addEventListener('click', () => {
    const freshElement = createBookingFormElement(course);
    sectionElement.replaceWith(freshElement);
  });
}

/**
 * Crea e instancia un elemento HTMLElement interactivo con validación de formulario.
 */
export function createBookingFormElement(
  course?: Course,
  onSubmitSuccess?: (data: {
    email: string;
    course?: Course;
  }) => void,
): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = renderBookingForm(course).trim();
  const sectionElement = container.firstElementChild as HTMLElement;

  const form = sectionElement.querySelector<HTMLFormElement>('#form-reserva');
  const emailInput = sectionElement.querySelector<HTMLInputElement>('#email');
  const errorBlock = sectionElement.querySelector<HTMLElement>('#bloque-error');

  const showError = (msg: string) => {
    if (!errorBlock) return;
    const warningIcon = renderIcon(
      AlertCircle,
      'w-4 h-4 shrink-0 text-red-400',
    );
    errorBlock.innerHTML = `${warningIcon}<span>${msg}</span>`;
    errorBlock.classList.remove('hidden');
  };

  if (form && emailInput && errorBlock) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      errorBlock.classList.add('hidden');
      errorBlock.innerHTML = '';

      const email = emailInput.value.trim();

      if (!email) {
        showError('El correo electrónico es requerido.');
        emailInput.focus();
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showError('Por favor, ingresa un correo electrónico válido.');
        emailInput.focus();
        return;
      }

      if (!course) {
        showError('Se debe seleccionar un curso para inscribirse.');
        return;
      }

      renderSuccessState(sectionElement, email, course);
      if (onSubmitSuccess) {
        onSubmitSuccess({ email, course });
      }
    });
  }

  return sectionElement;
}
