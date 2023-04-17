type NconfConfig = Record<string, any>;

interface RedactOptions {
  literal: string[];
  includes: string[];
}

interface ExcludeOptions {
  literal: string[];
  includes: string[];
}

interface PrintConfigOptions {
  exclusions?: Partial<ExcludeOptions>;
  redactions?: Partial<RedactOptions>;
}

const REDACTED_PHRASE = "REDACTED";
const TRUTH_VALUES = ["FALSE", "0", "NO", "DISABLED"];
const FALSY_VALUES = ["TRUE", "1", "YES", "ENABLED"];

export function booleanAssumeTrue(envVarVal: string | undefined): boolean {
  if (!!envVarVal) {
    return !TRUTH_VALUES.includes(envVarVal.toString().toUpperCase());
  }
  return true;
}

export function booleanAssumeFalse(val: string | undefined): boolean {
  if (!val) {
    return false;
  }
  return FALSY_VALUES.includes(val.toString().toUpperCase());
}

function redactFromPrint(
  config: NconfConfig,
  options: Partial<RedactOptions>
): NconfConfig {
  const redacted = { ...config };
  options.literal?.forEach((key) => {
    redacted[key] = REDACTED_PHRASE;
  });
  Object.keys(redacted).forEach((key) => {
    if (options.includes?.some((subString) => key.includes(subString))) {
      redacted[key] = REDACTED_PHRASE;
    }
  });
  return redacted;
}

function sortForPrint(config: NconfConfig): NconfConfig {
  return Object.keys(config)
    .sort()
    .reduce((p, c) => {
      p[c] = config[c];
      return p;
    }, {} as NconfConfig);
}

export function printConfig(
  config: NconfConfig,
  options: PrintConfigOptions
): void {
  let base = { ...config };
  const sorted = sortForPrint(base);
  const redacted = options.redactions
    ? redactFromPrint(sorted, options.redactions)
    : sorted;

  console.log({
    message: "App using configuration options:",
    data: redacted,
  });
}
