import { MethodParams } from "./inflation.model.types";
import knex from "_services/postgres-storage/postgres-storage.service";
import {
  meterRuns,
  meterPerformance,
} from "_utils/instrumentation/counter.utils";
import { trace } from "_utils/instrumentation/trace.utils";
import log from "_services/log/log.service";
import { api } from "@opentelemetry/sdk-node";

export class InflationModel {
  @meterRuns("decade_stats")
  @meterPerformance("decade_stats")
  @trace()
  public static decadeStats({ codes }: MethodParams, span?: api.Span) {
    span && span.addEvent("Adding event from inside method");
    return knex
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
}
