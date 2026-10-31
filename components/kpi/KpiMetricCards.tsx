"use client";

import React from "react";
import { Wallet, AlertTriangle, UserX, PiggyBank } from "lucide-react";
import { KpiSummaryData } from "@/types";
import { formatNumber, formatPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";

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
  delay: string;
}

function MetricCard({ label, value, footer, icon, delay }: MetricCardProps) {
  return (
    <div
      className="card rounded-lg p-4 flex flex-col gap-2 min-h-[88px] animate-fade-up"
      style={{ animationDelay: delay }}
    >
      {/* Label + icon row */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest truncate">
          {label}
        </p>
        <div className="text-[var(--brand)] shrink-0">
          {icon}
        </div>
      </div>

      {/* Main value */}
      <h3 className="text-xl font-extrabold text-[var(--text-primary)] leading-tight tracking-tight tabular-nums">
        {value}
      </h3>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--divider)] text-[10px]">
        <span className={cn("font-semibold px-1.5 py-0.5 rounded border whitespace-nowrap leading-tight tabular-nums", footer.badgeClass)}>
          {footer.badge}
        </span>
        <span className="text-[var(--text-muted)] text-right truncate">{footer.sub}</span>
      </div>
    </div>
  );
}

export default function KpiMetricCards({ data, dynamicMetrics }: KpiMetricCardsProps) {
  const isFiltered = dynamicMetrics?.isFiltered ?? false;

  const totalVol = dynamicMetrics?.totalVolumeTriliun ?? data.total_penyaluran_kredit_triliun;
  const nplVal   = dynamicMetrics?.avgNplPercent ?? data.rasio_npl_gross_persen;
  const debiturVal = dynamicMetrics?.totalDebiturCount ?? data.total_nasabah_aktif;
  const ckpnVal  = dynamicMetrics?.ckpnMiliar ?? data.estimasi_ckpn_miliar;

  const cards: MetricCardProps[] = [
    {
      label: "Total Penyaluran",
      value: `Rp ${formatNumber(totalVol, 2)} T`,
      icon: <Wallet className="size-4" />,
      delay: "0ms",
      footer: {
        badge: isFiltered
          ? dynamicMetrics?.sliceLabel || "Tersaring"
          : `+${formatPercent(data.pertumbuhan_yoy_persen, 1)} YoY`,
        badgeClass: isFiltered
          ? "bg-[var(--brand-subtle)] text-[var(--brand)] border-[var(--brand-border)]"
          : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
        sub: `${formatNumber(debiturVal, 0)} Nasabah`,
      },
    },
    {
      label: "Rasio NPL Gross",
      value: formatPercent(nplVal, 2),
      icon: <AlertTriangle className="size-4" />,
      delay: "60ms",
      footer: {
        badge: nplVal < 5.0 ? "Aman · OJK < 5%" : "Waspada",
        badgeClass: nplVal < 5.0
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
          : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
        sub: "Toleransi 5,0%",
      },
    },
    {
      label: "Tingkat Penolakan",
      value: formatPercent(data.rasio_penolakan_persen, 2),
      icon: <UserX className="size-4" />,
      delay: "120ms",
      footer: {
        badge: "Youden J = 0,463",
        badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
        sub: "Protektif",
      },
    },
    {
      label: "Estimasi CKPN",
      value: `Rp ${formatNumber(ckpnVal, 1)} M`,
      icon: <PiggyBank className="size-4" />,
      delay: "180ms",
      footer: {
        badge: "PSAK 71",
        badgeClass: "bg-[var(--brand-subtle)] text-[var(--brand)] border-[var(--brand-border)]",
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
