"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const THEME_KEY = "theme";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(THEME_KEY);
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme: Theme =
        stored === "light" || stored === "dark" ? stored : systemDark ? "dark" : "light";
      applyTheme(initialTheme);
      setTheme(initialTheme);
    } catch {
      setTheme("light");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    try {
      window.localStorage.setItem(THEME_KEY, nextTheme);
    } catch {
      /* ignore localStorage failures */
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="fixed right-4 top-4 z-50 border border-black/15 bg-white/80 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-ink backdrop-blur-sm transition-colors hover:bg-white dark:border-white/20 dark:bg-black/35 dark:hover:bg-black/50 md:right-6 md:top-6"
      aria-label="Toggle dark mode"
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}

