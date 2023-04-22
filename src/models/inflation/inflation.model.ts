import { type Transform } from "stream";
import { type DecadeStats } from "./inflation.model.types";
import knex from "_services/postgres-storage/postgres-storage.service";
import log from "_services/log/log.service";

const timeoutCb = (res: Transform) => () => {
  res.end(JSON.stringify({ error: "timeout" }));
};

export const decadeStats: DecadeStats = ({ codes }, res) => {
  type PromiseReturn = Awaited<ReturnType<DecadeStats>>;
  let writeCounter = 0;
  const timeout = setTimeout(timeoutCb(res), 5000);
  return new Promise<PromiseReturn>((resolve, reject) => {
    try {
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
        .whereIn("country_code", codes)
        .stream();

      stream.on("data", (data: object) => {
        log.debug("Data received", { data, writeCounter });
        res.write(data);
        writeCounter += 1;
      });
      stream.on("end", () => {
        clearTimeout(timeout);
        res.end();
        resolve(writeCounter);
      });
      stream.on("error", (e: Error) => {
        log.error("Error occurred", { error: e });
        reject(writeCounter);
      });
      stream.on("close", () => {
        clearTimeout(timeout);
        resolve(writeCounter);
      });
    } catch (e) {
      res.end(JSON.stringify({ error: "Internal server error" }));
      log.error({ message: "Something broke", error: e });
      reject(writeCounter);
    }
  });
};
