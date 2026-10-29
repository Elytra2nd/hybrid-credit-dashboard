"use client";

import React from "react";
import { Sliders, TrendingUp } from "lucide-react";
import { StressTestRequestPayload } from "@/types";

interface ScenarioControlsProps {
  params: StressTestRequestPayload;
  onChange: (params: StressTestRequestPayload) => void;
  onSimulate: () => void;
  loading: boolean;
}

export default function ScenarioControls({ params, onChange, onSimulate, loading }: ScenarioControlsProps) {
  const handleScenarioSelect = (scen: string) => {
    let shock = 0.0;
    if (scen === "Boom") shock = 25.0;
    if (scen === "Crisis") shock = -30.0;
    onChange({ skenario: scen, cpo_price_shock_pct: shock });
  };

  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
        <Sliders className="w-4 h-4 text-blue-400" />
        Parameter Skenario Makro
      </h3>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 block">Kondisi Makroekonomi:</label>
        <div className="grid grid-cols-3 gap-2">
          {["Boom", "Baseline", "Crisis"].map((scen) => (
            <button
              key={scen}
              type="button"
              onClick={() => handleScenarioSelect(scen)}
              className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                params.skenario === scen
                  ? "bg-blue-600/30 text-white border-blue-500/50 shadow-lg shadow-blue-600/20"
                  : "bg-[#0B0F19]/80 text-slate-400 border-white/5 hover:bg-white/5"
              }`}
            >
              {scen}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5 pt-2">
        <div className="flex justify-between items-center text-xs">
          <label className="font-semibold text-slate-300">Guncangan Harga CPO Dunia</label>
          <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] border ${
            params.cpo_price_shock_pct > 0
              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
              : params.cpo_price_shock_pct < 0
              ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
              : "bg-slate-800 text-slate-300 border-slate-700"
          }`}>
            {params.cpo_price_shock_pct > 0 ? `+${params.cpo_price_shock_pct}%` : `${params.cpo_price_shock_pct}%`}
          </span>
        </div>
        <input
          type="range"
          min="-50"
          max="50"
          step="5"
          value={params.cpo_price_shock_pct}
          onChange={(e) => onChange({ ...params, cpo_price_shock_pct: parseFloat(e.target.value) })}
          className="w-full accent-blue-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-medium">
          <span>-50% (Krisis Berat)</span>
          <span>0% (Normal)</span>
          <span>+50% (Booming)</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onSimulate}
        disabled={loading}
        className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 text-xs"
      >
        <TrendingUp className="w-4 h-4" />
        <span>{loading ? "Menjalankan Simulasi..." : "Jalankan Simulasi Stress Test"}</span>
      </button>
    </div>
  );
}
