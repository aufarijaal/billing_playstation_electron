import { Knex } from "knex";

export default function createTablePengeluaran(
  table: Knex.TableBuilder,
  db: Knex<any, unknown[]>,
) {
  table.increments("id");
  table.string("op").notNullable();
  table.string("deskripsi").notNullable();
  table.string("nominal").notNullable();
  table.string("dikeluarkan_pada").defaultTo(db.raw("CURRENT_TIMESTAMP"));
}
