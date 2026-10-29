"use client";

import React, { useState } from "react";
import { Activity, Sparkles, Filter, Calendar } from "lucide-react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { NplTimeSeriesPoint } from "@/types";
import { formatPercent } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";

interface NplTrendChartProps {
  data: NplTimeSeriesPoint[];
  currentNpl: number;
}

export default function NplTrendChart({ data, currentNpl }: NplTrendChartProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [filterRange, setFilterRange] = useState<"all" | "hist" | "proj">("all");

  // Filter dataset based on selected view
  const filteredData = data.filter((item) => {
    if (filterRange === "hist") return item.tanggal <= "2024-12";
    if (filterRange === "proj") return item.tanggal >= "2024-12";
    return true; // "all"
  });

  return (
    <div className="glass-card rounded-xl p-3.5 space-y-2.5">
      {/* Header & Range Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/5 pb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5 whitespace-nowrap">
              <Activity className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              Kurva Runtun Waktu &amp; Proyeksi NPL
            </h3>
            <span className="bg-cyan-500/15 text-cyan-300 text-[9.5px] px-1.5 py-0.2 rounded-full border border-cyan-400/25 font-semibold inline-flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Prophet · 2016–2026
            </span>
            <span className="bg-blue-500/15 text-blue-400 dark:text-blue-300 text-[9.5px] px-2 py-0.5 rounded-full border border-blue-400/25 font-semibold">
              Semua Wilayah (Kalbar)
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {filterRange === "proj"
              ? "Proyeksi forward-looking model Prophet (2025–2026)"
              : filterRange === "hist"
              ? "Data aktual historis pembukuan resmi (2016–2024)"
              : "Historis (2016–2024) + Proyeksi Prophet (2025–2026)"}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-[#0B0F19]/80 p-0.5 rounded-lg border border-white/5 text-[10px] font-semibold">
            <button
              onClick={() => setFilterRange("all")}
              className={`px-2 py-0.5 rounded transition whitespace-nowrap ${
                filterRange === "all"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterRange("hist")}
              className={`px-2 py-0.5 rounded transition whitespace-nowrap ${
                filterRange === "hist"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Historis
            </button>
            <button
              onClick={() => setFilterRange("proj")}
              className={`px-2 py-0.5 rounded transition whitespace-nowrap ${
                filterRange === "proj"
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Proyeksi
            </button>
          </div>

          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/30 whitespace-nowrap">
            {formatPercent(currentNpl, 2)}
          </span>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="w-full">
        <ResponsiveContainer width="100%" height={210}>
          <AreaChart data={filteredData} margin={{ top: 8, right: 10, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="neonNplGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="neonProjGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#E2E8F0" : "#1E293B"} vertical={false} />
            <XAxis
              dataKey="tanggal"
              tick={{ fontSize: 10, fill: isLight ? "#64748B" : "#64748B" }}
              tickLine={false}
              axisLine={{ stroke: isLight ? "#E2E8F0" : "#1E293B" }}
              interval={11} // Show 1 label per year
            />
            <YAxis
              tick={{ fontSize: 10, fill: isLight ? "#64748B" : "#64748B" }}
              domain={[0, 6]}
              unit="%"
              tickLine={false}
              axisLine={{ stroke: isLight ? "#E2E8F0" : "#1E293B" }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload as NplTimeSeriesPoint;
                  const isProj = pt.tanggal > "2024-12";
                  return (
                    <div className="p-3 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl text-xs space-y-1">
                      <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-1">
                        <span className="font-bold text-slate-900 dark:text-white">Periode: {label}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            isProj
                              ? "bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-400/30"
                              : "bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-400/30"
                          }`}
                        >
                          {isProj ? "Proyeksi Prophet" : "Data Aktual Historis"}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 flex justify-between gap-4 pt-1">
                        <span>Rasio NPL Gross:</span>
                        <span className="font-black text-blue-600 dark:text-cyan-400 text-sm">
                          {formatPercent(pt.npl_gross_persen, 2)}
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {isProj
                          ? "Model: Prophet Additive + Regressor CPO Lag-5"
                          : "Catatan Pembukuan Resmi Bank Kalbar"}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              height={26}
              wrapperStyle={{ fontSize: "10px", color: isLight ? "#475569" : "#94A3B8" }}
            />

            {/* OJK 5.00% Threshold */}
            <ReferenceLine
              y={5.0}
              stroke="#EF4444"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: "Batas OJK (5%)",
                fill: "#EF4444",
                fontSize: 9,
                position: "top",
              }}
            />

            {/* Junction Divider Line for 2024-12 */}
            {filterRange === "all" && (
              <ReferenceLine
                x="2024-12"
                stroke={isLight ? "#94A3B8" : "#64748B"}
                strokeDasharray="3 3"
                label={{
                  value: "Batas Historis ↔ Proyeksi",
                  fill: isLight ? "#475569" : "#94A3B8",
                  fontSize: 9,
                  position: "insideTopRight",
                }}
              />
            )}

            {/* 1. Historical Area (2016 - 2024) */}
            <Area
              type="monotone"
              dataKey="npl_historis"
              name="Aktual Historis (2016–2024)"
              stroke="#0284C7"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#neonNplGlow)"
              connectNulls={false}
            />

            {/* 2. Prophet Projection Curve (2025 - 2026) */}
            <Area
              type="monotone"
              dataKey="npl_proyeksi"
              name="Proyeksi Prophet (2025–2026)"
              stroke="#06B6D4"
              strokeWidth={2.5}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#neonProjGlow)"
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footnote Explanation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#0B0F19]/60 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-1 bg-[#0284C7] rounded-full inline-block" />
            <span>108 Bln Aktual</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-1 bg-[#06B6D4] border-b-2 border-dashed border-[#06B6D4] inline-block" />
            <span>24 Bln Proyeksi</span>
          </div>
        </div>
        <span className="text-slate-500 font-medium">
          MAPE: 4,85% &bull; RMSE: 0,11% (Sangat Akurat)
        </span>
      </div>
    </div>
  );
}
