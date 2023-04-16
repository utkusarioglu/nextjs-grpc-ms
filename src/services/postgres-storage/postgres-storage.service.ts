import config from "../../config";

console.log({
  type: "postgres-pass-for-ms",
  user: config.get("username"),
  password: config.get("password"),
});

export const knex = require("knex")({
  client: "pg",
  connection: {
    host: "postgres-storage.ms",
    port: 5432,
    user: config.get("username"),
    password: config.get("password"),
    database: "inflation",
  },
});
