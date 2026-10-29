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
import KpiMetricCards, { DynamicKpiMetrics } from "./KpiMetricCards";
import NplTrendChart from "./NplTrendChart";
import CollectibilityPie from "./CollectibilityPie";

interface KpiModuleProps {
  data: KpiSummaryData;
}

export default function KpiModule({ data }: KpiModuleProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  // ---------------------------------------------------------------------------
  // OLAP Interactive Controls State
  // ---------------------------------------------------------------------------
  // 1. Hierarchy Level (Roll-up / Drill-down)
  const [hierarchyLevel, setHierarchyLevel] = useState<"wilayah" | "cabang">("wilayah");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // 2. Slice (Product Dimension)
  const [sliceProduct, setSliceProduct] = useState<"all" | "kapuas" | "kuserna">("all");

  // 3. Dice (Region Sub-Cube)
  const [diceWilayah, setDiceWilayah] = useState<string>("all");

  // 4. Pivot Mode (Column Dimension for Matrix Table)
  const [pivotMode, setPivotMode] = useState<"kolektibilitas" | "produk" | "historis">("kolektibilitas");

  // 5. Active Sub-View (Zero-scroll switcher)
  const [activeView, setActiveView] = useState<"overview" | "matrix" | "compare">("overview");

  // ---------------------------------------------------------------------------
  // Filtered Cube Logic
  // ---------------------------------------------------------------------------
  const filteredCube = useMemo(() => {
    return RAW_OLAP_CUBE.filter((item) => {
      if (diceWilayah !== "all" && item.wilayah !== diceWilayah) {
        return false;
      }
      return true;
    });
  }, [diceWilayah]);

  // Aggregation per Wilayah (Roll-up)
  const wilayahAggregated = useMemo(() => {
    const map = new Map<
      string,
      {
        wilayah: string;
        totalPenyaluranMiliar: number;
        totalDebitur: number;
        nplWeightedSum: number;
        kapuasPenyaluran: number;
        kapuasDebitur: number;
        kusernaPenyaluran: number;
        kusernaDebitur: number;
        kol1Weighted: number;
        kol2Weighted: number;
        kolNplWeighted: number;
        npl2020W: number;
        npl2021W: number;
        npl2022W: number;
        npl2023W: number;
        npl2024W: number;
        cabangList: OlapBranchData[];
      }
    >();

    filteredCube.forEach((c) => {
      if (!map.has(c.wilayah)) {
        map.set(c.wilayah, {
          wilayah: c.wilayah,
          totalPenyaluranMiliar: 0,
          totalDebitur: 0,
          nplWeightedSum: 0,
          kapuasPenyaluran: 0,
          kapuasDebitur: 0,
          kusernaPenyaluran: 0,
          kusernaDebitur: 0,
          kol1Weighted: 0,
          kol2Weighted: 0,
          kolNplWeighted: 0,
          npl2020W: 0,
          npl2021W: 0,
          npl2022W: 0,
          npl2023W: 0,
          npl2024W: 0,
          cabangList: [],
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

  // ---------------------------------------------------------------------------
  // Dynamic Executive Metrics (Reactive to Active OLAP Slice & Dice)
  // ---------------------------------------------------------------------------
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
    let weightedNpl = 0;
    let totalVol = 0;
    filteredCube.forEach((c) => {
      const vol =
        sliceProduct === "all"
          ? c.totalPenyaluranMiliar
          : sliceProduct === "kapuas"
          ? c.kapuasPlusPenyaluran
          : c.kusernaPenyaluran;
      const npl =
        sliceProduct === "all"
          ? c.nplPercent
          : sliceProduct === "kapuas"
          ? c.kapuasPlusNpl
          : c.kusernaNpl;
      weightedNpl += npl * vol;
      totalVol += vol;
    });
    return totalVol > 0 ? weightedNpl / totalVol : 1.93;
  }, [filteredCube, sliceProduct]);

  const ckpnMiliar = useMemo(() => {
    return totalVolumeTriliun * 19.3;
  }, [totalVolumeTriliun]);

  const sliceLabel = useMemo(() => {
    if (sliceProduct === "kapuas") return "Kapuas Plus";
    if (sliceProduct === "kuserna") return "Kuserna";
    if (diceWilayah !== "all") return diceWilayah.split("(")[0].trim();
    return "Tersaring";
  }, [sliceProduct, diceWilayah]);

  const dynamicMetrics: DynamicKpiMetrics = {
    totalVolumeTriliun,
    avgNplPercent,
    totalDebiturCount,
    ckpnMiliar,
    sliceLabel,
    isFiltered,
  };

  // ---------------------------------------------------------------------------
  // Chart Data Preparation for Sub-View 2: Komparasi 4 Wilayah
  // ---------------------------------------------------------------------------
  const chartData = useMemo(() => {
    return wilayahAggregated.map((w) => ({
      name: w.wilayah.replace("Wilayah ", "Wil. ").replace(/\s*\(.*\)/, ""),
      penyaluran: Number((w.totalPenyaluranMiliar / 1000).toFixed(2)),
      npl: Number(w.nplPercent.toFixed(2)),
    }));
  }, [wilayahAggregated]);

  const pieCompositionData = useMemo(() => {
    let kapuasSum = 0;
    let kusernaSum = 0;
    filteredCube.forEach((c) => {
      kapuasSum += c.kapuasPlusPenyaluran;
      kusernaSum += c.kusernaPenyaluran;
    });
    return [
      { name: "Kapuas Plus", value: Math.round(kapuasSum) },
      { name: "Kuserna", value: Math.round(kusernaSum) },
    ];
  }, [filteredCube]);

  const PIE_COLORS = ["#3B82F6", "#06B6D4"];

  const handleResetOlap = () => {
    setHierarchyLevel("wilayah");
    setSliceProduct("all");
    setDiceWilayah("all");
    setPivotMode("kolektibilitas");
    setExpandedRow(null);
  };

  return (
    <div className="space-y-3">
      {/* 1. Ultra-Compact Executive Header with Top-Level Product Slicer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-0.5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
            <span className="w-1.5 h-3 bg-blue-500 rounded-full" />
            Dashboard Eksekutif &amp; Analisis OLAP
          </h2>
          <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-600 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Portofolio Terpadu
          </span>
        </div>

        {/* GLOBAL PRODUCT SLICER (Above KPI Metric Cards) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100/90 dark:bg-[#0B0F19]/90 p-0.5 rounded-lg border border-slate-200 dark:border-white/10 text-[10.5px] font-semibold shadow-inner">
            <span className="text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider">
              <Filter className="w-3 h-3 text-cyan-500 dark:text-cyan-400" />
              <span>Produk:</span>
            </span>
            <button
              onClick={() => setSliceProduct("all")}
              className={`px-2.5 py-0.5 rounded-md transition font-bold ${
                sliceProduct === "all"
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setSliceProduct("kapuas")}
              className={`px-2.5 py-0.5 rounded-md transition font-bold ${
                sliceProduct === "kapuas"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Kapuas Plus
            </button>
            <button
              onClick={() => setSliceProduct("kuserna")}
              className={`px-2.5 py-0.5 rounded-md transition font-bold ${
                sliceProduct === "kuserna"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Kuserna
            </button>
          </div>

          <button
            onClick={handleResetOlap}
            title="Reset seluruh filter & kubus OLAP ke default"
            className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/5 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center gap-1 transition"
          >
            <RotateCw className="w-3 h-3 text-blue-500 dark:text-blue-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* 2. Compact KPI Metric Cards (Directly reflect selected Product) */}
      <KpiMetricCards data={data} dynamicMetrics={dynamicMetrics} />

      {/* 3. Integrated OLAP Quick Control Ribbon (Zero-Scroll Command Bar) */}
      <div className="glass-card rounded-xl p-2 flex flex-col lg:flex-row lg:items-center justify-between gap-2 text-xs">
        {/* Left Side: Region Filter (Dice) */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-[#0B0F19]/90 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/5">
            <span className="text-slate-500 dark:text-slate-400 text-[10.5px] font-semibold flex items-center gap-1">
              <Sliders className="w-3 h-3 text-amber-500 dark:text-amber-400" />
              <span>Filter Wilayah:</span>
            </span>
            <select
              value={diceWilayah}
              onChange={(e) => setDiceWilayah(e.target.value)}
              className="h-6 bg-transparent text-[10.5px] text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Semua Wilayah (Kalbar)</option>
              <option value="Wilayah I (Pontianak Raya)" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Wilayah I (Pontianak Raya)</option>
              <option value="Wilayah II (Pantura)" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Wilayah II (Pantura)</option>
              <option value="Wilayah III (Kapuas Raya)" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Wilayah III (Kapuas Raya)</option>
              <option value="Wilayah IV (Ketapang & Selatan)" className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white">Wilayah IV (Ketapang &amp; Sel.)</option>
            </select>
          </div>
          {diceWilayah !== "all" && (
            <button
              onClick={() => setDiceWilayah("all")}
              className="text-[10px] text-amber-600 dark:text-amber-400 hover:underline font-semibold"
            >
              Reset ke Semua
            </button>
          )}
        </div>

        {/* Right Side: Interactive Sub-View Switcher */}
        <div className="flex items-center bg-slate-100/90 dark:bg-[#0B0F19] p-0.5 rounded-lg border border-slate-200 dark:border-white/5 text-[10.5px] font-semibold shrink-0">
          <button
            onClick={() => setActiveView("overview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
              activeView === "overview"
                ? "bg-blue-600 text-white shadow-sm font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-blue-300" />
            <span>1. Tren NPL Provinsi (Kalbar)</span>
          </button>
          <button
            onClick={() => setActiveView("compare")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
              activeView === "compare"
                ? "bg-indigo-600 text-white shadow-sm font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-300" />
            <span>2. Komparasi 4 Wilayah</span>
          </button>
          <button
            onClick={() => setActiveView("matrix")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
              activeView === "matrix"
                ? "bg-cyan-600 text-white shadow-sm font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <TableIcon className="w-3.5 h-3.5 text-cyan-300" />
            <span>3. Matriks Kubus OLAP</span>
          </button>
        </div>
      </div>

      {/* 4. DYNAMIC SUB-VIEW VISUALIZATION (Designed to fit within screen height) */}
      {/* --------------------------------------------------------------------- */}
      {/* SUB-VIEW 1: TRENS NPL & KUALITAS PORTOFOLIO                           */}
      {/* --------------------------------------------------------------------- */}
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

      {/* --------------------------------------------------------------------- */}
      {/* SUB-VIEW 3: MATRIKS KUBUS OLAP (PIVOT TABLE & EXPANDABLE DRILL-DOWN)  */}
      {/* --------------------------------------------------------------------- */}
      {activeView === "matrix" && (
        <div className="glass-card rounded-xl p-3.5 space-y-2.5 animate-fade-up">
          {/* Header Controls for Pivot Mode & Hierarchy Level */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 dark:border-white/5 pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                Matriks Multidimensi OLAP ({hierarchyLevel === "wilayah" ? "Tingkat 4 Wilayah" : "Tingkat 19 Kantor Cabang"})
              </h3>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/5">
                {hierarchyLevel === "wilayah" ? "Klik baris wilayah untuk rincian cabang" : "Menampilkan 19 Kantor Cabang"}
              </span>
            </div>

            {/* Hierarki Level & Sumbu Pivot Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Hierarchy: Roll-up / Drill-down Level */}
              <div className="flex items-center bg-slate-100/90 dark:bg-[#0B0F19]/80 p-0.5 rounded-lg border border-slate-200 dark:border-white/5 text-[10px] font-semibold">
                <span className="text-slate-500 px-1.5 flex items-center gap-1">
                  <Layers className="w-2.5 h-2.5 text-blue-500 dark:text-blue-400" />
                  <span>Level:</span>
                </span>
                <button
                  onClick={() => setHierarchyLevel("wilayah")}
                  title="Roll-up: Tampilan Agregat 4 Wilayah"
                  className={`px-2 py-0.5 rounded transition ${
                    hierarchyLevel === "wilayah"
                      ? "bg-blue-600 text-white font-bold shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  4 Wilayah (Roll-up)
                </button>
                <button
                  onClick={() => setHierarchyLevel("cabang")}
                  title="Drill-down: Tampilan Seluruh 19 Kantor Cabang"
                  className={`px-2 py-0.5 rounded transition ${
                    hierarchyLevel === "cabang"
                      ? "bg-blue-600 text-white font-bold shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  19 Cabang (Drill-down)
                </button>
              </div>

              {/* Pivot Axis Selector */}
              <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-[#0B0F19]/80 p-0.5 rounded-lg border border-slate-200 dark:border-white/5 text-[10px] font-semibold">
                <span className="text-slate-500 px-1">Sumbu Pivot:</span>
                <button
                  onClick={() => setPivotMode("kolektibilitas")}
                  className={`px-2 py-0.5 rounded transition ${
                    pivotMode === "kolektibilitas"
                      ? "bg-purple-600 text-white font-bold shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Kolektibilitas
                </button>
                <button
                  onClick={() => setPivotMode("produk")}
                  className={`px-2 py-0.5 rounded transition ${
                    pivotMode === "produk"
                      ? "bg-purple-600 text-white font-bold shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Produk
                </button>
                <button
                  onClick={() => setPivotMode("historis")}
                  className={`px-2 py-0.5 rounded transition ${
                    pivotMode === "historis"
                      ? "bg-purple-600 text-white font-bold shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Tren 5-Thn
                </button>
              </div>
            </div>
          </div>

          {/* Contained Scrollable Pivot Table (Prevent page overflow) */}
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto pr-1">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-[#0B0F19] text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-white/10 sticky top-0 z-10">
                <tr>
                  <th className="py-2 px-3 rounded-l-lg">Entitas Geografis</th>
                  <th className="py-2 px-3 text-right">Penyaluran (Rp M)</th>
                  <th className="py-2 px-3 text-right">Debitur</th>
                  <th className="py-2 px-3 text-right">NPL (%)</th>

                  {pivotMode === "kolektibilitas" && (
                    <>
                      <th className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400">Kol 1 Lancar</th>
                      <th className="py-2 px-3 text-right text-amber-600 dark:text-amber-400">Kol 2 DPK</th>
                      <th className="py-2 px-3 text-right text-rose-600 dark:text-rose-400 rounded-r-lg">Kol 3-5 NPL</th>
                    </>
                  )}

                  {pivotMode === "produk" && (
                    <>
                      <th className="py-2 px-3 text-right text-blue-600 dark:text-blue-400">Kapuas Plus (M)</th>
                      <th className="py-2 px-3 text-right text-cyan-600 dark:text-cyan-400 rounded-r-lg">Kuserna (M)</th>
                    </>
                  )}

                  {pivotMode === "historis" && (
                    <>
                      <th className="py-2 px-2.5 text-right">2020</th>
                      <th className="py-2 px-2.5 text-right">2021</th>
                      <th className="py-2 px-2.5 text-right">2022</th>
                      <th className="py-2 px-2.5 text-right">2023</th>
                      <th className="py-2 px-2.5 text-right text-cyan-600 dark:text-cyan-400 rounded-r-lg">2024</th>
                    </>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200/80 dark:divide-white/5 font-medium text-[11px]">
                {/* 4 WILAYAH LEVEL (ROLL-UP) */}
                {hierarchyLevel === "wilayah" &&
                  wilayahAggregated.map((w, idx) => {
                    const isExpanded = expandedRow === w.wilayah;
                    return (
                      <React.Fragment key={idx}>
                        <tr
                          onClick={() => setExpandedRow(isExpanded ? null : w.wilayah)}
                          className="hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer bg-slate-50/70 dark:bg-slate-900/40 font-semibold"
                        >
                          <td className="py-2 px-3 text-slate-900 dark:text-white flex items-center gap-1.5">
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                            )}
                            <span className="font-bold">{w.wilayah}</span>
                            <span className="text-[9.5px] text-slate-500 font-normal">
                              ({w.cabangList.length} Cab.)
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-white">
                            Rp {formatNumber(w.totalPenyaluranMiliar, 1)}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-600 dark:text-slate-300">
                            {formatNumber(w.totalDebitur, 0)}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-cyan-600 dark:text-cyan-400">
                            {formatPercent(w.nplPercent, 2)}
                          </td>

                          {pivotMode === "kolektibilitas" && (
                            <>
                              <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400">{formatPercent(w.kol1Percent, 1)}</td>
                              <td className="py-2 px-3 text-right text-amber-600 dark:text-amber-400">{formatPercent(w.kol2Percent, 1)}</td>
                              <td className="py-2 px-3 text-right text-rose-600 dark:text-rose-400 font-bold">{formatPercent(w.kolNplPercent, 2)}</td>
                            </>
                          )}

                          {pivotMode === "produk" && (
                            <>
                              <td className="py-2 px-3 text-right text-blue-600 dark:text-blue-400">Rp {formatNumber(w.kapuasPenyaluran, 1)}</td>
                              <td className="py-2 px-3 text-right text-cyan-600 dark:text-cyan-400">Rp {formatNumber(w.kusernaPenyaluran, 1)}</td>
                            </>
                          )}

                          {pivotMode === "historis" && (
                            <>
                              <td className="py-2 px-2.5 text-right text-slate-500 dark:text-slate-400">{formatPercent(w.npl2020, 2)}</td>
                              <td className="py-2 px-2.5 text-right text-slate-500 dark:text-slate-400">{formatPercent(w.npl2021, 2)}</td>
                              <td className="py-2 px-2.5 text-right text-slate-500 dark:text-slate-400">{formatPercent(w.npl2022, 2)}</td>
                              <td className="py-2 px-2.5 text-right text-slate-500 dark:text-slate-400">{formatPercent(w.npl2023, 2)}</td>
                              <td className="py-2 px-2.5 text-right text-cyan-600 dark:text-cyan-400 font-bold">{formatPercent(w.npl2024, 2)}</td>
                            </>
                          )}
                        </tr>

                        {/* DRILL-DOWN SUB-ROWS (BRANCHES INSIDE EXPANDED REGION) */}
                        {isExpanded &&
                          w.cabangList.map((c, cIdx) => (
                            <tr key={`sub-${cIdx}`} className="bg-slate-100/60 dark:bg-[#0B0F19]/80 hover:bg-slate-200/50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 text-[10.5px]">
                              <td className="py-1.5 px-7 text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                <span className="truncate">{c.nama}</span>
                              </td>
                              <td className="py-1.5 px-3 text-right">Rp {formatNumber(c.totalPenyaluranMiliar, 1)}</td>
                              <td className="py-1.5 px-3 text-right text-slate-500 dark:text-slate-400">{formatNumber(c.totalDebitur, 0)}</td>
                              <td className="py-1.5 px-3 text-right font-semibold text-cyan-600 dark:text-cyan-300">{formatPercent(c.nplPercent, 2)}</td>

                              {pivotMode === "kolektibilitas" && (
                                <>
                                  <td className="py-1.5 px-3 text-right text-emerald-600 dark:text-emerald-400">{formatPercent(c.kol1Percent, 1)}</td>
                                  <td className="py-1.5 px-3 text-right text-amber-600 dark:text-amber-400">{formatPercent(c.kol2Percent, 1)}</td>
                                  <td className="py-1.5 px-3 text-right text-rose-600 dark:text-rose-400">{formatPercent(c.kolNplPercent, 2)}</td>
                                </>
                              )}

                              {pivotMode === "produk" && (
                                <>
                                  <td className="py-1.5 px-3 text-right text-blue-600 dark:text-blue-400">Rp {formatNumber(c.kapuasPlusPenyaluran, 1)}</td>
                                  <td className="py-1.5 px-3 text-right text-cyan-600 dark:text-cyan-400">Rp {formatNumber(c.kusernaPenyaluran, 1)}</td>
                                </>
                              )}

                              {pivotMode === "historis" && (
                                <>
                                  <td className="py-1.5 px-2.5 text-right text-slate-500">{formatPercent(c.npl2020, 2)}</td>
                                  <td className="py-1.5 px-2.5 text-right text-slate-500">{formatPercent(c.npl2021, 2)}</td>
                                  <td className="py-1.5 px-2.5 text-right text-slate-500">{formatPercent(c.npl2022, 2)}</td>
                                  <td className="py-1.5 px-2.5 text-right text-slate-500">{formatPercent(c.npl2023, 2)}</td>
                                  <td className="py-1.5 px-2.5 text-right text-cyan-600 dark:text-cyan-400">{formatPercent(c.npl2024, 2)}</td>
                                </>
                              )}
                            </tr>
                          ))}
                      </React.Fragment>
                    );
                  })}

                {/* 19 CABANG GRANULAR LEVEL */}
                {hierarchyLevel === "cabang" &&
                  filteredCube.map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-[10.5px]">
                      <td className="py-1.5 px-3 font-semibold text-slate-900 dark:text-white">{c.nama}</td>
                      <td className="py-1.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                        Rp {formatNumber(c.totalPenyaluranMiliar, 1)}
                      </td>
                      <td className="py-1.5 px-3 text-right text-slate-600 dark:text-slate-300">
                        {formatNumber(c.totalDebitur, 0)}
                      </td>
                      <td className="py-1.5 px-3 text-right font-bold text-cyan-600 dark:text-cyan-400">
                        {formatPercent(c.nplPercent, 2)}
                      </td>

                      {pivotMode === "kolektibilitas" && (
                        <>
                          <td className="py-1.5 px-3 text-right text-emerald-600 dark:text-emerald-400">{formatPercent(c.kol1Percent, 1)}</td>
                          <td className="py-1.5 px-3 text-right text-amber-600 dark:text-amber-400">{formatPercent(c.kol2Percent, 1)}</td>
                          <td className="py-1.5 px-3 text-right text-rose-600 dark:text-rose-400 font-bold">{formatPercent(c.kolNplPercent, 2)}</td>
                        </>
                      )}

                      {pivotMode === "produk" && (
                        <>
                          <td className="py-1.5 px-3 text-right text-blue-600 dark:text-blue-400">Rp {formatNumber(c.kapuasPlusPenyaluran, 1)}</td>
                          <td className="py-1.5 px-3 text-right text-cyan-600 dark:text-cyan-400">Rp {formatNumber(c.kusernaPenyaluran, 1)}</td>
                        </>
                      )}

                      {pivotMode === "historis" && (
                        <>
                          <td className="py-1.5 px-2.5 text-right text-slate-500 dark:text-slate-400">{formatPercent(c.npl2020, 2)}</td>
                          <td className="py-1.5 px-2.5 text-right text-slate-500 dark:text-slate-400">{formatPercent(c.npl2021, 2)}</td>
                          <td className="py-1.5 px-2.5 text-right text-slate-500 dark:text-slate-400">{formatPercent(c.npl2022, 2)}</td>
                          <td className="py-1.5 px-2.5 text-right text-slate-500 dark:text-slate-400">{formatPercent(c.npl2023, 2)}</td>
                          <td className="py-1.5 px-2.5 text-right text-cyan-600 dark:text-cyan-400 font-bold">{formatPercent(c.npl2024, 2)}</td>
                        </>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* SUB-VIEW 2: KOMPARASI 4 WILAYAH OPERASIONAL & PRODUK                  */}
      {/* --------------------------------------------------------------------- */}
      {activeView === "compare" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 animate-fade-up">
          {/* Comparison Bar Chart */}
          <div className="lg:col-span-8 glass-card rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  Komparasi 4 Wilayah Operasional Bank Kalbar
                </h3>
                <span className="text-[9.5px] text-indigo-500 dark:text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 font-semibold">
                  Agregat 4 Wilayah
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Penyaluran (Rp T) &amp; Rasio NPL (%)
              </span>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#E2E8F0" : "#1E293B"} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9.5, fill: isLight ? "#64748B" : "#94A3B8" }} axisLine={{ stroke: isLight ? "#E2E8F0" : "#1E293B" }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 9.5, fill: isLight ? "#64748B" : "#64748B" }} unit=" T" axisLine={{ stroke: isLight ? "#E2E8F0" : "#1E293B" }} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 9.5, fill: isLight ? "#64748B" : "#64748B" }}
                    unit="%"
                    domain={[0, 3.5]}
                    axisLine={{ stroke: isLight ? "#E2E8F0" : "#1E293B" }}
                  />
                  <Tooltip
                    formatter={(val, name) => [
                      name === "Penyaluran" ? `Rp ${val} Triliun` : `${val}%`,
                      name === "Penyaluran" ? "Volume Penyaluran" : "Rasio NPL",
                    ]}
                    contentStyle={{
                      backgroundColor: isLight ? "#FFFFFF" : "#0F172A",
                      borderColor: isLight ? "#E2E8F0" : "#334155",
                      borderRadius: "10px",
                      color: isLight ? "#0F172A" : "#F8FAFC",
                      fontSize: "11px",
                      padding: "6px 10px",
                      boxShadow: isLight ? "0 10px 25px rgba(0,0,0,0.08)" : "0 10px 30px rgba(0,0,0,0.5)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px", color: isLight ? "#475569" : "#94A3B8" }} height={24} />
                  <Bar yAxisId="left" dataKey="penyaluran" name="Penyaluran" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="npl" name="NPL (%)" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Product Share Donut */}
          <div className="lg:col-span-4 glass-card rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
            <div className="border-b border-slate-200 dark:border-white/5 pb-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <PieIcon className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                Porsi Produk Kredit
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Kapuas Plus vs Kuserna
              </p>
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
                      borderColor: isLight ? "#E2E8F0" : "#334155",
                      borderRadius: "10px",
                      color: isLight ? "#0F172A" : "#F8FAFC",
                      fontSize: "11px",
                      padding: "6px 10px",
                      boxShadow: isLight ? "0 10px 25px rgba(0,0,0,0.08)" : "0 10px 30px rgba(0,0,0,0.5)",
                    }}
                  />
                  <Legend verticalAlign="bottom" height={26} iconType="circle" wrapperStyle={{ fontSize: "10px", color: isLight ? "#475569" : "#94A3B8" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="p-2 rounded-lg bg-slate-100/90 dark:bg-[#0B0F19]/60 border border-slate-200 dark:border-white/5 text-[10px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Rasio Kapuas : Kuserna</span>
              <span className="font-bold text-cyan-600 dark:text-cyan-400">75% : 25%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
