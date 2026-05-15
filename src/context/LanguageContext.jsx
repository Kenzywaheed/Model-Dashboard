import { createContext, useEffect, useMemo, useState } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'model-dashboard-language';

const getInitialLanguage = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === 'ar' || saved === 'en' ? saved : 'en';
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(getInitialLanguage);
  const isRtl = language === 'ar';

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', isRtl);
  }, [isRtl, language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    isRtl,
    t: translations[language],
  }), [isRtl, language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
