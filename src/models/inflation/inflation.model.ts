import { DecadeStats } from "./inflation.model.types";
import { knex } from "../../services/postgres-storage/postgres-storage.service";

// @ts-expect-error
const mockGrpcValues = process.env.NODE_ENV === "development";

const MOCK_VALUES = [
  {
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
  },
  {
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
  },
];

export const decadeStats: DecadeStats = (countryCodes, stream) =>
  mockGrpcValues
    ? (() => {
        stream.write(Buffer.from("["));
        MOCK_VALUES.forEach((item, i, a) => {
          stream.write(Buffer.from(JSON.stringify(item)));
          if (a.length > i + 1) {
            stream.write(", ");
          }
        });
        stream.write(Buffer.from("]"));
        stream.end();
      })()
    : knex
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
        .stream()
        .pipe(stream);
