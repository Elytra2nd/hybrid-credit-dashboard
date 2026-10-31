"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { useTheme } from "@/context/ThemeContext";

interface NplProjectionLineProps {
  timeSeries: Array<{
    bulan: string;
    baseline_npl: number;
    simulasi_npl: number;
    batas_ojk: number;
  }>;
  scenarioName: string;
}

export default function NplProjectionLine({
  timeSeries,
  scenarioName,
}: NplProjectionLineProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const simColor = isLight ? "#1E407A" : "#5A82CC";
  const baseColor = isLight ? "#64748B" : "#94A3B8";

  return (
    <div className="card rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="border-b border-[var(--divider)] pb-3">
        <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
          <TrendingUp className="size-4 text-[var(--brand)]" />
          Proyeksi Runtun Waktu NPL (Facebook Prophet 2025 – 2026)
        </h3>
        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
          Perbandingan kurva proyeksi terhadap baseline dan batas toleransi OJK (5,00%)
        </p>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={timeSeries}
            margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isLight ? "#E2E8F0" : "#1E293B"}
            />
            <XAxis
              dataKey="bulan"
              tick={{ fontSize: 10, fill: isLight ? "#64748B" : "#94A3B8" }}
              tickLine={false}
              axisLine={{ stroke: isLight ? "#CBD5E1" : "#1E293B" }}
            />
            <YAxis
              domain={[0, 6]}
              unit="%"
              tick={{ fontSize: 10, fill: isLight ? "#64748B" : "#94A3B8" }}
              tickLine={false}
              axisLine={{ stroke: isLight ? "#CBD5E1" : "#1E293B" }}
              tickFormatter={(v) => `${v}%`}
              className="tabular-nums"
            />
            <Tooltip
              formatter={(val, name) => [`${val}%`, name]}
              contentStyle={{
                backgroundColor: isLight ? "#FFFFFF" : "#0F172A",
                borderColor: isLight ? "#E2E8F0" : "#1E293B",
                borderRadius: "8px",
                color: isLight ? "#0F172A" : "#F8FAFC",
                fontSize: "11px",
                boxShadow: isLight ? "0 4px 12px rgba(0,0,0,0.06)" : undefined,
              }}
            />
            <Legend
              wrapperStyle={{
                fontSize: "11px",
                paddingTop: "8px",
                color: isLight ? "#475569" : "#94A3B8",
              }}
            />
            <ReferenceLine
              y={5.0}
              stroke="#F43F5E"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: "Batas OJK 5,00%",
                fill: "#F43F5E",
                fontSize: 10,
                position: "top",
                className: "tabular-nums",
              }}
            />
            <Line
              type="monotone"
              dataKey="baseline_npl"
              name="Baseline NPL (1,93%)"
              stroke={baseColor}
              strokeWidth={1.75}
              strokeDasharray="3 3"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="simulasi_npl"
              name={`Simulasi Skenario ${scenarioName}`}
              stroke={simColor}
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: simColor, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: simColor }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
