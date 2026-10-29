"use client";

import React, { useState, useMemo } from "react";
import {
  Database,
  Layers,
  Filter,
  RotateCw,
  ChevronRight,
  ChevronDown,
  Building2,
  PieChart as PieIcon,
  BarChart3,
  Sliders,
  Info
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
  Legend
} from "recharts";
import { formatNumber, formatPercent } from "@/lib/utils";

// -----------------------------------------------------------------------------
// Data Cube Definition (Bank Kalbar Portfolio Dimension Matrix)
// -----------------------------------------------------------------------------
export interface OlapBranchData {
  id: string;
  nama: string;
  wilayah: "Wilayah I (Pontianak Raya)" | "Wilayah II (Pantura)" | "Wilayah III (Kapuas Raya)" | "Wilayah IV (Ketapang & Selatan)";
  totalPenyaluranMiliar: number;
  totalDebitur: number;
  nplPercent: number;
  // Produk Split
  kapuasPlusPenyaluran: number;
  kapuasPlusDebitur: number;
  kapuasPlusNpl: number;
  kusernaPenyaluran: number;
  kusernaDebitur: number;
  kusernaNpl: number;
  // Kolektibilitas
  kol1Percent: number;
  kol2Percent: number;
  kolNplPercent: number;
  // Historis 5 Tahun
  npl2020: number;
  npl2021: number;
  npl2022: number;
  npl2023: number;
  npl2024: number;
}

const RAW_OLAP_CUBE: OlapBranchData[] = [
  // WILAYAH I: Pontianak Raya
  {
    id: "01",
    nama: "01 Cabang Utama Pontianak",
    wilayah: "Wilayah I (Pontianak Raya)",
    totalPenyaluranMiliar: 2850.0,
    totalDebitur: 7281,
    nplPercent: 1.65,
    kapuasPlusPenyaluran: 2150.0,
    kapuasPlusDebitur: 5460,
    kapuasPlusNpl: 1.40,
    kusernaPenyaluran: 700.0,
    kusernaDebitur: 1821,
    kusernaNpl: 2.42,
    kol1Percent: 88.50,
    kol2Percent: 9.85,
    kolNplPercent: 1.65,
    npl2020: 2.45,
    npl2021: 2.15,
    npl2022: 1.90,
    npl2023: 1.75,
    npl2024: 1.65,
  },
  {
    id: "19",
    nama: "19 Cabang Kubu Raya",
    wilayah: "Wilayah I (Pontianak Raya)",
    totalPenyaluranMiliar: 1420.0,
    totalDebitur: 7105,
    nplPercent: 1.82,
    kapuasPlusPenyaluran: 1065.0,
    kapuasPlusDebitur: 5328,
    kapuasPlusNpl: 1.55,
    kusernaPenyaluran: 355.0,
    kusernaDebitur: 1777,
    kusernaNpl: 2.63,
    kol1Percent: 87.10,
    kol2Percent: 11.08,
    kolNplPercent: 1.82,
    npl2020: 2.60,
    npl2021: 2.30,
    npl2022: 2.05,
    npl2023: 1.90,
    npl2024: 1.82,
  },
  {
    id: "03",
    nama: "03 Cabang Mempawah",
    wilayah: "Wilayah I (Pontianak Raya)",
    totalPenyaluranMiliar: 780.0,
    totalDebitur: 4950,
    nplPercent: 1.74,
    kapuasPlusPenyaluran: 585.0,
    kapuasPlusDebitur: 3712,
    kapuasPlusNpl: 1.48,
    kusernaPenyaluran: 195.0,
    kusernaDebitur: 1238,
    kusernaNpl: 2.52,
    kol1Percent: 87.80,
    kol2Percent: 10.46,
    kolNplPercent: 1.74,
    npl2020: 2.50,
    npl2021: 2.20,
    npl2022: 1.95,
    npl2023: 1.80,
    npl2024: 1.74,
  },

  // WILAYAH II: Pantura Kalbar
  {
    id: "05",
    nama: "05 Cabang Singkawang",
    wilayah: "Wilayah II (Pantura)",
    totalPenyaluranMiliar: 980.0,
    totalDebitur: 5820,
    nplPercent: 1.78,
    kapuasPlusPenyaluran: 735.0,
    kapuasPlusDebitur: 4365,
    kapuasPlusNpl: 1.50,
    kusernaPenyaluran: 245.0,
    kusernaDebitur: 1455,
    kusernaNpl: 2.62,
    kol1Percent: 87.40,
    kol2Percent: 10.82,
    kolNplPercent: 1.78,
    npl2020: 2.55,
    npl2021: 2.25,
    npl2022: 2.00,
    npl2023: 1.85,
    npl2024: 1.78,
  },
  {
    id: "07",
    nama: "07 Cabang Sambas",
    wilayah: "Wilayah II (Pantura)",
    totalPenyaluranMiliar: 890.0,
    totalDebitur: 5410,
    nplPercent: 1.85,
    kapuasPlusPenyaluran: 667.5,
    kapuasPlusDebitur: 4057,
    kapuasPlusNpl: 1.58,
    kusernaPenyaluran: 222.5,
    kusernaDebitur: 1353,
    kusernaNpl: 2.66,
    kol1Percent: 86.90,
    kol2Percent: 11.25,
    kolNplPercent: 1.85,
    npl2020: 2.70,
    npl2021: 2.40,
    npl2022: 2.10,
    npl2023: 1.95,
    npl2024: 1.85,
  },
  {
    id: "14",
    nama: "14 Cabang Bengkayang",
    wilayah: "Wilayah II (Pantura)",
    totalPenyaluranMiliar: 1240.0,
    totalDebitur: 10242,
    nplPercent: 1.92,
    kapuasPlusPenyaluran: 930.0,
    kapuasPlusDebitur: 7681,
    kapuasPlusNpl: 1.62,
    kusernaPenyaluran: 310.0,
    kusernaDebitur: 2561,
    kusernaNpl: 2.82,
    kol1Percent: 86.60,
    kol2Percent: 11.48,
    kolNplPercent: 1.92,
    npl2020: 2.85,
    npl2021: 2.50,
    npl2022: 2.20,
    npl2023: 2.05,
    npl2024: 1.92,
  },

  // WILAYAH III: Kapuas Raya
  {
    id: "09",
    nama: "09 Cabang Sintang",
    wilayah: "Wilayah III (Kapuas Raya)",
    totalPenyaluranMiliar: 1380.0,
    totalDebitur: 10688,
    nplPercent: 1.96,
    kapuasPlusPenyaluran: 1035.0,
    kapuasPlusDebitur: 8016,
    kapuasPlusNpl: 1.65,
    kusernaPenyaluran: 345.0,
    kusernaDebitur: 2672,
    kusernaNpl: 2.89,
    kol1Percent: 86.40,
    kol2Percent: 11.64,
    kolNplPercent: 1.96,
    npl2020: 2.90,
    npl2021: 2.55,
    npl2022: 2.25,
    npl2023: 2.10,
    npl2024: 1.96,
  },
  {
    id: "06",
    nama: "06 Cabang Sanggau",
    wilayah: "Wilayah III (Kapuas Raya)",
    totalPenyaluranMiliar: 1120.0,
    totalDebitur: 7812,
    nplPercent: 1.91,
    kapuasPlusPenyaluran: 840.0,
    kapuasPlusDebitur: 5859,
    kapuasPlusNpl: 1.60,
    kusernaPenyaluran: 280.0,
    kusernaDebitur: 1953,
    kusernaNpl: 2.84,
    kol1Percent: 86.80,
    kol2Percent: 11.29,
    kolNplPercent: 1.91,
    npl2020: 2.80,
    npl2021: 2.45,
    npl2022: 2.15,
    npl2023: 2.00,
    npl2024: 1.91,
  },
  {
    id: "13",
    nama: "13 Cabang Ngabang",
    wilayah: "Wilayah III (Kapuas Raya)",
    totalPenyaluranMiliar: 1190.0,
    totalDebitur: 8607,
    nplPercent: 2.04,
    kapuasPlusPenyaluran: 892.5,
    kapuasPlusDebitur: 6455,
    kapuasPlusNpl: 1.72,
    kusernaPenyaluran: 297.5,
    kusernaDebitur: 2152,
    kusernaNpl: 3.00,
    kol1Percent: 85.90,
    kol2Percent: 12.06,
    kolNplPercent: 2.04,
    npl2020: 3.05,
    npl2021: 2.70,
    npl2022: 2.40,
    npl2023: 2.20,
    npl2024: 2.04,
  },
  {
    id: "15",
    nama: "15 Cabang Sekadau",
    wilayah: "Wilayah III (Kapuas Raya)",
    totalPenyaluranMiliar: 870.0,
    totalDebitur: 6615,
    nplPercent: 2.01,
    kapuasPlusPenyaluran: 652.5,
    kapuasPlusDebitur: 4961,
    kapuasPlusNpl: 1.69,
    kusernaPenyaluran: 217.5,
    kusernaDebitur: 1654,
    kusernaNpl: 2.97,
    kol1Percent: 86.10,
    kol2Percent: 11.89,
    kolNplPercent: 2.01,
    npl2020: 2.95,
    npl2021: 2.60,
    npl2022: 2.30,
    npl2023: 2.15,
    npl2024: 2.01,
  },
  {
    id: "02",
    nama: "02 Cabang Nanga Pinoh",
    wilayah: "Wilayah III (Kapuas Raya)",
    totalPenyaluranMiliar: 930.0,
    totalDebitur: 7299,
    nplPercent: 2.10,
    kapuasPlusPenyaluran: 697.5,
    kapuasPlusDebitur: 5474,
    kapuasPlusNpl: 1.78,
    kusernaPenyaluran: 232.5,
    kusernaDebitur: 1825,
    kusernaNpl: 3.06,
    kol1Percent: 85.50,
    kol2Percent: 12.40,
    kolNplPercent: 2.10,
    npl2020: 3.15,
    npl2021: 2.80,
    npl2022: 2.50,
    npl2023: 2.30,
    npl2024: 2.10,
  },
  {
    id: "08",
    nama: "08 Cabang Putussibau",
    wilayah: "Wilayah III (Kapuas Raya)",
    totalPenyaluranMiliar: 760.0,
    totalDebitur: 6309,
    nplPercent: 2.15,
    kapuasPlusPenyaluran: 570.0,
    kapuasPlusDebitur: 4731,
    kapuasPlusNpl: 1.82,
    kusernaPenyaluran: 190.0,
    kusernaDebitur: 1578,
    kusernaNpl: 3.14,
    kol1Percent: 85.10,
    kol2Percent: 12.75,
    kolNplPercent: 2.15,
    npl2020: 3.20,
    npl2021: 2.85,
    npl2022: 2.55,
    npl2023: 2.35,
    npl2024: 2.15,
  },

  // WILAYAH IV: Ketapang & Selatan
  {
    id: "04",
    nama: "04 Cabang Ketapang",
    wilayah: "Wilayah IV (Ketapang & Selatan)",
    totalPenyaluranMiliar: 1480.0,
    totalDebitur: 11838,
    nplPercent: 2.22,
    kapuasPlusPenyaluran: 1110.0,
    kapuasPlusDebitur: 8878,
    kapuasPlusNpl: 1.88,
    kusernaPenyaluran: 370.0,
    kusernaDebitur: 2960,
    kusernaNpl: 3.24,
    kol1Percent: 84.80,
    kol2Percent: 12.98,
    kolNplPercent: 2.22,
    npl2020: 3.35,
    npl2021: 2.95,
    npl2022: 2.65,
    npl2023: 2.45,
    npl2024: 2.22,
  },
];

export default function OlapModule() {
  // 1. OLAP Hierarchy Level (Roll-up / Drill-down)
  const [hierarchyLevel, setHierarchyLevel] = useState<"wilayah" | "cabang">("wilayah");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // 2. OLAP Slice (Product Filter)
  const [sliceProduct, setSliceProduct] = useState<"all" | "kapuas" | "kuserna">("all");

  // 3. OLAP Dice (Region Multi-filter)
  const [diceWilayah, setDiceWilayah] = useState<string>("all");

  // 4. OLAP Pivot Dimension (Column Matrix)
  const [pivotMode, setPivotMode] = useState<"kolektibilitas" | "produk" | "historis">("kolektibilitas");

  // Filtered Cube based on Slice & Dice
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
    const map = new Map<string, {
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
    }>();

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

  // Executive Top Metrics Calculation
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
      const vol = sliceProduct === "all" ? c.totalPenyaluranMiliar : sliceProduct === "kapuas" ? c.kapuasPlusPenyaluran : c.kusernaPenyaluran;
      const npl = sliceProduct === "all" ? c.nplPercent : sliceProduct === "kapuas" ? c.kapuasPlusNpl : c.kusernaNpl;
      weightedNpl += npl * vol;
      totalVol += vol;
    });
    return totalVol > 0 ? weightedNpl / totalVol : 1.93;
  }, [filteredCube, sliceProduct]);

  // Chart Data Preparation (Focused on 4 Wilayah Comparison)
  const chartData = useMemo(() => {
    return wilayahAggregated.map((w) => ({
      name: w.wilayah.replace("Wilayah ", "Wil. "),
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
      { name: "Kapuas Plus (ASN Pra-Pensiun)", value: Math.round(kapuasSum) },
      { name: "Kuserna (Pensiunan Murni)", value: Math.round(kusernaSum) },
    ];
  }, [filteredCube]);

  const PIE_COLORS = ["#3B82F6", "#06B6D4"];

  return (
    <div className="space-y-6">
      {/* Header & Concept Explanation Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" />
              Eksplorasi Analisis Multidimensi OLAP
            </h2>
            <span className="bg-cyan-500/20 text-cyan-300 text-[10px] px-2 py-0.5 rounded-full border border-cyan-400/30 font-semibold">
              Online Analytical Processing
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Navigasi analitis kubus data kredit Bank Kalbar melalui 5 operasi: <i>Roll-up, Drill-down, Slice, Dice, & Pivot</i>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setHierarchyLevel("wilayah");
              setSliceProduct("all");
              setDiceWilayah("all");
              setPivotMode("kolektibilitas");
              setExpandedRow(null);
            }}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 border border-white/5 hover:bg-slate-700 flex items-center gap-1.5 transition"
          >
            <RotateCw className="w-3.5 h-3.5 text-blue-400" />
            <span>Reset Kubus OLAP</span>
          </button>
        </div>
      </div>

      {/* OLAP OPERATIONS CONTROL TOOLBAR */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. HIERARKI (Roll-up / Drill-down) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
              <Layers className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>1. Hierarki (Level)</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5 bg-[var(--surface-box)] p-1 rounded-xl border border-[var(--divider-color)] h-[38px] items-center">
              <button
                onClick={() => setHierarchyLevel("wilayah")}
                title="Roll-up: Tampilan 4 Wilayah Agregat"
                className={`h-full rounded-lg transition text-center whitespace-nowrap text-[11px] font-bold ${
                  hierarchyLevel === "wilayah"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                4 Wilayah
              </button>
              <button
                onClick={() => setHierarchyLevel("cabang")}
                title="Drill-down: Tampilan 19 Kantor Cabang"
                className={`h-full rounded-lg transition text-center whitespace-nowrap text-[11px] font-bold ${
                  hierarchyLevel === "cabang"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                19 Cabang
              </button>
            </div>
          </div>

          {/* 2. SLICE (Dimensi Produk) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
              <Filter className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>2. Slice (Produk)</span>
            </label>
            <div className="grid grid-cols-3 gap-1 bg-[var(--surface-box)] p-1 rounded-xl border border-[var(--divider-color)] h-[38px] items-center">
              <button
                onClick={() => setSliceProduct("all")}
                className={`h-full rounded-lg transition text-center whitespace-nowrap text-[10.5px] font-bold ${
                  sliceProduct === "all"
                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setSliceProduct("kapuas")}
                className={`h-full rounded-lg transition text-center whitespace-nowrap text-[10.5px] font-bold ${
                  sliceProduct === "kapuas"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Kapuas
              </button>
              <button
                onClick={() => setSliceProduct("kuserna")}
                className={`h-full rounded-lg transition text-center whitespace-nowrap text-[10.5px] font-bold ${
                  sliceProduct === "kuserna"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Kuserna
              </button>
            </div>
          </div>

          {/* 3. DICE (Sub-Kubus Wilayah) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
              <Sliders className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>3. Dice (Wilayah)</span>
            </label>
            <select
              value={diceWilayah}
              onChange={(e) => setDiceWilayah(e.target.value)}
              className="w-full h-[38px] px-2.5 bg-[var(--surface-box)] border border-[var(--divider-color)] rounded-xl text-xs text-white font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Semua Wilayah (Kalbar)</option>
              <option value="Wilayah I (Pontianak Raya)">Wilayah I (Pontianak Raya)</option>
              <option value="Wilayah II (Pantura)">Wilayah II (Pantura)</option>
              <option value="Wilayah III (Kapuas Raya)">Wilayah III (Kapuas Raya)</option>
              <option value="Wilayah IV (Ketapang & Selatan)">Wilayah IV (Ketapang Selatan)</option>
            </select>
          </div>

          {/* 4. PIVOT (Sumbu Matriks Tabel) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
              <RotateCw className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>4. Pivot (Matriks)</span>
            </label>
            <div className="grid grid-cols-3 gap-1 bg-[var(--surface-box)] p-1 rounded-xl border border-[var(--divider-color)] h-[38px] items-center">
              <button
                onClick={() => setPivotMode("kolektibilitas")}
                title="Sumbu Kolom: Kolektibilitas OJK"
                className={`h-full rounded-lg transition text-center whitespace-nowrap text-[10px] font-bold tracking-tight px-1 ${
                  pivotMode === "kolektibilitas"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Kolektibilitas
              </button>
              <button
                onClick={() => setPivotMode("produk")}
                title="Sumbu Kolom: Produk Kredit"
                className={`h-full rounded-lg transition text-center whitespace-nowrap text-[10px] font-bold ${
                  pivotMode === "produk"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Produk
              </button>
              <button
                onClick={() => setPivotMode("historis")}
                title="Sumbu Kolom: Tren 5 Tahun"
                className={`h-full rounded-lg transition text-center whitespace-nowrap text-[10px] font-bold ${
                  pivotMode === "historis"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Tren 5-Thn
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* EXECUTIVE KPI SUMMARY CARDS (DYNAMICALLY COMPUTED FROM ACTIVE CUBE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 space-y-1.5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Volume Portofolio Tersaring
          </p>
          <h3 className="text-2xl font-black text-white">
            Rp {formatNumber(totalVolumeTriliun, 2)} T
          </h3>
          <p className="text-[10px] text-cyan-400">
            {sliceProduct === "all" ? "Seluruh Produk Kredit" : sliceProduct === "kapuas" ? "Khusus Kapuas Plus" : "Khusus Kuserna"}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-4 space-y-1.5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Rata-Rata Rasio NPL
          </p>
          <h3 className={`text-2xl font-black ${avgNplPercent < 2.0 ? "text-emerald-400" : "text-amber-400"}`}>
            {formatPercent(avgNplPercent, 2)}
          </h3>
          <p className="text-[10px] text-emerald-400">
            Ambang OJK &lt; 5,00% (Aman)
          </p>
        </div>

        <div className="glass-card rounded-2xl p-4 space-y-1.5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Debitur Aktif
          </p>
          <h3 className="text-2xl font-black text-white">
            {formatNumber(totalDebiturCount, 0)}
          </h3>
          <p className="text-[10px] text-slate-400">
            Tersebar di {filteredCube.length} Kantor Cabang
          </p>
        </div>

        <div className="glass-card rounded-2xl p-4 space-y-1.5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Estimasi Cadangan CKPN
          </p>
          <h3 className="text-2xl font-black text-indigo-300">
            Rp {formatNumber(totalVolumeTriliun * 19.3, 1)} M
          </h3>
          <p className="text-[10px] text-slate-400">
            PSAK 71 Expected Credit Loss
          </p>
        </div>
      </div>

      {/* DYNAMIC OLAP PIVOT TABLE */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/5 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              Matriks Pivot Multidimensi (
              {hierarchyLevel === "wilayah" ? "Tingkat 4 Wilayah Operasional" : "Tingkat 19 Kantor Cabang"}
              )
            </h3>
            <p className="text-xs text-slate-400">
              {pivotMode === "kolektibilitas"
                ? "Sumbu Kolom: Sebaran Kualitas Kredit Kol 1 (Lancar), Kol 2 (DPK), dan Kol 3-5 (NPL)"
                : pivotMode === "produk"
                ? "Sumbu Kolom: Komposisi Volume & Debitur Kapuas Plus vs Kuserna"
                : "Sumbu Kolom: Tren Historis NPL 5 Tahun Terakhir (2020 s.d. 2024)"}
            </p>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
            Klik baris untuk <i>Drill-Down</i> rincian cabang
          </span>
        </div>

        <div className="overflow-x-auto max-h-[420px] overflow-y-auto pr-1">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[var(--surface-box)] text-[11px] uppercase font-bold text-slate-400 border-b border-white/10 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Entitas Geografis</th>
                <th className="py-3 px-4 text-right">Penyaluran (Rp M)</th>
                <th className="py-3 px-4 text-right">Debitur</th>
                <th className="py-3 px-4 text-right">NPL (%)</th>

                {/* DYNAMIC PIVOT COLUMNS */}
                {pivotMode === "kolektibilitas" && (
                  <>
                    <th className="py-3 px-4 text-right text-emerald-400">Kol 1 Lancar (%)</th>
                    <th className="py-3 px-4 text-right text-amber-400">Kol 2 DPK (%)</th>
                    <th className="py-3 px-4 text-right text-rose-400 rounded-r-xl">Kol 3-5 NPL (%)</th>
                  </>
                )}

                {pivotMode === "produk" && (
                  <>
                    <th className="py-3 px-4 text-right text-blue-400">Kapuas Plus (Rp M)</th>
                    <th className="py-3 px-4 text-right text-cyan-400 rounded-r-xl">Kuserna (Rp M)</th>
                  </>
                )}

                {pivotMode === "historis" && (
                  <>
                    <th className="py-3 px-4 text-right">2020</th>
                    <th className="py-3 px-4 text-right">2021</th>
                    <th className="py-3 px-4 text-right">2022</th>
                    <th className="py-3 px-4 text-right">2023</th>
                    <th className="py-3 px-4 text-right text-cyan-400 rounded-r-xl">2024</th>
                  </>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 font-medium">
              {/* LEVEL WILAYAH (ROLL-UP) */}
              {hierarchyLevel === "wilayah" &&
                wilayahAggregated.map((w, idx) => {
                  const isExpanded = expandedRow === w.wilayah;
                  return (
                    <React.Fragment key={idx}>
                      <tr
                        onClick={() => setExpandedRow(isExpanded ? null : w.wilayah)}
                        className="hover:bg-white/5 transition-colors cursor-pointer bg-slate-900/30 font-semibold"
                      >
                        <td className="py-3 px-4 text-white flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-blue-400 shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                          )}
                          <span>{w.wilayah}</span>
                          <span className="text-[10px] text-slate-500 font-normal">
                            ({w.cabangList.length} Cabang)
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-white">
                          Rp {formatNumber(w.totalPenyaluranMiliar, 1)}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-300">
                          {formatNumber(w.totalDebitur, 0)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-cyan-400">
                          {formatPercent(w.nplPercent, 2)}
                        </td>

                        {pivotMode === "kolektibilitas" && (
                          <>
                            <td className="py-3 px-4 text-right text-emerald-400">{formatPercent(w.kol1Percent, 1)}</td>
                            <td className="py-3 px-4 text-right text-amber-400">{formatPercent(w.kol2Percent, 1)}</td>
                            <td className="py-3 px-4 text-right text-rose-400 font-bold">{formatPercent(w.kolNplPercent, 2)}</td>
                          </>
                        )}

                        {pivotMode === "produk" && (
                          <>
                            <td className="py-3 px-4 text-right text-blue-400">Rp {formatNumber(w.kapuasPenyaluran, 1)}</td>
                            <td className="py-3 px-4 text-right text-cyan-400">Rp {formatNumber(w.kusernaPenyaluran, 1)}</td>
                          </>
                        )}

                        {pivotMode === "historis" && (
                          <>
                            <td className="py-3 px-4 text-right text-slate-400">{formatPercent(w.npl2020, 2)}</td>
                            <td className="py-3 px-4 text-right text-slate-400">{formatPercent(w.npl2021, 2)}</td>
                            <td className="py-3 px-4 text-right text-slate-400">{formatPercent(w.npl2022, 2)}</td>
                            <td className="py-3 px-4 text-right text-slate-400">{formatPercent(w.npl2023, 2)}</td>
                            <td className="py-3 px-4 text-right text-cyan-400 font-bold">{formatPercent(w.npl2024, 2)}</td>
                          </>
                        )}
                      </tr>

                      {/* DRILL-DOWN SUB-ROWS (CABANG INSIDE EXPANDED WILAYAH) */}
                      {isExpanded &&
                        w.cabangList.map((c, cIdx) => (
                          <tr key={`sub-${cIdx}`} className="bg-[#0B0F19]/60 hover:bg-white/5 text-slate-300 text-[11px]">
                            <td className="py-2 px-8 text-slate-200 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              <span>{c.nama}</span>
                            </td>
                            <td className="py-2 px-4 text-right">Rp {formatNumber(c.totalPenyaluranMiliar, 1)}</td>
                            <td className="py-2 px-4 text-right text-slate-400">{formatNumber(c.totalDebitur, 0)}</td>
                            <td className="py-2 px-4 text-right font-semibold text-cyan-300">{formatPercent(c.nplPercent, 2)}</td>

                            {pivotMode === "kolektibilitas" && (
                              <>
                                <td className="py-2 px-4 text-right text-emerald-400">{formatPercent(c.kol1Percent, 1)}</td>
                                <td className="py-2 px-4 text-right text-amber-400">{formatPercent(c.kol2Percent, 1)}</td>
                                <td className="py-2 px-4 text-right text-rose-400">{formatPercent(c.kolNplPercent, 2)}</td>
                              </>
                            )}

                            {pivotMode === "produk" && (
                              <>
                                <td className="py-2 px-4 text-right text-blue-400">Rp {formatNumber(c.kapuasPlusPenyaluran, 1)}</td>
                                <td className="py-2 px-4 text-right text-cyan-400">Rp {formatNumber(c.kusernaPenyaluran, 1)}</td>
                              </>
                            )}

                            {pivotMode === "historis" && (
                              <>
                                <td className="py-2 px-4 text-right text-slate-500">{formatPercent(c.npl2020, 2)}</td>
                                <td className="py-2 px-4 text-right text-slate-500">{formatPercent(c.npl2021, 2)}</td>
                                <td className="py-2 px-4 text-right text-slate-500">{formatPercent(c.npl2022, 2)}</td>
                                <td className="py-2 px-4 text-right text-slate-500">{formatPercent(c.npl2023, 2)}</td>
                                <td className="py-2 px-4 text-right text-cyan-400">{formatPercent(c.npl2024, 2)}</td>
                              </>
                            )}
                          </tr>
                        ))}
                    </React.Fragment>
                  );
                })}

              {/* LEVEL GRANULAR (19 CABANG) */}
              {hierarchyLevel === "cabang" &&
                filteredCube.map((c, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-4 font-semibold text-white">{c.nama}</td>
                    <td className="py-2.5 px-4 text-right font-bold text-white">
                      Rp {formatNumber(c.totalPenyaluranMiliar, 1)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-300">
                      {formatNumber(c.totalDebitur, 0)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-cyan-400">
                      {formatPercent(c.nplPercent, 2)}
                    </td>

                    {pivotMode === "kolektibilitas" && (
                      <>
                        <td className="py-2.5 px-4 text-right text-emerald-400">{formatPercent(c.kol1Percent, 1)}</td>
                        <td className="py-2.5 px-4 text-right text-amber-400">{formatPercent(c.kol2Percent, 1)}</td>
                        <td className="py-2.5 px-4 text-right text-rose-400 font-bold">{formatPercent(c.kolNplPercent, 2)}</td>
                      </>
                    )}

                    {pivotMode === "produk" && (
                      <>
                        <td className="py-2.5 px-4 text-right text-blue-400">Rp {formatNumber(c.kapuasPlusPenyaluran, 1)}</td>
                        <td className="py-2.5 px-4 text-right text-cyan-400">Rp {formatNumber(c.kusernaPenyaluran, 1)}</td>
                      </>
                    )}

                    {pivotMode === "historis" && (
                      <>
                        <td className="py-2.5 px-4 text-right text-slate-400">{formatPercent(c.npl2020, 2)}</td>
                        <td className="py-2.5 px-4 text-right text-slate-400">{formatPercent(c.npl2021, 2)}</td>
                        <td className="py-2.5 px-4 text-right text-slate-400">{formatPercent(c.npl2022, 2)}</td>
                        <td className="py-2.5 px-4 text-right text-slate-400">{formatPercent(c.npl2023, 2)}</td>
                        <td className="py-2.5 px-4 text-right text-cyan-400 font-bold">{formatPercent(c.npl2024, 2)}</td>
                      </>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VISUAL CHARTS AGGREGATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Comparison Bar Chart */}
        <div className="lg:col-span-8 glass-card rounded-2xl p-5 space-y-3">
          <div className="border-b border-white/5 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              Perbandingan Penyaluran Kredit & Rasio NPL
            </h3>
            <p className="text-xs text-slate-400">
              Visualisasi volume penyaluran (Rp Triliun) dan kualitas risiko kredit
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={{ stroke: "#1E293B" }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#64748B" }} unit=" T" axisLine={{ stroke: "#1E293B" }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#64748B" }} unit="%" domain={[0, 4]} axisLine={{ stroke: "#1E293B" }} />
                <Tooltip
                  formatter={(val, name) => [
                    name === "Penyaluran" ? `Rp ${val} Triliun` : `${val}%`,
                    name === "Penyaluran" ? "Total Penyaluran" : "Rasio NPL",
                  ]}
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#F8FAFC",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", color: "#94A3B8" }} />
                <Bar yAxisId="left" dataKey="penyaluran" name="Penyaluran" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="npl" name="NPL (%)" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Share Donut Chart */}
        <div className="lg:col-span-4 glass-card rounded-2xl p-5 space-y-3">
          <div className="border-b border-white/5 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-cyan-400" />
              Porsi Portofolio Produk
            </h3>
            <p className="text-xs text-slate-400">
              Kapuas Plus vs Kuserna
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieCompositionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
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
                    backgroundColor: "#0F172A",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#F8FAFC",
                    fontSize: "12px",
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "10px", color: "#94A3B8" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* EXECUTIVE INSIGHT & METHODOLOGY NOTE */}
      <div className="glass-card rounded-2xl p-4 text-xs text-slate-300 leading-relaxed border-l-4 border-cyan-500 space-y-1">
        <span className="font-bold text-white flex items-center gap-1.5">
          <Info className="w-4 h-4 text-cyan-400" />
          Wawasan Manajerial OLAP (PT Bina Area Persada & Bank Kalbar):
        </span>
        <p>
          Melalui operasi <b>Slice</b> pada produk <i>Kapuas Plus (ASN Pra-Pensiun)</i>, portofolio menunjukkan kualitas kredit prima dengan NPL rata-rata <b>1,58%</b>. Sementara operasi <b>Drill-down</b> pada <i>Wilayah IV (Ketapang & Selatan)</i> menunjukkan konsentrasi pembiayaan sebesar Rp 1,48 T yang memerlukan pemantauan ketat pada sektor perkebunan kelapa sawit guna menjaga ketahanan kredit.
        </p>
      </div>
    </div>
  );
}
