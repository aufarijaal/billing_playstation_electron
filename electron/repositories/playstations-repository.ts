import { db } from "../lib/db/knexfile";
import logger from "../lib/logging/logger";

const tableName = "playstations";

async function store(versi: number, tarif_per_menit: number) {
  try {
    await db.table(tableName).insert({
      versi,
      tarif_per_menit,
    });
    logger.info(
      `New playstation data inserted. params: ${JSON.stringify({
        versi,
        tarif_per_menit,
      })}`,
    );
  } catch (error: any) {
    logger.error(
      `Error inserting playstation data. message: ${
        error.message
      }. params: ${JSON.stringify({ versi, tarif_per_menit })}`,
    );
    throw error;
  }
}

async function get() {
  try {
    const playstations = await db.table(tableName).select();
    logger.info(`Get playstation data`);
    return playstations;
  } catch (error: any) {
    logger.error(`Error getting playstation data. message: ${error.message}`);
    throw error;
  }
}

async function updateTarifPerMenit(versi: number, tarif_per_menit: number) {
  try {
    await db.table(tableName).where("versi", versi).update({
      tarif_per_menit,
    });
    logger.info(
      `Update playstation.tarif_per_menit. params: ${JSON.stringify({
        versi,
        tarif_per_menit,
      })}`,
    );
  } catch (error: any) {
    logger.error(
      `Error updating playstation.tarif_per_menit. message: ${
        error.message
      }. params: ${JSON.stringify({ versi, tarif_per_menit })}`,
    );
    throw error;
  }
}

async function destroy(versi: number) {
  try {
    await db.table(tableName).where("versi", versi).delete();
    logger.info(`Delete playstation data. versi: ${versi}`);
  } catch (error: any) {
    logger.error(
      `Errror deleting playstation data. message: ${error.message}. versi: ${versi}`,
    );
    throw error;
  }
}

const playstationsRepository = {
  store,
  get,
  updateTarifPerMenit,
  destroy,
};

export default playstationsRepository;
