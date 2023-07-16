/**
 * #1 These are converted to string to mimic pg responses where, most types are
 *    returned as strings
 */
export const DECADE_STATS_MOCK_RESPONSE = Array(10)
  .fill(null)
  .map((_, i) => ({
    countryName: String.fromCharCode(i + 65),
    countryCode: String.fromCharCode(i + 97),
    decade: i, // uint
    // #1
    // count: i.toString(), // uint
    // average: i.toString(), // float
    // max: i.toString(), // float
    // min: i.toString(), // float
    // median: i.toString(), // float
    // range: i.toString(), // float
    // stdDev: i.toString(), // float
    // variance: i.toString(), // float

    count: i, // uint
    average: i, // float
    max: i, // float
    min: i, // float
    median: i, // float
    range: i, // float
    stdDev: i, // float
    variance: i, // float
  }));
