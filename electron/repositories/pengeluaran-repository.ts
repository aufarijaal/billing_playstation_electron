import { Pengeluaran } from "../@types/models";
import { PaginationParams, PaginationResponse } from "../@types/pagination";
import { exportCSV } from "../lib/data-exporter";
import { db } from "../lib/db/knexfile";
import logger from "../lib/logging/logger";

const tableName: string = "pengeluaran";

async function store(pengeluaran: Pengeluaran) {
  try {
    await db
      .table(tableName)
      .insert({
        op: pengeluaran.op,
        deskripsi: pengeluaran.deskripsi,
        nominal: pengeluaran.nominal,
        dikeluarkan_pada: pengeluaran.dikeluarkan_pada,
      })
      .returning("id");
    logger.info(
      `New pengeluaran inserted. params: ${JSON.stringify(pengeluaran)}`
    );
  } catch (error: any) {
    logger.error(
      `Error inserting pengeluaran data. message: ${
        error.message
      } params: ${JSON.stringify(pengeluaran)}`
    );
    throw error;
  }
}

async function get(
  params: PaginationParams
): Promise<{ data: Pengeluaran[]; pagination: PaginationResponse }> {
  try {
    const page = params.page ?? 1;
    const pagination: PaginationResponse = {
      total: undefined,
      pageCount: undefined,
      currentPage: undefined,
    };

    const dataLength: any = await db
      .select(db.raw("COUNT(id) as total"))
      .fromRaw(`${tableName}`)
      .where(function () {
        this.where("op", "like", `%${params.query}%`).orWhere(
          "deskripsi",
          "like",
          `%${params.query}%`
        );
      })
      .andWhereRaw("dikeluarkan_pada BETWEEN ? AND ?", [
        `${params.dateRange.from} 00:00:00`,
        `${params.dateRange.to} 23:59:59`,
      ])
      .orderBy(params.sort.by, params.sort.asc ? "ASC" : "DESC")
      .first();

    pagination.pageCount = Math.ceil(dataLength.total / params.dataPerPage);
    pagination.total = dataLength.total;
    pagination.currentPage = page + 1;

    const paginatedData = await db
      .table(tableName)
      .select("*")
      .where(function () {
        this.where("op", "like", `%${params.query}%`).orWhere(
          "deskripsi",
          "like",
          `%${params.query}%`
        );
      })
      .andWhereRaw("dikeluarkan_pada BETWEEN ? AND ?", [
        `${params.dateRange.from} 00:00:00`,
        `${params.dateRange.to} 23:59:59`,
      ])
      .orderBy(params.sort.by, params.sort.asc ? "ASC" : "DESC")
      .limit(params.dataPerPage)
      .offset(params.dataPerPage * (page - 1));

    logger.info(`Get pengeluaran data.`);
    return {
      data: paginatedData,
      pagination,
    };
  } catch (error: any) {
    logger.error(`Error getting pengeluaran data. message: ${error.message}`);
    throw error;
  }
}

async function update(pengeluaran: Pengeluaran) {
  try {
    await db.table(tableName).where("id", pengeluaran.id).update({
      op: pengeluaran.op,
      deskripsi: pengeluaran.deskripsi,
      nominal: pengeluaran.nominal,
      dikeluarkan_pada: pengeluaran.dikeluarkan_pada,
    });
    logger.info(`Update pengeluaran. params: ${JSON.stringify(pengeluaran)}`);
  } catch (error: any) {
    logger.error(
      `Error updating pengeluaran data. message: ${
        error.message
      }. params: ${JSON.stringify(pengeluaran)}`
    );
    throw error;
  }
}

async function destroy(id: number) {
  try {
    await db.table(tableName).where("id", id).delete();
    logger.info(`Delete pengeluaran. id: ${id}`);
  } catch (error: any) {
    logger.error(
      `Error deleting pengeluaran data. message: ${error.message}. id: ${id}`
    );
    throw error;
  }
}

async function destroyMany(id: number[]) {
  try {
    await db.table(tableName).whereIn("id", id).delete();
    logger.info(`Delete pengeluaran. id: ${id}`);
  } catch (error: any) {
    logger.error(
      `Error deleting many pengeluaran data. message: ${error.message}. ids: ${id}`
    );
    throw error;
  }
}

async function getDataCountFromDateRange(fromTs: string, toTs: string) {
  try {
    const result = await db
      .table(tableName)
      .count({ count: "id" })
      .whereRaw("dikeluarkan_pada BETWEEN ? AND ?", [fromTs, toTs])
      .first();

    logger.info(
      `Get data count from date range in pengeluaran table. params ${JSON.stringify(
        { fromTs, toTs }
      )}`
    );
    return result?.count;
  } catch (error: any) {
    logger.error(
      `Error getting data count from date range in pengeluaran table. message: ${
        error.message
      }. params ${JSON.stringify({ fromTs, toTs })}`
    );
    throw error;
  }
}

async function exportData(path: string, fromTs: string, toTs: string) {
  try {
    const result = await db
      .select("id AS ID","op AS Operator","deskripsi AS Deskripsi","nominal AS Nominal","dikeluarkan_pada AS 'Dikeluarkan Pada'")
      .from(tableName)
      .whereRaw("dikeluarkan_pada BETWEEN ? AND ?", [fromTs, toTs]);

    exportCSV(result, path);
    logger.info(
      `Export data pengeluaran table. params ${JSON.stringify({
        path,
        fromTs,
        toTs,
      })}`
    );
  } catch (error: any) {
    logger.info(
      `Error exporting data pengeluaran table. message: ${
        error.message
      } params ${JSON.stringify({ path, fromTs, toTs })}`
    );
    throw error;
  }
}

const pengeluaranRepository = {
  store,
  get,
  update,
  destroy,
  destroyMany,
  getDataCountFromDateRange,
  exportData,
};

export default pengeluaranRepository;
