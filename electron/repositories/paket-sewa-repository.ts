import { db } from "../lib/db/knexfile";
import logger from "../lib/logging/logger";

const tableName = "paket_sewa";

async function store(nama_paket: string, harga: number) {
  try {
    await db
      .table(tableName)
      .insert({
        nama_paket,
        harga,
      })
      .returning("id");
    logger.info(
      `New paket_sewa inserted. params: ${JSON.stringify({
        nama_paket,
        harga,
      })}`,
    );
  } catch (error: any) {
    logger.error(
      `Error inserting paket_sewa. message: ${
        error.message
      }. params: ${JSON.stringify({ nama_paket, harga })}`,
    );
    throw error;
  }
}

async function get() {
  try {
    const allPaketSewa = await db.table(tableName).select();
    logger.info(`Get all paket_sewa data.`);
    return allPaketSewa;
  } catch (error: any) {
    logger.error(`Error getting paket_sewa data. message: ${error.message}`);
    throw error;
  }
}

async function updateNamaPaket(id: number, nama_paket: string) {
  try {
    await db.table(tableName).where("id", id).update({
      nama_paket,
    });

    logger.info(
      `Update paket_sewa.nama_paket. params: ${JSON.stringify({
        id,
        nama_paket,
      })}`,
    );
  } catch (error: any) {
    logger.error(
      `Error updating paket_sewa.nama_paket. message: ${
        error.message
      } params: ${JSON.stringify({ id, nama_paket })}`,
    );
    throw error;
  }
}

async function updateHarga(id: number, harga: number) {
  try {
    await db.table(tableName).where("id", id).update({
      harga,
    });
    logger.info(
      `Update paket_sewa.harga. params: ${JSON.stringify({ id, harga })}`,
    );
  } catch (error: any) {
    logger.error(
      `Error updating paket_sewa.harga. message: ${
        error.message
      } params: ${JSON.stringify({ id, harga })}`,
    );
    throw error;
  }
}

async function destroy(id: number) {
  try {
    await db.table(tableName).where("id", id).delete();
    logger.info(`Delete paket_sewa data. id: ${id}`);
  } catch (error: any) {
    logger.error(
      `Error deleting paket_sewa data. message: ${error.message} id: ${id}`,
    );
    throw error;
  }
}

const paketSewaRepository = {
  store,
  get,
  updateNamaPaket,
  updateHarga,
  destroy,
};

export default paketSewaRepository;
