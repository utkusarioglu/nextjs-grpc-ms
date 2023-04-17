// type DecadeStatsReturn = DecadeStatsRow[]

import { Writable } from "stream";

// @ts-expect-error
interface DecadeStatsRow {
  countryName: string;
  countryCode: string;
  decade: number; // uint
  count: number; // unint
  average: number; // float
  max: number; // float
  min: number; // float
  median: number; // float
  range: number; // float
  stdDev: number; // float
  variance: number; // float
}

type DecadeStatsParams = [string[], Writable];

export type DecadeStats = (...params: DecadeStatsParams) => void;
