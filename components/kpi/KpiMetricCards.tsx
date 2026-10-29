"use client";

import React from "react";
import { Wallet, AlertTriangle, UserX, PiggyBank } from "lucide-react";
import { KpiSummaryData } from "@/types";
import { formatNumber, formatPercent } from "@/lib/utils";

export interface DynamicKpiMetrics {
  totalVolumeTriliun?: number;
  avgNplPercent?: number;
  totalDebiturCount?: number;
  ckpnMiliar?: number;
  sliceLabel?: string;
  isFiltered?: boolean;
}

interface KpiMetricCardsProps {
  data: KpiSummaryData;
  dynamicMetrics?: DynamicKpiMetrics;
}

interface MetricCardProps {
  label: string;
  value: string;
  footer: { badge: string; badgeClass: string; sub: string };
  icon: React.ReactNode;
  iconBg: string;
  accentColor: string;
  delay: string;
}

function MetricCard({ label, value, footer, icon, iconBg, accentColor, delay }: MetricCardProps) {
  return (
    <div
      className="glass-card-deep rounded-xl p-3 flex flex-col justify-between gap-1.5 min-h-[82px] animate-fade-up relative overflow-hidden transition-all duration-200 hover:border-white/20"
      style={{ animationDelay: delay }}
    >
      {/* Subtle radial glow accent (Dark mode only) */}
      <div
        className="hidden dark:block absolute -top-4 -right-4 w-16 h-16 rounded-full blur-xl pointer-events-none opacity-20"
        style={{ background: accentColor }}
      />

      {/* Top row: label + icon */}
      <div className="flex items-center justify-between gap-1.5 relative z-10">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
          {label}
        </p>
        <div className={`p-1 rounded-lg border shrink-0 ${iconBg}`}>
          {icon}
        </div>
      </div>

      {/* Main value */}
      <div className="relative z-10">
        <h3 className="text-xl font-extrabold text-white leading-tight tracking-tight">
          {value}
        </h3>
      </div>

      {/* Bottom row: badge + sub */}
      <div className="flex items-center justify-between gap-2 relative z-10 text-[10px] pt-0.5 border-t border-white/[0.04]">
        <span className={`font-semibold px-1.5 py-0.2 rounded border whitespace-nowrap leading-tight ${footer.badgeClass}`}>
          {footer.badge}
        </span>
        <span className="text-slate-400 text-right truncate text-[10px]">{footer.sub}</span>
      </div>
    </div>
  );
}

export default function KpiMetricCards({ data, dynamicMetrics }: KpiMetricCardsProps) {
  const isFiltered = dynamicMetrics?.isFiltered ?? false;

  const totalVol = dynamicMetrics?.totalVolumeTriliun ?? data.total_penyaluran_kredit_triliun;
  const nplVal = dynamicMetrics?.avgNplPercent ?? data.rasio_npl_gross_persen;
  const debiturVal = dynamicMetrics?.totalDebiturCount ?? data.total_nasabah_aktif;
  const ckpnVal = dynamicMetrics?.ckpnMiliar ?? data.estimasi_ckpn_miliar;

  const cards: MetricCardProps[] = [
    {
      label: "Total Penyaluran",
      value: `Rp ${formatNumber(totalVol, 2)} T`,
      icon: <Wallet className="w-3.5 h-3.5" />,
      iconBg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      accentColor: "rgba(59,130,246,0.6)",
      delay: "0ms",
      footer: {
        badge: isFiltered ? dynamicMetrics?.sliceLabel || "Tersaring" : `+${formatPercent(data.pertumbuhan_yoy_persen, 1)} YoY`,
        badgeClass: isFiltered
          ? "bg-cyan-500/15 text-cyan-300 border-cyan-400/30"
          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        sub: `${formatNumber(debiturVal, 0)} Nasabah`,
      },
    },
    {
      label: "Rasio NPL Gross",
      value: formatPercent(nplVal, 2),
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      iconBg: nplVal <= 2.0
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        : "bg-amber-500/10 text-amber-400 border-amber-500/20",
      accentColor: nplVal <= 2.0 ? "rgba(16,185,129,0.6)" : "rgba(245,158,11,0.6)",
      delay: "60ms",
      footer: {
        badge: nplVal < 5.0 ? "Aman · OJK < 5%" : "Waspada",
        badgeClass: nplVal < 5.0
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          : "bg-rose-500/10 text-rose-400 border-rose-500/20",
        sub: "Toleransi 5,0%",
      },
    },
    {
      label: "Tingkat Penolakan",
      value: formatPercent(data.rasio_penolakan_persen, 2),
      icon: <UserX className="w-3.5 h-3.5" />,
      iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      accentColor: "rgba(245,158,11,0.6)",
      delay: "120ms",
      footer: {
        badge: "Youden J = 0,463",
        badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        sub: "Protektif",
      },
    },
    {
      label: "Estimasi CKPN",
      value: `Rp ${formatNumber(ckpnVal, 1)} M`,
      icon: <PiggyBank className="w-3.5 h-3.5" />,
      iconBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      accentColor: "rgba(99,102,241,0.6)",
      delay: "180ms",
      footer: {
        badge: "PSAK 71",
        badgeClass: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        sub: "Cadangan Kerugian",
      },
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <MetricCard key={card.label} {...card} />
      ))}
    </div>
  );
}
