"use client";

import * as React from "react";
import {
  LayoutDashboard,
  UserCheck,
  TrendingUp,
  Landmark,
  ShieldCheck,
  Cpu,
  HelpCircle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  activeTab: "dashboard" | "scoring" | "stress-test";
  onTabChange: (tab: "dashboard" | "scoring" | "stress-test") => void;
}

interface NavItem {
  id: "dashboard" | "scoring" | "stress-test";
  title: string;
  sub: string;
  icon: React.ElementType;
  badge?: string;
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview & Analytics",
    items: [
      {
        id: "dashboard",
        title: "Dashboard & OLAP",
        sub: "KPI Eksekutif & Kubus Data",
        icon: LayoutDashboard,
        badge: "19 Cabang",
      },
      {
        id: "stress-test",
        title: "Stress Testing Makro",
        sub: "Guncangan CPO & Proyeksi",
        icon: TrendingUp,
        badge: "Prophet",
      },
    ],
  },
  {
    label: "Credit Evaluation",
    items: [
      {
        id: "scoring",
        title: "Scoring Debitur",
        sub: "FICO Hibrida & SHAP",
        icon: UserCheck,
        badge: "XGBoost",
      },
    ],
  },
];

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const { isMobile, setOpenMobile } = useSidebar();

  const handleSelect = (id: "dashboard" | "scoring" | "stress-test") => {
    onTabChange(id);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-slate-200/80 dark:border-slate-800 bg-[var(--card-bg)] select-none"
    >
      {/* ── 1. HEADER (Brand & Logo) ── */}
      <SidebarHeader className="p-3 border-b border-[var(--divider)]">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-[var(--brand)] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Landmark className="size-5" />
          </div>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs tracking-tight text-[var(--text-primary)] truncate">
                Hybrid Credit DSS
              </span>
              <span className="bg-[var(--brand-subtle)] text-[var(--brand)] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[var(--brand-border)] leading-none">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] truncate font-medium mt-0.5">
              PT Bank Kalbar &bull; Enterprise
            </p>
          </div>
        </div>
      </SidebarHeader>

      {/* ── 2. CONTENT (Navigation Groups) ── */}
      <SidebarContent className="px-2 py-3 gap-3">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label} className="p-0">
            <SidebarGroupLabel className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-2 py-1 group-data-[collapsible=icon]:hidden">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.title}
                        onClick={() => handleSelect(item.id)}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs transition-all min-h-10 cursor-pointer",
                          isActive
                            ? "bg-[var(--brand)] text-white font-medium shadow-2xs hover:bg-[var(--brand-hover)] hover:text-white"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/80"
                        )}
                      >
                        <Icon
                          className={cn(
                            "size-4 shrink-0 transition-colors",
                            isActive ? "text-white" : "text-[var(--brand)]"
                          )}
                        />
                        <div className="flex-1 min-w-0 flex flex-col text-left group-data-[collapsible=icon]:hidden">
                          <span className="font-semibold text-xs truncate leading-snug">
                            {item.title}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] truncate leading-tight",
                              isActive
                                ? "text-slate-200"
                                : "text-[var(--text-muted)]"
                            )}
                          >
                            {item.sub}
                          </span>
                        </div>
                        {item.badge && (
                          <span
                            className={cn(
                              "group-data-[collapsible=icon]:hidden shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded leading-none tabular-nums",
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-[var(--surface-subtle)] text-[var(--text-muted)] border border-[var(--divider)]"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* System Model Info Box (Expanded view) */}
        <div className="mt-auto px-1 group-data-[collapsible=icon]:hidden">
          <div className="p-2.5 rounded-lg bg-[var(--surface-subtle)] border border-[var(--divider)] flex flex-col gap-1.5 text-[10px]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[var(--text-primary)] flex items-center gap-1">
                <ShieldCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
                CRISP-DM Standard
              </span>
              <span className="text-[9px] text-emerald-800 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-200/80 dark:border-emerald-500/20">
                Online
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] leading-tight">
              XGBoost Classifier + SHAP TreeExplainer + Prophet Time-Series
            </p>
          </div>
        </div>
      </SidebarContent>

      {/* ── 3. FOOTER (Active User Profile & Theme Toggle) ── */}
      <SidebarFooter className="p-3 border-t border-[var(--divider)]">
        <div className="flex items-center justify-between gap-2 p-1 rounded-lg">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] border border-[var(--brand-border)] flex items-center justify-center text-xs font-bold shrink-0">
              BK
            </div>
            <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="text-xs font-bold text-[var(--text-primary)] truncate leading-tight">
                Analis Kredit Senior
              </span>
              <span className="text-[10px] text-[var(--text-muted)] truncate flex items-center gap-1 leading-tight mt-0.5">
                <span className="size-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
                Divisi Manajemen Risiko
              </span>
            </div>
          </div>
          <ThemeToggle className="size-8 group-data-[collapsible=icon]:hidden shrink-0" />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;

