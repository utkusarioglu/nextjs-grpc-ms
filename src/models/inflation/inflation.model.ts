import config from "../../config";

console.log({
  type: "postgres-pass",
    user: config.get("username"),
    password: config.get("password"),
  
})

const knex = require("knex")({
  client: "pg",
  connection: {
    host: "postgres-storage.ms",
    port: 5432,
    user: config.get("username"),
    password: config.get("password"),
    database: "inflation",
  },
});

export const countryList = (countryCodes: string[]) =>
  knex
    .select({
      countryName: "country_name",
      countryCode: "country_code",
      decade: "decade",
      count: "count",
      average: "average",
      max: "max",
      min: "min",
      median: "median",
      range: "range",
      stdDev: "stddev",
      variance: "variance",
      // dummy: "dummy = 'dummy'"
    })
    .withSchema("inflation")
    .from("decade_stats")
    .whereIn("country_code", countryCodes);

// module.exports = {
//   countryList,
// };
