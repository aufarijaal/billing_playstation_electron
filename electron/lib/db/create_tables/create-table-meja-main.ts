import { Knex } from "knex";

export default function createTableMejaMain(
  table: Knex.TableBuilder,
  _db: Knex<any, unknown[]>,
) {
  table.integer("nomor_meja").notNullable();
  table.integer("versi_ps").nullable();
  table.integer("hold_id").nullable();
}
