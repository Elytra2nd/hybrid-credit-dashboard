"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { FeatureContribution } from "@/types";
import { useTheme } from "@/context/ThemeContext";

interface ShapChartProps {
  contributions: FeatureContribution[];
}

export default function ShapChart({ contributions }: ShapChartProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div className="glass-card rounded-2xl p-5 space-y-3">
      <div className="border-b border-white/5 pb-2">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          Faktor Penentu Keputusan
        </h3>
        <p className="text-xs text-slate-400">
          Variabel yang paling memengaruhi hasil penilaian kredit nasabah ini
        </p>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={contributions} margin={{ top: 10, right: 30, left: 70, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#E2E8F0" : "#1E293B"} horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: "#64748B" }}
              axisLine={{ stroke: isLight ? "#CBD5E1" : "#1E293B" }}
              tickFormatter={() => ""}
            />
            <YAxis
              type="category"
              dataKey="feature_label"
              tick={{ fontSize: 10, fill: isLight ? "#334155" : "#94A3B8" }}
              width={140}
              axisLine={{ stroke: isLight ? "#CBD5E1" : "#1E293B" }}
            />
            <Tooltip
              formatter={(val) => [val, "Besar Pengaruh"]}
              contentStyle={{
                backgroundColor: isLight ? "#FFFFFF" : "#0F172A",
                borderColor: isLight ? "#E2E8F0" : "#334155",
                borderRadius: "12px",
                color: isLight ? "#0F172A" : "#F8FAFC",
                fontSize: "12px",
                boxShadow: isLight ? "0 10px 25px rgba(0,0,0,0.08)" : "0 10px 30px rgba(0,0,0,0.5)",
              }}
            />
            <ReferenceLine x={0} stroke={isLight ? "#94A3B8" : "#475569"} strokeWidth={1.5} />
            <Bar dataKey="contribution_value" radius={[0, 4, 4, 0]}>
              {contributions.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.contribution_value > 0 ? "#F43F5E" : "#10B981"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-6 text-[11px] pt-1 text-slate-400 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm inline-block" />
          <span>Menurunkan Risiko (Mendukung Persetujuan)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm inline-block" />
          <span>Meningkatkan Risiko (Perlu Perhatian)</span>
        </div>
      </div>
    </div>
  );
}
