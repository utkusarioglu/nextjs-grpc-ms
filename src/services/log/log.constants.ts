export const LOG_LEGAL_LEVELS = {
  emerg: 0,
  alert: 1,
  crit: 2,
  error: 3,
  warning: 4,
  notice: 5,
  info: 6,
  debug: 7,
};

const LOG_LEGAL_LEVEL_KEYS = Object.keys(LOG_LEGAL_LEVELS);

export const LOG_CONFIG_ACCEPTED_LEVEL_KEYS = [
  ...LOG_LEGAL_LEVEL_KEYS,
  ...LOG_LEGAL_LEVEL_KEYS.map((key) => key.toUpperCase()),
];

const LOG_LEGAL_FORMATS = ["TEXT", "JSON"];

export const LOG_CONFIG_ACCEPTED_FORMATS = [
  ...LOG_LEGAL_FORMATS,
  ...LOG_LEGAL_FORMATS.map((format) => format.toLowerCase()),
];
