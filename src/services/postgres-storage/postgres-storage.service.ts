import config from "../../config";
import { MockClient, createTracker } from "knex-mock-client";
import knexClass from "knex";

const POSTGRES_STORAGE_MOCK_CONNECTION = false;

const connectionProperties = POSTGRES_STORAGE_MOCK_CONNECTION
  ? () => ({
      dialect: "pg",
      client: MockClient,
    })
  : () => ({
      client: "pg",
      connection: {
        host: config.get("POSTGRES_STORAGE_HOST"),
        port: config.get("POSTGRES_STORAGE_PORT"),
        user: config.get("POSTGRES_STORAGE_USERNAME"),
        password: config.get("POSTGRES_STORAGE_PASSWORD"),
        database: "inflation",
      },
    });

const knexInstance = knexClass(connectionProperties());

if (!!POSTGRES_STORAGE_MOCK_CONNECTION) {
  const tracker = createTracker(knexInstance);
  tracker.on.any("inflation").response([{ hi: "hi" }]);
}

export const knex = knexInstance;
