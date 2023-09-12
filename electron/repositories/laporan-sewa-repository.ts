import { LaporanSewa } from "../@types/models";
import { PaginationParams, PaginationResponse } from "../@types/pagination";
import { exportCSV } from "../lib/data-exporter";
import { db } from "../lib/db/knexfile";
import logger from "../lib/logging/logger";

const tableName: string = "laporan_sewa";

async function store(laporanSewa: LaporanSewa): Promise<void> {
  try {
    await db.table(tableName).insert({
      op: laporanSewa.op,
      nama_penyewa: laporanSewa.nama_penyewa,
      alamat_penyewa: laporanSewa.alamat_penyewa,
      kontak_penyewa: laporanSewa.kontak_penyewa,
      paket_sewa: laporanSewa.paket_sewa,
      tanggal_sewa: laporanSewa.tanggal_sewa,
      total_bayar: laporanSewa.total_bayar,
      status: laporanSewa.status,
    });
    logger.info(
      `New laporan_sewa data inserted. params: ${JSON.stringify(laporanSewa)}`
    );
  } catch (error: any) {
    logger.info(
      `Error inserting laporan_sewa data. message: ${
        error.message
      } params: ${JSON.stringify(laporanSewa)}`
    );
    throw error;
  }
}

async function get(
  params: PaginationParams
): Promise<{ data: LaporanSewa[]; pagination: PaginationResponse }> {
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
        this.where("op", "like", `%${params.query}%`)
          .orWhere("nama_penyewa", "like", `%${params.query}%`)
          .orWhere("alamat_penyewa", "like", `%${params.query}%`)
          .orWhere("kontak_penyewa", "like", `%${params.query}%`)
          .orWhere("paket_sewa", "like", `%${params.query}%`)
          .orWhere("tanggal_sewa", "like", `%${params.query}%`);
      })
      .andWhereRaw("tanggal_sewa BETWEEN ? AND ?", [
        params.dateRange.from,
        params.dateRange.to,
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
        this.where("op", "like", `%${params.query}%`)
          .orWhere("nama_penyewa", "like", `%${params.query}%`)
          .orWhere("alamat_penyewa", "like", `%${params.query}%`)
          .orWhere("kontak_penyewa", "like", `%${params.query}%`)
          .orWhere("paket_sewa", "like", `%${params.query}%`)
          .orWhere("tanggal_sewa", "like", `%${params.query}%`);
      })
      .andWhereRaw("tanggal_sewa BETWEEN ? AND ?", [
        `${params.dateRange.from} 00:00:00`,
        `${params.dateRange.to} 23:59:59`,
      ])
      .orderBy(params.sort.by, params.sort.asc ? "ASC" : "DESC")
      .limit(params.dataPerPage)
      .offset(params.dataPerPage * (page - 1));

    logger.info(`Get laporan_sewa data. params: ${JSON.stringify(params)}`);
    return {
      data: paginatedData,
      pagination,
    };
  } catch (error: any) {
    logger.error(
      `Error getting laporan_sewa data. message: ${
        error.message
      }. params: ${JSON.stringify(params)}`
    );
    throw error;
  }
}

async function update(laporanSewa: LaporanSewa): Promise<void> {
  try {
    await db.table(tableName).where("id", laporanSewa.id).update({
      op: laporanSewa.op,
      nama_penyewa: laporanSewa.nama_penyewa,
      alamat_penyewa: laporanSewa.alamat_penyewa,
      kontak_penyewa: laporanSewa.kontak_penyewa,
      paket_sewa: laporanSewa.paket_sewa,
      tanggal_sewa: laporanSewa.tanggal_sewa,
      total_bayar: laporanSewa.total_bayar,
      status: laporanSewa.status,
    });
    logger.info(`Update laporan_sewa. params: ${JSON.stringify(laporanSewa)}`);
  } catch (error: any) {
    logger.error(
      `Error updating laporan_sewa. message: ${
        error.message
      }. params: ${JSON.stringify(laporanSewa)}`
    );
    throw error;
  }
}

async function updateStatus(id: number, new_status: 0 | 1): Promise<void> {
  try {
    await db.table(tableName).where("id", id).update({
      status: new_status,
    });

    logger.info(
      `Update laporan_sewa.status. params: ${JSON.stringify({
        id,
        new_status,
      })}`
    );
  } catch (error: any) {
    logger.error(
      `Error updating laporan_sewa.status. message: ${
        error.message
      }. params: ${JSON.stringify({ id, new_status })}`
    );
    throw error;
  }
}

async function destroy(id: number): Promise<void> {
  try {
    await db.table(tableName).where("id", id).delete();

    logger.info(`Delete laporan_sewa: id: ${id}`);
  } catch (error: any) {
    logger.error(
      `Error deleting laporan_sewa. message: ${error.message}. id: ${id}`
    );
    throw error;
  }
}

async function destroyMany(id: number[]): Promise<void> {
  try {
    await db.table(tableName).whereIn("id", id).delete();
    logger.info(`Delete many laporan_sewa: ids: ${JSON.stringify(id)}`);
  } catch (error: any) {
    logger.error(
      `Error deleting many laporan_sewa. message: ${
        error.message
      }. ids: ${JSON.stringify(id)}`
    );
    throw error;
  }
}

async function getDataCountFromDateRange(fromTs: string, toTs: string) {
  try {
    const result = await db
      .table(tableName)
      .count({ count: "id" })
      .whereRaw("tanggal_sewa BETWEEN ? AND ?", [fromTs, toTs])
      .first();

    logger.info(
      `Get data count from date range in laporan_sewa table. params ${JSON.stringify(
        { fromTs, toTs }
      )}`
    );
    return result?.count;
  } catch (error: any) {
    logger.error(
      `Error getting data count from date range in laporan_sewa table. message: ${
        error.message
      }. params ${JSON.stringify({ fromTs, toTs })}`
    );
    throw error;
  }
}

async function exportData(path: string, fromTs: string, toTs: string) {
  try {
    const result = await db
      .select(
        "id AS ID",
          "op AS Operator",
          "nama_penyewa AS 'Nama Penyewa'",
          "alamat_penyewa AS 'Alamat Penyewa'",
          "kontak_penyewa AS 'Kontak Penyewa'",
          "paket_sewa AS 'Paket Sewa'",
          "tanggal_sewa AS 'Tanggal Sewa'",
          "total_bayar AS 'Total Bayar'",
          "status AS Status",
      )
      .from(tableName)
      .whereRaw("tanggal_sewa BETWEEN ? AND ?", [fromTs, toTs])

    exportCSV(result, path);
    logger.info(
      `Export data laporan_sewa table. params ${JSON.stringify({
        path,
        fromTs,
        toTs,
      })}`
    );
  } catch (error: any) {
    logger.info(
      `Error exporting data laporan_sewa table. message: ${
        error.message
      } params ${JSON.stringify({ path, fromTs, toTs })}`
    );
    throw error;
  }
}

const laporanSewaRepository = {
  store,
  get,
  update,
  updateStatus,
  destroy,
  destroyMany,
  getDataCountFromDateRange,
  exportData,
};

export default laporanSewaRepository;
