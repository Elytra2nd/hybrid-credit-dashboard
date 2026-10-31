"use client";

import React, { useEffect, useState } from "react";
import { Landmark, WifiOff, Moon, Sun } from "lucide-react";
import { checkApiHealth } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";

export default function Navbar() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    async function verify() {
      const res = await checkApiHealth();
      setIsOnline(res.online);
    }
    verify();
    const interval = setInterval(verify, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[var(--sidebar-bg)] border-b border-[var(--sidebar-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">

        {/* ── Logo & Identity ── */}
        <div className="flex items-center gap-3">
          {/* Brand icon: solid navy square, no gradient */}
          <div className="size-9 rounded-lg bg-[var(--brand)] flex items-center justify-center shrink-0">
            <Landmark className="size-4 text-white" strokeWidth={1.75} />
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-tight">
                Hybrid Credit DSS
              </h1>
              <span className="text-[10px] font-semibold text-[var(--navy-200)] bg-white/10 border border-white/15 px-1.5 py-0.5 rounded">
                v2
              </span>
            </div>
            <p className="text-[11px] text-[var(--navy-300)] font-medium">
              PT Bina Area Persada · Bank Kalbar
            </p>
          </div>
        </div>

        {/* ── Right controls ── */}
        <div className="flex items-center gap-2">

          {/* API Status */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-semibold border ${
              isOnline
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                : "bg-rose-500/10 text-rose-400 border-rose-500/25"
            }`}
          >
            {isOnline ? (
              <>
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
                <span className="hidden sm:inline">FastAPI Live</span>
              </>
            ) : (
              <>
                <WifiOff className="size-3" />
                <span className="hidden sm:inline">Offline</span>
              </>
            )}
          </div>

          {/* Theme toggle — clean pill switch */}
          <button
            onClick={toggleTheme}
            type="button"
            role="switch"
            aria-checked={theme === "dark"}
            title={theme === "dark" ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
            className="relative flex items-center h-7 w-[52px] rounded-full cursor-pointer transition-colors duration-200 border border-white/15 bg-white/10 hover:bg-white/15"
          >
            <span
              className={`absolute flex size-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 ${
                theme === "dark" ? "translate-x-[27px]" : "translate-x-[3px]"
              }`}
            >
              {theme === "dark" ? (
                <Moon className="size-3 text-[var(--navy-700)]" />
              ) : (
                <Sun className="size-3 text-[var(--navy-700)]" />
              )}
            </span>
          </button>

          {/* Profile avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="size-8 rounded-lg bg-[var(--navy-600)] flex items-center justify-center font-bold text-xs text-white">
              BK
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
