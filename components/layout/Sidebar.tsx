"use client";

import React from "react";
import {
  LayoutDashboard,
  UserCheck,
  TrendingUp,
  Activity,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: "dashboard" | "scoring" | "stress-test";
  onTabChange: (tab: "dashboard" | "scoring" | "stress-test") => void;
}

const navItems = [
  {
    id: "dashboard" as const,
    label: "Dashboard & OLAP",
    sub: "KPI Eksekutif · Kubus Data",
    icon: LayoutDashboard,
  },
  {
    id: "scoring" as const,
    label: "Scoring Debitur",
    sub: "FICO Hibrida · SHAP Explainability",
    icon: UserCheck,
  },
  {
    id: "stress-test" as const,
    label: "Stress Testing",
    sub: "Prophet · Makro CPO",
    icon: TrendingUp,
  },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="flex flex-col gap-3">

      {/* ── Navigation Card ── */}
      <div className="card p-3">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--divider)]">
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
            Modul
          </span>
          <span className="text-[10px] font-semibold text-[var(--brand)] bg-[var(--brand-subtle)] border border-[var(--brand-border)] px-1.5 py-0.5 rounded">
            3 Aktif
          </span>
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-1">
          {navItems.map(({ id, label, sub, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-left transition-all duration-150",
                  isActive
                    ? "bg-[var(--brand)] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]"
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0",
                    isActive ? "text-white" : "text-[var(--brand)]"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className={cn("text-xs font-semibold leading-tight", isActive ? "text-white" : "")}>
                    {label}
                  </p>
                  <p className={cn("text-[10px] mt-0.5 truncate leading-tight", isActive ? "text-white/70" : "text-[var(--text-muted)]")}>
                    {sub}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── System Status Card ── */}
      <div className="card p-3">
        <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-[var(--divider)]">
          <Cpu className="size-3.5 text-[var(--brand)]" />
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
            Status Sistem
          </span>
        </div>

        <div className="flex flex-col gap-1.5 text-[10px]">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">API Backend</span>
            <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
              Aktif
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">XGBoost</span>
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">AUC 0.94</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">Kubus OLAP</span>
            <span className="font-semibold text-[var(--brand)]">Terintegrasi</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">Prophet</span>
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">MAPE 4.85%</span>
          </div>
        </div>
      </div>

      {/* ── AI Model info ── */}
      <div className="px-3 py-2.5 rounded-md bg-[var(--brand-subtle)] border border-[var(--brand-border)]">
        <div className="flex items-center gap-1.5 mb-1">
          <Activity className="size-3 text-[var(--brand)]" />
          <span className="text-[10px] font-bold text-[var(--brand)] uppercase tracking-wider">CRISP-DM</span>
        </div>
        <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
          Kerangka kerja ML & OLAP standar industri perbankan.
        </p>
      </div>

    </aside>
  );
}
