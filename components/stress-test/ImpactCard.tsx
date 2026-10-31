"use client";

import React from "react";
import { StressTestResult } from "@/types";
import { formatPercent, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ImpactCardProps {
  result: StressTestResult;
}

export default function ImpactCard({ result }: ImpactCardProps) {
  const nplSafe  = result.proyeksi_npl_simulasi_persen < 5.0;
  const adjPos   = result.faktor_penyesuaian_skor_poin >= 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* Proyeksi NPL */}
        <div className="card rounded-lg p-4 text-center">
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Proyeksi NPL</p>
          <h4 className={cn(
            "text-2xl font-extrabold mt-1 tabular-nums",
            nplSafe ? "text-[var(--text-primary)]" : "text-rose-600 dark:text-rose-400"
          )}>
            {formatPercent(result.proyeksi_npl_simulasi_persen, 2)}
          </h4>
          <p className={cn(
            "text-[10px] font-semibold mt-1",
            nplSafe ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          )}>
            {nplSafe ? "Di Bawah Batas OJK 5,00%" : "Melampaui Batas OJK!"}
          </p>
        </div>

        {/* Faktor Koreksi */}
        <div className="card rounded-lg p-4 text-center">
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Koreksi Skor</p>
          <h4 className={cn(
            "text-2xl font-extrabold mt-1 tabular-nums",
            adjPos ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          )}>
            {adjPos ? "+" : ""}{formatNumber(result.faktor_penyesuaian_skor_poin, 2)} poin
          </h4>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">Pergeseran Kurva FICO</p>
        </div>

        {/* Debitur Layak */}
        <div className="card rounded-lg p-4 text-center">
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Debitur Layak</p>
          <h4 className="text-2xl font-extrabold text-[var(--text-primary)] mt-1 tabular-nums">
            {formatPercent(result.persentase_nasabah_layak, 1)}
          </h4>
          <p className="text-[10px] text-[var(--text-muted)] mt-1 tabular-nums">
            Ditolak: {formatPercent(result.persentase_nasabah_ditolak, 1)}
          </p>
        </div>
      </div>

      {/* Narrative */}
      <div className="card rounded-lg p-4 text-xs text-[var(--text-secondary)] leading-relaxed border-l-2 border-[var(--brand)]">
        <span className="font-bold text-[var(--brand)]">Dampak Portofolio: </span>
        {result.analisis_dampak_portofolio}
      </div>
    </div>
  );
}
