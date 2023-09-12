import dayjs from "dayjs";
import { countdown } from "../../src/utils/timer-and-stopwatch";
import type { LaporanBilling } from "../@types/models";
import { db } from "../lib/db/knexfile";
import logger from "../lib/logging/logger";
const tableName: string = "meja_main";

async function store(nomor_meja: number, versi_ps: number) {
  try {
    await db.table(tableName).insert({
      nomor_meja,
      versi_ps,
    });
    logger.info(
      `New meja_main data inserted. params: ${JSON.stringify({
        nomor_meja,
        versi_ps,
      })}`,
    );
  } catch (error: any) {
    logger.error(
      `Error inserting meja_main data. message: ${
        error.message
      }. params: ${JSON.stringify({ nomor_meja, versi_ps })}`,
    );
    throw error;
  }
}

async function get() {
  try {
    const allMejaMain = await db.table(tableName).select();

    logger.info(`Get meja_main data.`);
    return allMejaMain;
  } catch (error: any) {
    logger.error(`Error getting meja_main data. message: ${error.message}`);
    throw error;
  }
}

async function getWithRelation() {
  try {
    const data = await db
      .select(
        "meja_main.nomor_meja",
        "meja_main.versi_ps",
        "playstations.tarif_per_menit",
        "meja_main.hold_id",
        "lb.op AS laporan_op",
        "lb.versi_ps AS laporan_versi_ps",
        "lb.jenis_main AS laporan_jenis_main",
        "lb.paket_main AS laporan_paket_main",
        "lb.waktu_mulai AS laporan_waktu_mulai",
        "lb.waktu_selesai AS laporan_waktu_selesai",
        "lb.lama_main AS laporan_lama_main",
        "lb.konsumsi AS laporan_konsumsi",
        "lb.total_bayar_main AS laporan_total_bayar_main",
        "lb.total_bayar_konsumsi AS laporan_total_bayar_konsumsi",
        "lb.total_bayar_semua AS laporan_total_bayar_semua",
      )
      .from(tableName)
      .leftJoin("playstations", "meja_main.versi_ps", "playstations.versi")
      .leftJoin("laporan_billing AS lb", "meja_main.hold_id", "lb.id");

    logger.info(`Get all meja_main data with relations.`);
    return data;
  } catch (error: any) {
    logger.error(
      `Error getting all meja_main data with relations. message: ${error.mesage}`,
    );
    throw error;
  }
}

interface GetOneMejaMainWithRelation {
  nomor_meja: number;
  versi_ps: number;
  tarif_per_menit: number;
  hold_id?: number;
  laporan_op?: string;
  laporan_versi_ps?: number;
  laporan_jenis_main?: "diwaktu" | "los";
  laporan_paket_main?: string;
  laporan_waktu_mulai?: string;
  laporan_waktu_selesai?: string;
  laporan_lama_main?: string;
  laporan_konsumsi?: string;
  laporan_total_bayar_main?: number;
  laporan_total_bayar_konsumsi?: number;
  laporan_total_bayar_semua?: number;
}

async function getOneWithRelation(
  nomorMeja: number,
): Promise<GetOneMejaMainWithRelation | null> {
  try {
    db.transaction(async function (trx) {
      const data: GetOneMejaMainWithRelation[] = await trx
        .select(
          "meja_main.nomor_meja",
          "meja_main.versi_ps",
          "playstations.tarif_per_menit",
          "meja_main.hold_id",
          "lb.op AS laporan_op",
          "lb.versi_ps AS laporan_versi_ps",
          "lb.jenis_main AS laporan_jenis_main",
          "lb.paket_main AS laporan_paket_main",
          "lb.waktu_mulai AS laporan_waktu_mulai",
          "lb.waktu_selesai AS laporan_waktu_selesai",
          "lb.lama_main AS laporan_lama_main",
          "lb.konsumsi AS laporan_konsumsi",
          "lb.total_bayar_main AS laporan_total_bayar_main",
          "lb.total_bayar_konsumsi AS laporan_total_bayar_konsumsi",
          "lb.total_bayar_semua AS laporan_total_bayar_semua",
        )
        .from(tableName)
        .leftJoin("playstations", "meja_main.versi_ps", "playstations.versi")
        .leftJoin("laporan_billing AS lb", "meja_main.hold_id", "lb.id")
        .where("meja_main.nomor_meja", nomorMeja);

      if (data[0] && data[0].hold_id !== null) {
        let totalBayarKonsumsiUntukJenisMainLos =
          data[0].laporan_total_bayar_konsumsi!;
        if (data[0].laporan_konsumsi !== "[]") {
          const konsumsiListParsed = JSON.parse(data[0].laporan_konsumsi!);
          const hasilKalkulasiUlangTotalBayarKonsumsi =
            konsumsiListParsed.reduce(
              (acc: number, konsumsi: any) => acc + konsumsi.bayar,
              0,
            );
          const result = await trx
            .table("laporan_billing")
            .where("id", data[0].hold_id)
            .update({
              total_bayar_konsumsi: hasilKalkulasiUlangTotalBayarKonsumsi,
              total_bayar_semua:
                hasilKalkulasiUlangTotalBayarKonsumsi +
                data[0].laporan_total_bayar_main,
            })
            .returning(["total_bayar_konsumsi"]);

          totalBayarKonsumsiUntukJenisMainLos = result[0].total_bayar_konsumsi;
        }

        if (
          data[0].laporan_jenis_main === "diwaktu" &&
          !data[0].laporan_lama_main
        ) {
          const waktuSudahHabis =
            countdown(
              data[0].laporan_waktu_mulai!,
              data[0].laporan_waktu_selesai!,
            ).percentage >= 100;
          const duration = dayjs(data[0].laporan_waktu_selesai).diff(
            data[0].laporan_waktu_mulai,
            "second",
          );
          const hours = Math.floor(duration / 3600);
          const minutes = Math.floor((duration % 3600) / 60);
          const seconds = duration % 60;

          const lamaMainString = `${hours} Jam ${minutes} Menit ${seconds} Detik`;
          if (waktuSudahHabis) {
            await trx
              .table("laporan_billing")
              .where("id", data[0].hold_id)
              .update({
                lama_main: lamaMainString,
              });
          }
        }

        // KHUSUS JIKA JENIS MAINNYA "Los" yang status nya masih bermain / belum di stop.
        // Sebelum me-return data, update data bayar konsumsi, bayar main, dan total bayar / semua
        // Hal ini dilakukan barang kali sebelumnya operator melakukan keluar aplikasi secara mendadak / crash
        // yang menyebabkan data tidak sinkron.
        // Dan ini supaya front-end tidak usah pusing pusing memikirkan apakah data bayar konsumsi, bayar main, dan total nya sudah sinkron apa belum.
        // Semua nya sudah diatur disini.
        if (
          data[0]?.laporan_jenis_main === "los" &&
          !data[0].laporan_lama_main
        ) {
          function getMenitTerlalui(startTime: string) {
            const startTimestamp = new Date(startTime).getTime();
            const currentTimestamp = new Date().getTime();
            const elapsedDuration = currentTimestamp - startTimestamp;
            const elapsedMinutes = Math.floor(elapsedDuration / 60000);

            return elapsedMinutes;
          }

          const totalMenitTerlalui = getMenitTerlalui(
            data[0].laporan_waktu_mulai!,
          );
          const totalBayarMainUntukDimasukkanUlang =
            totalMenitTerlalui * data[0].tarif_per_menit;

          await trx
            .table("laporan_billing")
            .where("id", data[0].hold_id)
            .update({
              total_bayar_main: totalBayarMainUntukDimasukkanUlang,
              total_bayar_semua:
                totalBayarMainUntukDimasukkanUlang +
                totalBayarKonsumsiUntukJenisMainLos,
            });
        }

        logger.info(
          `Get one meja_main data with relations. nomor_meja: ${nomorMeja}`,
        );
      }
    });

    const data: GetOneMejaMainWithRelation[] = await db
      .select(
        "meja_main.nomor_meja",
        "meja_main.versi_ps",
        "playstations.tarif_per_menit",
        "meja_main.hold_id",
        "lb.op AS laporan_op",
        "lb.versi_ps AS laporan_versi_ps",
        "lb.jenis_main AS laporan_jenis_main",
        "lb.paket_main AS laporan_paket_main",
        "lb.waktu_mulai AS laporan_waktu_mulai",
        "lb.waktu_selesai AS laporan_waktu_selesai",
        "lb.lama_main AS laporan_lama_main",
        "lb.konsumsi AS laporan_konsumsi",
        "lb.total_bayar_main AS laporan_total_bayar_main",
        "lb.total_bayar_konsumsi AS laporan_total_bayar_konsumsi",
        "lb.total_bayar_semua AS laporan_total_bayar_semua",
      )
      .from(tableName)
      .leftJoin("playstations", "meja_main.versi_ps", "playstations.versi")
      .leftJoin("laporan_billing AS lb", "meja_main.hold_id", "lb.id")
      .where("meja_main.nomor_meja", nomorMeja);
    return data[0];
  } catch (error: any) {
    logger.error(
      `Error getting one meja_main data with relations. message: ${error.mesage}. nomor_meja: ${nomorMeja}`,
    );
    throw error;
  }
}

async function updateVersiPS(nomorMeja: number, versi_ps: number) {
  try {
    await db.table(tableName).where("nomor_meja", nomorMeja).update({
      versi_ps,
    });

    logger.info(
      `Update meja_main.versi_ps. params: ${JSON.stringify({
        nomorMeja: versi_ps,
      })}`,
    );
  } catch (error: any) {
    logger.error(
      `Error updating meja_main.versi_ps. message: ${
        error.message
      } params: ${JSON.stringify({ nomorMeja: versi_ps })}`,
    );
    throw error;
  }
}

async function destroy(nomor: number) {
  try {
    await db.table(tableName).where("nomor_meja", nomor).delete();

    logger.info(`Delete meja_main data. nomor_meja: ${nomor}`);
  } catch (error: any) {
    logger.error(
      `Error deleting meja_main data. message: ${error.message}. nomor_meja: ${nomor}`,
    );
    throw error;
  }
}

/**
 * Memasukkan data ke laporan billing dan mengupdate hold_id di meja main terkait dari laporan_billing yang baru saja dibuat
 * Ini terjadi ketika operator memulai permainan pada meja main entah itu "Los" ataupun "diwaktu".
 * Function dibawah hanya untuk memasukkan data baru ke laporan billing dan mengupdate hold_id di meja main
 * Function ini tidak mengembalikan data nya, untuk mengambil data nya, pakai function getState.
 * @param {number} nomorMeja
 * @param {LaporanBilling} billingParams
 */
async function assignState(nomorMeja: number, billingParams: LaporanBilling) {
  try {
    await db.transaction(async function (trx) {
      const playingData = await trx
        .table("laporan_billing")
        .insert({
          op: billingParams.op,
          nomor_meja: billingParams.nomor_meja,
          versi_ps: billingParams.versi_ps,
          jenis_main: billingParams.jenis_main,
          paket_main: billingParams.paket_main,
          waktu_mulai: billingParams.waktu_mulai,
          waktu_selesai: billingParams.waktu_selesai,
          lama_main: billingParams.lama_main,
          konsumsi: billingParams.konsumsi,
          total_bayar_main: billingParams.total_bayar_main,
          total_bayar_konsumsi: billingParams.total_bayar_konsumsi,
          total_bayar_semua: billingParams.total_bayar_semua,
        })
        .returning("*");

      await trx.table(tableName).where("nomor_meja", nomorMeja).update({
        hold_id: playingData[0].id,
      });
    });
    logger.info(
      `Assign state to meja_main ${nomorMeja}. params: ${JSON.stringify(
        billingParams,
      )}`,
    );
  } catch (error: any) {
    logger.error(
      `Error assigning state to meja_main ${nomorMeja}. message: ${
        error.message
      }. params: ${JSON.stringify(billingParams)}`,
    );
    throw error;
  }
}

/**
 * Function untuk mendapatkan data permainan dari nomor meja yang dispesifikasikan melalui parameter.
 * Jika hold_id pada nomor meja yang ditentukan null, maka nilai null akan dikembalikan dan sisi front end tidak akan menjalankan timer / stopwatch
 * timer / stopwatch juga tidak akan dijalankan di sisi front end jika, timer sudah habis (waktu_selesai sudah lewat dari waktu sekarang) / stopwatch sudah dihentikan (waktu_selesai tidak null dan sudah lewat dari waktu sekarang)
 * Namun jika hold_id ada, dan timer belum habis (waktu_selesai belum lewat dari waktu sekarang) / stopwatch belum dihentikan (waktu_selesai masih null), maka sisi front end akan menjalankan timer.
 * @param {number} nomorMeja
 * @return {*}  {(Promise<LaporanBilling | null>)}
 */
async function getState(nomorMeja: number): Promise<LaporanBilling | null> {
  try {
    const holdIdExist = await db
      .table(tableName)
      .select("hold_id")
      .where("nomor_meja", nomorMeja)
      .first();

    if (holdIdExist) {
      const playingData = await db
        .table("laporan_billing")
        .select("*")
        .where("id", holdIdExist.hold_id)
        .first();
      return playingData;
    } else {
      return null;
    }
  } catch (error: any) {
    throw error;
  }
}

async function detachHoldId(nomorMeja: number): Promise<void> {
  try {
    await db.table(tableName).where("nomor_meja", nomorMeja).update({
      hold_id: null,
    });

    logger.info(`Detach hold_id from meja_main ${nomorMeja}`);
  } catch (error: any) {
    logger.error(
      `Error detaching hold_id from meja_main ${nomorMeja}. message: ${error.message}`,
    );
    throw error;
  }
}

async function getSisaWaktu(
  nomorNomorMeja: number[],
): Promise<Record<string, unknown>[] | undefined> {
  try {
    const holdIds = db
      .select("hold_id")
      .from("meja_main")
      .whereIn("nomor_meja", nomorNomorMeja)
      .andWhereRaw("hold_id IS NOT NULL");

    const dataMain = await db
      .select("id", "nomor_meja", "waktu_selesai")
      .from("laporan_billing")
      .whereIn("id", holdIds)
      .andWhere("jenis_main", "diwaktu")
      .andWhereRaw("lama_main IS NULL");

    const dataMainUntukDiberiBgTimeout: {
      nomor_meja: number;
      waktu_selesai: string;
      timeout: number;
    }[] = [];

    if (dataMain.length) {
      for (let i = 0; i < dataMain.length; i++) {
        const endTimestamp = new Date(dataMain[i].waktu_selesai).getTime();
        const currentTimestamp = new Date().getTime();
        const sisaDetik = Math.max(0, endTimestamp - currentTimestamp);
        if (sisaDetik > 0) {
          dataMainUntukDiberiBgTimeout.push({
            nomor_meja: dataMain[i].nomor_meja,
            waktu_selesai: dataMain[i].waktu_selesai,
            timeout: sisaDetik,
          });
        }
      }
    }

    logger.info(`Get sisa waktu meja ${[...nomorNomorMeja]}`);
    return dataMainUntukDiberiBgTimeout;
  } catch (error: any) {
    logger.error(
      `Error getting sisa waktu on meja ${JSON.stringify(
        nomorNomorMeja,
      )}. message: ${error.message}`,
    );
    throw error;
  }
}

const mejaMainRepository = {
  store,
  get,
  updateVersiPS,
  destroy,
  assignState,
  getState,
  detachHoldId,
  getWithRelation,
  getOneWithRelation,
  getSisaWaktu,
};

export default mejaMainRepository;
