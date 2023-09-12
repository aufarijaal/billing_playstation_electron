import { app } from "electron";
import winston, { createLogger, transports, format } from "winston";

const logFormat = format.combine(
  format.timestamp({
    format: "DD-MMMM-YYYY HH:mm:ss",
  }),
  format.printf((info) => {
    return `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`;
  }),
);

const logger = createLogger({
  transports: [
    new transports.Console({
      format: logFormat,
    }),
    new transports.File({
      format: logFormat,
      dirname: "dist-electron/logs",
    }),
  ],
});

if (!app.isPackaged) {
  logger.remove(winston.transports.File);
}

export default logger;
