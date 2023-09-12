import { IPCHandler } from "../@types/ipc-handler";
import { LaporanSewa } from "../@types/models";
import { PaginationParams } from "../@types/pagination";
import laporanSewaCrudChannelNames from "../channel_names/laporan-sewa-crud-channel-names";
import laporanSewaRepository from "../repositories/laporan-sewa-repository";

const handlers: IPCHandler[] = [
  {
    channelName: laporanSewaCrudChannelNames.ADD,
    action: async (_event, laporanSewa: LaporanSewa) => {
      try {
        await laporanSewaRepository.store(laporanSewa);
      } catch (error: any) {
        throw error;
      }
    },
  },
  {
    channelName: laporanSewaCrudChannelNames.GET,
    action: async (_event, params: PaginationParams) => {
      try {
        const allLaporanSewa = await laporanSewaRepository.get(params);
        return allLaporanSewa;
      } catch (error) {
        throw error;
      }
    },
  },
  {
    channelName: laporanSewaCrudChannelNames.UPDATE_STATUS,
    action: async (_event, id: number, new_status: 0 | 1) => {
      try {
        await laporanSewaRepository.updateStatus(id, new_status);
      } catch (error: any) {
        throw error;
      }
    },
  },
  {
    channelName: laporanSewaCrudChannelNames.UPDATE,
    action: async (_event, laporanSewa: LaporanSewa) => {
      try {
        await laporanSewaRepository.update(laporanSewa);
      } catch (error: any) {
        throw error;
      }
    },
  },
  {
    channelName: laporanSewaCrudChannelNames.DELETE,
    action: async (_event, id: number) => {
      try {
        await laporanSewaRepository.destroy(id);
      } catch (error) {
        throw error;
      }
    },
  },
  {
    channelName: laporanSewaCrudChannelNames.BULK_DELETE,
    action: async (_event, id: number[]) => {
      try {
        await laporanSewaRepository.destroyMany(id);
      } catch (error) {
        throw error;
      }
    },
  },
  {
    channelName: laporanSewaCrudChannelNames.GET_COUNT_FROM_DATE_RANGE,
    action: async (_event, fromTs: string, toTs: string) => {
      try {
        const count = await laporanSewaRepository.getDataCountFromDateRange(
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
    channelName: laporanSewaCrudChannelNames.EXPORT,
    action: async (_event, path: string, fromTs: string, toTs: string) => {
      try {
        await laporanSewaRepository.exportData(path, fromTs, toTs);
      } catch (error) {
        throw error;
      }
    },
  },
];

export default handlers;
