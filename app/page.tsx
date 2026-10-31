"use client";

import React, { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";
import KpiModule from "@/components/kpi/KpiModule";
import ScoringModule from "@/components/scoring/ScoringModule";
import StressTestModule from "@/components/stress-test/StressTestModule";
import { fetchKpiSummary } from "@/lib/api";
import { KpiSummaryData } from "@/types";
import { Loader2 } from "lucide-react";

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
    <SidebarProvider defaultOpen={true}>
      <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <SidebarInset className="min-w-0 flex-1 overflow-x-hidden flex flex-col bg-[var(--bg-main)]">
        {/* Sticky Mobile & Desktop Topbar with Breadcrumbs */}
        <DashboardHeader activeTab={activeTab} />

        {/* Main Content Area — Responsive & Anti-Overflow */}
        <main className="min-w-0 flex-1 overflow-x-hidden p-3.5 sm:p-5 md:p-6 lg:p-8 space-y-4">
          {loading ? (
            <div className="card rounded-lg flex items-center justify-center h-72">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="size-8 text-[var(--brand)] animate-spin" />
                <p className="text-xs font-semibold text-[var(--text-muted)]">
                  Memuat data analitis eksekutif...
                </p>
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

        {/* Footer */}
        <footer className="py-4 px-6 text-center text-[11px] border-t border-[var(--divider)] text-[var(--text-muted)] mt-auto">
          &copy; 2026 PT Bina Area Persada &bull; Bank Kalbar &bull; Kerangka Kerja CRISP-DM Machine Learning &amp; OLAP
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
