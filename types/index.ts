export interface FeatureContribution {
  feature_name: string;
  feature_label: string;
  contribution_value: number;
  impact_direction: 'increase_risk' | 'decrease_risk';
}

export interface DebtorInputPayload {
  usia: number;
  gaji_bersih_aktif: number;
  estimasi_gaji_pensiun: number;
  plafon_diminta: number;
  tenor: number;
  dti_ratio: number;
  jenis_pekerjaan: string;
  top_up: boolean;
  jenis_produk: string;
}

export interface DebtorScoreResult {
  probabilitas_default: number;
  skor_fico_dasar: number;
  faktor_penyesuaian_makro: number;
  skor_fico_hibrida: number;
  kategori_skor: string;
  rekomendasi_keputusan: string;
  keterangan_analisis: string;
  threshold_optimal_youden: number;
  feature_contributions: FeatureContribution[];
}

export interface BranchDistributionItem {
  nama_cabang: string;
  total_debitur: number;
  persentase_portofolio: number;
}

export interface NplTimeSeriesPoint {
  tanggal: string;
  npl_gross_persen: number;
  npl_historis?: number | null;
  npl_proyeksi?: number | null;
  tipe?: string;
}

export interface KpiSummaryData {
  total_penyaluran_kredit_triliun: number;
  rasio_npl_gross_persen: number;
  rasio_penolakan_persen: number;
  estimasi_ckpn_miliar: number;
  pertumbuhan_yoy_persen: number;
  total_nasabah_aktif: number;
  distribusi_kolektibilitas: Record<string, number>;
  tren_historis_npl: NplTimeSeriesPoint[];
  sebaran_kantor_cabang: BranchDistributionItem[];
}

export interface StressTestRequestPayload {
  skenario: string;
  cpo_price_shock_pct: number;
}

export interface StressTestResult {
  skenario: string;
  cpo_price_shock_pct: number;
  proyeksi_npl_simulasi_persen: number;
  deviasi_terhadap_baseline_persen: number;
  faktor_penyesuaian_skor_poin: number;
  persentase_nasabah_layak: number;
  persentase_nasabah_ditinjau: number;
  persentase_nasabah_ditolak: number;
  analisis_dampak_portofolio: string;
  runtun_waktu_proyeksi: Array<{
    bulan: string;
    baseline_npl: number;
    simulasi_npl: number;
    batas_ojk: number;
  }>;
}
