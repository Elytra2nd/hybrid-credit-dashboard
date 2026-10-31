"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
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
    <div
      className="min-h-screen flex flex-col font-sans"
      style={{ backgroundColor: "var(--bg-main)", color: "var(--text-primary)" }}
    >
      {/* Top navbar: dark navy */}
      <Navbar />

      {/* Main layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* Sidebar (3 cols) */}
          <div className="lg:col-span-3">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Main content (9 cols) */}
          <main className="lg:col-span-9 flex flex-col gap-4">
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
        </div>
      </div>

      {/* Footer */}
      <footer
        className="py-4 text-center text-[11px] border-t"
        style={{
          color: "var(--text-muted)",
          borderColor: "var(--divider)",
        }}
      >
        &copy; 2026 PT Bina Area Persada &bull; Bank Kalbar &bull; Kerangka Kerja CRISP-DM Machine Learning &amp; OLAP
      </footer>
    </div>
  );
}
