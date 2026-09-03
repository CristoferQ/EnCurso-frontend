import { translations, type Language, type TranslationSchema } from './translations';

const STORAGE_KEY = 'encurso_lang';
type Listener = (lang: Language) => void;

export class I18nService {
  private static currentLang: Language = (localStorage.getItem(STORAGE_KEY) as Language) || 'es';
  private static listeners: Listener[] = [];

  static getLanguage(): Language {
    return this.currentLang;
  }

  static setLanguage(lang: Language): void {
    if (this.currentLang === lang) return;
    this.currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    this.notify();
  }

  static toggleLanguage(): Language {
    const nextLang: Language = this.currentLang === 'es' ? 'en' : 'es';
    this.setLanguage(nextLang);
    return nextLang;
  }

  static getStrings(): TranslationSchema {
    return translations[this.currentLang];
  }

  static subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentLang);
      } catch (err) {
        console.error('[I18nService] Error en listener:', err);
      }
    });
  }
}

/**
 * Helper global para obtener traducciones reactivas del idioma actual.
 */
export function useI18n(): TranslationSchema {
  return I18nService.getStrings();
}
