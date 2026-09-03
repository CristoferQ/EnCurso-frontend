import { AuthService } from '../../services/auth.service';
import { useI18n, I18nService } from '../../i18n/i18n.service';

export function createAuthModalElement(
  initialMode: 'login' | 'register' = 'login',
  onSuccess: () => void,
  onClose: () => void
): HTMLElement {
  const backdrop = document.createElement('div');
  backdrop.className =
    'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in';

  let currentMode = initialMode;

  const renderContent = () => {
    const i18n = useI18n();
    const t = i18n.authModal;

    backdrop.innerHTML = `
      <div class="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl flex flex-col overflow-hidden text-zinc-100 relative">
        <button id="auth-close-btn" class="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg transition-colors text-lg font-bold" aria-label="Cerrar">✕</button>

        <div class="flex items-center gap-2 mb-2">
          <span class="w-2.5 h-6 bg-sky-500 rounded-sm inline-block"></span>
          <h2 id="auth-title" class="text-2xl font-bold uppercase tracking-wider text-white">
            ${currentMode === 'login' ? t.loginTab : t.registerTab}
          </h2>
        </div>
        <p class="text-sm text-zinc-400 mb-6">
          ${currentMode === 'login' ? t.loginSubtitle : t.registerSubtitle}
        </p>

        <!-- Formulario -->
        <form id="auth-form" class="space-y-4">
          ${
            currentMode === 'register'
              ? `
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5" for="auth-name">${t.nameLabel}</label>
              <input id="auth-name" name="name" required placeholder="${t.namePlaceholder}"
                class="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 transition-colors" />
            </div>
          `
              : ''
          }

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5" for="auth-email">${t.emailLabel}</label>
            <input id="auth-email" name="email" type="email" required placeholder="${t.emailPlaceholder}"
              class="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 transition-colors" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5" for="auth-password">${t.passwordLabel}</label>
            <input id="auth-password" name="password" type="password" required placeholder="${t.passwordPlaceholder}"
              class="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 transition-colors" />
          </div>

          <div id="auth-error" class="text-red-400 bg-red-950/40 border border-red-800/60 rounded-lg p-2.5 text-xs hidden"></div>

          <button type="submit" id="auth-submit-btn" class="w-full py-2.5 text-sm font-bold uppercase tracking-wider bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors shadow-md mt-2 flex items-center justify-center gap-2">
            <span>${currentMode === 'login' ? t.loginSubmit : t.registerSubmit}</span>
          </button>
        </form>

        <!-- Toggle Modo -->
        <div class="mt-6 pt-4 border-t border-zinc-800 text-center text-xs text-zinc-400">
          ${
            currentMode === 'login'
              ? `${t.noAccount} <button id="switch-mode-btn" class="text-sky-400 font-semibold hover:underline ml-1">${t.createOne}</button>`
              : `${t.hasAccount} <button id="switch-mode-btn" class="text-sky-400 font-semibold hover:underline ml-1">${t.signInHere}</button>`
          }
        </div>
      </div>
    `;

    bindEvents();
  };

  const bindEvents = () => {
    const closeBtn = backdrop.querySelector('#auth-close-btn');
    closeBtn?.addEventListener('click', handleClose);

    const switchBtn = backdrop.querySelector('#switch-mode-btn');
    switchBtn?.addEventListener('click', () => {
      currentMode = currentMode === 'login' ? 'register' : 'login';
      renderContent();
    });

    const form = backdrop.querySelector<HTMLFormElement>('#auth-form')!;
    const errorEl = backdrop.querySelector<HTMLElement>('#auth-error')!;
    const submitBtn = backdrop.querySelector<HTMLButtonElement>('#auth-submit-btn')!;

    const showError = (msg: string) => {
      errorEl.textContent = msg;
      errorEl.classList.remove('hidden');
    };

    const clearError = () => {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearError();
      const i18n = useI18n();

      const email = (form.querySelector('#auth-email') as HTMLInputElement).value.trim();
      const password = (form.querySelector('#auth-password') as HTMLInputElement).value;
      const nameInput = form.querySelector('#auth-name') as HTMLInputElement | null;
      const name = nameInput ? nameInput.value.trim() : '';

      submitBtn.disabled = true;
      submitBtn.classList.add('opacity-75', 'cursor-not-allowed');

      try {
        if (currentMode === 'register') {
          if (!name) {
            showError(i18n.authModal.fillAllFields);
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
            return;
          }
          await AuthService.register({ name, email, password });
        } else {
          await AuthService.login({ email, password });
        }

        handleClose();
        onSuccess();
      } catch (err) {
        showError(err instanceof Error ? err.message : i18n.authModal.errorGeneric);
      } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
      }
    });
  };

  const handleClose = () => {
    unsubscribeLang();
    backdrop.remove();
    onClose();
  };

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) handleClose();
  });

  const unsubscribeLang = I18nService.subscribe(() => {
    renderContent();
  });

  renderContent();
  return backdrop;
}
