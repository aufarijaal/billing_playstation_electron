import { IPCHandler } from "../@types/ipc-handler";
import { LaporanBilling } from "../@types/models";
import mejaMainCrudChannelNames from "../channel_names/meja-main-crud-channel-names";
import mejaMainRepository from "../repositories/meja-main-repository";

const handlers: IPCHandler[] = [
  {
    channelName: mejaMainCrudChannelNames.ADD,
    action: async (_event, nomor: number, versi_ps: number) => {
      try {
        await mejaMainRepository.store(nomor, versi_ps);
      } catch (error: any) {
        if (error.message.includes("SQLITE_CONSTRAINT: UNIQUE")) {
          throw new Error("Meja main nomor ini sudah ada");
        }
        throw error;
      }
    },
  },
  {
    channelName: mejaMainCrudChannelNames.GET_ALL,
    action: async (_event) => {
      try {
        const allMejaMain = await mejaMainRepository.get();
        return allMejaMain;
      } catch (error) {
        throw error;
      }
    },
  },
  {
    channelName: mejaMainCrudChannelNames.UPDATE_VERSI_PS,
    action: async (_event, nomor: number, versi_ps: number) => {
      try {
        await mejaMainRepository.updateVersiPS(nomor, versi_ps);
      } catch (error: any) {
        if (error.message.includes("SQLITE_CONSTRAINT: UNIQUE")) {
          throw new Error("Meja main ini sudah ada");
        }
        throw error;
      }
    },
  },
  {
    channelName: mejaMainCrudChannelNames.DELETE,
    action: async (_event, nomor: number) => {
      try {
        await mejaMainRepository.destroy(nomor);
      } catch (error) {
        throw error;
      }
    },
  },
  {
    channelName: mejaMainCrudChannelNames.ASSIGN_STATE,
    action: async (
      _event,
      nomorMeja: number,
      billingParams: LaporanBilling,
    ) => {
      try {
        await mejaMainRepository.assignState(nomorMeja, billingParams);
      } catch (error) {
        throw error;
      }
    },
  },
  {
    channelName: mejaMainCrudChannelNames.GET_STATE,
    action: async (_event, nomorMeja: number) => {
      try {
        const playingData = await mejaMainRepository.getState(nomorMeja);
        return playingData;
      } catch (error) {
        throw error;
      }
    },
  },
  {
    channelName: mejaMainCrudChannelNames.DETACH_HOLD_ID,
    action: async (_event, nomorMeja: number) => {
      try {
        await mejaMainRepository.detachHoldId(nomorMeja);
      } catch (error) {
        throw error;
      }
    },
  },
  {
    channelName: mejaMainCrudChannelNames.GET_ALL_WITH_RELATION,
    action: async (_event) => {
      try {
        const data = await mejaMainRepository.getWithRelation();
        return data;
      } catch (error) {
        throw error;
      }
    },
  },
  {
    channelName: mejaMainCrudChannelNames.GET_ONE_WITH_RELATION,
    action: async (_event, nomorMeja: number) => {
      try {
        const data = await mejaMainRepository.getOneWithRelation(nomorMeja);
        return data;
      } catch (error) {
        throw error;
      }
    },
  },
  {
    channelName: mejaMainCrudChannelNames.GET_SISA_WAKTU,
    action: async (_event, nomorMeja: number[]) => {
      try {
        const sisaWaktuDalamDetik = await mejaMainRepository.getSisaWaktu(
          nomorMeja,
        );
        return sisaWaktuDalamDetik;
      } catch (error) {
        throw error;
      }
    },
  },
];

export default handlers;
