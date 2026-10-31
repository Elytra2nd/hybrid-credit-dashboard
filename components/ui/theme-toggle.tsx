"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface ThemeToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export function ThemeToggle({ className, ...props }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    // 1. Fallback otomatis jika browser tidak mendukung View Transitions API atau preferensi reduced motion
    if (
      typeof document === "undefined" ||
      !("startViewTransition" in document) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      toggleTheme();
      return;
    }

    // 2. Ambil koordinat pusat (x, y) dari tombol yang diklik
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX || rect.left + rect.width / 2;
    const y = event.clientY || rect.top + rect.height / 2;

    // 3. Hitung radius maksimum lingkaran hingga sudut terjauh layar
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // 4. Set CSS custom properties di documentElement untuk keyframes di globals.css
    document.documentElement.style.setProperty("--transition-x", `${x}px`);
    document.documentElement.style.setProperty("--transition-y", `${y}px`);
    document.documentElement.style.setProperty("--transition-r", `${endRadius}px`);

    // 5. Jalankan Circular View Transition
    const transition = (document as any).startViewTransition(() => {
      toggleTheme();
    });

    // 6. Jalankan Web Animations API pada pseudo-element ::view-transition-new(root) untuk presisi 400ms ease-in-out
    if (transition?.ready) {
      transition.ready
        .then(() => {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${endRadius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: 400,
              easing: "ease-in-out",
              pseudoElement: "::view-transition-new(root)",
            }
          );
        })
        .catch(() => {
          // Graceful handling jika promise dibatalkan
        });
    }
  };

  return (
    <button
      onClick={handleToggle}
      type="button"
      aria-label={theme === "dark" ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
      title={theme === "dark" ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
      className={cn(
        "relative overflow-hidden rounded-full size-9 border border-slate-200/80 dark:border-slate-800 bg-background hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center cursor-pointer text-slate-700 dark:text-slate-200 shadow-2xs shrink-0",
        className
      )}
      {...props}
    >
      {/* Sun Icon: Visible in Light Mode, scales down & rotates -90deg in Dark Mode */}
      <Sun className="size-4 text-amber-600 dark:text-amber-400 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] scale-100 rotate-0 opacity-100 dark:scale-0 dark:-rotate-90 dark:opacity-0" />

      {/* Moon Icon: Hidden in Light Mode, rotates 0deg & scales up in Dark Mode */}
      <Moon className="size-4 text-blue-400 absolute transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] scale-0 rotate-90 opacity-0 dark:scale-100 dark:rotate-0 dark:opacity-100" />

      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

export default ThemeToggle;
