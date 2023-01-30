const knex = require("knex")({
  client: "pg",
  connection: {
    host: "postgres-storage.ms",
    port: 5432,
    user: "postgres",
    password: "postgres",
    database: "inflation",
  },
});

const countryList = (countryCodes) =>
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
    })
    .withSchema("inflation")
    .from("decade_stats")
    .whereIn("country_code", countryCodes);

module.exports = {
  countryList,
};
