import { IPCHandler } from "../@types/ipc-handler";
import playstationsCrudChannelNames from "../channel_names/playstations-crud-channel-names";
import playstationsRepository from "../repositories/playstations-repository";

const handlers: IPCHandler[] = [
  {
    channelName: playstationsCrudChannelNames.ADD,
    action: async (_event, versi: number, tarif_per_menit: number) => {
      try {
        await playstationsRepository.store(versi, tarif_per_menit);
      } catch (error: any) {
        if (error.message.includes("SQLITE_CONSTRAINT: UNIQUE")) {
          throw new Error("Versi PS ini sudah ada");
        }
        throw error;
      }
    },
  },
  {
    channelName: playstationsCrudChannelNames.GET_ALL,
    action: async (_event) => {
      try {
        const allPlaystations = await playstationsRepository.get();
        return allPlaystations;
      } catch (error) {
        throw error;
      }
    },
  },
  {
    channelName: playstationsCrudChannelNames.UPDATE_TARIF,
    action: async (_event, versi: number, tarif_per_menit: number) => {
      try {
        await playstationsRepository.updateTarifPerMenit(
          versi,
          tarif_per_menit,
        );
      } catch (error: any) {
        if (error.message.includes("SQLITE_CONSTRAINT: UNIQUE")) {
          throw new Error("Versi PS ini sudah ada");
        }
        throw error;
      }
    },
  },
  {
    channelName: playstationsCrudChannelNames.DELETE,
    action: async (_event, id: number) => {
      try {
        await playstationsRepository.destroy(id);
      } catch (error) {
        throw error;
      }
    },
  },
];

export default handlers;
