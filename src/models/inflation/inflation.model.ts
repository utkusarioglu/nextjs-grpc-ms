import { DecadeStats } from "./inflation.model.types";
import { knex } from "../../services/postgres-storage/postgres-storage.service";
import { pipeline } from "stream";
import { promisify } from "util";

const pipelineAsync = promisify(pipeline);

export const decadeStats: DecadeStats = (countryCodes, res) => {
  const stream = knex
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

  const timeoutCb = () => {
    res.write("timeout]");
    res.end();
  };
  const timeout = setTimeout(timeoutCb, 5000);
  stream.on("data", (data) => {
    console.log({ data });
    res.write(data);
  });
  stream.on("end", () => {
    clearTimeout(timeout);
    res.end();
  });
  stream.on("error", (error) => {
    console.log({ message: "Something broke", error });
  });
  stream.on("close", () => {
    console.log("closed");
  });
};
