import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Lang } from "../lib/types";
import { load, save } from "../lib/storage";
import { tPath } from "../data/translations";
import { resolveTr } from "../data/translations";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  tx: (obj: unknown) => string;
}

const Ctx = createContext<LangCtx>({
  lang: "en",
  setLang: () => undefined,
  t: (k) => k,
  tx: () => "",
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const l = load<Lang | null>("lang", null);
    return l === "en" || l === "as" || l === "bn" ? l : "en";
  });

  useEffect(() => {
    document.documentElement.lang = lang === "as" ? "as" : lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    save("lang", l);
  }, []);

  const t = useCallback((key: string) => tPath(key, lang), [lang]);
  const tx = useCallback((obj: unknown) => resolveTr(obj, lang), [lang]);

  const value = useMemo(() => ({ lang, setLang, t, tx }), [lang, setLang, t, tx]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  return useContext(Ctx);
}
