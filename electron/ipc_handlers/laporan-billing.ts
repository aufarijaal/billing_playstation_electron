import { IPCHandler } from "../@types/ipc-handler";
import { PaginationParams } from "../@types/pagination";
import { LaporanBilling } from "../@types/models";
import laporanBillingCrudChannelNames from "../channel_names/laporan-billing-crud-channel-names";
import laporanBillingRepository from "../repositories/laporan-billing-repository";

const handlers: IPCHandler[] = [
  {
    channelName: laporanBillingCrudChannelNames.ADD,
    action: async (_event, laporanBilling: LaporanBilling) => {
      try {
        const inserted = await laporanBillingRepository.store(laporanBilling);
        return inserted;
      } catch (error: any) {
        throw error;
      }
    },
  },
  {
    channelName: laporanBillingCrudChannelNames.GET,
    action: async (_event, params: PaginationParams) => {
      try {
        const allLaporanBilling = await laporanBillingRepository.get(params);
        return allLaporanBilling;
      } catch (error) {
        throw error;
      }
    },
  },
  {
    channelName: laporanBillingCrudChannelNames.UPDATE,
    action: async (_event, laporanBilling: LaporanBilling) => {
      try {
        await laporanBillingRepository.update(laporanBilling);
      } catch (error: any) {
        throw error;
      }
    },
  },
  {
    channelName: laporanBillingCrudChannelNames.DELETE,
    action: async (_event, id: number) => {
      try {
        await laporanBillingRepository.destroy(id);
      } catch (error) {
        throw error;
      }
    },
  },
  {
    channelName: laporanBillingCrudChannelNames.BULK_DELETE,
    action: async (_event, id: number[]) => {
      try {
        await laporanBillingRepository.destroyMany(id);
      } catch (error) {
        throw error;
      }
    },
  },
  {
    channelName: laporanBillingCrudChannelNames.UPDATE_KONSUMSI,
    action: async (
      _event,
      id: number,
      stringifiedData: string,
      newTotalBayarKonsumsi: number,
      newTotalBayarSemua: number
    ) => {
      try {
        const updated = await laporanBillingRepository.updateKonsumsi(
          id,
          stringifiedData,
          newTotalBayarKonsumsi,
          newTotalBayarSemua
        );

        return updated;
      } catch (error) {
        throw error;
      }
    },
  },
  {
    channelName:
      laporanBillingCrudChannelNames.UPDATE_TOTAL_BAYAR_MAIN_DAN_SEMUA,
    action: async (
      _event,
      id: number,
      newTotalBayarMain: number,
      newTotalBayarSemua: number
    ) => {
      try {
        const updated =
          await laporanBillingRepository.updateTotalBayarMainDanSemua(
            id,
            newTotalBayarMain,
            newTotalBayarSemua
          );

        return updated;
      } catch (error) {
        throw error;
      }
    },
  },
  {
    channelName: laporanBillingCrudChannelNames.STOP_TIMER,
    action: async (
      _event,
      id: number,
      lamaMain: string,
      waktuSelesai: string
    ) => {
      try {
        const updated = await laporanBillingRepository.stopTimer(
          id,
          lamaMain,
          waktuSelesai
        );

        return updated;
      } catch (error) {
        throw error;
      }
    },
  },
  {
    channelName: laporanBillingCrudChannelNames.GET_COUNT_FROM_DATE_RANGE,
    action: async (_event, fromTs: string, toTs: string) => {
      try {
        const count = await laporanBillingRepository.getDataCountFromDateRange(
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
    channelName: laporanBillingCrudChannelNames.EXPORT,
    action: async (_event, path: string, fromTs: string, toTs: string) => {
      try {
        await laporanBillingRepository.exportData(path, fromTs, toTs);
      } catch (error) {
        throw error;
      }
    },
  },
];

export default handlers;
