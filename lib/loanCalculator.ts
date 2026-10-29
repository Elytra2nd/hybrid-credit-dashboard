/**
 * loanCalculator.ts
 * Implementasi formula resmi perbankan PT Bina Area Persada & Bank Kalbar
 * Berdasarkan berkas SIMULASI KREDIT KAPUAS PLUS DAN KUSERNA NEW (1).xlsx
 */

export interface AgeCalculationResult {
  years: number;
  months: number;
  displayText: string;
}

export function calculateAgeFromBirthDate(
  birthDateStr: string,
  referenceDate: Date = new Date()
): AgeCalculationResult {
  if (!birthDateStr) {
    return { years: 56, months: 4, displayText: "56 Tahun 4 Bulan" };
  }

  const birthDate = new Date(birthDateStr);
  if (isNaN(birthDate.getTime())) {
    return { years: 56, months: 4, displayText: "56 Tahun 4 Bulan" };
  }

  let years = referenceDate.getFullYear() - birthDate.getFullYear();
  let months = referenceDate.getMonth() - birthDate.getMonth();
  const days = referenceDate.getDate() - birthDate.getDate();

  if (days < 0) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const finalYears = Math.max(18, Math.min(80, years));
  const finalMonths = Math.max(0, Math.min(11, months));

  return {
    years: finalYears,
    months: finalMonths,
    displayText: `${finalYears} Tahun ${finalMonths} Bulan`,
  };
}

export interface KapuasPlusInput {
  usiaTahun: number;
  usiaBulan: number;
  bup: number; // 58, 60, 65
  gajiBersihAktif: number;
  estimasiGajiPensiun: number;
  plafon1Pemohon?: number;
  plafon2Pemohon?: number;
  sukuBungaTahunan?: number;
  persentasePemotongan?: number;
  angsuranBerjalan1?: number;
  angsuranBerjalan2?: number;
  bulanRitensi?: number;
  nominalPelunasan1?: number;
  nominalPelunasan2?: number;
}

export interface KapuasPlusResult {
  tenorPensiunBulan: number;
  tenorAktifBulan: number;
  plafon1Max: number;
  plafon1Dibulatkan: number;
  plafon1Terpakai: number;
  angsuranPensiun: number;
  sisaGajiPensiun: number;
  gajiKotorTersediaAktif: number;
  plafon2Max: number;
  plafon2Dibulatkan: number;
  plafon2Terpakai: number;
  angsuranTambahanAktif: number;
  totalAngsuranAktif: number;
  sisaGajiAktif: number;
  totalPlafonKredit: number;
  biayaProvisi1Persen: number;
  ritensiAngsuran: number;
  totalPencairanDiterima: number;
  dtiAktifRatio: number;
  dtiPensiunRatio: number;
}

export interface KusernaInput {
  usiaTahun: number;
  usiaBulan: number;
  gajiPensiun: number;
  plafonPemohon?: number;
  sukuBungaTahunan?: number;
  persentasePemotongan?: number;
  angsuranBerjalan?: number;
  bulanRitensi?: number;
  nominalPelunasan1?: number;
  nominalPelunasan2?: number;
}

export interface KusernaResult {
  tenorMaksimalBulan: number;
  plafonMax: number;
  plafonDibulatkan: number;
  plafonTerpakai: number;
  angsuranBulanan: number;
  sisaGajiPensiun: number;
  biayaProvisi1Persen: number;
  ritensiAngsuran: number;
  totalPencairanDiterima: number;
  dtiRatio: number;
}

export function calculateKapuasPlus(input: KapuasPlusInput): KapuasPlusResult {
  const sukuBunga = input.sukuBungaTahunan ?? 0.12;
  const i = sukuBunga / 12;
  const pctPotong = input.persentasePemotongan ?? 0.90;
  const angsuranBerjalan1 = input.angsuranBerjalan1 ?? 0;
  const angsuranBerjalan2 = input.angsuranBerjalan2 ?? 0;
  const bulanRitensi = input.bulanRitensi ?? 21;
  const pelunasan1 = input.nominalPelunasan1 ?? 0;
  const pelunasan2 = input.nominalPelunasan2 ?? 0;

  // Max 20 tahun (240 bulan) atau sisa usia ke 75
  const rawTenorPensiun = (75 - input.usiaTahun) * 12 - input.usiaBulan;
  const tenorPensiun = Math.max(12, Math.min(240, rawTenorPensiun));

  const factorPensiun = 1 - Math.pow(1 / (1 + i), tenorPensiun);
  const gajiPensiunEfektif = Math.max(1000000, input.estimasiGajiPensiun || 4200000);
  const plafon1Max = ((gajiPensiunEfektif * pctPotong - angsuranBerjalan1) * 12 / sukuBunga) * factorPensiun;
  const plafon1Dibulatkan = Math.max(10000000, Math.floor(plafon1Max / 1000000) * 1000000);
  
  // PERBAIKAN: Periksa apakah plafon1Pemohon terdefinisi (termasuk jika bernilai 0)
  const plafon1Terpakai = typeof input.plafon1Pemohon === "number" && input.plafon1Pemohon >= 0
    ? input.plafon1Pemohon
    : plafon1Dibulatkan;

  const angsuranPensiun = plafon1Terpakai > 0
    ? Math.ceil(plafon1Terpakai * i * (1 / (1 - Math.pow(1 / (1 + i), tenorPensiun))))
    : 0;
  const sisaGajiPensiun = gajiPensiunEfektif - angsuranPensiun;

  // Tenor aktif (sisa ke BUP)
  const rawTenorAktif = (input.bup - input.usiaTahun) * 12 - input.usiaBulan;
  const tenorAktif = Math.max(6, Math.min(180, rawTenorAktif));

  const gajiAktifEfektif = Math.max(1000000, input.gajiBersihAktif || 5000000);
  const gajiKotorTersediaAktif = Math.max(0, gajiAktifEfektif - angsuranPensiun);
  const factorAktif = 1 - Math.pow(1 / (1 + i), tenorAktif);
  const plafon2Max = ((gajiKotorTersediaAktif * pctPotong - angsuranBerjalan2) * 12 / sukuBunga) * factorAktif;
  const plafon2Dibulatkan = Math.max(0, Math.floor(plafon2Max / 1000000) * 1000000);
  
  // PERBAIKAN KRUSIAL: Jika plafon2Pemohon = 0, gunakan 0, JANGAN default ke plafon2Dibulatkan!
  const plafon2Terpakai = typeof input.plafon2Pemohon === "number" && input.plafon2Pemohon >= 0
    ? input.plafon2Pemohon
    : plafon2Dibulatkan;

  const angsuranTambahanAktif = plafon2Terpakai > 0
    ? Math.ceil(plafon2Terpakai * i * (1 / (1 - Math.pow(1 / (1 + i), tenorAktif))))
    : 0;
  const totalAngsuranAktif = angsuranPensiun + angsuranTambahanAktif;
  const sisaGajiAktif = gajiAktifEfektif - totalAngsuranAktif;

  const totalPlafonKredit = plafon1Terpakai + plafon2Terpakai;
  const biayaProvisi1Persen = totalPlafonKredit * 0.01;
  const ritensiAngsuran = totalAngsuranAktif * bulanRitensi;
  const totalPencairanDiterima = totalPlafonKredit - biayaProvisi1Persen - ritensiAngsuran - pelunasan1 - pelunasan2;

  const rawDtiAktif = gajiAktifEfektif > 0 ? totalAngsuranAktif / gajiAktifEfektif : 0.25;
  const dtiAktifRatio = Math.max(0.05, Math.min(0.95, isNaN(rawDtiAktif) ? 0.25 : rawDtiAktif));

  const rawDtiPensiun = gajiPensiunEfektif > 0 ? angsuranPensiun / gajiPensiunEfektif : 0.25;
  const dtiPensiunRatio = Math.max(0.05, Math.min(0.95, isNaN(rawDtiPensiun) ? 0.25 : rawDtiPensiun));

  return {
    tenorPensiunBulan: tenorPensiun,
    tenorAktifBulan: tenorAktif,
    plafon1Max,
    plafon1Dibulatkan,
    plafon1Terpakai,
    angsuranPensiun,
    sisaGajiPensiun,
    gajiKotorTersediaAktif,
    plafon2Max,
    plafon2Dibulatkan,
    plafon2Terpakai,
    angsuranTambahanAktif,
    totalAngsuranAktif,
    sisaGajiAktif,
    totalPlafonKredit,
    biayaProvisi1Persen,
    ritensiAngsuran,
    totalPencairanDiterima,
    dtiAktifRatio,
    dtiPensiunRatio,
  };
}

export function calculateKuserna(input: KusernaInput): KusernaResult {
  const sukuBunga = input.sukuBungaTahunan ?? 0.12;
  const i = sukuBunga / 12;
  const pctPotong = input.persentasePemotongan ?? 0.90;
  const angsuranBerjalan = input.angsuranBerjalan ?? 0;
  const bulanRitensi = input.bulanRitensi ?? 4;
  const pelunasan1 = input.nominalPelunasan1 ?? 0;
  const pelunasan2 = input.nominalPelunasan2 ?? 0;

  const rawTenor = (75 - input.usiaTahun) * 12 - input.usiaBulan;
  const tenorMax = Math.max(12, Math.min(240, rawTenor));

  const gajiPensiunEfektif = Math.max(1000000, input.gajiPensiun || 4400000);
  const factor = 1 - Math.pow(1 / (1 + i), tenorMax);
  const plafonMax = ((gajiPensiunEfektif * pctPotong - angsuranBerjalan) * 12 / sukuBunga) * factor;
  const plafonDibulatkan = Math.max(10000000, Math.floor(plafonMax / 1000000) * 1000000);
  
  const plafonTerpakai = typeof input.plafonPemohon === "number" && input.plafonPemohon > 0
    ? input.plafonPemohon
    : plafonDibulatkan;

  const angsuranBulanan = plafonTerpakai > 0
    ? Math.ceil(plafonTerpakai * i * (1 / (1 - Math.pow(1 / (1 + i), tenorMax))))
    : 0;
  const sisaGajiPensiun = gajiPensiunEfektif - angsuranBulanan;

  const biayaProvisi1Persen = plafonTerpakai * 0.01;
  const ritensiAngsuran = angsuranBulanan * bulanRitensi;
  const totalPencairanDiterima = plafonTerpakai - biayaProvisi1Persen - ritensiAngsuran - pelunasan1 - pelunasan2;

  const rawDti = gajiPensiunEfektif > 0 ? angsuranBulanan / gajiPensiunEfektif : 0.25;
  const dtiRatio = Math.max(0.05, Math.min(0.95, isNaN(rawDti) ? 0.25 : rawDti));

  return {
    tenorMaksimalBulan: tenorMax,
    plafonMax,
    plafonDibulatkan,
    plafonTerpakai,
    angsuranBulanan,
    sisaGajiPensiun,
    biayaProvisi1Persen,
    ritensiAngsuran,
    totalPencairanDiterima,
    dtiRatio,
  };
}
