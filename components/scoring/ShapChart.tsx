"use client";

import React from "react";
import { BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { FeatureContribution } from "@/types";
import { useTheme } from "@/context/ThemeContext";

interface ShapChartProps {
  contributions: FeatureContribution[];
}

export default function ShapChart({ contributions }: ShapChartProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div className="card rounded-lg p-4 space-y-3">
      <div className="border-b border-[var(--divider)] pb-2">
        <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
          <BarChart3 className="size-4 text-[var(--brand)]" />
          Faktor Penentu Keputusan (SHAP)
        </h3>
        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
          Variabel yang paling memengaruhi hasil penilaian kredit nasabah ini
        </p>
      </div>

      <div className="h-56 sm:h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={contributions}
            margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isLight ? "#E2E8F0" : "#1E293B"}
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: "#64748B" }}
              axisLine={{ stroke: isLight ? "#E2E8F0" : "#1E293B" }}
              tickFormatter={() => ""}
            />
            <YAxis
              type="category"
              dataKey="feature_label"
              tick={{ fontSize: 10, fill: isLight ? "#334155" : "#94A3B8" }}
              width={115}
              axisLine={{ stroke: isLight ? "#E2E8F0" : "#1E293B" }}
            />
            <Tooltip
              formatter={(val) => [val, "Besar Pengaruh"]}
              contentStyle={{
                backgroundColor: isLight ? "#FFFFFF" : "#0F172A",
                borderColor: isLight ? "#E2E8F0" : "#1E293B",
                borderRadius: "8px",
                color: isLight ? "#0F172A" : "#F1F5F9",
                fontSize: "11px",
                padding: "6px 10px",
              }}
            />
            <ReferenceLine
              x={0}
              stroke={isLight ? "#CBD5E1" : "#334155"}
              strokeWidth={1.5}
            />
            <Bar dataKey="contribution_value" radius={[0, 4, 4, 0]}>
              {contributions.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.contribution_value > 0 ? "#F43F5E" : "#10B981"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 text-[10px] text-[var(--text-muted)] font-medium pt-1 border-t border-[var(--divider)]">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 bg-emerald-500 rounded-sm shrink-0" />
          <span>Menurunkan Risiko</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 bg-rose-500 rounded-sm shrink-0" />
          <span>Meningkatkan Risiko</span>
        </div>
      </div>
    </div>
  );
}
