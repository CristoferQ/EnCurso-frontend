export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

/**
 * Muestra un modal de confirmación con diseño estilizado y retorna una Promesa booleana.
 */
export function confirmAction(options: ConfirmOptions): Promise<boolean> {
  const {
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isDestructive = true,
  } = options;

  return new Promise<boolean>((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in';

    const confirmBtnClasses = isDestructive
      ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/50'
      : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-950/50';

    backdrop.innerHTML = `
      <div class="bg-zinc-900 border border-zinc-700 rounded-xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 text-zinc-100 transform transition-all scale-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full ${isDestructive ? 'bg-red-950/80 border border-red-800 text-red-400' : 'bg-sky-950/80 border border-sky-800 text-sky-400'} flex items-center justify-center text-lg shrink-0">
            ${isDestructive ? '⚠️' : '❓'}
          </div>
          <div>
            <h3 class="text-base font-bold text-white uppercase tracking-wider">${title}</h3>
          </div>
        </div>

        <p class="text-sm text-zinc-300 leading-relaxed">${message}</p>

        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
          <button id="cancel-confirm-btn" class="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg transition-colors">
            ${cancelText}
          </button>
          <button id="ok-confirm-btn" class="px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-colors ${confirmBtnClasses}">
            ${confirmText}
          </button>
        </div>
      </div>
    `;

    const cleanup = (result: boolean) => {
      backdrop.remove();
      document.removeEventListener('keydown', handleKey);
      resolve(result);
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cleanup(false);
    };

    backdrop.querySelector('#cancel-confirm-btn')?.addEventListener('click', () => cleanup(false));
    backdrop.querySelector('#ok-confirm-btn')?.addEventListener('click', () => cleanup(true));
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) cleanup(false);
    });

    document.addEventListener('keydown', handleKey);
    document.body.appendChild(backdrop);
  });
}
