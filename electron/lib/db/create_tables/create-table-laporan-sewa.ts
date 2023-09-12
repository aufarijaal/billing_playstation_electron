import { Knex } from "knex";

export default function createTableLaporanSewa(
  table: Knex.TableBuilder,
  _db: Knex<any, unknown[]>,
) {
  table.increments("id");
  table.string("op").notNullable();
  table.string("nama_penyewa").nullable();
  table.string("alamat_penyewa").nullable();
  table.string("kontak_penyewa").nullable();
  table.string("paket_sewa").notNullable();
  table.string("tanggal_sewa").notNullable();
  table.decimal("total_bayar").notNullable();
  table.integer("status").defaultTo(0);
}
