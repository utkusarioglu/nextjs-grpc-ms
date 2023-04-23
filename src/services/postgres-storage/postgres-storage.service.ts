import config from "_config";
import mockDb from "mock-knex";
import log from "_services/log/log.service";
import knex from "knex";
import { DECADE_STATS_MOCK_RESPONSE } from "./postgres-storage.constants";

const knexInstance = knex({
  client: "pg",
  debug: true,
  connection: {
    host: config.get("POSTGRES_STORAGE_HOST"),
    port: config.get("POSTGRES_STORAGE_PORT"),
    user: config.get("POSTGRES_STORAGE_USERNAME"),
    password: config.get("POSTGRES_STORAGE_PASSWORD"),
    database: "inflation",
  },
  pool: { min: 1, max: 5 },
  log,
});

if (config.get("POSTGRES_STORAGE_MOCK_CONNECTION")) {
  mockDb.mock(knexInstance);

  const tracker = mockDb.getTracker();
  tracker.install();

  tracker.on("query", (query) => {
    const inducedLatency = Math.random() * 3e3;
    log.debug("Queueing response", { inducedLatency });
    setTimeout(() => {
      log.debug("Sending response", { inducedLatency });
      query.response(DECADE_STATS_MOCK_RESPONSE, { stream: true });
    }, inducedLatency);
  });
}

export default knexInstance;
