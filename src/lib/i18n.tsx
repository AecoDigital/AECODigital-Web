"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { translations, Lang, Translations } from "./translations";

interface I18nContext {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const Context = createContext<I18nContext | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("es");

  return (
    <Context.Provider value={{ lang, setLang, t: translations[lang] as typeof translations["es"] }}>
      {children}
    </Context.Provider>
  );
}

export function useLang() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
