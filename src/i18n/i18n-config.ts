import { default as i18n } from 'i18next';
import enTranslations from './locales/en.json';

i18n.init({
  lng: 'en',
  defaultNS: 'translation',
  resources: {
    en: {
      translation: enTranslations
    }
  }
});

export default i18n;
