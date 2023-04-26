import { Primitives, Prop } from "./config.utils.types";

export const SCREAMING_SNAKE_CASE = new RegExp(/^[A-Z_][A-Z0-9_]*$/);

export class ConfigTransformer {
  private parseTruthy(value: Primitives): Primitives {
    const TRUTHY = ["true", "yes", "enabled"];
    const FALSY = ["false", "no", "disabled"];
    try {
      if (typeof value === "string") {
        if (TRUTHY.includes(value.toLowerCase())) {
          return true;
        }
        if (FALSY.includes(value.toLowerCase())) {
          return false;
        }
      }
    } catch (e) {
      return value;
    }

    return value;
  }

  private parseJson(value: Primitives): Primitives {
    try {
      if (typeof value === "string") {
        return JSON.parse(value);
      } else {
        return value;
      }
    } catch (e) {}
    return value;
  }

  private parseCsv(value: Primitives): Primitives | Primitives[] {
    try {
      if (typeof value === "string") {
        const arrayified = value.split(",");
        if (arrayified.length > 1) {
          return arrayified.map((item) => item.trim());
        } else {
          return value;
        }
      } else {
        return value;
      }
    } catch (e) {}
    return value;
  }

  private parsePipeline(prop: Primitives): Primitives {
    let value: Primitives = prop;

    value = this.parseJson(value);
    value = this.parseTruthy(value);

    return value;
  }

  public transformEnv(prop: Prop) {
    const isEnvKey = SCREAMING_SNAKE_CASE.test(prop["key"]);

    if (isEnvKey && prop["value"].length !== 0) {
      const value = this.parseCsv(prop["value"]);
      if (Array.isArray(value)) {
        return {
          key: prop["key"],
          value: value.map((value) => this.parsePipeline(value)),
        };
      } else {
        return {
          key: prop["key"],
          value: this.parsePipeline(value),
        };
      }
    }

    return prop;
  }
}
