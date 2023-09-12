import { IpcMainEvent } from "electron";

interface IPCHandler {
  channelName: string;
  action: (event: IpcMainEvent, ...args: any) => Promise<unknown> | any | void;
}
