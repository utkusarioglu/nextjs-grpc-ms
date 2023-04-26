import { format, transports, createLogger } from "winston";
import { LOG_LEGAL_LEVELS } from "./log.constants";
import config from "_config";
import { inspect } from "util";

const { timestamp, combine, colorize, printf, errors, json } = format;

const logFormat = printf(({ level, message, timestamp, stack, ...rest }) =>
  [
    "[",
    level,
    "] ",
    timestamp,
    " ",
    stack || message,
    !!Object.keys(rest).length
      ? " -- " + inspect(rest[Symbol.for("splat")][0], false, undefined, true)
      : "",
  ].join("")
);

const level = config.get("otel:logs:level");

function textLogger() {
  return createLogger({
    levels: LOG_LEGAL_LEVELS,
    level,
    format: combine(
      colorize(),
      timestamp({ format: config.get("otel:logs:time:format") }),
      errors({ stack: true }),
      logFormat
    ),
    transports: [new transports.Console()],
  });
}

function jsonLogger() {
  return createLogger({
    levels: LOG_LEGAL_LEVELS,
    level,
    format: combine(errors({ stack: true }), json()),
    defaultMeta: {
      environment: config.get("NODE_ENV"),
    },
    transports: [new transports.Console()],
  });
}

const logService =
  config.get("otel:logs:format") === "TEXT" ? textLogger() : jsonLogger();

export default Object.freeze(logService);

// export const emerg = logService.emerg;
// export const alert = logService.alert;
// export const crit = logService.crit;
// export const error = logService.error;
// export const warning = logService.warning;
// export const notice = logService.notice;
// export const info = logService.info;
// export const debug = logService.debug;
