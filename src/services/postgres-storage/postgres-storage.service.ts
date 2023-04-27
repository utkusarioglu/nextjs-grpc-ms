import config from "_config";
import mockDb from "mock-knex";
import log from "_services/log/log.service";
import knex from "knex";
import { DECADE_STATS_MOCK_RESPONSE } from "./postgres-storage.constants";

const poolConfig = config.get("postgresStorage:connection:pool:enabled")
  ? {
      pool: {
        min: config.get("postgresStorage:connection:pool:min"),
        max: config.get("postgresStorage:connection:pool:max"),
      },
    }
  : {};

const connection = {
  host: config.get("postgresStorage:connection:host"),
  port: config.get("postgresStorage:connection:port"),
  user: config.get("postgresStorage:credentials:inflation:username"),
  password: config.get("postgresStorage:credentials:inflation:password"),
  database: "inflation",
};

const knexInstance = knex({
  client: "pg",
  debug: true,
  connection,
  log,
  ...poolConfig,
});

if (config.get("postgresStorage:mock:data")) {
  mockDb.mock(knexInstance);

  const tracker = mockDb.getTracker();
  tracker.install();

  tracker.on("query", (query) => {
    const maxDelay = config.get("postgresStorage:mock:maxDelay");
    const minDelay = config.get("postgresStorage:mock:minDelay");
    const inducedLatency = minDelay + Math.random() * (maxDelay - minDelay);
    log.debug("Queueing response", { inducedLatency, minDelay, maxDelay });
    setTimeout(() => {
      log.debug("Sending response", { inducedLatency });
      query.response(DECADE_STATS_MOCK_RESPONSE, { stream: true });
    }, inducedLatency);
  });
}

export default knexInstance;
