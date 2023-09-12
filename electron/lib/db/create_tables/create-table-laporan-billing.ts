import { Knex } from "knex";

export default function createTableLaporanBilling(
  table: Knex.TableBuilder,
  _db: Knex<any, unknown[]>,
) {
  table.increments("id");
  table.string("op").notNullable();
  table.integer("nomor_meja").notNullable();
  table.integer("versi_ps").notNullable();
  table.string("jenis_main").notNullable();
  table.string("paket_main").nullable();
  table.string("waktu_mulai").notNullable();
  table.string("waktu_selesai").nullable();
  table.string("lama_main").nullable();
  table.string("konsumsi").notNullable();
  table.decimal("total_bayar_main").nullable();
  table.decimal("total_bayar_konsumsi").nullable();
  table.decimal("total_bayar_semua").nullable();
}
