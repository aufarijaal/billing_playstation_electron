import { Knex } from "knex";

export default function createTablePlaystations(
  table: Knex.TableBuilder,
  _db: Knex<any, unknown[]>,
) {
  table.integer("versi").primary();
  table.decimal("tarif_per_menit").notNullable();
}
