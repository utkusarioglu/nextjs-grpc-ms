interface DecadeStatsReturn {
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

type DecadeStatsParams = [string[]];

export type DecadeStats = (...params: DecadeStatsParams) => Promise<DecadeStatsReturn>;
