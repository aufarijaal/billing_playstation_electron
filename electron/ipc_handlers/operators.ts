import { IPCHandler } from "../@types/ipc-handler";
import { Operator } from "../@types/models";
import operatorsCrudChannelNames from "../channel_names/operators-crud-channel-names";
import operatorsRepository from "../repositories/operators-repository";

const handlers: IPCHandler[] = [
  {
    channelName: operatorsCrudChannelNames.ADD,
    action: async (_event, operator: Operator) => {
      try {
        await operatorsRepository.store(operator);
      } catch (error: any) {
        if (error.message.includes("SQLITE_CONSTRAINT: UNIQUE")) {
          throw new Error("Nama sudah dipakai");
        }
        throw error;
      }
    },
  },
  {
    channelName: operatorsCrudChannelNames.GET_ALL,
    action: async (_event) => {
      try {
        const allOperators = await operatorsRepository.get();

        return allOperators;
      } catch (error) {
        throw error;
      }
    },
  },
  {
    channelName: operatorsCrudChannelNames.UPDATE,
    action: async (_event, operator: Operator) => {
      try {
        await operatorsRepository.update(operator);
      } catch (error: any) {
        if (error.message.includes("SQLITE_CONSTRAINT: UNIQUE")) {
          throw new Error("Nama sudah dipakai");
        }
        throw error;
      }
    },
  },
  {
    channelName: operatorsCrudChannelNames.DELETE,
    action: async (_event, id: number) => {
      try {
        await operatorsRepository.destroy(id);
      } catch (error) {
        throw error;
      }
    },
  },
  {
    channelName: operatorsCrudChannelNames.LOGIN,
    action: async (_event, username: string, password: string) => {
      try {
        const operator = await operatorsRepository.login(username, password);

        return operator;
      } catch (error) {
        throw error;
      }
    },
  },
];

export default handlers;
