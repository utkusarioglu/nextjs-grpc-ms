import config from "_config";
import mockDb from "mock-knex";
import log from "_services/log/log.service";
import knexClass from "knex";
import { DECADE_STATS_MOCK_RESPONSE } from "./postgres-storage.constants";

const knexInstance = knexClass({
  client: "pg",
  connection: {
    host: config.get("POSTGRES_STORAGE_HOST"),
    port: config.get("POSTGRES_STORAGE_PORT"),
    user: config.get("POSTGRES_STORAGE_USERNAME"),
    password: config.get("POSTGRES_STORAGE_PASSWORD"),
    database: "inflation",
  },
  log: {
    warn: log.warning,
    error: log.error,
    debug: log.debug,
    // TODO this isn't how this prop works
    deprecate: log.warning,
  },
});

if (config.get("POSTGRES_STORAGE_MOCK_CONNECTION")) {
  mockDb.mock(knexInstance);

  const tracker = mockDb.getTracker();
  tracker.install();

  tracker.on("query", (query) => {
    log.debug("Tracker caught query", { query });
    query.response(
      DECADE_STATS_MOCK_RESPONSE.map((row) => row),
      { stream: true }
    );
  });
}

export default knexInstance;
