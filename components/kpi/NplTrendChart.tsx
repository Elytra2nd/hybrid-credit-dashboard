"use client";

import React, { useState } from "react";
import { Activity, Sparkles } from "lucide-react";
import {
  AreaChart,
  Area,
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
import { cn } from "@/lib/utils";

interface NplTrendChartProps {
  data: NplTimeSeriesPoint[];
  currentNpl: number;
}

type FilterRange = "all" | "hist" | "proj";

export default function NplTrendChart({ data, currentNpl }: NplTrendChartProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [filterRange, setFilterRange] = useState<FilterRange>("all");

  const filteredData = data.filter((item) => {
    if (filterRange === "hist") return item.tanggal <= "2024-12";
    if (filterRange === "proj") return item.tanggal >= "2024-12";
    return true;
  });

  const gridColor  = isLight ? "#E2E8F0" : "#1E293B";
  const axisColor  = isLight ? "#64748B" : "#64748B";
  const axisStroke = isLight ? "#E2E8F0" : "#1E293B";

  const filters: { id: FilterRange; label: string }[] = [
    { id: "all", label: "Semua" },
    { id: "hist", label: "Historis" },
    { id: "proj", label: "Proyeksi" },
  ];

  return (
    <div className="card rounded-lg p-4 space-y-3">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 border-b border-[var(--divider)] pb-2.5">
        <div className="min-w-0">
          <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <Activity className="size-4 text-[var(--brand)] shrink-0" />
            Kurva Runtun Waktu &amp; Proyeksi NPL
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--brand)] bg-[var(--brand-subtle)] border border-[var(--brand-border)] px-1.5 py-0.5 rounded">
              <Sparkles className="size-2.5" />
              Prophet · 2016–2026
            </span>
            <p className="text-[10px] text-[var(--text-muted)]">
              {filterRange === "proj"
                ? "Proyeksi forward-looking model Prophet (2025–2026)"
                : filterRange === "hist"
                ? "Data aktual historis pembukuan resmi (2016–2024)"
                : "Historis (2016–2024) + Proyeksi Prophet (2025–2026)"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Filter pills */}
          <div className="flex items-center bg-[var(--surface-subtle)] p-0.5 rounded border border-[var(--divider)] text-[10px] font-semibold">
            {filters.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setFilterRange(id)}
                className={cn(
                  "px-2 py-1 rounded transition whitespace-nowrap",
                  filterRange === id
                    ? "bg-[var(--brand)] text-white shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-bold tabular-nums text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200/80 dark:border-emerald-500/20 whitespace-nowrap">
            {formatPercent(currentNpl, 2)}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-[240px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 6, right: 8, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="gradHistorical" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--chart-1)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="gradProjection" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--chart-4)" stopOpacity={0.20} />
                <stop offset="95%" stopColor="var(--chart-4)" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="tanggal"
              tick={{ fontSize: 10, fill: axisColor }}
              tickLine={false}
              axisLine={{ stroke: axisStroke }}
              minTickGap={20}
            />
            <YAxis
              tick={{ fontSize: 10, fill: axisColor }}
              domain={[0, 6]}
              unit="%"
              tickLine={false}
              axisLine={{ stroke: axisStroke }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const pt = payload[0].payload as NplTimeSeriesPoint;
                const isProj = pt.tanggal > "2024-12";
                return (
                  <div className="p-3 bg-[var(--chart-tooltip-bg)] border border-[var(--chart-tooltip-border)] rounded-lg shadow-lg text-xs space-y-1">
                    <div className="flex items-center justify-between gap-3 border-b border-[var(--divider)] pb-1">
                      <span className="font-bold text-[var(--text-primary)]">Periode: {label}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[9px] font-bold",
                        isProj
                          ? "bg-[var(--brand-subtle)] text-[var(--brand)] border border-[var(--brand-border)]"
                          : "bg-slate-100 dark:bg-slate-800 text-[var(--text-secondary)] border border-[var(--divider)]"
                      )}>
                        {isProj ? "Proyeksi Prophet" : "Data Aktual"}
                      </span>
                    </div>
                    <p className="text-[var(--text-secondary)] flex justify-between gap-4 pt-1">
                      <span>Rasio NPL Gross:</span>
                      <span className="font-black text-[var(--brand)] tabular-nums text-sm">
                        {formatPercent(pt.npl_gross_persen, 2)}
                      </span>
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {isProj
                        ? "Model: Prophet Additive + Regressor CPO Lag-5"
                        : "Catatan Pembukuan Resmi Bank Kalbar"}
                    </p>
                  </div>
                );
              }}
            />
            <Legend
              verticalAlign="top"
              height={22}
              wrapperStyle={{ fontSize: "10px", color: isLight ? "#475569" : "#94A3B8" }}
            />

            {/* OJK reference line */}
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

            {/* Historis/Proyeksi divider */}
            {filterRange === "all" && (
              <ReferenceLine
                x="2024-12"
                stroke={isLight ? "#94A3B8" : "#475569"}
                strokeDasharray="3 3"
                label={{
                  value: "Historis ↔ Proyeksi",
                  fill: isLight ? "#64748B" : "#64748B",
                  fontSize: 9,
                  position: "insideTopRight",
                }}
              />
            )}

            <Area
              type="monotone"
              dataKey="npl_historis"
              name="Aktual Historis (2016–2024)"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#gradHistorical)"
              connectNulls={false}
            />
            <Area
              type="monotone"
              dataKey="npl_proyeksi"
              name="Proyeksi Prophet (2025–2026)"
              stroke="var(--chart-4)"
              strokeWidth={2}
              strokeDasharray="5 4"
              fillOpacity={1}
              fill="url(#gradProjection)"
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footnote */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-[10px] text-[var(--text-muted)] bg-[var(--surface-subtle)] px-2.5 py-1.5 rounded border border-[var(--divider)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 rounded-full inline-block" style={{ background: "var(--chart-1)" }} />
            <span>108 Bln Aktual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 border-b-2 border-dashed inline-block" style={{ borderColor: "var(--chart-4)" }} />
            <span>24 Bln Proyeksi</span>
          </div>
        </div>
        <span className="font-medium tabular-nums">MAPE: 4,85% · RMSE: 0,11%</span>
      </div>
    </div>
  );
}
