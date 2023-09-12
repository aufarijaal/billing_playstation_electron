import { IPCHandler } from "../@types/ipc-handler";
import { Pengeluaran } from "../@types/models";
import { PaginationParams } from "../@types/pagination";
import pengeluaranCrudChannelNames from "../channel_names/pengeluaran-crud-channel-names";
import pengeluaranRepository from "../repositories/pengeluaran-repository";

const handlers: IPCHandler[] = [
  {
    channelName: pengeluaranCrudChannelNames.ADD,
    action: async (_event, pengeluaran: Pengeluaran) => {
      try {
        await pengeluaranRepository.store(pengeluaran);
      } catch (error: any) {
        throw error;
      }
    },
  },
  {
    channelName: pengeluaranCrudChannelNames.GET,
    action: async (_event, params: PaginationParams) => {
      try {
        const pengeluaranData = await pengeluaranRepository.get(params);
        return pengeluaranData;
      } catch (error) {
        throw error;
      }
    },
  },
  {
    channelName: pengeluaranCrudChannelNames.UPDATE,
    action: async (_event, pengeluaran: Pengeluaran) => {
      try {
        await pengeluaranRepository.update(pengeluaran);
      } catch (error: any) {
        throw error;
      }
    },
  },
  {
    channelName: pengeluaranCrudChannelNames.DELETE,
    action: async (_event, id: number) => {
      try {
        await pengeluaranRepository.destroy(id);
      } catch (error) {
        throw error;
      }
    },
  },
  {
    channelName: pengeluaranCrudChannelNames.BULK_DELETE,
    action: async (_event, id: number[]) => {
      try {
        await pengeluaranRepository.destroyMany(id);
      } catch (error) {
        throw error;
      }
    },
  },
  {
    channelName: pengeluaranCrudChannelNames.GET_COUNT_FROM_DATE_RANGE,
    action: async (_event, fromTs: string, toTs: string) => {
      try {
        const count = await pengeluaranRepository.getDataCountFromDateRange(
          fromTs,
          toTs
        );

        return count;
      } catch (error) {
        throw error;
      }
    },
  },
  {
    channelName: pengeluaranCrudChannelNames.EXPORT,
    action: async (_event, path: string, fromTs: string, toTs: string) => {
      try {
        await pengeluaranRepository.exportData(path, fromTs, toTs);
      } catch (error) {
        throw error;
      }
    },
  },
];

export default handlers;
