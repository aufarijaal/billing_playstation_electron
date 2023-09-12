import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Notification,
  session,
} from "electron";
import path, { join } from "node:path";
import { dbPopulate } from "./lib/db/knexfile";
import logger from "./lib/logging/logger";
import unhandled from "electron-unhandled";
import { readdirSync } from "fs";
import { homedir } from "node:os";
// Global exception catcher
unhandled({
  showDialog: true,
});

process.env.DIST = path.join(__dirname, "../dist");
process.env.PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, "../public");

let win: BrowserWindow | null;
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.PUBLIC, "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    width: 745,
    height: 465,
    minWidth: 745,
    minHeight: 465,
    show: true,
  });

  // Clear session before starting application
  win.webContents.on("dom-ready", () => {
    win?.webContents.executeJavaScript(`
        localStorage.setItem("session", JSON.stringify({
            username: "",
            full_access: 0,
            logged_in_at: "",
        }));
        `);
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, "index.html"));
  }

  win.menuBarVisible = false;
  win.minimize();
}

function registerIPCHandlers() {
  const modules = import.meta.glob("./ipc_handlers/**/*.ts");

  Object.values(modules).forEach((module) => {
    module().then((handlers: any) => {
      if (!Array.isArray(handlers.default)) {
        throw new Error("The handlers is malformed");
      }

      for (const handler of handlers.default) {
        if (!handler.channelName) {
          throw new Error("The handlers is malformed");
        } else {
          if (typeof handler.channelName !== "string") {
            throw new Error("Channel name is must be a non-empty string");
          }
        }

        if (!handler.action) {
          throw new Error("The handlers is malformed");
        } else {
          if (typeof handler.action !== "function") {
            throw new Error("action must be a function");
          }
        }
      }

      handlers.default.forEach((handler: any) => {
        ipcMain.handle(handler.channelName, handler.action);

        logger.info(`Channel "${handler.channelName}" registered.`);
      });
    });
  });
}

app.on("window-all-closed", () => {
  win = null;
});

app.whenReady().then(() => {
  logger.info("STARTING APPLICATION");
  // Other initialization
  dbPopulate();

  ipcMain.handle("/notification", (_event, title, body) => {
    new Notification({
      title,
      body,
      icon: path.join(process.env.PUBLIC, "icon.png"),
    }).show();
  });

  ipcMain.handle(
    "/utils/select_folder",
    (_event, { title, buttonLabel, filename }) => {
      return new Promise((resolve, reject) => {
        dialog
          .showSaveDialog({
            title,
            defaultPath: join(homedir(), filename),
            filters: [{ name: "Document Files", extensions: ["csv"] }],
            buttonLabel,
          })
          .then((result) => {
            if (!result.canceled) {
              const filePath = result.filePath;
              resolve(filePath);
            } else {
              resolve(null);
            }
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
  );

  // Register all the IPC handlers defined in ipc_handlers directory
  registerIPCHandlers();

  // Window creation
  createWindow();

  if (!app.isPackaged) {
    try {
      // Karena extension nya auto update yang menyebabkan nama folder nya dinamis, jadi tidak bisa ditambahkan di akhir vueDevToolsPath dibawah,
      // namun hanya akan ada satu folder setelah folder ID dari extension yaitu versi nya, jadi cara nya adalah
      // ambil path terakhir setelah path ID extension lalu gabungkan.
      const vueDevToolsPath =
        "/home/aufa/.config/BraveSoftware/Brave-Browser/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd";
      const files = readdirSync(vueDevToolsPath);
      session.defaultSession.loadExtension(
        path.join(vueDevToolsPath, files[0]),
      );
    } catch (error: any) {
      logger.error(`Failed to load extension, ${error.mesage}`);
    }
  }
});
