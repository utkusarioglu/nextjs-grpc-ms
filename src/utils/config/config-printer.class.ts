import { inspect } from "util";
import nconf from "_config";
import type {
  RedactOptions,
  NconfConfig,
  PrintConfigOptions,
} from "./config.utils.types";

export const REDACTED_PHRASE = "REDACTED";

export class ConfigPrinter {
  private redactFromPrint(
    config: NconfConfig,
    options: RedactOptions
  ): NconfConfig {
    options.forEach((pathStr) => {
      const path = pathStr.split(":");
      path.reduce((acc, cur, i, arr) => {
        if (i === arr.length - 1) {
          acc[cur] = REDACTED_PHRASE;
        } else {
          acc = acc[cur];
        }
        return acc;
      }, config);
    });
    return config;
  }

  private sortForPrint(config: NconfConfig): NconfConfig {
    return Object.keys(config)
      .sort()
      .reduce((p, c) => {
        p[c] = config[c];
        return p;
      }, {} as NconfConfig);
  }

  public printConfig(config: typeof nconf, options: PrintConfigOptions): void {
    const logLevel = config.get("otel:logs:level");
    const logToConsoleLevels = config.get(
      "otel:logs:summary:logToConsoleLevels"
    );

    if (!logToConsoleLevels.includes(logLevel)) {
      return;
    }

    let base = { ...config.get() };
    const sorted = this.sortForPrint(base);
    const redacted = options.redactions
      ? this.redactFromPrint(sorted, options.redactions)
      : sorted;

    console.log(
      inspect(
        {
          level: "debug",
          message: "App using configuration options:",
          config: redacted,
        },
        false,
        null,
        true
      )
    );
  }
}
