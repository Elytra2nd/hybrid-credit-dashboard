"use client";

import React from "react";
import { StressTestResult } from "@/types";
import { formatPercent, formatNumber } from "@/lib/utils";

interface ImpactCardProps {
  result: StressTestResult;
}

export default function ImpactCard({ result }: ImpactCardProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Proyeksi NPL</p>
          <h4 className="text-2xl font-black text-white mt-1">
            {formatPercent(result.proyeksi_npl_simulasi_persen, 2)}
          </h4>
          <p className={`text-[10px] font-bold mt-1 ${
            result.proyeksi_npl_simulasi_persen < 5.0 ? "text-emerald-400" : "text-rose-400"
          }`}>
            {result.proyeksi_npl_simulasi_persen < 5.0 ? "Di Bawah Batas OJK 5,00%" : "Melampaui Batas OJK!"}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Faktor Koreksi</p>
          <h4 className={`text-2xl font-black mt-1 ${
            result.faktor_penyesuaian_skor_poin >= 0 ? "text-emerald-400" : "text-rose-400"
          }`}>
            {result.faktor_penyesuaian_skor_poin >= 0
              ? `+${formatNumber(result.faktor_penyesuaian_skor_poin, 2)}`
              : formatNumber(result.faktor_penyesuaian_skor_poin, 2)}{" "}
            Poin
          </h4>
          <p className="text-[10px] text-slate-500 mt-1">Pergeseran Kurva FICO</p>
        </div>

        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Debitur Layak</p>
          <h4 className="text-2xl font-black text-white mt-1">
            {formatPercent(result.persentase_nasabah_layak, 1)}
          </h4>
          <p className="text-[10px] text-slate-400 mt-1">
            Ditolak: {formatPercent(result.persentase_nasabah_ditolak, 1)}
          </p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4 text-xs text-slate-300 leading-relaxed border-l-4 border-blue-500">
        <span className="font-bold text-white">Dampak Portofolio: </span>
        {result.analisis_dampak_portofolio}
      </div>
    </div>
  );
}
