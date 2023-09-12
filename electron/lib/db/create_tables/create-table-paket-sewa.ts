import { Knex } from "knex";

export default function createTablePaketSewa(
  table: Knex.TableBuilder,
  _db: Knex<any, unknown[]>,
) {
  table.increments("id");
  table.string("nama_paket").unique().notNullable();
  table.decimal("harga").notNullable();
}
