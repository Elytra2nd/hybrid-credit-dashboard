"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import KpiModule from "@/components/kpi/KpiModule";
import ScoringModule from "@/components/scoring/ScoringModule";
import StressTestModule from "@/components/stress-test/StressTestModule";
import { fetchKpiSummary } from "@/lib/api";
import { KpiSummaryData } from "@/types";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "scoring" | "stress-test">("dashboard");
  const [kpiData, setKpiData] = useState<KpiSummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchKpiSummary();
      setKpiData(data);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 relative overflow-hidden flex flex-col font-sans">
      {/* Ambient Radial Mesh Background Glow (Dark Mode only) */}
      <div className="hidden dark:block absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="hidden dark:block absolute top-1/3 -right-40 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="hidden dark:block absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-blue-700/10 rounded-full blur-[180px] pointer-events-none" />

      {/* 1. Header / Navbar */}
      <Navbar />

      {/* 2. Main Dashboard Window Layout (Left Sidebar + Right Content) */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Module Switcher (3 Kolom) */}
          <div className="lg:col-span-3">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Right Panel: Dynamic Main Content Area (9 Kolom) */}
          <main className="lg:col-span-9 space-y-4">
            {loading ? (
              <div className="glass-card rounded-2xl flex items-center justify-center h-80">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-400 rounded-full animate-spin" />
                  <p className="text-xs font-semibold text-slate-400">Memuat data analitis eksekutif...</p>
                </div>
              </div>
            ) : (
              <>
                {activeTab === "dashboard" && kpiData && <KpiModule data={kpiData} />}
                {activeTab === "scoring" && <ScoringModule />}
                {activeTab === "stress-test" && <StressTestModule />}
              </>
            )}
          </main>
        </div>
      </div>

      {/* 3. Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-white/5">
        <p>
          &copy; 2026 PT Bina Area Persada &bull; Bank Kalbar &bull; Kerangka Kerja CRISP-DM Machine Learning & OLAP
        </p>
      </footer>
    </div>
  );
}
