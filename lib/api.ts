import {
  KpiSummaryData,
  DebtorInputPayload,
  DebtorScoreResult,
  StressTestRequestPayload,
  StressTestResult
} from "@/types";

const API_BASE_URL = process.env.NEXT_BASE_URL || "http://localhost:8000";

// Fallback Mock Data if FastAPI server is momentarily unreachable
const FALLBACK_KPI: KpiSummaryData = {
  total_penyaluran_kredit_triliun: 14.85,
  rasio_npl_gross_persen: 1.93,
  rasio_penolakan_persen: 13.27,
  estimasi_ckpn_miliar: 286.70,
  pertumbuhan_yoy_persen: 6.40,
  total_nasabah_aktif: 123760,
  distribusi_kolektibilitas: {
    "Kolektibilitas 1 (Lancar)": 86.73,
    "Kolektibilitas 2 (DPK)": 11.34,
    "Kolektibilitas 3-5 (NPL)": 1.93
  },
  tren_historis_npl: [
    { tanggal: "2016-01", npl_gross_persen: 1.85, npl_historis: 1.85, npl_proyeksi: null },
    { tanggal: "2017-01", npl_gross_persen: 2.10, npl_historis: 2.10, npl_proyeksi: null },
    { tanggal: "2018-01", npl_gross_persen: 2.35, npl_historis: 2.35, npl_proyeksi: null },
    { tanggal: "2019-01", npl_gross_persen: 2.05, npl_historis: 2.05, npl_proyeksi: null },
    { tanggal: "2020-01", npl_gross_persen: 2.80, npl_historis: 2.80, npl_proyeksi: null },
    { tanggal: "2021-01", npl_gross_persen: 2.45, npl_historis: 2.45, npl_proyeksi: null },
    { tanggal: "2022-01", npl_gross_persen: 2.15, npl_historis: 2.15, npl_proyeksi: null },
    { tanggal: "2022-06", npl_gross_persen: 2.08, npl_historis: 2.08, npl_proyeksi: null },
    { tanggal: "2023-01", npl_gross_persen: 2.02, npl_historis: 2.02, npl_proyeksi: null },
    { tanggal: "2023-06", npl_gross_persen: 1.98, npl_historis: 1.98, npl_proyeksi: null },
    { tanggal: "2024-01", npl_gross_persen: 1.95, npl_historis: 1.95, npl_proyeksi: null },
    { tanggal: "2024-06", npl_gross_persen: 1.94, npl_historis: 1.94, npl_proyeksi: null },
    { tanggal: "2024-12", npl_gross_persen: 1.93, npl_historis: 1.93, npl_proyeksi: 1.93 },
    { tanggal: "2025-03", npl_gross_persen: 1.91, npl_historis: null, npl_proyeksi: 1.91 },
    { tanggal: "2025-06", npl_gross_persen: 1.89, npl_historis: null, npl_proyeksi: 1.89 },
    { tanggal: "2025-09", npl_gross_persen: 1.87, npl_historis: null, npl_proyeksi: 1.87 },
    { tanggal: "2025-12", npl_gross_persen: 1.95, npl_historis: null, npl_proyeksi: 1.95 },
    { tanggal: "2026-03", npl_gross_persen: 1.92, npl_historis: null, npl_proyeksi: 1.92 },
    { tanggal: "2026-06", npl_gross_persen: 1.88, npl_historis: null, npl_proyeksi: 1.88 },
    { tanggal: "2026-09", npl_gross_persen: 1.93, npl_historis: null, npl_proyeksi: 1.93 },
    { tanggal: "2026-12", npl_gross_persen: 1.93, npl_historis: null, npl_proyeksi: 1.93 }
  ],
  sebaran_kantor_cabang: [
    { nama_cabang: "04 Cabang Ketapang", total_debitur: 11838, persentase_portofolio: 9.57 },
    { nama_cabang: "09 Cabang Sintang", total_debitur: 10688, persentase_portofolio: 8.64 },
    { nama_cabang: "14 Cabang Bengkayang", total_debitur: 10242, persentase_portofolio: 8.28 },
    { nama_cabang: "13 Cabang Ngabang", total_debitur: 8607, persentase_portofolio: 6.95 },
    { nama_cabang: "06 Cabang Sanggau", total_debitur: 7812, persentase_portofolio: 6.31 },
    { nama_cabang: "02 Cabang Nanga Pinoh", total_debitur: 7299, persentase_portofolio: 5.90 },
    { nama_cabang: "01 Cabang Utama Pontianak", total_debitur: 7281, persentase_portofolio: 5.88 },
    { nama_cabang: "19 Cabang Kubu Raya", total_debitur: 7105, persentase_portofolio: 5.74 },
    { nama_cabang: "15 Cabang Sekadau", total_debitur: 6615, persentase_portofolio: 5.35 },
    { nama_cabang: "08 Cabang Putussibau", total_debitur: 6309, persentase_portofolio: 5.10 }
  ]
};

export async function checkApiHealth(): Promise<{ online: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/`, { cache: "no-store" });
    if (res.ok) {
      return { online: true, message: "FastAPI Backend Online (Port 8000)" };
    }
    return { online: false, message: "FastAPI Backend Offline" };
  } catch {
    return { online: false, message: "FastAPI Backend Offline (Koneksi Gagal)" };
  }
}

export async function fetchKpiSummary(): Promise<KpiSummaryData> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/kpi/summary`, { cache: "no-store" });
    if (!res.ok) throw new Error("Gagal memuat data KPI dari server");
    return await res.json();
  } catch (err) {
    console.warn("Using fallback KPI data due to connection error:", err);
    return FALLBACK_KPI;
  }
}

export async function scoreDebtor(payload: DebtorInputPayload): Promise<DebtorScoreResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/score/debtor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Gagal melakukan komputasi skor debitur");
    return await res.json();
  } catch (err) {
    console.error("Scoring error:", err);
    throw err;
  }
}

export async function runStressTestSimulation(payload: StressTestRequestPayload): Promise<StressTestResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/simulation/stress-test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Gagal menjalankan simulasi stress test");
    return await res.json();
  } catch (err) {
    console.error("Stress test error:", err);
    throw err;
  }
}
