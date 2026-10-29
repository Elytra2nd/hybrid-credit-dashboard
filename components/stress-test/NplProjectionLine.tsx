"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
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

export default function NplProjectionLine({ timeSeries, scenarioName }: NplProjectionLineProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      <div className="border-b border-white/5 pb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          Proyeksi Runtun Waktu NPL (Facebook Prophet 2025 – 2026)
        </h3>
        <p className="text-xs text-slate-400">
          Perbandingan kurva proyeksi terhadap baseline dan batas toleransi OJK (5,00%)
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#E2E8F0" : "#1E293B"} />
            <XAxis dataKey="bulan" tick={{ fontSize: 10, fill: "#64748B" }} tickLine={false} axisLine={{ stroke: isLight ? "#CBD5E1" : "#1E293B" }} />
            <YAxis domain={[0, 6]} unit="%" tick={{ fontSize: 10, fill: "#64748B" }} tickLine={false} axisLine={{ stroke: isLight ? "#CBD5E1" : "#1E293B" }} />
            <Tooltip
              formatter={(val, name) => [`${val}%`, name]}
              contentStyle={{
                backgroundColor: isLight ? "#FFFFFF" : "#0F172A",
                borderColor: isLight ? "#E2E8F0" : "#334155",
                borderRadius: "12px",
                color: isLight ? "#0F172A" : "#F8FAFC",
                fontSize: "12px",
                boxShadow: isLight ? "0 10px 25px rgba(0,0,0,0.08)" : undefined,
              }}
            />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px", color: isLight ? "#475569" : "#94A3B8" }} />
            <ReferenceLine y={5.0} stroke="#EF4444" strokeDasharray="4 4" label={{ value: "Batas OJK 5,00%", fill: "#EF4444", fontSize: 10, position: "top" }} />
            <Line
              type="monotone"
              dataKey="baseline_npl"
              name="Baseline NPL (1,93%)"
              stroke="#64748B"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="simulasi_npl"
              name={`Simulasi Skenario ${scenarioName}`}
              stroke="#38BDF8"
              strokeWidth={3}
              dot={{ r: 4, fill: "#38BDF8" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
