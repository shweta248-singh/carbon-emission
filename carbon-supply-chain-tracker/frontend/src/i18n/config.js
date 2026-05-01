import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import hi from './hi.json';
import es from './es.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      es: { translation: es }
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    parseMissingKeyHandler: (key) => {
      const parts = key.split('.');
      const lastPart = parts[parts.length - 1];
      return lastPart.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  });


export default i18n;
