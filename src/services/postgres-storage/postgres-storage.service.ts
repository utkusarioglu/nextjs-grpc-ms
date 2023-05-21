import config from "_config";
import mockDb from "mock-knex";
import log from "_services/log/log.service";
import knex, { type Knex } from "knex";
import { DECADE_STATS_MOCK_RESPONSE } from "./postgres-storage.constants";

const pool: Pick<Knex.Config, "pool"> = config.get(
  "postgresStorage:connection:pool:enabled"
)
  ? {
      pool: {
        min: config.get("postgresStorage:pool:min"),
        max: config.get("postgresStorage:pool:max"),
        // afterCreate: (connection: any, callback: any) => {
        //   connection.on("error", connectionError);
        //   callback(null, connection);
        // },
      },
    }
  : {};

const connection: NonNullable<Knex.Config["connection"]> = {
  host: config.get("postgresStorage:connection:host"),
  port: config.get("postgresStorage:connection:port"),
  user: config.get("postgresStorage:credentials:inflation:username"),
  password: config.get("postgresStorage:credentials:inflation:password"),
  database: "inflation",
  keepAlive: true,
};

console.log({ connection });

const knexInstance = knex({
  client: "pg",
  debug: true,
  connection,
  log,
  ...pool,
});

if (config.get("postgresStorage:mockConnection:enabled")) {
  mockDb.mock(knexInstance);

  const tracker = mockDb.getTracker();
  tracker.install();

  tracker.on("query", (query) => {
    const maxDelay = config.get("postgresStorage:mockConnection:maxDelay");
    const minDelay = config.get("postgresStorage:mockConnection:minDelay");
    const inducedLatency = minDelay + Math.random() * (maxDelay - minDelay);
    log.debug("Queueing response", { inducedLatency, minDelay, maxDelay });
    setTimeout(() => {
      log.debug("Sending response", { inducedLatency });
      query.response(DECADE_STATS_MOCK_RESPONSE, { stream: true });
    }, inducedLatency);
  });
}

knexInstance.on("connection-error", (e) => {
  console.log("knex pg inflation on error event", e);
});

knexInstance.on("query", (data: unknown) => {
  log.debug("Query data", { data });
});
knexInstance.on("query-error", (err: unknown, data: unknown) => {
  log.debug("Query-error", { err, data });
});
knexInstance.on("query-response", (...args: unknown[]) => {
  log.debug("query-response", { args });
});

export default knexInstance;
