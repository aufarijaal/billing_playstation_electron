export interface DataMejaMainWithRelations {
  nomor_meja: number;
  versi_ps: number;
  tarif_per_menit: number;
  hold_id: number | null;
  laporan_op: string | null;
  laporan_versi_ps: number | null;
  laporan_jenis_main: "los" | "diwaktu" | null;
  laporan_paket_main: string | null;
  laporan_waktu_mulai: string | null;
  laporan_waktu_selesai: string | null;
  laporan_lama_main: string | null;
  laporan_konsumsi: string | null;
  laporan_total_bayar_main: number | null;
  laporan_total_bayar_konsumsi: number | null;
  laporan_total_bayar_semua: number | null;
}
