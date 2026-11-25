import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next, useTranslation } from "react-i18next";
import en from "./en.json";
import ur from "./ur.json";
import type { Language } from "@/services/types";
const LanguageContext = createContext<{ language: Language; setLanguage: (l: Language) => void }>({
  language: "en",
  setLanguage: () => {},
});
export function SiteProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [i18n] = useState(() => {
    const instance = createInstance();
    void instance
      .use(initReactI18next)
      .init({
        resources: { en: { translation: en }, ur: { translation: ur } },
        lng: "en",
        fallbackLng: "en",
        interpolation: { escapeValue: false },
        initAsync: false,
      });
    return instance;
  });
  useEffect(() => {
    void i18n.changeLanguage(language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ur" ? "rtl" : "ltr";
  }, [language, i18n]);
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </LanguageContext.Provider>
  );
}
export function useLanguage() {
  return { ...useContext(LanguageContext), ...useTranslation() };
}
