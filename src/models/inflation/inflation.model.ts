import { type DecadeStats } from "./inflation.model.types";
import knex from "_services/postgres-storage/postgres-storage.service";

export class InflationModel {
  public static decadeStats: DecadeStats = ({ codes }) =>
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
      .whereIn("country_code", codes)
      .stream();
}
