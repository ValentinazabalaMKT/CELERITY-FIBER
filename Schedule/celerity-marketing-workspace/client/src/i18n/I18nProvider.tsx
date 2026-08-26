import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import en, { type TranslationKey } from "./en";
import es from "./es";
import type { Language } from "../shared/types";

const DICTIONARIES: Record<Language, Record<TranslationKey, string>> = { en, es };

interface I18nContextValue {
  locale: Language;
  setLocale: (locale: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  initialLocale = "en",
}: {
  children: ReactNode;
  initialLocale?: Language;
}) {
  const [locale, setLocaleState] = useState<Language>(
    (localStorage.getItem("celerity.locale") as Language | null) ?? initialLocale
  );

  const setLocale = (next: Language) => {
    setLocaleState(next);
    localStorage.setItem("celerity.locale", next);
  };

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key: TranslationKey) => DICTIONARIES[locale][key] ?? DICTIONARIES.en[key] ?? key,
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
