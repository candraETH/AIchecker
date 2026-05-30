import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "dark" | "light" | "system";

interface ThemeCtx {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolved: "dark" | "light";
}

const Ctx = createContext<ThemeCtx | null>(null);

function applyTheme(theme: Theme): "dark" | "light" {
  if (typeof document === "undefined") return "dark";
  const root = document.documentElement;
  let resolved: "dark" | "light" = "dark";
  if (theme === "system") {
    resolved = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  } else {
    resolved = theme;
  }
  root.classList.remove("dark", "light");
  root.classList.add(resolved);
  return resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolved, setResolved] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = (window.localStorage.getItem("aec.theme") as Theme | null) ?? "dark";
    setThemeState(stored);
    setResolved(applyTheme(stored));
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    window.localStorage.setItem("aec.theme", t);
    setResolved(applyTheme(t));
  };

  return <Ctx.Provider value={{ theme, setTheme, resolved }}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const v = useContext(Ctx);
  if (!v) return { theme: "dark", setTheme: () => {}, resolved: "dark" };
  return v;
}
