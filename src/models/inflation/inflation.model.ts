import { DecadeStats } from "./inflation.model.types";
import { knex } from "../../services/postgres-storage/postgres-storage.service";

// @ts-expect-error
const mock = process.env.NODE_ENV === "development"

const MOCK_VALUE = [{
    countryName: "country_name",
    countryCode: "country_code",
    decade: 1,
    count: 1,
    average: 1,
    max: 1,
    min: 1,
    median: 1,
    range: 1,
    stdDev: 1,
    variance: 1,
  }, {
    countryName: "country_name",
    countryCode: "country_code",
    decade: 2,
    count: 2,
    average: 2,
    max: 2,
    min: 2,
    median: 2,
    range: 2,
    stdDev: 2,
    variance: 2,
  }]

export const decadeStats: DecadeStats = (countryCodes, stream) =>
  mock
    ? (() => { 
      console.log("reached", countryCodes)
      MOCK_VALUE.forEach((row) => {
        stream.write(row);
      })
      stream.end()
      // Promise.resolve(MOCK_VALUE)
    })()
    : (() => {
      stream = knex
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
        .whereIn("country_code", countryCodes)
        .stream();
    })()
    // : knex
    //   .select({
    //     countryName: "country_name",
    //     countryCode: "country_code",
    //     decade: "decade",
    //     count: "count",
    //     average: "average",
    //     max: "max",
    //     min: "min",
    //     median: "median",
    //     range: "range",
    //     stdDev: "stddev",
    //     variance: "variance",
    //   })
    //   .withSchema("inflation")
    //   .from("decade_stats")
    //   .whereIn("country_code", countryCodes);
