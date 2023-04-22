import { type Readable } from "stream";

export interface DecadeStatsRow {
  countryName: string;
  countryCode: string;
  decade: number; // uint
  count: number; // uint
  average: number; // float
  max: number; // float
  min: number; // float
  median: number; // float
  range: number; // float
  stdDev: number; // float
  variance: number; // float
}

interface MethodParams {
  codes: string[];
}

type DecadeStatsParams = [MethodParams];

export type DecadeStats = (...params: DecadeStatsParams) => Readable;
