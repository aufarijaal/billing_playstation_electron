import dayjs from "dayjs";
import type { Operator } from "../@types/models";
import { db } from "../lib/db/knexfile";
import logger from "../lib/logging/logger";

async function store(operator: Operator) {
  try {
    await db.table("operators").insert({
      username: operator.username,
      password: operator.password,
      full_access: operator.full_access,
    });
    logger.info(`New operator inserted.`);
  } catch (error: any) {
    logger.error(`Error inserting new operator. message: ${error.message}`);
    throw error;
  }
}

async function get() {
  try {
    const operators = await db.table("operators").select();

    logger.info(`Get operators data.`);
    return operators;
  } catch (error: any) {
    logger.error(`Error getting operators data. message: ${error.message}`);
    throw error;
  }
}

async function update(operator: Operator) {
  try {
    await db.table("operators").where("id", operator.id).update({
      username: operator.username,
      password: operator.password,
      full_access: operator.full_access,
    });

    logger.info(`Update operator data.`);
  } catch (error: any) {
    if ((error.message as string).includes("SQLITE_CONSTRAINT: UNIQUE")) {
      throw new Error("Nama sudah dipakai");
    }

    logger.error(`Error updating operator data.`);
    throw error;
  }
}

async function destroy(id: number) {
  try {
    await db.table("operators").where("id", id).delete();
    logger.info(`Delete operator data.`);
  } catch (error: any) {
    logger.error(`Error deleting operator data. message: ${error.message}`);
    throw error;
  }
}

async function login(username: string, password: string) {
  try {
    const operator = await db
      .table("operators")
      .select("username", "full_access")
      .where("username", username)
      .andWhere("password", password)
      .first();
    if (!operator) {
      throw new Error("Data Operator tidak ditemukan");
    } else {
      logger.info(`Logging in operator. username: ${username}`);
      return {
        username: operator.username,
        full_access: operator.full_access,
        logged_in_at: dayjs().format("DD/MM/YYYY HH:mm:ss"),
      } as OperatorSession;
    }
  } catch (error) {
    logger.error(`Error logging in operator. username: ${username}`);
    throw error;
  }
}

const operatorsRepository = {
  store,
  get,
  update,
  destroy,
  login,
};

export default operatorsRepository;
