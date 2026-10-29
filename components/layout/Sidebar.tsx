"use client";

import React from "react";
import {
  LayoutDashboard,
  Database,
  UserCheck,
  TrendingUp,
  Activity,
} from "lucide-react";

interface SidebarProps {
  activeTab: "dashboard" | "scoring" | "stress-test";
  onTabChange: (tab: "dashboard" | "scoring" | "stress-test") => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="space-y-4">
      {/* 1. Quick Navigation Glass Card */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider whitespace-nowrap">
            Menu
          </span>
          <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 whitespace-nowrap">
            3 Modul BI Terpadu
          </span>
        </div>

        <div className="space-y-1.5">
          <button
            onClick={() => onTabChange("dashboard")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all ${
              activeTab === "dashboard"
                ? "bg-blue-50 dark:bg-blue-600/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/40 shadow-sm dark:shadow-blue-600/10"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold leading-tight">1. Dashboard &amp; OLAP</p>
              <p className="text-[10px] text-slate-500 truncate">KPI Eksekutif &amp; Kubus Data</p>
            </div>
          </button>

          <button
            onClick={() => onTabChange("scoring")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all ${
              activeTab === "scoring"
                ? "bg-blue-50 dark:bg-blue-600/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/40 shadow-sm dark:shadow-blue-600/10"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold leading-tight">2. Scoring Debitur</p>
              <p className="text-[10px] text-slate-500 truncate">FICO Hibrida &amp; SHAP</p>
            </div>
          </button>

          <button
            onClick={() => onTabChange("stress-test")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all ${
              activeTab === "stress-test"
                ? "bg-blue-50 dark:bg-blue-600/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/40 shadow-sm dark:shadow-blue-600/10"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <TrendingUp className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold leading-tight">3. Stress Testing</p>
              <p className="text-[10px] text-slate-500 truncate">Prophet Makro CPO</p>
            </div>
          </button>
        </div>
      </div>

      {/* Status Sistem */}
      <div className="glass-card rounded-2xl p-3 space-y-2">
        <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-200 dark:border-white/5">
          <Activity className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Status Sistem</span>
        </div>
        <div className="space-y-1.5 text-[10px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">API Backend</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              Aktif
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">Model XGBoost</span>
            <span className="text-slate-800 dark:text-slate-300 font-semibold">AUC 0.94</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">Kubus OLAP</span>
            <span className="text-cyan-700 dark:text-cyan-400 font-semibold">Terintegrasi</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
