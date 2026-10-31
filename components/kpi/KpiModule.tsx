"use client";

import React, { useState, useMemo } from "react";
import {
  Layers,
  Filter,
  RotateCw,
  ChevronRight,
  ChevronDown,
  Building2,
  PieChart as PieIcon,
  BarChart3,
  Sliders,
  Table as TableIcon,
  Activity,
  LayoutDashboard,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { KpiSummaryData } from "@/types";
import { formatNumber, formatPercent } from "@/lib/utils";
import { RAW_OLAP_CUBE, OlapBranchData } from "@/lib/olapData";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import KpiMetricCards, { DynamicKpiMetrics } from "./KpiMetricCards";
import NplTrendChart from "./NplTrendChart";
import CollectibilityPie from "./CollectibilityPie";

interface KpiModuleProps {
  data: KpiSummaryData;
}

type ActiveView = "overview" | "matrix" | "compare";
type PivotMode  = "kolektibilitas" | "produk" | "historis";
type HierarchyLevel = "wilayah" | "cabang";

export default function KpiModule({ data }: KpiModuleProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [hierarchyLevel, setHierarchyLevel] = useState<HierarchyLevel>("wilayah");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [sliceProduct, setSliceProduct] = useState<"all" | "kapuas" | "kuserna">("all");
  const [diceWilayah, setDiceWilayah] = useState<string>("all");
  const [pivotMode, setPivotMode] = useState<PivotMode>("kolektibilitas");
  const [activeView, setActiveView] = useState<ActiveView>("overview");

  const filteredCube = useMemo(() => {
    return RAW_OLAP_CUBE.filter((item) => {
      if (diceWilayah !== "all" && item.wilayah !== diceWilayah) return false;
      return true;
    });
  }, [diceWilayah]);

  const wilayahAggregated = useMemo(() => {
    const map = new Map<string, {
      wilayah: string; totalPenyaluranMiliar: number; totalDebitur: number; nplWeightedSum: number;
      kapuasPenyaluran: number; kapuasDebitur: number; kusernaPenyaluran: number; kusernaDebitur: number;
      kol1Weighted: number; kol2Weighted: number; kolNplWeighted: number;
      npl2020W: number; npl2021W: number; npl2022W: number; npl2023W: number; npl2024W: number;
      cabangList: OlapBranchData[];
    }>();

    filteredCube.forEach((c) => {
      if (!map.has(c.wilayah)) {
        map.set(c.wilayah, {
          wilayah: c.wilayah, totalPenyaluranMiliar: 0, totalDebitur: 0, nplWeightedSum: 0,
          kapuasPenyaluran: 0, kapuasDebitur: 0, kusernaPenyaluran: 0, kusernaDebitur: 0,
          kol1Weighted: 0, kol2Weighted: 0, kolNplWeighted: 0,
          npl2020W: 0, npl2021W: 0, npl2022W: 0, npl2023W: 0, npl2024W: 0, cabangList: [],
        });
      }
      const w = map.get(c.wilayah)!;
      w.totalPenyaluranMiliar += c.totalPenyaluranMiliar;
      w.totalDebitur += c.totalDebitur;
      w.nplWeightedSum += c.nplPercent * c.totalPenyaluranMiliar;
      w.kapuasPenyaluran += c.kapuasPlusPenyaluran;
      w.kapuasDebitur += c.kapuasPlusDebitur;
      w.kusernaPenyaluran += c.kusernaPenyaluran;
      w.kusernaDebitur += c.kusernaDebitur;
      w.kol1Weighted += c.kol1Percent * c.totalPenyaluranMiliar;
      w.kol2Weighted += c.kol2Percent * c.totalPenyaluranMiliar;
      w.kolNplWeighted += c.kolNplPercent * c.totalPenyaluranMiliar;
      w.npl2020W += c.npl2020 * c.totalPenyaluranMiliar;
      w.npl2021W += c.npl2021 * c.totalPenyaluranMiliar;
      w.npl2022W += c.npl2022 * c.totalPenyaluranMiliar;
      w.npl2023W += c.npl2023 * c.totalPenyaluranMiliar;
      w.npl2024W += c.npl2024 * c.totalPenyaluranMiliar;
      w.cabangList.push(c);
    });

    return Array.from(map.values()).map((w) => ({
      wilayah: w.wilayah,
      totalPenyaluranMiliar: w.totalPenyaluranMiliar,
      totalDebitur: w.totalDebitur,
      nplPercent: w.nplWeightedSum / w.totalPenyaluranMiliar,
      kapuasPenyaluran: w.kapuasPenyaluran,
      kapuasDebitur: w.kapuasDebitur,
      kusernaPenyaluran: w.kusernaPenyaluran,
      kusernaDebitur: w.kusernaDebitur,
      kol1Percent: w.kol1Weighted / w.totalPenyaluranMiliar,
      kol2Percent: w.kol2Weighted / w.totalPenyaluranMiliar,
      kolNplPercent: w.kolNplWeighted / w.totalPenyaluranMiliar,
      npl2020: w.npl2020W / w.totalPenyaluranMiliar,
      npl2021: w.npl2021W / w.totalPenyaluranMiliar,
      npl2022: w.npl2022W / w.totalPenyaluranMiliar,
      npl2023: w.npl2023W / w.totalPenyaluranMiliar,
      npl2024: w.npl2024W / w.totalPenyaluranMiliar,
      cabangList: w.cabangList,
    }));
  }, [filteredCube]);

  const isFiltered = sliceProduct !== "all" || diceWilayah !== "all";

  const totalVolumeTriliun = useMemo(() => {
    let sum = 0;
    filteredCube.forEach((c) => {
      if (sliceProduct === "all") sum += c.totalPenyaluranMiliar;
      else if (sliceProduct === "kapuas") sum += c.kapuasPlusPenyaluran;
      else sum += c.kusernaPenyaluran;
    });
    return sum / 1000;
  }, [filteredCube, sliceProduct]);

  const totalDebiturCount = useMemo(() => {
    let sum = 0;
    filteredCube.forEach((c) => {
      if (sliceProduct === "all") sum += c.totalDebitur;
      else if (sliceProduct === "kapuas") sum += c.kapuasPlusDebitur;
      else sum += c.kusernaDebitur;
    });
    return sum;
  }, [filteredCube, sliceProduct]);

  const avgNplPercent = useMemo(() => {
    let weightedNpl = 0; let totalVol = 0;
    filteredCube.forEach((c) => {
      const vol = sliceProduct === "all" ? c.totalPenyaluranMiliar : sliceProduct === "kapuas" ? c.kapuasPlusPenyaluran : c.kusernaPenyaluran;
      const npl = sliceProduct === "all" ? c.nplPercent : sliceProduct === "kapuas" ? c.kapuasPlusNpl : c.kusernaNpl;
      weightedNpl += npl * vol; totalVol += vol;
    });
    return totalVol > 0 ? weightedNpl / totalVol : 1.93;
  }, [filteredCube, sliceProduct]);

  const ckpnMiliar = useMemo(() => totalVolumeTriliun * 19.3, [totalVolumeTriliun]);

  const sliceLabel = useMemo(() => {
    if (sliceProduct === "kapuas") return "Kapuas Plus";
    if (sliceProduct === "kuserna") return "Kuserna";
    if (diceWilayah !== "all") return diceWilayah.split("(")[0].trim();
    return "Tersaring";
  }, [sliceProduct, diceWilayah]);

  const dynamicMetrics: DynamicKpiMetrics = { totalVolumeTriliun, avgNplPercent, totalDebiturCount, ckpnMiliar, sliceLabel, isFiltered };

  const chartData = useMemo(() => {
    return wilayahAggregated.map((w) => ({
      name: w.wilayah.replace("Wilayah ", "Wil. ").replace(/\s*\(.*\)/, ""),
      penyaluran: Number((w.totalPenyaluranMiliar / 1000).toFixed(2)),
      npl: Number(w.nplPercent.toFixed(2)),
    }));
  }, [wilayahAggregated]);

  const pieCompositionData = useMemo(() => {
    let kapuasSum = 0; let kusernaSum = 0;
    filteredCube.forEach((c) => { kapuasSum += c.kapuasPlusPenyaluran; kusernaSum += c.kusernaPenyaluran; });
    return [
      { name: "Kapuas Plus", value: Math.round(kapuasSum) },
      { name: "Kuserna",     value: Math.round(kusernaSum) },
    ];
  }, [filteredCube]);

  // Chart colors: brand navy monochromatic
  const PIE_COLORS = ["#1E407A", "#5A82CC"];

  const handleResetOlap = () => {
    setHierarchyLevel("wilayah"); setSliceProduct("all"); setDiceWilayah("all");
    setPivotMode("kolektibilitas"); setExpandedRow(null);
  };

  const gridColor  = isLight ? "#E2E8F0" : "#1E293B";
  const axisColor  = isLight ? "#64748B" : "#64748B";
  const axisStroke = isLight ? "#E2E8F0" : "#1E293B";

  // Sub-view toggle config
  const views = [
    { id: "overview" as ActiveView, label: "Tren NPL", icon: Activity },
    { id: "compare"  as ActiveView, label: "Komparasi 4 Wil.", icon: BarChart3 },
    { id: "matrix"   as ActiveView, label: "Matriks OLAP", icon: TableIcon },
  ];

  const sliceButtons = [
    { id: "all" as const, label: "Semua" },
    { id: "kapuas" as const, label: "Kapuas Plus" },
    { id: "kuserna" as const, label: "Kuserna" },
  ];

  return (
    <div className="space-y-3">

      {/* 1. Section header + Product slicer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-0.5">
        <div className="flex items-start gap-2">
          <span className="brand-accent-bar mt-0.5" />
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-1.5">
              <LayoutDashboard className="size-4 text-[var(--brand)] shrink-0" />
              Dashboard Eksekutif &amp; Analisis OLAP
            </h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/20 px-1.5 py-0.5 rounded mt-0.5">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
              Portofolio Terpadu
            </span>
          </div>
        </div>

        {/* Product slicer + Reset */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-[var(--surface-subtle)] p-0.5 rounded border border-[var(--divider)] text-[10.5px] font-semibold overflow-x-auto max-w-full">
            <span className="text-[var(--text-muted)] px-2 flex items-center gap-1 text-[10px] font-bold tracking-wider shrink-0">
              <Filter className="size-3 text-[var(--brand)]" />
              Produk:
            </span>
            {sliceButtons.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setSliceProduct(id)}
                className={cn(
                  "px-2.5 py-1 sm:py-0.5 rounded transition font-bold whitespace-nowrap min-h-8 sm:min-h-0",
                  sliceProduct === id
                    ? "bg-[var(--brand)] text-white shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={handleResetOlap}
            title="Reset seluruh filter & kubus OLAP"
            className="text-[10px] font-semibold px-2.5 py-1.5 sm:py-1 rounded bg-[var(--surface-subtle)] text-[var(--text-muted)] border border-[var(--divider)] hover:text-[var(--text-primary)] flex items-center gap-1 transition min-h-8 sm:min-h-0"
          >
            <RotateCw className="size-3 text-[var(--brand)]" />
            <span className="inline">Reset</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Metric Cards */}
      <KpiMetricCards data={data} dynamicMetrics={dynamicMetrics} />

      {/* 3. OLAP Control Ribbon */}
      <div className="card rounded-lg p-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">

        {/* Region filter (Dice) */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-[var(--surface-subtle)] px-2.5 py-1.5 rounded border border-[var(--divider)] w-full sm:w-auto min-h-10 sm:min-h-0">
            <span className="text-[var(--text-muted)] text-[11px] sm:text-[10.5px] font-semibold flex items-center gap-1 shrink-0">
              <Sliders className="size-3.5 sm:size-3 text-[var(--brand)]" />
              <span>Filter Wilayah:</span>
            </span>
            <select
              value={diceWilayah}
              onChange={(e) => setDiceWilayah(e.target.value)}
              className="h-full bg-transparent text-sm sm:text-[10.5px] text-[var(--text-primary)] font-semibold focus:outline-none cursor-pointer flex-1"
            >
              <option value="all">Semua Wilayah (Kalbar)</option>
              <option value="Wilayah I (Pontianak Raya)">Wilayah I (Pontianak Raya)</option>
              <option value="Wilayah II (Pantura)">Wilayah II (Pantura)</option>
              <option value="Wilayah III (Kapuas Raya)">Wilayah III (Kapuas Raya)</option>
              <option value="Wilayah IV (Ketapang & Selatan)">Wilayah IV (Ketapang &amp; Sel.)</option>
            </select>
          </div>
          {diceWilayah !== "all" && (
            <button
              onClick={() => setDiceWilayah("all")}
              className="text-xs sm:text-[10px] text-[var(--brand)] hover:underline font-semibold"
            >
              Reset Wilayah
            </button>
          )}
        </div>

        {/* View switcher */}
        <div className="flex items-center bg-[var(--surface-subtle)] p-0.5 rounded border border-[var(--divider)] text-[11px] sm:text-[10.5px] font-semibold overflow-x-auto w-full md:w-auto">
          {views.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={cn(
                "flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded transition whitespace-nowrap min-h-10 sm:min-h-0",
                activeView === id
                  ? "bg-[var(--brand)] text-white shadow-sm font-bold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              )}
            >
              <Icon className="size-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Dynamic Sub-Views */}

      {/* SUB-VIEW 1: Tren NPL */}
      {activeView === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-8">
            <NplTrendChart data={data.tren_historis_npl} currentNpl={avgNplPercent} />
          </div>
          <div className="lg:col-span-4">
            <CollectibilityPie distribusi={data.distribusi_kolektibilitas} />
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: Komparasi 4 Wilayah */}
      {activeView === "compare" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 animate-fade-up">

          {/* Bar Chart */}
          <div className="lg:col-span-8 card rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between border-b border-[var(--divider)] pb-2">
              <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <BarChart3 className="size-4 text-[var(--brand)]" />
                Komparasi 4 Wilayah Operasional
              </h3>
              <span className="text-[10px] text-[var(--text-muted)]">Penyaluran (Rp T) &amp; Rasio NPL (%)</span>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 6, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9.5, fill: axisColor }} axisLine={{ stroke: axisStroke }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 9.5, fill: axisColor }} unit=" T" axisLine={{ stroke: axisStroke }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9.5, fill: axisColor }} unit="%" domain={[0, 3.5]} axisLine={{ stroke: axisStroke }} />
                  <Tooltip
                    formatter={(val, name) => [
                      name === "Penyaluran" ? `Rp ${val} Triliun` : `${val}%`,
                      name === "Penyaluran" ? "Volume Penyaluran" : "Rasio NPL",
                    ]}
                    contentStyle={{
                      backgroundColor: isLight ? "#FFFFFF" : "#0F172A",
                      borderColor: isLight ? "#E2E8F0" : "#1E293B",
                      borderRadius: "8px",
                      color: isLight ? "#0F172A" : "#F1F5F9",
                      fontSize: "11px",
                      padding: "6px 10px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px", color: isLight ? "#475569" : "#94A3B8" }} height={24} />
                  <Bar yAxisId="left"  dataKey="penyaluran" name="Penyaluran" fill="#1E407A" radius={[3, 3, 0, 0]} />
                  <Bar yAxisId="right" dataKey="npl"         name="NPL (%)"   fill="#5A82CC" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut */}
          <div className="lg:col-span-4 card rounded-lg p-4 space-y-2 flex flex-col justify-between">
            <div className="border-b border-[var(--divider)] pb-2">
              <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <PieIcon className="size-4 text-[var(--brand)]" />
                Porsi Produk Kredit
              </h3>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Kapuas Plus vs Kuserna</p>
            </div>
            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieCompositionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieCompositionData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`Rp ${formatNumber(Number(val), 0)} Miliar`, "Volume"]}
                    contentStyle={{
                      backgroundColor: isLight ? "#FFFFFF" : "#0F172A",
                      borderColor: isLight ? "#E2E8F0" : "#1E293B",
                      borderRadius: "8px",
                      color: isLight ? "#0F172A" : "#F1F5F9",
                      fontSize: "11px",
                      padding: "6px 10px",
                    }}
                  />
                  <Legend verticalAlign="bottom" height={26} iconType="circle" wrapperStyle={{ fontSize: "10px", color: isLight ? "#475569" : "#94A3B8" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="p-2 rounded bg-[var(--surface-subtle)] border border-[var(--divider)] text-[10px] text-[var(--text-muted)] flex items-center justify-between">
              <span>Rasio Kapuas : Kuserna</span>
              <span className="font-bold tabular-nums text-[var(--brand)]">75% : 25%</span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: OLAP Matrix */}
      {activeView === "matrix" && (
        <div className="card rounded-lg p-4 space-y-2.5 animate-fade-up">

          {/* Matrix controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[var(--divider)] pb-2">
            <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Building2 className="size-4 text-[var(--brand)]" />
              Matriks OLAP — {hierarchyLevel === "wilayah" ? "4 Wilayah (Roll-up)" : "19 Kantor Cabang (Drill-down)"}
            </h3>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Hierarchy */}
              <div className="flex items-center bg-[var(--surface-subtle)] p-0.5 rounded border border-[var(--divider)] text-[10px] font-semibold">
                <span className="text-[var(--text-muted)] px-1.5 flex items-center gap-1">
                  <Layers className="size-2.5 text-[var(--brand)]" />
                  Level:
                </span>
                {(["wilayah", "cabang"] as HierarchyLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setHierarchyLevel(lvl)}
                    className={cn(
                      "px-2 py-0.5 rounded transition",
                      hierarchyLevel === lvl
                        ? "bg-[var(--brand)] text-white font-bold shadow-sm"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    {lvl === "wilayah" ? "4 Wilayah" : "19 Cabang"}
                  </button>
                ))}
              </div>

              {/* Pivot axis */}
              <div className="flex items-center bg-[var(--surface-subtle)] p-0.5 rounded border border-[var(--divider)] text-[10px] font-semibold">
                <span className="text-[var(--text-muted)] px-1">Pivot:</span>
                {(["kolektibilitas", "produk", "historis"] as PivotMode[]).map((pm) => (
                  <button
                    key={pm}
                    onClick={() => setPivotMode(pm)}
                    className={cn(
                      "px-2 py-0.5 rounded transition capitalize",
                      pivotMode === pm
                        ? "bg-[var(--brand)] text-white font-bold shadow-sm"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    {pm === "kolektibilitas" ? "Kolektibilitas" : pm === "produk" ? "Produk" : "Tren 5-Thn"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pivot Table */}
          <div className="w-full overflow-x-auto rounded-lg border border-[var(--divider)] max-h-[320px] overflow-y-auto">
            <table className="w-full text-left text-xs text-[var(--text-secondary)]">
              <thead className="bg-[var(--surface-subtle)] text-[10px] font-bold text-[var(--text-muted)] border-b border-[var(--divider)] sticky top-0 z-20">
                <tr>
                  <th className="py-2.5 px-3 sticky left-0 bg-[var(--surface-subtle)] z-10 whitespace-nowrap">Entitas Geografis</th>
                  <th className="py-2.5 px-3 text-right tabular-nums whitespace-nowrap">Penyaluran (Rp M)</th>
                  <th className="py-2.5 px-3 text-right tabular-nums whitespace-nowrap">Debitur</th>
                  <th className="py-2.5 px-3 text-right tabular-nums whitespace-nowrap">NPL (%)</th>
                  {pivotMode === "kolektibilitas" && (
                    <>
                      <th className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400 whitespace-nowrap">Kol 1 Lancar</th>
                      <th className="py-2.5 px-3 text-right text-amber-600 dark:text-amber-400 whitespace-nowrap">Kol 2 DPK</th>
                      <th className="py-2.5 px-3 text-right text-rose-600 dark:text-rose-400 whitespace-nowrap">Kol 3-5 NPL</th>
                    </>
                  )}
                  {pivotMode === "produk" && (
                    <>
                      <th className="py-2.5 px-3 text-right text-[var(--brand)] whitespace-nowrap">Kapuas Plus (M)</th>
                      <th className="py-2.5 px-3 text-right text-[var(--navy-400)] whitespace-nowrap">Kuserna (M)</th>
                    </>
                  )}
                  {pivotMode === "historis" && (
                    <>
                      <th className="py-2.5 px-2.5 text-right tabular-nums whitespace-nowrap">2020</th>
                      <th className="py-2.5 px-2.5 text-right tabular-nums whitespace-nowrap">2021</th>
                      <th className="py-2.5 px-2.5 text-right tabular-nums whitespace-nowrap">2022</th>
                      <th className="py-2.5 px-2.5 text-right tabular-nums whitespace-nowrap">2023</th>
                      <th className="py-2.5 px-2.5 text-right tabular-nums text-[var(--brand)] whitespace-nowrap">2024</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--divider)] font-medium text-[11px]">

                {/* WILAYAH (Roll-up) */}
                {hierarchyLevel === "wilayah" && wilayahAggregated.map((w, idx) => {
                  const isExpanded = expandedRow === w.wilayah;
                  return (
                    <React.Fragment key={idx}>
                      <tr
                        onClick={() => setExpandedRow(isExpanded ? null : w.wilayah)}
                        className="hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer bg-[var(--surface-subtle)]/50 font-semibold"
                      >
                        <td className="py-2 px-3 text-[var(--text-primary)] flex items-center gap-1.5">
                          {isExpanded
                            ? <ChevronDown className="size-3.5 text-[var(--brand)] shrink-0" />
                            : <ChevronRight className="size-3.5 text-[var(--text-muted)] shrink-0" />
                          }
                          <span className="font-bold">{w.wilayah}</span>
                          <span className="text-[9.5px] text-[var(--text-muted)] font-normal">({w.cabangList.length} Cab.)</span>
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-[var(--text-primary)] tabular-nums">Rp {formatNumber(w.totalPenyaluranMiliar, 1)}</td>
                        <td className="py-2 px-3 text-right text-[var(--text-secondary)] tabular-nums">{formatNumber(w.totalDebitur, 0)}</td>
                        <td className="py-2 px-3 text-right font-bold text-[var(--brand)] tabular-nums">{formatPercent(w.nplPercent, 2)}</td>
                        {pivotMode === "kolektibilitas" && (
                          <>
                            <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400 tabular-nums">{formatPercent(w.kol1Percent, 1)}</td>
                            <td className="py-2 px-3 text-right text-amber-600 dark:text-amber-400 tabular-nums">{formatPercent(w.kol2Percent, 1)}</td>
                            <td className="py-2 px-3 text-right text-rose-600 dark:text-rose-400 font-bold tabular-nums">{formatPercent(w.kolNplPercent, 2)}</td>
                          </>
                        )}
                        {pivotMode === "produk" && (
                          <>
                            <td className="py-2 px-3 text-right text-[var(--brand)] tabular-nums">Rp {formatNumber(w.kapuasPenyaluran, 1)}</td>
                            <td className="py-2 px-3 text-right text-[var(--navy-400)] tabular-nums">Rp {formatNumber(w.kusernaPenyaluran, 1)}</td>
                          </>
                        )}
                        {pivotMode === "historis" && (
                          <>
                            <td className="py-2 px-2.5 text-right text-[var(--text-muted)] tabular-nums">{formatPercent(w.npl2020, 2)}</td>
                            <td className="py-2 px-2.5 text-right text-[var(--text-muted)] tabular-nums">{formatPercent(w.npl2021, 2)}</td>
                            <td className="py-2 px-2.5 text-right text-[var(--text-muted)] tabular-nums">{formatPercent(w.npl2022, 2)}</td>
                            <td className="py-2 px-2.5 text-right text-[var(--text-muted)] tabular-nums">{formatPercent(w.npl2023, 2)}</td>
                            <td className="py-2 px-2.5 text-right text-[var(--brand)] font-bold tabular-nums">{formatPercent(w.npl2024, 2)}</td>
                          </>
                        )}
                      </tr>

                      {/* Drill-down sub-rows */}
                      {isExpanded && w.cabangList.map((c, cIdx) => (
                        <tr key={`sub-${cIdx}`} className="bg-[var(--surface-subtle)]/30 hover:bg-[var(--surface-subtle)] text-[var(--text-secondary)] text-[10.5px]">
                          <td className="py-1.5 px-7 text-[var(--text-secondary)] flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-[var(--brand)] shrink-0" />
                            <span className="truncate">{c.nama}</span>
                          </td>
                          <td className="py-1.5 px-3 text-right tabular-nums">Rp {formatNumber(c.totalPenyaluranMiliar, 1)}</td>
                          <td className="py-1.5 px-3 text-right text-[var(--text-muted)] tabular-nums">{formatNumber(c.totalDebitur, 0)}</td>
                          <td className="py-1.5 px-3 text-right font-semibold text-[var(--brand)] tabular-nums">{formatPercent(c.nplPercent, 2)}</td>
                          {pivotMode === "kolektibilitas" && (
                            <>
                              <td className="py-1.5 px-3 text-right text-emerald-600 dark:text-emerald-400 tabular-nums">{formatPercent(c.kol1Percent, 1)}</td>
                              <td className="py-1.5 px-3 text-right text-amber-600 dark:text-amber-400 tabular-nums">{formatPercent(c.kol2Percent, 1)}</td>
                              <td className="py-1.5 px-3 text-right text-rose-600 dark:text-rose-400 tabular-nums">{formatPercent(c.kolNplPercent, 2)}</td>
                            </>
                          )}
                          {pivotMode === "produk" && (
                            <>
                              <td className="py-1.5 px-3 text-right text-[var(--brand)] tabular-nums">Rp {formatNumber(c.kapuasPlusPenyaluran, 1)}</td>
                              <td className="py-1.5 px-3 text-right text-[var(--navy-400)] tabular-nums">Rp {formatNumber(c.kusernaPenyaluran, 1)}</td>
                            </>
                          )}
                          {pivotMode === "historis" && (
                            <>
                              <td className="py-1.5 px-2.5 text-right text-[var(--text-muted)] tabular-nums">{formatPercent(c.npl2020, 2)}</td>
                              <td className="py-1.5 px-2.5 text-right text-[var(--text-muted)] tabular-nums">{formatPercent(c.npl2021, 2)}</td>
                              <td className="py-1.5 px-2.5 text-right text-[var(--text-muted)] tabular-nums">{formatPercent(c.npl2022, 2)}</td>
                              <td className="py-1.5 px-2.5 text-right text-[var(--text-muted)] tabular-nums">{formatPercent(c.npl2023, 2)}</td>
                              <td className="py-1.5 px-2.5 text-right text-[var(--brand)] tabular-nums">{formatPercent(c.npl2024, 2)}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}

                {/* CABANG (Drill-down) */}
                {hierarchyLevel === "cabang" && filteredCube.map((c, idx) => (
                  <tr key={idx} className="hover:bg-[var(--surface-subtle)] transition-colors text-[10.5px]">
                    <td className="py-1.5 px-3 font-semibold text-[var(--text-primary)]">{c.nama}</td>
                    <td className="py-1.5 px-3 text-right font-bold text-[var(--text-primary)] tabular-nums">Rp {formatNumber(c.totalPenyaluranMiliar, 1)}</td>
                    <td className="py-1.5 px-3 text-right text-[var(--text-secondary)] tabular-nums">{formatNumber(c.totalDebitur, 0)}</td>
                    <td className="py-1.5 px-3 text-right font-bold text-[var(--brand)] tabular-nums">{formatPercent(c.nplPercent, 2)}</td>
                    {pivotMode === "kolektibilitas" && (
                      <>
                        <td className="py-1.5 px-3 text-right text-emerald-600 dark:text-emerald-400 tabular-nums">{formatPercent(c.kol1Percent, 1)}</td>
                        <td className="py-1.5 px-3 text-right text-amber-600 dark:text-amber-400 tabular-nums">{formatPercent(c.kol2Percent, 1)}</td>
                        <td className="py-1.5 px-3 text-right text-rose-600 dark:text-rose-400 font-bold tabular-nums">{formatPercent(c.kolNplPercent, 2)}</td>
                      </>
                    )}
                    {pivotMode === "produk" && (
                      <>
                        <td className="py-1.5 px-3 text-right text-[var(--brand)] tabular-nums">Rp {formatNumber(c.kapuasPlusPenyaluran, 1)}</td>
                        <td className="py-1.5 px-3 text-right text-[var(--navy-400)] tabular-nums">Rp {formatNumber(c.kusernaPenyaluran, 1)}</td>
                      </>
                    )}
                    {pivotMode === "historis" && (
                      <>
                        <td className="py-1.5 px-2.5 text-right text-[var(--text-muted)] tabular-nums">{formatPercent(c.npl2020, 2)}</td>
                        <td className="py-1.5 px-2.5 text-right text-[var(--text-muted)] tabular-nums">{formatPercent(c.npl2021, 2)}</td>
                        <td className="py-1.5 px-2.5 text-right text-[var(--text-muted)] tabular-nums">{formatPercent(c.npl2022, 2)}</td>
                        <td className="py-1.5 px-2.5 text-right text-[var(--text-muted)] tabular-nums">{formatPercent(c.npl2023, 2)}</td>
                        <td className="py-1.5 px-2.5 text-right text-[var(--brand)] font-bold tabular-nums">{formatPercent(c.npl2024, 2)}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
