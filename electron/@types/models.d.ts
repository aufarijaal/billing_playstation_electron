export interface Operator {
  id?: number;
  username: string;
  password: string;
  full_access?: boolean;
}

export interface Logistik {
  id?: number;
  nama_produk: string;
  harga: number;
}

export interface Playstation {
  versi?: number;
  tarif_per_menit: number;
}

export interface MejaMain {
  nomor_meja?: number;
  versi_ps: number;
  hold_id?: number;
}

export interface PaketSewa {
  id?: number;
  nama_paket: string;
  harga: number;
}

export interface Pengeluaran {
  id?: number;
  op: string;
  deskripsi: string;
  nominal: number;
  dikeluarkan_pada: string;
}

export interface LaporanSewa {
  id?: number;
  op: string;
  nama_penyewa: string;
  alamat_penyewa: string;
  kontak_penyewa: string;
  paket_sewa: string;
  tanggal_sewa: string;
  total_bayar: number;
  status: 0 | 1;
}

export interface LaporanBilling {
  id?: number;
  op: string;
  nomor_meja: number;
  versi_ps: number;
  jenis_main: "diwaktu" | "los";
  paket_main?: string;
  waktu_mulai: string;
  waktu_selesai?: string;
  lama_main?: string;
  konsumsi?: string;
  total_bayar_main?: number;
  total_bayar_konsumsi?: number;
  total_bayar_semua?: number;
}
