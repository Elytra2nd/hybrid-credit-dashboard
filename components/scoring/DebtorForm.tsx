"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  UserCheck,
  Calendar,
  Layers,
  Sparkles,
  Calculator,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { DebtorInputPayload } from "@/types";
import { formatRupiah, formatPercent } from "@/lib/utils";

interface DebtorFormProps {
  formData: DebtorInputPayload;
  onChange: (data: DebtorInputPayload) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  onApplyPreset: (type: "prime" | "risky") => void;
}

export default function DebtorForm({
  formData,
  onChange,
  onSubmit,
  loading,
}: DebtorFormProps) {
  const isKapuasPlus = formData.jenis_produk === "Kapuas Plus (Kredit ASN)";
  const isKuserna = formData.jenis_produk === "Kuserna (Serbaguna)";

  // Internal interactive state
  const [tanggalLahir, setTanggalLahir] = useState<string>("1970-02-08");
  const [bup, setBup] = useState<number>(58);
  const [plafon1Pemohon, setPlafon1Pemohon] = useState<number>(120000000);
  const [plafon2Pemohon, setPlafon2Pemohon] = useState<number>(0);
  const [bulanRitensi, setBulanRitensi] = useState<number>(21);
  const [pelunasan1, setPelunasan1] = useState<number>(0);

  // Auto calculate age
  const usiaDisplay = useMemo(() => {
    if (!tanggalLahir) return 56;
    const birth = new Date(tanggalLahir);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return Math.max(21, Math.min(75, age));
  }, [tanggalLahir]);

  // Sync auto age to parent
  useEffect(() => {
    if (formData.usia !== usiaDisplay) {
      onChange({ ...formData, usia: usiaDisplay });
    }
  }, [usiaDisplay]);

  // Real-time Kapuas Plus mathematical engine
  const kapuasResult = useMemo(() => {
    if (!isKapuasPlus) return null;

    const rateTahunan = 0.125;
    const rateBulanan = rateTahunan / 12;

    const sisaBulanAktif = Math.max(12, (bup - usiaDisplay) * 12);
    const tenorPensiun = Math.min(180, 240 - sisaBulanAktif);

    const angsuranPlafon1 =
      tenorPensiun > 0
        ? (plafon1Pemohon * rateBulanan) / (1 - Math.pow(1 + rateBulanan, -tenorPensiun))
        : 0;

    const angsuranPlafon2 =
      sisaBulanAktif > 0 && plafon2Pemohon > 0
        ? (plafon2Pemohon * rateBulanan) / (1 - Math.pow(1 + rateBulanan, -sisaBulanAktif))
        : 0;

    const totalAngsuranAktif = angsuranPlafon1 + angsuranPlafon2;
    const dtiAktif = formData.gaji_bersih_aktif > 0 ? totalAngsuranAktif / formData.gaji_bersih_aktif : 0.35;

    const totalPlafon = plafon1Pemohon + plafon2Pemohon;
    const ritensiNominal = angsuranPlafon1 * (bulanRitensi || 21);
    const biayaAdminAsuransi = totalPlafon * 0.035;
    const pencairanDiterima = Math.max(0, totalPlafon - ritensiNominal - pelunasan1 - biayaAdminAsuransi);

    return {
      tenorPensiunBulan: tenorPensiun,
      sisaBulanAktif: sisaBulanAktif,
      angsuranPlafon1: angsuranPlafon1,
      angsuranPlafon2: angsuranPlafon2,
      totalAngsuranAktif: totalAngsuranAktif,
      dtiAktifRatio: dtiAktif,
      totalPlafonKredit: totalPlafon,
      totalPencairanDiterima: pencairanDiterima,
    };
  }, [isKapuasPlus, bup, usiaDisplay, plafon1Pemohon, plafon2Pemohon, bulanRitensi, pelunasan1, formData.gaji_bersih_aktif]);

  // Real-time Kuserna mathematical engine
  const kusernaResult = useMemo(() => {
    if (!isKuserna) return null;

    const usiaMaksimal = 75;
    const sisaTahun = Math.max(1, usiaMaksimal - usiaDisplay);
    const tenorMaksimalBulan = Math.min(180, sisaTahun * 12);

    const rateTahunan = 0.115;
    const rateBulanan = rateTahunan / 12;

    const angsuran =
      tenorMaksimalBulan > 0 && formData.plafon_diminta > 0
        ? (formData.plafon_diminta * rateBulanan) / (1 - Math.pow(1 + rateBulanan, -tenorMaksimalBulan))
        : 0;

    const dti = formData.estimasi_gaji_pensiun > 0 ? angsuran / formData.estimasi_gaji_pensiun : 0.35;
    const biayaAdminAsuransi = formData.plafon_diminta * 0.03;
    const pencairanDiterima = Math.max(0, formData.plafon_diminta - pelunasan1 - biayaAdminAsuransi);

    return {
      tenorMaksimalBulan: tenorMaksimalBulan,
      angsuranBulanan: angsuran,
      dtiRatio: dti,
      plafonTerpakai: formData.plafon_diminta,
      totalPencairanDiterima: pencairanDiterima,
    };
  }, [isKuserna, usiaDisplay, formData.plafon_diminta, formData.estimasi_gaji_pensiun, pelunasan1]);

  // Sync computed DTI and Tenor to parent form payload
  useEffect(() => {
    if (isKapuasPlus && kapuasResult) {
      if (
        formData.dti_ratio !== kapuasResult.dtiAktifRatio ||
        formData.tenor !== kapuasResult.tenorPensiunBulan ||
        formData.plafon_diminta !== kapuasResult.totalPlafonKredit
      ) {
        onChange({
          ...formData,
          dti_ratio: parseFloat(kapuasResult.dtiAktifRatio.toFixed(4)),
          tenor: kapuasResult.tenorPensiunBulan,
          plafon_diminta: kapuasResult.totalPlafonKredit,
        });
      }
    } else if (isKuserna && kusernaResult) {
      if (
        formData.dti_ratio !== kusernaResult.dtiRatio ||
        formData.tenor !== kusernaResult.tenorMaksimalBulan
      ) {
        onChange({
          ...formData,
          dti_ratio: parseFloat(kusernaResult.dtiRatio.toFixed(4)),
          tenor: kusernaResult.tenorMaksimalBulan,
        });
      }
    }
  }, [kapuasResult, kusernaResult]);

  const handleProductChange = (prod: "Kapuas Plus (Kredit ASN)" | "Kuserna (Serbaguna)") => {
    if (prod === "Kapuas Plus (Kredit ASN)") {
      setBup(58);
      setPlafon1Pemohon(120000000);
      setPlafon2Pemohon(0);
      setBulanRitensi(21);
      setTanggalLahir("1970-02-08");
      onChange({
        ...formData,
        jenis_produk: prod,
        jenis_pekerjaan: "PNS / ASN",
        gaji_bersih_aktif: 5923400,
        estimasi_gaji_pensiun: 4200000,
        plafon_diminta: 120000000,
        top_up: false,
      });
    } else {
      setBulanRitensi(4);
      setTanggalLahir("1965-09-30");
      onChange({
        ...formData,
        jenis_produk: prod,
        jenis_pekerjaan: "Pensiunan",
        estimasi_gaji_pensiun: 4400000,
        gaji_bersih_aktif: 0,
        plafon_diminta: 100000000,
        top_up: false,
      });
    }
  };

  const applyProductPreset = (type: "prime" | "max_excel" | "risky") => {
    if (isKapuasPlus) {
      if (type === "prime") {
        setTanggalLahir("1970-02-08");
        setBup(58);
        setPlafon1Pemohon(120000000);
        setPlafon2Pemohon(0);
        setBulanRitensi(21);
        setPelunasan1(0);
        onChange({
          ...formData,
          jenis_produk: "Kapuas Plus (Kredit ASN)",
          jenis_pekerjaan: "PNS / ASN",
          gaji_bersih_aktif: 5923400,
          estimasi_gaji_pensiun: 4200000,
          plafon_diminta: 120000000,
          top_up: false,
        });
      } else if (type === "max_excel") {
        setTanggalLahir("1970-02-08");
        setBup(58);
        setPlafon1Pemohon(337000000);
        setPlafon2Pemohon(34000000);
        setBulanRitensi(21);
        setPelunasan1(0);
        onChange({
          ...formData,
          jenis_produk: "Kapuas Plus (Kredit ASN)",
          jenis_pekerjaan: "PNS / ASN",
          gaji_bersih_aktif: 5923400,
          estimasi_gaji_pensiun: 4200000,
          plafon_diminta: 371000000,
          top_up: false,
        });
      } else {
        setTanggalLahir("1996-03-12");
        setBup(58);
        setPlafon1Pemohon(250000000);
        setPlafon2Pemohon(100000000);
        setBulanRitensi(21);
        onChange({
          ...formData,
          jenis_produk: "Kapuas Plus (Kredit ASN)",
          jenis_pekerjaan: "PNS / ASN",
          gaji_bersih_aktif: 3800000,
          estimasi_gaji_pensiun: 1800000,
          plafon_diminta: 350000000,
          top_up: true,
        });
      }
    } else {
      if (type === "prime") {
        setTanggalLahir("1965-09-30");
        setBulanRitensi(4);
        setPelunasan1(0);
        onChange({
          ...formData,
          jenis_produk: "Kuserna (Serbaguna)",
          jenis_pekerjaan: "Pensiunan",
          estimasi_gaji_pensiun: 4400000,
          gaji_bersih_aktif: 0,
          plafon_diminta: 100000000,
          top_up: false,
        });
      } else if (type === "max_excel") {
        setTanggalLahir("1965-09-30");
        setBulanRitensi(4);
        setPelunasan1(0);
        onChange({
          ...formData,
          jenis_produk: "Kuserna (Serbaguna)",
          jenis_pekerjaan: "Pensiunan",
          estimasi_gaji_pensiun: 4400000,
          gaji_bersih_aktif: 0,
          plafon_diminta: 321000000,
          top_up: false,
        });
      } else {
        setTanggalLahir("1953-04-18");
        setBulanRitensi(4);
        onChange({
          ...formData,
          jenis_produk: "Kuserna (Serbaguna)",
          jenis_pekerjaan: "Pensiunan",
          estimasi_gaji_pensiun: 2200000,
          gaji_bersih_aktif: 0,
          plafon_diminta: 180000000,
          top_up: true,
        });
      }
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Header & Product Switcher */}
      <div className="border-b border-slate-200 dark:border-white/5 pb-3 space-y-3">
        {/* Title row */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 whitespace-nowrap">
            <UserCheck className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
            Profil Calon Debitur
          </h3>
          <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20 whitespace-nowrap">
            Input Simulasi
          </span>
        </div>

        {/* Preset quick buttons - Clean 3-column Grid (No Overflow) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-500 dark:text-blue-400" />
              Pilihan Preset Cepat:
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => applyProductPreset("prime")}
              className="text-[10.5px] font-bold px-2 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-1 transition shadow-sm"
              title="Preset Pinjaman Prima Sehat (DTI ~23% -> Disetujui)"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">Prima (Aman)</span>
            </button>

            <button
              type="button"
              onClick={() => applyProductPreset("max_excel")}
              className="text-[10.5px] font-bold px-2 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center justify-center gap-1 transition shadow-sm"
              title="Preset Plafon Maksimal Batas Excel (USEB / TIKA)"
            >
              <span className="truncate">Plafon Max</span>
            </button>

            <button
              type="button"
              onClick={() => applyProductPreset("risky")}
              className="text-[10.5px] font-bold px-2 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 flex items-center justify-center gap-1 transition shadow-sm"
              title="Preset Pinjaman Berisiko Tinggi"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="truncate">Risiko Tinggi</span>
            </button>
          </div>
        </div>

        {/* Product Type Tabs - High Contrast in Light & Dark Modes */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => handleProductChange("Kapuas Plus (Kredit ASN)")}
            className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition ${
              isKapuasPlus
                ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/25"
                : "bg-slate-100 dark:bg-slate-900/60 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-200/70 dark:hover:bg-white/5"
            }`}
          >
            <Layers className={`w-3.5 h-3.5 ${isKapuasPlus ? "text-white" : "text-blue-500 dark:text-blue-400"}`} />
            <span>Kapuas Plus (ASN)</span>
          </button>

          <button
            type="button"
            onClick={() => handleProductChange("Kuserna (Serbaguna)")}
            className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition ${
              isKuserna
                ? "bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-500/25"
                : "bg-slate-100 dark:bg-slate-900/60 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-200/70 dark:hover:bg-white/5"
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isKuserna ? "text-white" : "text-cyan-500 dark:text-cyan-400"}`} />
            <span>Kuserna (Pensiun)</span>
          </button>
        </div>
      </div>

      {/* Form Controls */}
      <form onSubmit={onSubmit} className="space-y-3 text-xs">
        {/* Tanggal Lahir */}
        <div className="p-3 bg-slate-50 dark:bg-[#0B0F19]/80 border border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-between gap-3">
          <div className="flex-1">
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1 mb-1">
              <Calendar className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              Tanggal Lahir Nasabah
            </label>
            <input
              type="date"
              value={tanggalLahir}
              onChange={(e) => setTanggalLahir(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-[#131B2E] border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:outline-none transition"
              required
            />
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Usia Auto:</span>
            <span className="font-bold text-cyan-600 dark:text-cyan-400 text-xs">{usiaDisplay} Thn</span>
          </div>
        </div>

        {/* KAPUAS PLUS DUAL STAGE */}
        {isKapuasPlus && (
          <div className="p-3 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/20 rounded-xl space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-700 dark:text-slate-300 block mb-1 font-medium">Batas Usia Pensiun (BUP)</label>
                <select
                  value={bup}
                  onChange={(e) => setBup(parseInt(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-[#131B2E] border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
                >
                  <option value={58} className="bg-white dark:bg-[#0F172A]">58 Thn (Staff ASN)</option>
                  <option value={60} className="bg-white dark:bg-[#0F172A]">60 Thn (Pejabat)</option>
                  <option value={65} className="bg-white dark:bg-[#0F172A]">65 Thn (Fungsional)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-700 dark:text-slate-300 block mb-1 font-medium">Gaji Bersih Aktif (Rp)</label>
                <input
                  type="number"
                  step="50000"
                  value={formData.gaji_bersih_aktif}
                  onChange={(e) => onChange({ ...formData, gaji_bersih_aktif: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-[#131B2E] border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-700 dark:text-slate-300 block mb-1 font-medium">Estimasi Gaji Pensiun (Rp)</label>
              <input
                type="number"
                step="50000"
                value={formData.estimasi_gaji_pensiun}
                onChange={(e) => onChange({ ...formData, estimasi_gaji_pensiun: parseFloat(e.target.value) || 0 })}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-[#131B2E] border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-700 dark:text-slate-300 block mb-1 font-medium">Plafon 1 (Fase Pensiun)</label>
                <input
                  type="number"
                  step="1000000"
                  value={plafon1Pemohon}
                  onChange={(e) => setPlafon1Pemohon(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-[#131B2E] border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-700 dark:text-slate-300 block mb-1 font-medium">Plafon 2 (Tambahan Aktif)</label>
                <input
                  type="number"
                  step="1000000"
                  value={plafon2Pemohon}
                  onChange={(e) => setPlafon2Pemohon(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-[#131B2E] border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* KUSERNA SINGLE STAGE */}
        {isKuserna && (
          <div className="p-3 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 rounded-xl space-y-2.5">
            <div>
              <label className="text-[11px] text-slate-700 dark:text-slate-300 block mb-1 font-medium">Gaji Pensiun Bulanan (Rp)</label>
              <input
                type="number"
                step="50000"
                value={formData.estimasi_gaji_pensiun}
                onChange={(e) =>
                  onChange({
                    ...formData,
                    estimasi_gaji_pensiun: parseFloat(e.target.value) || 0,
                    gaji_bersih_aktif: 0,
                  })
                }
                className="w-full px-2.5 py-1.5 bg-white dark:bg-[#131B2E] border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-700 dark:text-slate-300 block mb-1 font-medium">Plafon Pinjaman Diminta (Rp)</label>
              <input
                type="number"
                step="1000000"
                value={formData.plafon_diminta}
                onChange={(e) => onChange({ ...formData, plafon_diminta: parseFloat(e.target.value) || 0 })}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-[#131B2E] border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
                required
              />
            </div>
          </div>
        )}

        {/* Ritensi & Pelunasan */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1 font-medium">Ritensi (Bln)</label>
            <input
              type="number"
              value={bulanRitensi}
              onChange={(e) => setBulanRitensi(parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1.5 bg-white dark:bg-[#131B2E] border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
            />
          </div>
          <div className="col-span-2">
            <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1 font-medium">Take Over / Pelunasan (Rp)</label>
            <input
              type="number"
              step="1000000"
              value={pelunasan1}
              onChange={(e) => setPelunasan1(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-[#131B2E] border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
            />
          </div>
        </div>

        {/* Live Calculation Output Card */}
        {isKapuasPlus && kapuasResult && (
          <div className="p-3 bg-blue-50/80 dark:bg-[#0B0F19]/90 border border-blue-200 dark:border-blue-500/30 rounded-xl space-y-1.5 text-[11px]">
            <p className="font-bold text-blue-600 dark:text-blue-400 border-b border-slate-200 dark:border-white/10 pb-1 flex justify-between">
              <span>Simulasi Kapuas Plus:</span>
              <span className="text-slate-900 dark:text-white font-semibold">Tenor {kapuasResult.tenorPensiunBulan} Bln</span>
            </p>
            <div className="flex justify-between text-slate-700 dark:text-slate-300">
              <span>Total Plafon:</span>
              <span className="font-bold text-blue-600 dark:text-cyan-300">{formatRupiah(kapuasResult.totalPlafonKredit)}</span>
            </div>
            <div className="flex justify-between text-slate-700 dark:text-slate-300">
              <span>Angsuran Aktif / Bln:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatRupiah(kapuasResult.totalAngsuranAktif)}</span>
            </div>
            <div className="flex justify-between text-slate-700 dark:text-slate-300 items-center">
              <span>Rasio Beban Utang (DTI):</span>
              <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                kapuasResult.dtiAktifRatio <= 0.38
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                  : kapuasResult.dtiAktifRatio <= 0.50
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                  : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30"
              }`}>
                {formatPercent(kapuasResult.dtiAktifRatio * 100, 1)} {kapuasResult.dtiAktifRatio <= 0.38 ? "(Aman & Sehat)" : "(Tinggi)"}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-white/10 font-bold">
              <span className="text-slate-700 dark:text-slate-300">Pencairan Diterima:</span>
              <span className="text-emerald-600 dark:text-emerald-400">{formatRupiah(kapuasResult.totalPencairanDiterima)}</span>
            </div>
          </div>
        )}

        {isKuserna && kusernaResult && (
          <div className="p-3 bg-amber-50/80 dark:bg-[#0B0F19]/90 border border-amber-200 dark:border-amber-500/30 rounded-xl space-y-1.5 text-[11px]">
            <p className="font-bold text-amber-600 dark:text-amber-400 border-b border-slate-200 dark:border-white/10 pb-1 flex justify-between">
              <span>Simulasi Kuserna:</span>
              <span className="text-slate-900 dark:text-white font-semibold">Tenor {kusernaResult.tenorMaksimalBulan} Bln</span>
            </p>
            <div className="flex justify-between text-slate-700 dark:text-slate-300">
              <span>Plafon Pinjaman:</span>
              <span className="font-bold text-amber-600 dark:text-amber-300">{formatRupiah(kusernaResult.plafonTerpakai)}</span>
            </div>
            <div className="flex justify-between text-slate-700 dark:text-slate-300">
              <span>Angsuran Pensiun:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatRupiah(kusernaResult.angsuranBulanan)}</span>
            </div>
            <div className="flex justify-between text-slate-700 dark:text-slate-300 items-center">
              <span>Rasio Beban Utang (DTI):</span>
              <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                kusernaResult.dtiRatio <= 0.38
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                  : kusernaResult.dtiRatio <= 0.50
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                  : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30"
              }`}>
                {formatPercent(kusernaResult.dtiRatio * 100, 1)} {kusernaResult.dtiRatio <= 0.38 ? "(Aman & Sehat)" : "(Tinggi)"}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-white/10 font-bold">
              <span className="text-slate-700 dark:text-slate-300">Pencairan Diterima:</span>
              <span className="text-emerald-600 dark:text-emerald-400">{formatRupiah(kusernaResult.totalPencairanDiterima)}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 text-xs"
        >
          {loading ? (
            <span>Menghitung Skor...</span>
          ) : (
            <>
              <Calculator className="w-4 h-4" />
              <span>Hitung Skor Kredit FICO Hibrida</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
