import { useI18n } from '../../i18n/i18n.service';

/**
 * Genera la vista de estado de error global con opción de reintento.
 */
export function createErrorStateElement(
  message?: string,
  onRetry?: () => void,
): HTMLElement {
  const i18n = useI18n();
  const container = document.createElement('div');
  container.className =
    'col-span-full text-center py-10 px-6 bg-zinc-950 border border-dashed border-red-600/40 rounded-xl text-zinc-400';

  const defaultMsg = message || i18n.catalog.errorLoading;

  container.innerHTML = `
    <h3 class="text-lg font-bold text-red-500 mb-2 uppercase">${i18n.catalog.errorLoading}</h3>
    <p class="text-sm mb-4">${defaultMsg}</p>
  `;

  if (onRetry) {
    const retryButton = document.createElement('button');
    retryButton.className =
      'px-5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-black text-xs uppercase tracking-wider rounded-lg transition-all duration-150 shadow cursor-pointer';
    retryButton.textContent = i18n.catalog.retry;
    retryButton.addEventListener('click', () => onRetry());
    container.appendChild(retryButton);
  }

  return container;
}

/**
 * Genera la vista de estado vacío cuando no hay cursos disponibles.
 */
export function createEmptyStateElement(): HTMLElement {
  const i18n = useI18n();
  const container = document.createElement('div');
  container.className =
    'col-span-full text-center py-10 px-6 bg-zinc-950 border border-dashed border-zinc-800 rounded-xl text-zinc-400';
  container.innerHTML = `
    <p class="text-base font-bold uppercase">${i18n.catalog.noCourses}</p>
  `;
  return container;
}
