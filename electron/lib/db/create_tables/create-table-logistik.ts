import { Knex } from "knex";

export default function createTableLogistik(
  table: Knex.TableBuilder,
  _db: Knex<any, unknown[]>,
) {
  table.increments("id");
  table.string("nama_produk").unique().notNullable();
  table.decimal("harga").notNullable();
}
