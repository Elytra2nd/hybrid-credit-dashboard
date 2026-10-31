"use client";

import React from "react";
import { Building2, MapPin } from "lucide-react";
import { BranchDistributionItem } from "@/types";
import { formatNumber, formatPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface BranchTableProps {
  branches: BranchDistributionItem[];
}

const maxPorsi = 9.57;

function rankClass(idx: number) {
  if (idx === 0) return "rank-gold";
  if (idx === 1) return "rank-silver";
  if (idx === 2) return "rank-bronze";
  return "bg-slate-400 dark:bg-slate-600";
}

export default function BranchTable({ branches }: BranchTableProps) {
  return (
    <div className="card rounded-lg p-4 space-y-3 animate-fade-up" style={{ animationDelay: "200ms" }}>

      {/* Header */}
      <div className="flex items-start justify-between border-b border-[var(--divider)] pb-2.5">
        <div>
          <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <Building2 className="size-4 text-[var(--brand)]" />
            Sebaran Portofolio 19 Kantor Cabang
          </h3>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
            Konsentrasi penyaluran kredit daerah di Kalimantan Barat
          </p>
        </div>
        <span className="text-[10px] font-semibold text-[var(--brand)] bg-[var(--brand-subtle)] border border-[var(--brand-border)] px-2 py-0.5 rounded whitespace-nowrap">
          Top {branches.length} Cabang
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[280px] overflow-y-auto">
        <table className="w-full text-left text-xs text-[var(--text-secondary)]">
          <thead className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--divider)] sticky top-0 bg-[var(--card-bg)] z-10">
            <tr>
              <th className="py-2 px-2 w-8">#</th>
              <th className="py-2 px-2">Kantor Cabang</th>
              <th className="py-2 px-2 text-right">Debitur</th>
              <th className="py-2 px-2 text-right">Porsi</th>
              <th className="py-2 px-2 w-1/3">Distribusi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--divider)]">
            {branches.map((branch, idx) => (
              <tr
                key={idx}
                className="group hover:bg-[var(--surface-subtle)] transition-colors"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                {/* Rank badge */}
                <td className="py-2.5 px-2">
                  <span
                    className={cn(
                      "inline-flex items-center justify-center size-5 rounded text-[10px] font-black text-white",
                      rankClass(idx)
                    )}
                  >
                    {idx + 1}
                  </span>
                </td>

                {/* Branch name */}
                <td className="py-2.5 px-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-3 text-[var(--text-muted)] shrink-0 group-hover:text-[var(--brand)] transition-colors" />
                    <span className="font-semibold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors text-[11px]">
                      {branch.nama_cabang}
                    </span>
                  </div>
                </td>

                {/* Debitur */}
                <td className="py-2.5 px-2 text-right text-[var(--text-muted)] font-medium tabular-nums">
                  {formatNumber(branch.total_debitur, 0)}
                </td>

                {/* Porsi % */}
                <td className="py-2.5 px-2 text-right font-bold text-[var(--brand)] tabular-nums">
                  {formatPercent(branch.persentase_portofolio, 2)}
                </td>

                {/* Progress bar */}
                <td className="py-2.5 px-2">
                  <div className="w-full bg-[var(--surface-subtle)] h-1.5 rounded-full overflow-hidden border border-[var(--divider)]">
                    <div
                      className="bg-[var(--brand)] h-full rounded-full animate-fill-bar"
                      style={{
                        width: `${(branch.persentase_portofolio / maxPorsi) * 100}%`,
                        animationDelay: `${idx * 60 + 200}ms`,
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
