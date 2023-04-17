import config from "../../config";

export const knex = require("knex")({
  client: "pg",
  connection: {
    host: "postgres-storage.ms",
    port: 5432,
    user: config.get("POSTGRES_STORAGE_USERNAME"),
    password: config.get("POSTGRES_STORAGE_PASSWORD"),
    database: "inflation",
  },
});
