"use client";

import React, { useState } from "react";
import { StressTestRequestPayload, StressTestResult } from "@/types";
import { runStressTestSimulation } from "@/lib/api";
import ScenarioControls from "./ScenarioControls";
import NplProjectionLine from "./NplProjectionLine";
import ImpactCard from "./ImpactCard";
import { FlaskConical } from "lucide-react";

export default function StressTestModule() {
  const [params, setParams] = useState<StressTestRequestPayload>({
    skenario: "Crisis",
    cpo_price_shock_pct: -30.0,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<StressTestResult | null>({
    skenario: "Crisis",
    cpo_price_shock_pct: -30.0,
    proyeksi_npl_simulasi_persen: 3.50,
    deviasi_terhadap_baseline_persen: 81.35,
    faktor_penyesuaian_skor_poin: -28.47,
    persentase_nasabah_layak: 66.50,
    persentase_nasabah_ditinjau: 20.10,
    persentase_nasabah_ditolak: 13.40,
    analisis_dampak_portofolio:
      "Pada Skenario Crisis / Tekanan makro, lonjakan NPL hingga 3,50% memicu pengetatan otomatis skor kredit (-28,47 poin), menaikkan porsi penolakan protektif ke 13,40% guna memitigasi kerugian kredit.",
    runtun_waktu_proyeksi: [
      { bulan: "2025-01", baseline_npl: 1.93, simulasi_npl: 3.50, batas_ojk: 5.0 },
      { bulan: "2025-04", baseline_npl: 2.05, simulasi_npl: 3.62, batas_ojk: 5.0 },
      { bulan: "2025-07", baseline_npl: 1.98, simulasi_npl: 3.55, batas_ojk: 5.0 },
      { bulan: "2025-10", baseline_npl: 1.90, simulasi_npl: 3.47, batas_ojk: 5.0 },
      { bulan: "2026-01", baseline_npl: 1.95, simulasi_npl: 3.52, batas_ojk: 5.0 },
      { bulan: "2026-06", baseline_npl: 2.02, simulasi_npl: 3.59, batas_ojk: 5.0 },
      { bulan: "2026-12", baseline_npl: 1.93, simulasi_npl: 3.50, batas_ojk: 5.0 },
    ],
  });

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await runStressTestSimulation(params);
      setResult(res);
    } catch {
      alert("Gagal menjalankan simulasi stress test pada server FastAPI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-up">

      {/* Section header */}
      <div className="flex items-start gap-3 pb-1">
        <span className="brand-accent-bar mt-0.5" />
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
              Pengujian Tekanan Makroekonomi &amp; Proyeksi NPL
            </h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--brand)] bg-[var(--brand-subtle)] border border-[var(--brand-border)] px-1.5 py-0.5 rounded">
              <FlaskConical className="size-2.5" />
              Stress Testing
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            Simulasi dampak guncangan harga komoditas sawit (CPO) terhadap dinamika rasio NPL regional
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4">
          <ScenarioControls
            params={params}
            onChange={setParams}
            onSimulate={handleSimulate}
            loading={loading}
          />
        </div>

        <div className="space-y-4 lg:col-span-8">
          {result && (
            <>
              <ImpactCard result={result} />
              <NplProjectionLine
                timeSeries={result.runtun_waktu_proyeksi}
                scenarioName={result.skenario}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
