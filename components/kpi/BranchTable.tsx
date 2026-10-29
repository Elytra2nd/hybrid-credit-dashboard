"use client";

import React from "react";
import { Building2, MapPin } from "lucide-react";
import { BranchDistributionItem } from "@/types";
import { formatNumber, formatPercent } from "@/lib/utils";

interface BranchTableProps {
  branches: BranchDistributionItem[];
}

const maxPorsi = 9.57; // max portofolio pct for relative bar scaling

function rankClass(idx: number) {
  if (idx === 0) return "rank-gold";
  if (idx === 1) return "rank-silver";
  if (idx === 2) return "rank-bronze";
  return "bg-slate-700";
}

export default function BranchTable({ branches }: BranchTableProps) {
  return (
    <div className="glass-card-deep rounded-2xl p-5 space-y-4 animate-fade-up" style={{ animationDelay: "200ms" }}>
      {/* Header */}
      <div className="flex items-start justify-between border-b border-white/5 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            Sebaran Portofolio 19 Kantor Cabang Bank Kalbar
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Konsentrasi penyaluran kredit daerah di Kalimantan Barat
          </p>
        </div>
        <span className="text-[10px] font-bold text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-xl whitespace-nowrap">
          Top {branches.length} Cabang
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[280px] overflow-y-auto pr-1">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="text-[10px] uppercase font-bold text-slate-500 border-b border-white/5 sticky top-0 bg-[var(--surface-box)] z-10">
            <tr>
              <th className="py-2.5 px-3 w-8">#</th>
              <th className="py-2.5 px-3">Nama Kantor Cabang</th>
              <th className="py-2.5 px-3 text-right">Debitur</th>
              <th className="py-2.5 px-3 text-right">Porsi</th>
              <th className="py-2.5 px-3 w-1/3">Distribusi</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((branch, idx) => (
              <tr
                key={idx}
                className="group hover:bg-white/[0.03] transition-colors border-b border-white/[0.03] last:border-0"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                {/* Rank badge */}
                <td className="py-3 px-3">
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-black text-white ${rankClass(idx)}`}
                  >
                    {idx + 1}
                  </span>
                </td>

                {/* Branch name */}
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0 group-hover:text-blue-400 transition-colors" />
                    <span className="font-semibold text-slate-200 group-hover:text-white transition-colors text-[11px]">
                      {branch.nama_cabang}
                    </span>
                  </div>
                </td>

                {/* Debitur count */}
                <td className="py-3 px-3 text-right text-slate-400 font-medium tabular-nums">
                  {formatNumber(branch.total_debitur, 0)}
                </td>

                {/* Porsi % */}
                <td className="py-3 px-3 text-right font-bold text-cyan-400 tabular-nums">
                  {formatPercent(branch.persentase_portofolio, 2)}
                </td>

                {/* Animated progress bar */}
                <td className="py-3 px-3">
                  <div className="w-full bg-slate-800/60 h-1.5 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full animate-fill-bar"
                      style={{
                        width: `${(branch.persentase_portofolio / maxPorsi) * 100}%`,
                        animationDelay: `${idx * 60 + 300}ms`,
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
