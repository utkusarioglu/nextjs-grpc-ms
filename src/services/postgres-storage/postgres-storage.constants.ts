export const DECADE_STATS_MOCK_RESPONSE = Array(10)
  .fill(null)
  .map((_, i) => ({
    countryName: String.fromCharCode(i + 65),
    countryCode: String.fromCharCode(i + 97),
    decade: i, // uint
    count: i, // uint
    average: i, // float
    max: i, // float
    min: i, // float
    median: i, // float
    range: i, // float
    stdDev: i, // float
    variance: i, // float
  }));
