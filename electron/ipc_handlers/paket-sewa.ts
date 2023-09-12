import { IPCHandler } from "../@types/ipc-handler";
import paketSewaCrudChannelNames from "../channel_names/paket-sewa-crud-channel-names";
import paketSewaRepository from "../repositories/paket-sewa-repository";

const handlers: IPCHandler[] = [
  {
    channelName: paketSewaCrudChannelNames.ADD,
    action: async (_event, nama_paket: string, harga: number) => {
      try {
        await paketSewaRepository.store(nama_paket, harga);
      } catch (error: any) {
        if (error.message.includes("SQLITE_CONSTRAINT: UNIQUE")) {
          throw new Error("Paket ini sudah ada");
        }
        throw error;
      }
    },
  },
  {
    channelName: paketSewaCrudChannelNames.GET_ALL,
    action: async (_event) => {
      try {
        const allPaket = await paketSewaRepository.get();
        return allPaket;
      } catch (error) {
        throw error;
      }
    },
  },
  {
    channelName: paketSewaCrudChannelNames.UPDATE_NAMA_PAKET,
    action: async (_event, id: number, nama_paket: string) => {
      try {
        await paketSewaRepository.updateNamaPaket(id, nama_paket);
      } catch (error: any) {
        if (error.message.includes("SQLITE_CONSTRAINT: UNIQUE")) {
          throw new Error("Paket ini sudah ada");
        }
        throw error;
      }
    },
  },
  {
    channelName: paketSewaCrudChannelNames.UPDATE_HARGA,
    action: async (_event, id: number, harga: number) => {
      try {
        await paketSewaRepository.updateHarga(id, harga);
      } catch (error: any) {
        throw error;
      }
    },
  },
  {
    channelName: paketSewaCrudChannelNames.DELETE,
    action: async (_event, id: number) => {
      try {
        await paketSewaRepository.destroy(id);
      } catch (error) {
        throw error;
      }
    },
  },
];

export default handlers;
