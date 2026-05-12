import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('mh_lang') || 'ar');

  useEffect(() => {
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('mh_lang', lang);
  }, [lang]);

  const t = (key) => translations[lang]?.[key] ?? translations['en']?.[key] ?? key;

  const toggleLang = () => setLang(l => l === 'ar' ? 'en' : 'ar');

  return (
    <LangContext.Provider value={{ lang, t, toggleLang, isRTL: lang === 'ar' }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside LangProvider');
  return ctx;
}
