import { db } from "../lib/db/knexfile";
import logger from "../lib/logging/logger";

async function store(nama_produk: string, harga: number) {
  try {
    await db
      .table("logistik")
      .insert({
        nama_produk,
        harga,
      })
      .returning("id");
    logger.info(
      `Insert logistik data. params: ${JSON.stringify({ nama_produk, harga })}`,
    );
  } catch (error: any) {
    logger.error(
      `Error inserting logistik data. message: ${
        error.message
      }. params: ${JSON.stringify({ nama_produk, harga })}`,
    );
    throw error;
  }
}

async function get() {
  try {
    const logistik = await db.table("logistik").select();
    logger.info(`Get logisitk data.`);
    return logistik;
  } catch (error: any) {
    logger.error(`Error getting logistik data. message: ${error.message}.`);
    throw error;
  }
}

async function updateNamaProduk(id: number, nama_produk: string) {
  try {
    await db.table("logistik").where("id", id).update({
      nama_produk,
    });
    logger.info(
      `Update logistik.nama_produk. params: ${JSON.stringify({
        id,
        nama_produk,
      })}`,
    );
  } catch (error: any) {
    logger.error(
      `Error updating logistik.nama_produk. message: ${
        error.mesage
      }. params: ${JSON.stringify({ id, nama_produk })}`,
    );
    throw error;
  }
}

async function updateHarga(id: number, harga: number) {
  try {
    await db.table("logistik").where("id", id).update({
      harga,
    });
    logger.info(
      `Update logistik.harga. params: ${JSON.stringify({ id, harga })}`,
    );
  } catch (error: any) {
    logger.error(
      `Error updating logistik.harga. message: ${
        error.message
      }. params: ${JSON.stringify({ id, harga })}`,
    );
    throw error;
  }
}

async function destroy(id: number) {
  try {
    await db.table("logistik").where("id", id).delete();
    logger.info(`Delete logistik data. id: ${id}`);
  } catch (error: any) {
    logger.error(
      `Error deleting logisitk data. message: ${error.message}. id: ${id}`,
    );
    throw error;
  }
}

const logistikRepository = {
  store,
  get,
  updateNamaProduk,
  updateHarga,
  destroy,
};

export default logistikRepository;
