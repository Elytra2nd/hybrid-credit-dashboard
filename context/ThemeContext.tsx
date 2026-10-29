"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  resetToSystem: () => void;
  isSystem: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [isSystem, setIsSystem] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  // Helper to apply theme classes and attributes
  const applyTheme = (t: Theme) => {
    document.documentElement.setAttribute("data-theme", t);
    if (t === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("hcd_theme") as Theme | null;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    if (savedTheme === "light" || savedTheme === "dark") {
      setThemeState(savedTheme);
      setIsSystem(false);
      applyTheme(savedTheme);
    } else {
      // Default to system theme!
      const systemTheme: Theme = mediaQuery.matches ? "dark" : "light";
      setThemeState(systemTheme);
      setIsSystem(true);
      applyTheme(systemTheme);
    }

    // Automatically follow OS / System theme changes when no manual override is active
    const handleSystemChange = (e: MediaQueryListEvent) => {
      const currentSaved = localStorage.getItem("hcd_theme");
      if (!currentSaved) {
        const newSystemTheme: Theme = e.matches ? "dark" : "light";
        setThemeState(newSystemTheme);
        setIsSystem(true);
        applyTheme(newSystemTheme);
      }
    };

    mediaQuery.addEventListener("change", handleSystemChange);
    setMounted(true);

    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setIsSystem(false);
    localStorage.setItem("hcd_theme", newTheme);
    applyTheme(newTheme);
  };

  const resetToSystem = () => {
    localStorage.removeItem("hcd_theme");
    setIsSystem(true);
    const systemTheme: Theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setThemeState(systemTheme);
    applyTheme(systemTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, resetToSystem, isSystem }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
