// type DecadeStatsReturn = DecadeStatsRow[]
  
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

interface StreamCallbacks {
  write: (data: DecadeStatsRow) => void,
  end: () => void
}

type DecadeStatsParams = [string[], StreamCallbacks];

// export type DecadeStats = (...params: DecadeStatsParams) => Promise<DecadeStatsReturn>;
export type DecadeStats = (...params: DecadeStatsParams) => void;
