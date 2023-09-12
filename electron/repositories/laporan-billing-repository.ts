import { LaporanBilling } from "../@types/models";
import { PaginationParams, PaginationResponse } from "../@types/pagination";
import { exportCSV } from "../lib/data-exporter";
import { db } from "../lib/db/knexfile";
import logger from "../lib/logging/logger";

const tableName: string = "laporan_billing";

async function store(laporanBilling: LaporanBilling): Promise<LaporanBilling> {
  try {
    const inserted: LaporanBilling = await db
      .table(tableName)
      .insert({
        op: laporanBilling.op,
        nomor_meja: laporanBilling.nomor_meja,
        jenis_main: laporanBilling.jenis_main,
        paket_main: laporanBilling.paket_main,
        waktu_mulai: laporanBilling.waktu_mulai,
        waktu_selesai: laporanBilling.waktu_selesai,
        lama_main: laporanBilling.lama_main,
        konsumsi: laporanBilling.konsumsi,
        total_bayar_main: laporanBilling.total_bayar_main,
        total_bayar_konsumsi: laporanBilling.total_bayar_konsumsi,
        total_bayar_semua: laporanBilling.total_bayar_semua,
      })
      .returning("*")
      .first();

    logger.info(
      `New laporan_billing data inserted. data: ${JSON.stringify(
        laporanBilling
      )}`
    );
    return inserted;
  } catch (error: any) {
    logger.error(
      `Error inserting laporan_billing data. message: ${
        error.message
      }. data: ${JSON.stringify(laporanBilling)}`
    );
    throw error;
  }
}

async function get(
  params: PaginationParams
): Promise<{ data: LaporanBilling[]; pagination: PaginationResponse }> {
  try {
    const page = params.page ?? 1;
    const pagination: PaginationResponse = {
      total: undefined,
      pageCount: undefined,
      currentPage: undefined,
    };

    // Data pengecualian yang diambil dari meja_main.hold_id, jika meja_main masih memiliki hold_id (id laporan billing),
    // maka id tersebut tidak boleh ditampilkan pada halaman laporan billing, untuk mencegah pengubahan data sebelum operator menyimpan (men-detach hold_id) nya.
    const dataUntukDikecualikan = db
      .select("hold_id")
      .from("meja_main")
      .whereRaw("hold_id IS NOT NULL");

    const dataLength: any = await db
      .select(db.raw("COUNT(id) as total"))
      .fromRaw(`${tableName}`)
      .where(function () {
        this.where("op", "like", `%${params.query}%`)
          .orWhere("nomor_meja", "like", `%${params.query}%`)
          .orWhere("jenis_main", "like", `%${params.query}%`)
          .orWhere("paket_main", "like", `%${params.query}%`);
      })
      .andWhereRaw("waktu_mulai BETWEEN ? AND ?", [
        params.dateRange.from,
        params.dateRange.to,
      ])
      .andWhereRaw("lama_main IS NOT NULL")
      .andWhere("id", "NOT IN", dataUntukDikecualikan)
      .orderBy(
        params.sort.by === "tanggal" ? "waktu_mulai" : params.sort.by,
        params.sort.asc ? "ASC" : "DESC"
      )
      .first();

    pagination.pageCount = Math.ceil(dataLength.total / params.dataPerPage);
    pagination.total = dataLength.total;
    pagination.currentPage = page + 1;

    const paginatedData = await db
      .table(tableName)
      .select("*")
      .where(function () {
        this.where("op", "like", `%${params.query}%`)
          .orWhere("nomor_meja", "like", `%${params.query}%`)
          .orWhere("jenis_main", "like", `%${params.query}%`)
          .orWhere("paket_main", "like", `%${params.query}%`);
      })
      .andWhereRaw("waktu_mulai BETWEEN ? AND ?", [
        params.dateRange.from,
        params.dateRange.to,
      ])
      .andWhereRaw("lama_main IS NOT NULL")
      .andWhere("id", "NOT IN", dataUntukDikecualikan)
      .orderBy(
        params.sort.by === "tanggal" ? "waktu_mulai" : params.sort.by,
        params.sort.asc ? "ASC" : "DESC"
      )
      .limit(params.dataPerPage)
      .offset(params.dataPerPage * (page - 1));

    logger.info(`Get laporan_billing data. params: ${JSON.stringify(params)}`);
    return {
      data: paginatedData,
      pagination,
    };
  } catch (error: any) {
    logger.error(`Error get laporan_billing data. message: ${error.message}`);
    throw error;
  }
}

async function update(laporanBilling: LaporanBilling): Promise<void> {
  try {
    await db.table(tableName).where("id", laporanBilling.id).update({
      op: laporanBilling.op,
      nomor_meja: laporanBilling.nomor_meja,
      jenis_main: laporanBilling.jenis_main,
      paket_main: laporanBilling.paket_main,
      waktu_mulai: laporanBilling.waktu_mulai,
      waktu_selesai: laporanBilling.waktu_selesai,
      lama_main: laporanBilling.lama_main,
      konsumsi: laporanBilling.konsumsi,
      total_bayar_main: laporanBilling.total_bayar_main,
      total_bayar_konsumsi: laporanBilling.total_bayar_konsumsi,
      total_bayar_semua: laporanBilling.total_bayar_semua,
    });
    logger.info(
      `Update laporan_billing data. params: ${JSON.stringify(laporanBilling)}`
    );
  } catch (error: any) {
    logger.error(
      `Error update laporan_billing data. message: ${
        error.message
      }. params: ${JSON.stringify(laporanBilling)}`
    );
    throw error;
  }
}

async function destroy(id: number): Promise<void> {
  try {
    await db.table(tableName).where("id", id).delete();
    logger.info(`Delete laporan_billing data. id: ${id}`);
  } catch (error: any) {
    logger.error(
      `Error delete laporan_billing data. message: ${error.message}. id: ${id}`
    );
    throw error;
  }
}

async function destroyMany(id: number[]): Promise<void> {
  try {
    await db.table(tableName).whereIn("id", id).delete();
    logger.info(`Delete many laporan_billing data. ids: ${id}`);
  } catch (error: any) {
    logger.error(
      `Error delete many laporan_billing data. message: ${error.message}. ids: ${id}`
    );
    throw error;
  }
}

async function updateKonsumsi(
  id: number,
  stringifiedData: string,
  newTotalBayarKonsumsi: number,
  newTotalBayarSemua: number
) {
  try {
    const updated = await db
      .table(tableName)
      .where("id", id)
      .update({
        konsumsi: stringifiedData,
        total_bayar_konsumsi: newTotalBayarKonsumsi,
        total_bayar_semua: newTotalBayarSemua,
      })
      .returning(["konsumsi", "total_bayar_semua", "total_bayar_konsumsi"]);

    logger.info(
      `Update konsumsi laporan_billing data. params: ${JSON.stringify({
        id,
        stringifiedData,
        newTotalBayarKonsumsi,
        newTotalBayarSemua,
      })}`
    );
    return updated[0];
  } catch (error: any) {
    logger.error(
      `Error update konsumsi laporan_billing data. message: ${
        error.message
      }. params: ${JSON.stringify({
        id,
        stringifiedData,
        newTotalBayarKonsumsi,
        newTotalBayarSemua,
      })}`
    );
    throw error;
  }
}

async function updateTotalBayarMainDanSemua(
  id: number,
  newTotalBayarMain: number,
  newTotalBayarSemua: number
) {
  try {
    const updated = await db
      .table(tableName)
      .where("id", id)
      .update({
        total_bayar_main: newTotalBayarMain,
        total_bayar_semua: newTotalBayarSemua,
      })
      .returning(["total_bayar_semua", "total_bayar_main"]);

    logger.info(
      `Update total_bayar_main, total_bayar_semua in laporan_billing data. params: ${JSON.stringify(
        { id, newTotalBayarMain, newTotalBayarSemua }
      )}`
    );
    return updated[0];
  } catch (error: any) {
    logger.error(
      `Error update total_bayar_main, total_bayar_semua in laporan_billing data. params: ${JSON.stringify(
        { id, newTotalBayarMain, newTotalBayarSemua }
      )}`
    );
    throw error;
  }
}

async function stopTimer(id: number, lamaMain: string, waktuSelesai: string) {
  try {
    const updated = await db
      .table(tableName)
      .where("id", id)
      .update({
        lama_main: lamaMain,
        waktu_selesai: waktuSelesai,
      })
      .returning(["lama_main", "waktu_selesai"]);

    logger.info(
      `Stop timer laporan_billing, params: ${JSON.stringify({
        id,
        lamaMain,
        waktuSelesai,
      })}`
    );
    return updated[0];
  } catch (error: any) {
    logger.error(
      `Error stop timer laporan_billing, params: ${JSON.stringify({
        id,
        lamaMain,
        waktuSelesai,
      })}`
    );
    throw error;
  }
}
async function getDataCountFromDateRange(fromTs: string, toTs: string) {
  try {
    const dataUntukDikecualikan = db
      .select("hold_id")
      .from("meja_main")
      .whereRaw("hold_id IS NOT NULL");

    const result = await db
      .table(tableName)
      .count({ count: "id" })
      .whereRaw("waktu_mulai BETWEEN ? AND ?", [fromTs, toTs])
      .andWhereRaw("lama_main IS NOT NULL")
      .andWhere("id", "NOT IN", dataUntukDikecualikan)
      .first();

    logger.info(
      `Get data count from date range in laporan_billing table. params ${JSON.stringify(
        { fromTs, toTs }
      )}`
    );
    return result?.count;
  } catch (error: any) {
    logger.error(
      `Error getting data count from date range in laporan_billing table. message: ${
        error.message
      }. params ${JSON.stringify({ fromTs, toTs })}`
    );
    throw error;
  }
}

async function exportData(path: string, fromTs: string, toTs: string) {
  try {
    const dataUntukDikecualikan = db
      .select("hold_id")
      .from("meja_main")
      .whereRaw("hold_id IS NOT NULL");

    const result = await db
      .select(
        "id AS ID",
        "op AS Operator",
        "nomor_meja AS 'Nomor Meja'",
        "versi_ps AS 'Versi PS'",
        "jenis_main AS 'Jenis Main'",
        "paket_main AS 'Paket Main'",
        "waktu_mulai AS 'Waktu Mulai'",
        "waktu_selesai AS 'Waktu Selesai'",
        "lama_main AS 'Lama Main'",
        "total_bayar_main AS 'Bayar Main'",
        "total_bayar_konsumsi AS 'Bayar Konsumsi'",
        "total_bayar_semua AS 'Total Bayar'"
      )
      .from(tableName)
      .whereRaw("waktu_mulai BETWEEN ? AND ?", [fromTs, toTs])
      .andWhereRaw("lama_main IS NOT NULL")
      .andWhere("id", "NOT IN", dataUntukDikecualikan);

    exportCSV(result, path);
    logger.info(
      `Export data laporan_billing table. params ${JSON.stringify({
        path,
        fromTs,
        toTs,
      })}`
    );
  } catch (error: any) {
    logger.info(
      `Error exporting data laporan_billing table. message: ${
        error.message
      } params ${JSON.stringify({ path, fromTs, toTs })}`
    );
    throw error;
  }
}

const laporanBillingRepository = {
  store,
  get,
  update,
  destroy,
  destroyMany,
  updateKonsumsi,
  updateTotalBayarMainDanSemua,
  stopTimer,
  getDataCountFromDateRange,
  exportData,
};

export default laporanBillingRepository;
