"use client";

import React from "react";
import { Sliders, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { StressTestRequestPayload } from "@/types";
import { cn } from "@/lib/utils";

interface ScenarioControlsProps {
  params: StressTestRequestPayload;
  onChange: (params: StressTestRequestPayload) => void;
  onSimulate: () => void;
  loading: boolean;
}

const SCENARIOS = [
  { id: "Boom",     label: "Boom",     icon: TrendingUp,   colorActive: "text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/30" },
  { id: "Baseline", label: "Baseline", icon: Minus,         colorActive: "text-[var(--brand)] bg-[var(--brand-subtle)] border-[var(--brand-border)]" },
  { id: "Crisis",   label: "Crisis",   icon: TrendingDown, colorActive: "text-rose-700 dark:text-rose-300 bg-rose-500/10 border-rose-500/30" },
] as const;

export default function ScenarioControls({
  params,
  onChange,
  onSimulate,
  loading,
}: ScenarioControlsProps) {
  const handleScenarioSelect = (scen: string) => {
    let shock = 0.0;
    if (scen === "Boom")   shock = 25.0;
    if (scen === "Crisis") shock = -30.0;
    onChange({ skenario: scen, cpo_price_shock_pct: shock });
  };

  const shockPct = params.cpo_price_shock_pct;
  const shockColor =
    shockPct > 0
      ? "text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20"
      : shockPct < 0
      ? "text-rose-700 dark:text-rose-300 bg-rose-500/10 border-rose-500/20"
      : "text-[var(--text-muted)] bg-[var(--surface-subtle)] border-[var(--divider)]";

  return (
    <div className="card rounded-lg p-4 space-y-4">

      {/* Header */}
      <div className="border-b border-[var(--divider)] pb-2.5">
        <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
          <Sliders className="size-4 text-[var(--brand)]" />
          Parameter Skenario Makro
        </h3>
        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
          Guncangan harga CPO dunia terhadap rasio NPL
        </p>
      </div>

      {/* Scenario picker */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block">
          Kondisi Makroekonomi
        </label>
        <div className="grid grid-cols-3 gap-2">
          {SCENARIOS.map(({ id, label, icon: Icon, colorActive }) => {
            const isActive = params.skenario === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleScenarioSelect(id)}
                className={cn(
                  "py-2 px-3 text-xs font-semibold rounded border transition flex flex-col items-center gap-1",
                  isActive
                    ? colorActive
                    : "text-[var(--text-muted)] bg-[var(--surface-subtle)] border-[var(--divider)] hover:text-[var(--text-primary)] hover:border-[var(--brand-border)]"
                )}
              >
                <Icon className="size-3.5" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CPO shock slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
            Guncangan CPO
          </label>
          <span className={cn(
            "text-[11px] font-bold tabular-nums px-2 py-0.5 rounded border",
            shockColor
          )}>
            {shockPct > 0 ? "+" : ""}{shockPct}%
          </span>
        </div>
        <input
          type="range"
          min="-50"
          max="50"
          step="5"
          value={shockPct}
          onChange={(e) =>
            onChange({ ...params, cpo_price_shock_pct: parseFloat(e.target.value) })
          }
          className="w-full cursor-pointer accent-[#1E407A]"
        />
        <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-medium">
          <span>-50% Krisis</span>
          <span>0% Normal</span>
          <span>+50% Boom</span>
        </div>
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={onSimulate}
        disabled={loading}
        className="w-full btn-primary py-2.5 px-4 rounded-md flex items-center justify-center gap-2 text-xs font-semibold"
      >
        <TrendingUp className="size-4" />
        {loading ? "Menjalankan Simulasi..." : "Jalankan Stress Test"}
      </button>
    </div>
  );
}
