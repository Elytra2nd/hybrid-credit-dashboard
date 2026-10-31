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
  CreditCard,
} from "lucide-react";
import { DebtorInputPayload } from "@/types";
import { formatRupiah, formatPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface DebtorFormProps {
  formData: DebtorInputPayload;
  onChange: (data: DebtorInputPayload) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  onApplyPreset: (type: "prime" | "risky") => void;
}

const inputBase =
  "w-full px-3 py-2 min-h-10 sm:min-h-8 bg-[var(--surface-input)] border border-[var(--card-border)] rounded-md text-[var(--text-primary)] text-base sm:text-xs focus:outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10 transition";

export default function DebtorForm({
  formData,
  onChange,
  onSubmit,
  loading,
}: DebtorFormProps) {
  const isKapuasPlus = formData.jenis_produk === "Kapuas Plus (Kredit ASN)";
  const isKuserna    = formData.jenis_produk === "Kuserna (Serbaguna)";

  const [tanggalLahir, setTanggalLahir] = useState<string>("1970-02-08");
  const [bup, setBup] = useState<number>(58);
  const [plafon1Pemohon, setPlafon1Pemohon] = useState<number>(120000000);
  const [plafon2Pemohon, setPlafon2Pemohon] = useState<number>(0);
  const [bulanRitensi, setBulanRitensi] = useState<number>(21);
  const [pelunasan1, setPelunasan1] = useState<number>(0);

  const usiaDisplay = useMemo(() => {
    if (!tanggalLahir) return 56;
    const birth = new Date(tanggalLahir);
    const now   = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return Math.max(21, Math.min(75, age));
  }, [tanggalLahir]);

  useEffect(() => {
    if (formData.usia !== usiaDisplay) {
      onChange({ ...formData, usia: usiaDisplay });
    }
  }, [usiaDisplay]);

  const kapuasResult = useMemo(() => {
    if (!isKapuasPlus) return null;
    const rateBulanan = 0.125 / 12;
    const sisaBulanAktif  = Math.max(12, (bup - usiaDisplay) * 12);
    const tenorPensiun    = Math.max(1, Math.min(180, 240 - sisaBulanAktif));
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
    const ritensiNominal    = angsuranPlafon1 * (bulanRitensi || 21);
    const biayaAdminAsuransi = totalPlafon * 0.035;
    const pencairanDiterima = Math.max(0, totalPlafon - ritensiNominal - pelunasan1 - biayaAdminAsuransi);
    return { tenorPensiunBulan: tenorPensiun, sisaBulanAktif, angsuranPlafon1, angsuranPlafon2, totalAngsuranAktif, dtiAktifRatio: dtiAktif, totalPlafonKredit: totalPlafon, totalPencairanDiterima: pencairanDiterima };
  }, [isKapuasPlus, bup, usiaDisplay, plafon1Pemohon, plafon2Pemohon, bulanRitensi, pelunasan1, formData.gaji_bersih_aktif]);

  const kusernaResult = useMemo(() => {
    if (!isKuserna) return null;
    const sisaTahun = Math.max(1, 75 - usiaDisplay);
    const tenorMaksimalBulan = Math.min(180, sisaTahun * 12);
    const rateBulanan = 0.115 / 12;
    const angsuran =
      tenorMaksimalBulan > 0 && formData.plafon_diminta > 0
        ? (formData.plafon_diminta * rateBulanan) / (1 - Math.pow(1 + rateBulanan, -tenorMaksimalBulan))
        : 0;
    const dti = formData.estimasi_gaji_pensiun > 0 ? angsuran / formData.estimasi_gaji_pensiun : 0.35;
    const biayaAdminAsuransi = formData.plafon_diminta * 0.03;
    const pencairanDiterima  = Math.max(0, formData.plafon_diminta - pelunasan1 - biayaAdminAsuransi);
    return { tenorMaksimalBulan, angsuranBulanan: angsuran, dtiRatio: dti, plafonTerpakai: formData.plafon_diminta, totalPencairanDiterima: pencairanDiterima };
  }, [isKuserna, usiaDisplay, formData.plafon_diminta, formData.estimasi_gaji_pensiun, pelunasan1]);

  useEffect(() => {
    if (isKapuasPlus && kapuasResult) {
      const safeDti   = Math.min(0.95, Math.max(0.01, parseFloat(kapuasResult.dtiAktifRatio.toFixed(4))));
      const safeTenor = Math.max(1, Math.min(360, kapuasResult.tenorPensiunBulan));
      if (formData.dti_ratio !== safeDti || formData.tenor !== safeTenor || formData.plafon_diminta !== kapuasResult.totalPlafonKredit) {
        onChange({ ...formData, dti_ratio: safeDti, tenor: safeTenor, plafon_diminta: kapuasResult.totalPlafonKredit });
      }
    } else if (isKuserna && kusernaResult) {
      const safeDti   = Math.min(0.95, Math.max(0.01, parseFloat(kusernaResult.dtiRatio.toFixed(4))));
      const safeTenor = Math.max(1, Math.min(360, kusernaResult.tenorMaksimalBulan));
      if (formData.dti_ratio !== safeDti || formData.tenor !== safeTenor) {
        onChange({ ...formData, dti_ratio: safeDti, tenor: safeTenor });
      }
    }
  }, [kapuasResult, kusernaResult]);

  const handleProductChange = (prod: "Kapuas Plus (Kredit ASN)" | "Kuserna (Serbaguna)") => {
    if (prod === "Kapuas Plus (Kredit ASN)") {
      setBup(58); setPlafon1Pemohon(120000000); setPlafon2Pemohon(0); setBulanRitensi(21); setTanggalLahir("1970-02-08");
      onChange({ ...formData, jenis_produk: prod, jenis_pekerjaan: "PNS / ASN", gaji_bersih_aktif: 5923400, estimasi_gaji_pensiun: 4200000, plafon_diminta: 120000000, top_up: false });
    } else {
      setBulanRitensi(4); setTanggalLahir("1965-09-30");
      onChange({ ...formData, jenis_produk: prod, jenis_pekerjaan: "Pensiunan", estimasi_gaji_pensiun: 4400000, gaji_bersih_aktif: 0, plafon_diminta: 100000000, top_up: false });
    }
  };

  const applyProductPreset = (type: "prime" | "max_excel" | "risky") => {
    if (isKapuasPlus) {
      if (type === "prime") {
        setTanggalLahir("1970-02-08"); setBup(58); setPlafon1Pemohon(120000000); setPlafon2Pemohon(0); setBulanRitensi(21); setPelunasan1(0);
        onChange({ ...formData, jenis_produk: "Kapuas Plus (Kredit ASN)", jenis_pekerjaan: "PNS / ASN", gaji_bersih_aktif: 5923400, estimasi_gaji_pensiun: 4200000, plafon_diminta: 120000000, top_up: false });
      } else if (type === "max_excel") {
        setTanggalLahir("1970-02-08"); setBup(58); setPlafon1Pemohon(337000000); setPlafon2Pemohon(34000000); setBulanRitensi(21); setPelunasan1(0);
        onChange({ ...formData, jenis_produk: "Kapuas Plus (Kredit ASN)", jenis_pekerjaan: "PNS / ASN", gaji_bersih_aktif: 5923400, estimasi_gaji_pensiun: 4200000, plafon_diminta: 371000000, top_up: false });
      } else {
        setTanggalLahir("1996-03-12"); setBup(58); setPlafon1Pemohon(250000000); setPlafon2Pemohon(100000000); setBulanRitensi(21);
        onChange({ ...formData, jenis_produk: "Kapuas Plus (Kredit ASN)", jenis_pekerjaan: "PNS / ASN", gaji_bersih_aktif: 3800000, estimasi_gaji_pensiun: 1800000, plafon_diminta: 350000000, top_up: true });
      }
    } else {
      if (type === "prime") {
        setTanggalLahir("1965-09-30"); setBulanRitensi(4); setPelunasan1(0);
        onChange({ ...formData, jenis_produk: "Kuserna (Serbaguna)", jenis_pekerjaan: "Pensiunan", estimasi_gaji_pensiun: 4400000, gaji_bersih_aktif: 0, plafon_diminta: 100000000, top_up: false });
      } else if (type === "max_excel") {
        setTanggalLahir("1965-09-30"); setBulanRitensi(4); setPelunasan1(0);
        onChange({ ...formData, jenis_produk: "Kuserna (Serbaguna)", jenis_pekerjaan: "Pensiunan", estimasi_gaji_pensiun: 4400000, gaji_bersih_aktif: 0, plafon_diminta: 321000000, top_up: false });
      } else {
        setTanggalLahir("1953-04-18"); setBulanRitensi(4);
        onChange({ ...formData, jenis_produk: "Kuserna (Serbaguna)", jenis_pekerjaan: "Pensiunan", estimasi_gaji_pensiun: 2200000, gaji_bersih_aktif: 0, plafon_diminta: 180000000, top_up: true });
      }
    }
  };

  const dtiClass = (dti: number) =>
    dti <= 0.38
      ? "bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20"
      : dti <= 0.50
      ? "bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20"
      : "bg-rose-50 text-rose-800 border-rose-200/80 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20";

  return (
    <div className="card rounded-lg p-4 space-y-4">

      {/* Header */}
      <div className="border-b border-[var(--divider)] pb-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <UserCheck className="size-4 text-[var(--brand)] shrink-0" />
            Profil Calon Debitur
          </h3>
          <span className="text-[10px] font-semibold text-[var(--brand)] bg-[var(--brand-subtle)] border border-[var(--brand-border)] px-2 py-0.5 rounded whitespace-nowrap">
            Input Simulasi
          </span>
        </div>

        {/* Preset quick buttons */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="size-3 text-[var(--brand)]" />
            Preset Cepat:
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => applyProductPreset("prime")}
              className="text-[10.5px] font-semibold px-2 py-1.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/20 flex items-center justify-center gap-1 transition"
              title="Preset Prima Sehat (DTI ~23% → Disetujui)"
            >
              <CheckCircle2 className="size-3.5 shrink-0" />
              <span className="truncate">Prima</span>
            </button>
            <button
              type="button"
              onClick={() => applyProductPreset("max_excel")}
              className="text-[10.5px] font-semibold px-2 py-1.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:hover:bg-amber-500/15 dark:text-amber-300 border border-amber-200/80 dark:border-amber-500/20 flex items-center justify-center gap-1 transition"
              title="Preset Plafon Maksimal (USEB / TIKA)"
            >
              <CreditCard className="size-3.5 shrink-0" />
              <span className="truncate">Maks</span>
            </button>
            <button
              type="button"
              onClick={() => applyProductPreset("risky")}
              className="text-[10.5px] font-semibold px-2 py-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:hover:bg-rose-500/15 dark:text-rose-300 border border-rose-200/80 dark:border-rose-500/20 flex items-center justify-center gap-1 transition"
              title="Preset Pinjaman Berisiko Tinggi"
            >
              <AlertTriangle className="size-3.5 shrink-0" />
              <span className="truncate">Risiko</span>
            </button>
          </div>
        </div>

        {/* Product tabs */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleProductChange("Kapuas Plus (Kredit ASN)")}
            className={cn(
              "py-2 px-3 rounded text-xs font-semibold border flex items-center justify-center gap-1.5 transition",
              isKapuasPlus
                ? "bg-[var(--brand)] text-white border-transparent shadow-sm"
                : "bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-[var(--divider)] hover:border-[var(--brand-border)]"
            )}
          >
            <Layers className={cn("size-3.5 shrink-0", isKapuasPlus ? "text-white" : "text-[var(--brand)]")} />
            <span>Kapuas Plus (ASN)</span>
          </button>
          <button
            type="button"
            onClick={() => handleProductChange("Kuserna (Serbaguna)")}
            className={cn(
              "py-2 px-3 rounded text-xs font-semibold border flex items-center justify-center gap-1.5 transition",
              isKuserna
                ? "bg-[var(--brand)] text-white border-transparent shadow-sm"
                : "bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-[var(--divider)] hover:border-[var(--brand-border)]"
            )}
          >
            <Sparkles className={cn("size-3.5 shrink-0", isKuserna ? "text-white" : "text-[var(--brand)]")} />
            <span>Kuserna (Pensiun)</span>
          </button>
        </div>
      </div>

      {/* Form controls */}
      <form onSubmit={onSubmit} className="space-y-3 text-xs">

        {/* Tanggal Lahir */}
        <div className="p-3 bg-[var(--surface-subtle)] border border-[var(--divider)] rounded flex items-center justify-between gap-3">
          <div className="flex-1">
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center gap-1 mb-1">
              <Calendar className="size-3.5 text-[var(--brand)]" />
              Tanggal Lahir Nasabah
            </label>
            <input
              type="date"
              value={tanggalLahir}
              onChange={(e) => setTanggalLahir(e.target.value)}
              className={inputBase}
              required
            />
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] text-[var(--text-muted)] block">Usia Auto:</span>
            <span className="font-bold text-[var(--brand)] tabular-nums">{usiaDisplay} Thn</span>
          </div>
        </div>

        {/* Kapuas Plus fields */}
        {isKapuasPlus && (
          <div className="p-3 bg-[var(--brand-subtle)] border border-[var(--brand-border)] rounded space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-[var(--text-secondary)] block mb-1 font-medium">BUP (Batas Usia Pensiun)</label>
                <select
                  value={bup}
                  onChange={(e) => setBup(parseInt(e.target.value))}
                  className={inputBase}
                >
                  <option value={58}>58 Thn (Staff ASN)</option>
                  <option value={60}>60 Thn (Pejabat)</option>
                  <option value={65}>65 Thn (Fungsional)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-[var(--text-secondary)] block mb-1 font-medium">Gaji Bersih Aktif (Rp)</label>
                <input
                  type="number"
                  step="50000"
                  value={formData.gaji_bersih_aktif}
                  onChange={(e) => onChange({ ...formData, gaji_bersih_aktif: parseFloat(e.target.value) || 0 })}
                  className={cn(inputBase, "tabular-nums")}
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-[var(--text-secondary)] block mb-1 font-medium">Estimasi Gaji Pensiun (Rp)</label>
              <input
                type="number"
                step="50000"
                value={formData.estimasi_gaji_pensiun}
                onChange={(e) => onChange({ ...formData, estimasi_gaji_pensiun: parseFloat(e.target.value) || 0 })}
                className={cn(inputBase, "tabular-nums")}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-[var(--text-secondary)] block mb-1 font-medium">Plafon 1 – Fase Pensiun (Rp)</label>
                <input
                  type="number"
                  step="1000000"
                  value={plafon1Pemohon}
                  onChange={(e) => setPlafon1Pemohon(parseFloat(e.target.value) || 0)}
                  className={cn(inputBase, "tabular-nums")}
                />
              </div>
              <div>
                <label className="text-[11px] text-[var(--text-secondary)] block mb-1 font-medium">Plafon 2 – Tambahan Aktif (Rp)</label>
                <input
                  type="number"
                  step="1000000"
                  value={plafon2Pemohon}
                  onChange={(e) => setPlafon2Pemohon(parseFloat(e.target.value) || 0)}
                  className={cn(inputBase, "tabular-nums")}
                />
              </div>
            </div>
          </div>
        )}

        {/* Kuserna fields */}
        {isKuserna && (
          <div className="p-3 bg-amber-50/60 dark:bg-amber-950/15 border border-amber-200 dark:border-amber-500/20 rounded space-y-2.5">
            <div>
              <label className="text-[11px] text-[var(--text-secondary)] block mb-1 font-medium">Gaji Pensiun Bulanan (Rp)</label>
              <input
                type="number"
                step="50000"
                value={formData.estimasi_gaji_pensiun}
                onChange={(e) => onChange({ ...formData, estimasi_gaji_pensiun: parseFloat(e.target.value) || 0, gaji_bersih_aktif: 0 })}
                className={cn(inputBase, "tabular-nums")}
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-[var(--text-secondary)] block mb-1 font-medium">Plafon Pinjaman Diminta (Rp)</label>
              <input
                type="number"
                step="1000000"
                value={formData.plafon_diminta}
                onChange={(e) => onChange({ ...formData, plafon_diminta: parseFloat(e.target.value) || 0 })}
                className={cn(inputBase, "tabular-nums")}
                required
              />
            </div>
          </div>
        )}

        {/* Ritensi & Pelunasan */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[11px] text-[var(--text-muted)] block mb-1 font-medium">Ritensi (Bln)</label>
            <input
              type="number"
              value={bulanRitensi}
              onChange={(e) => setBulanRitensi(parseInt(e.target.value) || 0)}
              className={cn(inputBase, "tabular-nums")}
            />
          </div>
          <div className="col-span-2">
            <label className="text-[11px] text-[var(--text-muted)] block mb-1 font-medium">Take Over / Pelunasan (Rp)</label>
            <input
              type="number"
              step="1000000"
              value={pelunasan1}
              onChange={(e) => setPelunasan1(parseFloat(e.target.value) || 0)}
              className={cn(inputBase, "tabular-nums")}
            />
          </div>
        </div>

        {/* Live Calc: Kapuas Plus */}
        {isKapuasPlus && kapuasResult && (
          <div className="p-3 bg-[var(--brand-subtle)] border border-[var(--brand-border)] rounded space-y-1.5 text-[11px]">
            <p className="font-bold text-[var(--brand)] border-b border-[var(--divider)] pb-1 flex justify-between">
              <span>Simulasi Kapuas Plus</span>
              <span className="tabular-nums">Tenor {kapuasResult.tenorPensiunBulan} Bln</span>
            </p>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Total Plafon:</span>
              <span className="font-bold text-[var(--brand)] tabular-nums">{formatRupiah(kapuasResult.totalPlafonKredit)}</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Angsuran Aktif / Bln:</span>
              <span className="font-semibold text-[var(--text-primary)] tabular-nums">{formatRupiah(kapuasResult.totalAngsuranAktif)}</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)] items-center">
              <span>Rasio Beban Utang (DTI):</span>
              <span className={cn("font-bold px-1.5 py-0.5 rounded text-[10px] border tabular-nums", dtiClass(kapuasResult.dtiAktifRatio))}>
                {formatPercent(kapuasResult.dtiAktifRatio * 100, 1)} {kapuasResult.dtiAktifRatio <= 0.38 ? "(Aman)" : "(Tinggi)"}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-[var(--divider)] font-bold">
              <span className="text-[var(--text-secondary)]">Pencairan Diterima:</span>
              <span className="text-emerald-600 dark:text-emerald-400 tabular-nums">{formatRupiah(kapuasResult.totalPencairanDiterima)}</span>
            </div>
          </div>
        )}

        {/* Live Calc: Kuserna */}
        {isKuserna && kusernaResult && (
          <div className="p-3 bg-amber-50/60 dark:bg-amber-950/15 border border-amber-200 dark:border-amber-500/20 rounded space-y-1.5 text-[11px]">
            <p className="font-bold text-amber-700 dark:text-amber-400 border-b border-[var(--divider)] pb-1 flex justify-between">
              <span>Simulasi Kuserna</span>
              <span className="tabular-nums">Tenor {kusernaResult.tenorMaksimalBulan} Bln</span>
            </p>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Plafon Pinjaman:</span>
              <span className="font-bold text-amber-700 dark:text-amber-300 tabular-nums">{formatRupiah(kusernaResult.plafonTerpakai)}</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Angsuran Pensiun:</span>
              <span className="font-semibold text-[var(--text-primary)] tabular-nums">{formatRupiah(kusernaResult.angsuranBulanan)}</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)] items-center">
              <span>Rasio Beban Utang (DTI):</span>
              <span className={cn("font-bold px-1.5 py-0.5 rounded text-[10px] border tabular-nums", dtiClass(kusernaResult.dtiRatio))}>
                {formatPercent(kusernaResult.dtiRatio * 100, 1)} {kusernaResult.dtiRatio <= 0.38 ? "(Aman)" : "(Tinggi)"}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-[var(--divider)] font-bold">
              <span className="text-[var(--text-secondary)]">Pencairan Diterima:</span>
              <span className="text-emerald-600 dark:text-emerald-400 tabular-nums">{formatRupiah(kusernaResult.totalPencairanDiterima)}</span>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 btn-primary py-3 sm:py-2.5 min-h-11 sm:min-h-9 px-4 rounded-md flex items-center justify-center gap-2 text-sm sm:text-xs font-semibold cursor-pointer"
        >
          <Calculator className="size-4" />
          <span>{loading ? "Menghitung Skor..." : "Hitung Skor Kredit FICO Hibrida"}</span>
        </button>
      </form>
    </div>
  );
}
