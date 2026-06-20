import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import he from './locales/he.json';
import en from './locales/en.json';

const savedLang = (typeof window !== 'undefined' && localStorage.getItem('eb_language')) || 'he';

if (typeof window !== 'undefined') {
  document.documentElement.dir  = savedLang === 'he' ? 'rtl' : 'ltr';
  document.documentElement.lang = savedLang;
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      he: { translation: he },
      en: { translation: en },
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
