"use client";

import React from "react";
import { PieChart as PieIcon } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "@/context/ThemeContext";

interface CollectibilityPieProps {
  distribusi: Record<string, number>;
}

// Semantic risk colors — distinct from brand navy
const PIE_COLORS = ["#10B981", "#F59E0B", "#F43F5E"];

const SHORT_LABELS: Record<string, string> = {
  "Kolektibilitas 1 (Lancar)": "Lancar",
  "Kolektibilitas 2 (DPK)":    "DPK",
  "Kolektibilitas 3-5 (NPL)":  "NPL",
};

export default function CollectibilityPie({ distribusi }: CollectibilityPieProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const pieData = Object.entries(distribusi).map(([name, value]) => ({
    name: SHORT_LABELS[name] ?? name,
    fullName: name,
    value,
  }));

  const lancerPct = pieData.find((d) => d.name === "Lancar")?.value ?? 0;

  return (
    <div className="card rounded-lg p-4 flex flex-col gap-3 h-full">

      {/* Header */}
      <div className="border-b border-[var(--divider)] pb-2">
        <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
          <PieIcon className="size-4 text-[var(--brand)]" />
          Komposisi Kualitas Kredit
        </h3>
        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
          Distribusi kolektibilitas OJK (1 s.d. 5)
        </p>
      </div>

      {/* Donut + center stat */}
      <div className="relative flex items-center justify-center flex-1">
        {/* Center overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">
            {lancerPct.toFixed(1)}%
          </p>
          <p className="text-[9px] text-[var(--text-muted)] font-semibold mt-0.5">Lancar</p>
        </div>

        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={44}
              outerRadius={66}
              paddingAngle={3}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              {pieData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(val, name) => [`${val}%`, name]}
              contentStyle={{
                backgroundColor: isLight ? "#FFFFFF" : "#0F172A",
                borderColor: isLight ? "#E2E8F0" : "#1E293B",
                borderRadius: "8px",
                color: isLight ? "#0F172A" : "#F1F5F9",
                fontSize: "11px",
                padding: "6px 10px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-1.5 pt-1 border-t border-[var(--divider)]">
        {pieData.map((entry, idx) => (
          <div key={entry.name} className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full shrink-0"
                style={{ backgroundColor: PIE_COLORS[idx] }}
              />
              <span className="text-[var(--text-muted)]">{entry.fullName.split("(")[0].trim()}</span>
            </div>
            <span className="font-bold tabular-nums" style={{ color: PIE_COLORS[idx] }}>
              {entry.value.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
