import { IPCHandler } from "../@types/ipc-handler";
import logistikCrudChannelNames from "../channel_names/logistik-crud-channel-names";
import logistikRepository from "../repositories/logistik-repository";

const handlers: IPCHandler[] = [
  {
    channelName: logistikCrudChannelNames.ADD,
    action: async (_event, nama_produk: string, harga: number) => {
      try {
        await logistikRepository.store(nama_produk, harga);
      } catch (error: any) {
        if (error.message.includes("SQLITE_CONSTRAINT: UNIQUE")) {
          throw new Error("Produk ini sudah ada");
        }
        throw error;
      }
    },
  },
  {
    channelName: logistikCrudChannelNames.GET_ALL,
    action: async (_event) => {
      try {
        const allLogistik = await logistikRepository.get();
        return allLogistik;
      } catch (error) {
        throw error;
      }
    },
  },
  {
    channelName: logistikCrudChannelNames.UPDATE_NAMA_PRODUK,
    action: async (_event, id: number, nama_produk: string) => {
      try {
        await logistikRepository.updateNamaProduk(id, nama_produk);
      } catch (error: any) {
        if (error.message.includes("SQLITE_CONSTRAINT: UNIQUE")) {
          throw new Error("Produk ini sudah ada");
        }
        throw error;
      }
    },
  },
  {
    channelName: logistikCrudChannelNames.UPDATE_HARGA,
    action: async (_event, id: number, harga: number) => {
      try {
        await logistikRepository.updateHarga(id, harga);
      } catch (error: any) {
        throw error;
      }
    },
  },
  {
    channelName: logistikCrudChannelNames.DELETE,
    action: async (_event, id: number) => {
      try {
        await logistikRepository.destroy(id);
      } catch (error) {
        throw error;
      }
    },
  },
];

export default handlers;
