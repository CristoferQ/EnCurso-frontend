import { I18nService } from '../../i18n/i18n.service';

export function createLanguageSelectorElement(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'fixed bottom-5 right-5 z-40';

  const render = () => {
    const currentLang = I18nService.getLanguage();
    const strings = I18nService.getStrings().langSelector;

    container.innerHTML = `
      <div class="flex items-center bg-zinc-900/90 backdrop-blur-md border border-zinc-700/80 rounded-full p-1 shadow-xl hover:border-sky-500/50 transition-all">
        <button 
          id="btn-lang-es" 
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            currentLang === 'es'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }"
          title="${strings.es}"
        >
          <span>🇪🇸</span>
          <span class="hidden sm:inline">ES</span>
        </button>

        <button 
          id="btn-lang-en" 
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            currentLang === 'en'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }"
          title="${strings.en}"
        >
          <span>🇺🇸</span>
          <span class="hidden sm:inline">EN</span>
        </button>
      </div>
    `;

    container.querySelector('#btn-lang-es')?.addEventListener('click', () => {
      I18nService.setLanguage('es');
    });

    container.querySelector('#btn-lang-en')?.addEventListener('click', () => {
      I18nService.setLanguage('en');
    });
  };

  render();
  I18nService.subscribe(() => {
    render();
  });

  return container;
}
