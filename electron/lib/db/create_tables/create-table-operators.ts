import { Knex } from "knex";

export default function createTableOperators(
  table: Knex.TableBuilder,
  _db: Knex<any, unknown[]>,
) {
  table.increments("id");
  table.string("username").unique().notNullable();
  table.string("password").notNullable();
  table.boolean("full_access").defaultTo(false);
}
