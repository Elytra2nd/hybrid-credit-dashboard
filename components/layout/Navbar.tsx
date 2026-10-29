"use client";

import React, { useEffect, useState } from "react";
import { Layers, WifiOff, Bell, Sun, Moon } from "lucide-react";
import { checkApiHealth } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";

interface NavbarProps {
  activeTab?: "kpi" | "scoring" | "stress-test";
  onTabChange?: (tab: "kpi" | "scoring" | "stress-test") => void;
}

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
    <header className="sticky top-0 z-50 px-4 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto glass-card rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 shadow-2xl">
        {/* Logo & App Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 p-0.5 shadow-lg shadow-blue-500/30 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#0D121F] rounded-[10px] flex items-center justify-center text-blue-400">
              <Layers className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wider uppercase">
                Hybrid Credit DSS
              </h1>
              <span className="bg-blue-500/20 text-blue-500 dark:text-blue-300 text-[10px] px-2 py-0.5 rounded-full border border-blue-400/30 font-semibold">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              PT Bina Area Persada &bull; Bank Kalbar
            </p>
          </div>
        </div>

        {/* Right: Theme Switcher, API Status, Notifications, Profile */}
        <div className="flex items-center gap-2.5">
          {/* API Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${
              isOnline
                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30"
                : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/30"
            }`}
          >
            {isOnline ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="hidden sm:inline">FastAPI 8000 Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-rose-400" />
                <span className="hidden sm:inline">Backend Offline</span>
              </>
            )}
          </div>

          {/* Theme On/Off Switch Toggle */}
          <button
            onClick={toggleTheme}
            type="button"
            role="switch"
            aria-checked={theme === "dark"}
            title={theme === "dark" ? "Mode Gelap aktif (Klik untuk Mode Terang)" : "Mode Terang aktif (Klik untuk Mode Gelap)"}
            className={`relative inline-flex h-7 w-[52px] items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 border shadow-inner ${
              theme === "dark"
                ? "bg-[#090D16] border-blue-500/30 shadow-black/60"
                : "bg-slate-200 border-slate-300 shadow-slate-300/50"
            }`}
          >
            {/* Background Icons in Track */}
            <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
              <Sun className={`w-3.5 h-3.5 transition-opacity duration-200 ${theme === "light" ? "opacity-0" : "text-amber-400/50"}`} />
              <Moon className={`w-3.5 h-3.5 transition-opacity duration-200 ${theme === "dark" ? "opacity-0" : "text-slate-400"}`} />
            </div>

            {/* Sliding Thumb Knob */}
            <span
              className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full shadow-md transition-transform duration-300 ${
                theme === "dark"
                  ? "translate-x-6 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-900/50"
                  : "translate-x-0 bg-white text-amber-500 shadow-slate-400/40"
              }`}
            >
              {theme === "dark" ? (
                <Moon className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Sun className="w-3.5 h-3.5 fill-current" />
              )}
            </span>
          </button>

          {/* Notification Bell */}
          <div className="relative p-2 rounded-xl bg-slate-200/60 dark:bg-white/5 hover:bg-slate-300/60 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-white/5 cursor-pointer transition">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-[#0D121F]" />
          </div>

          {/* Profile Avatar */}
          <div className="flex items-center gap-2 pl-1 border-l border-slate-300 dark:border-white/10">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-blue-600/30">
              BK
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
