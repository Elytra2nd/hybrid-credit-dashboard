"use client";

import React, { useState } from "react";
import { DebtorInputPayload, DebtorScoreResult } from "@/types";
import { scoreDebtor } from "@/lib/api";
import DebtorForm from "./DebtorForm";
import FicoGauge from "./FicoGauge";
import DecisionBadge from "./DecisionBadge";
import ShapChart from "./ShapChart";

export default function ScoringModule() {
  const [formData, setFormData] = useState<DebtorInputPayload>({
    usia: 56,
    gaji_bersih_aktif: 5923400,
    estimasi_gaji_pensiun: 4200000,
    plafon_diminta: 371000000,
    tenor: 224,
    dti_ratio: 0.35,
    jenis_pekerjaan: "PNS / ASN",
    top_up: false,
    jenis_produk: "Kapuas Plus (Kredit ASN)",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [scoreResult, setScoreResult] = useState<DebtorScoreResult | null>({
    probabilitas_default: 0.1818,
    skor_fico_dasar: 750.0,
    faktor_penyesuaian_makro: 0.0,
    skor_fico_hibrida: 750,
    kategori_skor: "Risiko Rendah (Prime)",
    rekomendasi_keputusan: "DISETUJUI (Sangat Layak)",
    keterangan_analisis:
      "Calon debitur memiliki profil risiko prima dengan kapasitas pembayaran memadai (DTI aman) dan terhindar dari indikasi default.",
    threshold_optimal_youden: 0.4633,
    feature_contributions: [
      { feature_name: "dti_ratio", feature_label: "Rasio Debt-to-Income (DTI)", contribution_value: 0.147, impact_direction: "decrease_risk" },
      { feature_name: "gaji_bersih_aktif", feature_label: "Gaji Bersih Aktif Bulanan", contribution_value: -0.285, impact_direction: "decrease_risk" },
      { feature_name: "usia", feature_label: "Usia Debitur", contribution_value: -0.004, impact_direction: "decrease_risk" },
      { feature_name: "plafon_diminta", feature_label: "Plafon Pinjaman", contribution_value: 0.051, impact_direction: "decrease_risk" },
      { feature_name: "tenor", feature_label: "Tenor Pinjaman (Bulan)", contribution_value: 0.017, impact_direction: "decrease_risk" },
    ],
  });

  const applyPreset = (type: "prime" | "risky") => {
    // Handled in DebtorForm
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: DebtorInputPayload = {
        ...formData,
        usia: Math.min(80, Math.max(18, Math.round(Number(formData.usia)))),
        gaji_bersih_aktif: Math.max(0, Number(formData.gaji_bersih_aktif)),
        estimasi_gaji_pensiun: Math.max(0, Number(formData.estimasi_gaji_pensiun)),
        plafon_diminta: Math.max(1000000, Number(formData.plafon_diminta)),
        tenor: Math.min(600, Math.max(1, Math.round(Number(formData.tenor)))),
        dti_ratio: Math.min(0.95, Math.max(0.01, Number(formData.dti_ratio))),
      };
      const res = await scoreDebtor(payload);
      setScoreResult(res);
    } catch {
      alert("Terjadi kesalahan saat komputasi skor pada backend FastAPI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <DebtorForm
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            loading={loading}
            onApplyPreset={applyPreset}
          />
        </div>

        <div className="space-y-4 lg:col-span-7">
          {scoreResult && (
            <>
              <div className="glass-card rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-white/5 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Hasil Penilaian</span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Kelayakan Kredit Nasabah</h3>
                  </div>
                  <DecisionBadge
                    rekomendasi={scoreResult.rekomendasi_keputusan}
                    kategori={scoreResult.kategori_skor}
                    score={scoreResult.skor_fico_hibrida}
                  />
                </div>

                <FicoGauge
                  score={scoreResult.skor_fico_hibrida}
                  probDefault={scoreResult.probabilitas_default}
                  youdenThreshold={scoreResult.threshold_optimal_youden}
                />

                <div className="p-3 bg-slate-50 dark:bg-[#0B0F19]/90 border border-slate-200 dark:border-blue-500/20 rounded-xl text-xs text-slate-800 dark:text-slate-300 leading-relaxed">
                  <span className="font-bold text-blue-600 dark:text-blue-400">Ringkasan: </span>
                  {scoreResult.keterangan_analisis}
                </div>
              </div>

              <ShapChart contributions={scoreResult.feature_contributions} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
