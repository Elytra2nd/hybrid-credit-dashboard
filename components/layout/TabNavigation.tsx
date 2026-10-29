"use client";

import React from "react";
import { LayoutDashboard, UserCheck, TrendingUp } from "lucide-react";

interface TabNavigationProps {
  activeTab: "kpi" | "scoring" | "stress-test";
  onTabChange: (tab: "kpi" | "scoring" | "stress-test") => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    {
      id: "kpi" as const,
      label: "Modul 1: Ringkasan Eksekutif KPI & Portofolio",
      icon: LayoutDashboard,
      desc: "Metrik Portofolio, NPL Historis & Sebaran Cabang",
    },
    {
      id: "scoring" as const,
      label: "Modul 2: Simulasi Penilaian Debitur & SHAP",
      icon: UserCheck,
      desc: "Scoring Real-Time, FICO Hibrida & Explainable AI",
    },
    {
      id: "stress-test" as const,
      label: "Modul 3: Stress Testing Makro & Proyeksi NPL",
      icon: TrendingUp,
      desc: "Simulasi Guncangan CPO & Ketahanan Likuiditas",
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm sticky top-[69px] z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-2 md:space-x-4 overflow-x-auto py-2.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-left transition-all duration-150 whitespace-nowrap text-sm font-semibold border ${
                  isActive
                    ? "bg-[#0F2942] text-white border-[#0F2942] shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-300" : "text-slate-500"}`} />
                <div>
                  <div>{tab.label}</div>
                  <div className={`text-[11px] font-normal ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                    {tab.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
