"use client";

import React, { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { checkApiHealth } from "@/lib/api";
import { WifiOff } from "lucide-react";

interface DashboardHeaderProps {
  activeTab: "dashboard" | "scoring" | "stress-test";
}

const TAB_TITLES: Record<string, string> = {
  dashboard: "Ringkasan Eksekutif & OLAP",
  scoring: "Scoring Debitur & SHAP",
  "stress-test": "Stress Testing Makro",
};

export default function DashboardHeader({ activeTab }: DashboardHeaderProps) {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    async function verify() {
      const res = await checkApiHealth();
      setIsOnline(res.online);
    }
    verify();
    const interval = setInterval(verify, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-slate-200/80 dark:border-slate-800 px-4 flex items-center justify-between gap-4">
      {/* ── Left: Trigger + Breadcrumb ── */}
      <div className="flex items-center gap-2 min-w-0">
        <SidebarTrigger className="-ml-1 size-8 cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0" />
        <Separator orientation="vertical" className="h-4 my-auto bg-slate-200 dark:bg-slate-700" />

        <Breadcrumb className="truncate">
          <BreadcrumbList className="text-xs">
            <BreadcrumbItem>
              <BreadcrumbLink href="#" className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200">
                Sistem Kredit
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:inline-flex text-slate-400" />
            <BreadcrumbItem className="hidden md:inline-flex">
              <BreadcrumbLink href="#" className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200">
                Bank Kalbar
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-slate-400" />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-[var(--brand)] dark:text-blue-400 truncate">
                {TAB_TITLES[activeTab] ?? "Dashboard"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* ── Right: Live status & Theme Toggle ── */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Status Indicator */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold border ${
            isOnline
              ? "bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
              : "bg-rose-50 text-rose-800 border-rose-200/80 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
          }`}
        >
          {isOnline ? (
            <>
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
              <span className="hidden sm:inline">Engine Live</span>
            </>
          ) : (
            <>
              <WifiOff className="size-3" />
              <span className="hidden sm:inline">Offline</span>
            </>
          )}
        </div>

        {/* Animated Theme Toggle with Spring Micro-interaction */}
        <ThemeToggle />
      </div>
    </header>
  );
}

