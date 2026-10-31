"use client";

import React from "react";
import { formatPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface FicoGaugeProps {
  score: number;
  probDefault: number;
  youdenThreshold: number;
}

export default function FicoGauge({ score, probDefault, youdenThreshold }: FicoGaugeProps) {
  const pct = Math.max(0, Math.min(100, ((score - 300) / 550) * 100));

  const scoreColor =
    score >= 700
      ? "text-emerald-600 dark:text-emerald-400"
      : score >= 580
      ? "text-amber-600 dark:text-amber-400"
      : "text-rose-600 dark:text-rose-400";

  const barColor =
    score >= 700
      ? "bg-emerald-500"
      : score >= 580
      ? "bg-amber-500"
      : "bg-rose-500";

  return (
    <div className="grid grid-cols-3 gap-3">

      {/* FICO Score */}
      <div className="glass-panel-subtle p-3 rounded-lg text-center flex flex-col items-center justify-center gap-1">
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Nilai Kredit</p>
        <p className={cn("text-3xl font-black tabular-nums leading-none", scoreColor)}>{score}</p>
        <p className="text-[10px] text-[var(--text-muted)]">300 – 850</p>
      </div>

      {/* PD */}
      <div className="glass-panel-subtle p-3 rounded-lg text-center flex flex-col items-center justify-center gap-1">
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Prob. Default</p>
        <p className={cn(
          "text-2xl font-black tabular-nums leading-none",
          probDefault < youdenThreshold ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
        )}>
          {formatPercent(probDefault * 100, 2)}
        </p>
        <p className="text-[10px] text-[var(--text-muted)]">
          Threshold: {formatPercent(youdenThreshold * 100, 1)}
        </p>
      </div>

      {/* Bar gauge */}
      <div className="glass-panel-subtle p-3 rounded-lg flex flex-col justify-center gap-2">
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest text-center">Kelayakan</p>
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
          <div
            className={cn("h-full rounded-full transition-all duration-700", barColor)}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-[var(--text-muted)] font-semibold tabular-nums">
          <span>Buruk</span>
          <span>Sedang</span>
          <span>Prima</span>
        </div>
      </div>

    </div>
  );
}
