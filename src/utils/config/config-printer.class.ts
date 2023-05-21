import { inspect } from "util";
import nconf from "_config";
import type {
  RedactOptions,
  NconfConfig,
  PrintConfigOptions,
} from "./config.utils.types";

export class ConfigPrinter {
  private redactFromPrint(
    config: NconfConfig,
    options: RedactOptions,
    redactedPhrase: string
  ): NconfConfig {
    options.forEach((pathStr) => {
      const path = pathStr.split(":");
      path.reduce((acc, cur, i, arr) => {
        if (i === arr.length - 1) {
          acc[cur] = redactedPhrase;
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
      .reduce((acc, curr) => {
        acc[curr] = config[curr];
        return acc;
      }, {} as NconfConfig);
  }

  /**
   * @dev
   * 1- This is fine for an object of this size. If the config size grows,
   *    maybe a recursive solution may be more suitable.
   */
  public printConfig(config: typeof nconf, options: PrintConfigOptions): void {
    const logLevel = config.get("otel:logs:level");
    const logToConsoleLevels = config.get(
      "otel:logs:summary:logToConsoleLevels"
    );

    if (!logToConsoleLevels.includes(logLevel)) {
      return;
    }

    const redactedPhrase = config.get("otel:logs:summary:redactedPhrase");
    let base = JSON.parse(JSON.stringify(config.get())); // #1
    const sorted = this.sortForPrint(base);
    const redacted = options.redactions
      ? this.redactFromPrint(sorted, options.redactions, redactedPhrase)
      : sorted;

    if (config.get("NODE_ENV") === "development") {
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
    } else {
      console.log(
        JSON.stringify({
          level: "debug",
          message: "App using configuration options:",
          config: redacted,
        })
      );
    }
  }
}
