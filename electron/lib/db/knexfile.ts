import { app } from "electron";
import { knex, Knex } from "knex";
import { homedir } from "os";
import { join } from "path";
import pkg from "../../../package.json";
import createTableOperators from "./create_tables/create-table-operators";
import createTablePlaystations from "./create_tables/create-table-playstations";
import createTableMejaMain from "./create_tables/create-table-meja-main";
import createTableLogistik from "./create_tables/create-table-logistik";
import createTablePaketSewa from "./create_tables/create-table-paket-sewa";
import createTablePengeluaran from "./create_tables/create-table-pengeluaran";
import createTableLaporanSewa from "./create_tables/create-table-laporan-sewa";
import createTableLaporanBilling from "./create_tables/create-table-laporan-billing";
import logger from "../logging/logger";

export const config: Knex.Config = {
  client: "sqlite3",
  connection: {
    filename: app.isPackaged
      ? join(homedir(), pkg.name, "billing_playstation.db")
      : "./billing_playstation.db",
  },
  useNullAsDefault: true,
};

export const db = knex(config);

async function createTable(
  tableName: string,
  tableDefinition: (table: Knex.TableBuilder, db: Knex<any, unknown[]>) => void,
) {
  try {
    const exists = await db.schema.hasTable(tableName);

    if (!exists) {
      await db.schema.createTable(tableName, (table) => {
        tableDefinition(table, db);
      });
      logger.info(`Table '${tableName}' created successfully.`);
    } else {
      logger.info(`Table '${tableName}' already exist, Ignored.`);
    }
  } catch (error) {
    throw error;
  }
}

export async function dbPopulate() {
  try {
    const tables = [
      { name: "operators", definition: createTableOperators },
      { name: "playstations", definition: createTablePlaystations },
      { name: "meja_main", definition: createTableMejaMain },
      { name: "logistik", definition: createTableLogistik },
      { name: "paket_sewa", definition: createTablePaketSewa },
      { name: "pengeluaran", definition: createTablePengeluaran },
      { name: "laporan_sewa", definition: createTableLaporanSewa },
      { name: "laporan_billing", definition: createTableLaporanBilling },
    ];

    for (const { name, definition } of tables) {
      try {
        await createTable(name, definition);
      } catch (error) {
        logger.error(`Error creating table '${name}':`, error);
      }
    }
  } catch (error) {
    throw error;
  }
}
