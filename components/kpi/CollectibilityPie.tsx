"use client";

import React from "react";
import { PieChart as PieIcon } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "@/context/ThemeContext";

interface CollectibilityPieProps {
  distribusi: Record<string, number>;
}

const PIE_COLORS = ["#10B981", "#F59E0B", "#EF4444"];
const PIE_GLOW   = ["rgba(16,185,129,0.4)", "rgba(245,158,11,0.4)", "rgba(239,68,68,0.4)"];

const SHORT_LABELS: Record<string, string> = {
  "Kolektibilitas 1 (Lancar)":    "Lancar",
  "Kolektibilitas 2 (DPK)":        "DPK",
  "Kolektibilitas 3-5 (NPL)":      "NPL",
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
    <div className="glass-card-deep rounded-xl p-3.5 space-y-2 animate-fade-up h-full flex flex-col justify-between" style={{ animationDelay: "120ms" }}>
      {/* Header */}
      <div className="border-b border-white/5 pb-2">
        <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
          <PieIcon className="w-3.5 h-3.5 text-blue-400" />
          Komposisi Kualitas Kredit
        </h3>
        <p className="text-[10px] text-slate-400 mt-0.5">
          Distribusi kolektibilitas OJK (1 s.d. 5)
        </p>
      </div>

      {/* Pie + center stat */}
      <div className="relative flex items-center justify-center py-1">
        {/* Center label overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <p className="text-xl font-extrabold text-emerald-400 leading-none">
            {lancerPct.toFixed(1)}%
          </p>
          <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Lancar</p>
        </div>

        <ResponsiveContainer width="100%" height={155}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={46}
              outerRadius={68}
              paddingAngle={4}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                  style={isLight ? undefined : { filter: `drop-shadow(0 0 6px ${PIE_GLOW[index % PIE_GLOW.length]})` }}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(val, name) => [`${val}%`, name]}
              contentStyle={{
                backgroundColor: isLight ? "#FFFFFF" : "#0F172A",
                borderColor: isLight ? "#E2E8F0" : "#334155",
                borderRadius: "10px",
                color: isLight ? "#0F172A" : "#F8FAFC",
                fontSize: "11px",
                padding: "6px 10px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend with colored dots */}
      <div className="space-y-1 pt-1 border-t border-white/[0.04]">
        {pieData.map((entry, idx) => (
          <div key={entry.name} className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: PIE_COLORS[idx], boxShadow: isLight ? "none" : `0 0 4px ${PIE_GLOW[idx]}` }}
              />
              <span className="text-slate-400 text-[10px]">{entry.fullName.split("(")[0].trim()}</span>
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
