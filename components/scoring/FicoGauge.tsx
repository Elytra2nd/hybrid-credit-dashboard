"use client";

import React from "react";
import { formatPercent } from "@/lib/utils";

interface FicoGaugeProps {
  score: number;
  probDefault: number;
  youdenThreshold: number;
}

export default function FicoGauge({ score, probDefault, youdenThreshold }: FicoGaugeProps) {
  const pct = Math.max(0, Math.min(100, ((score - 300) / 550) * 100));

  return (
    <div className="grid grid-cols-3 gap-3 text-center">
      <div className="glass-panel-subtle p-3 rounded-xl">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nilai Kredit</p>
        <p className="text-3xl font-black text-white mt-0.5">{score}</p>
        <p className="text-[10px] text-slate-500 mt-0.5">(300 – 850, makin tinggi makin baik)</p>
      </div>

      <div className="glass-panel-subtle p-3 rounded-xl">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kemungkinan Gagal Bayar</p>
        <p className="text-2xl font-black text-cyan-400 mt-1">{formatPercent(probDefault * 100, 2)}</p>
        <p className="text-[10px] text-slate-500 mt-0.5">
          Batas Aman: {formatPercent(youdenThreshold * 100, 1)}
        </p>
      </div>

      <div className="glass-panel-subtle p-3 rounded-xl flex flex-col justify-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Indikator Kelayakan</p>
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-2 border border-white/5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              score >= 700 ? "bg-emerald-400 shadow-sm shadow-emerald-400/50" : score >= 580 ? "bg-amber-400" : "bg-rose-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-[8px] text-slate-500 mt-1 font-semibold">
          <span>Buruk</span>
          <span>Sedang</span>
          <span>Baik</span>
          <span>Prima</span>
        </div>
      </div>
    </div>
  );
}
