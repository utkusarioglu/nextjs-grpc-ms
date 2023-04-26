require("dotenv").config();
import { strict as assert } from "assert";
import nconf from "nconf";
import yaml from "yaml";
import {
  configPrinter,
  configTransformer,
  type Prop,
} from "_utils/config/config.utils";
import {
  LOG_CONFIG_ACCEPTED_FORMATS,
  LOG_CONFIG_ACCEPTED_LEVEL_KEYS,
} from "_services/log/log.constants";
import type {
  EnvAssignment,
  ConfigValueCombination,
  ConfigValueCheck,
  ConfigManualTransform,
} from "_utils/config/config.utils.types";

nconf
  .env({
    transform: (prop: Prop) => configTransformer.transformEnv(prop),
  })
  .required([
    "GRPC_SERVER_HOST",
    "GRPC_SERVER_PORT",
    "GRPC_SERVER_CERT_SUBPATH", // get rid of this
    "POSTGRES_STORAGE_HOST",
    "POSTGRES_STORAGE_PORT",
    "HTTP_SERVER_PORT",
  ]);

nconf.file("user-config", {
  file: "./config/user/config.yml",
  format: {
    parse: yaml.parse,
    stringify: yaml.stringify,
  },
});

nconf.file("defaults", {
  file: "./config/defaults.yml",
  format: {
    parse: yaml.parse,
    stringify: yaml.stringify,
  },
});

nconf.file("env-assignments", {
  file: "./config/env-assignments.yml",
  format: {
    parse: yaml.parse,
    stringify: yaml.stringify,
  },
});

nconf.file("config-value-combinations.", {
  file: "./config/config-value-combinations.yml",
  format: {
    parse: yaml.parse,
    stringify: yaml.stringify,
  },
});

nconf.file("config-value-checks", {
  file: "./config/config-value-checks.yml",
  format: {
    parse: yaml.parse,
    stringify: yaml.stringify,
  },
});

nconf.file("config-manual-transforms", {
  file: "./config/config-manual-transforms.yml",
  format: {
    parse: yaml.parse,
    stringify: yaml.stringify,
  },
});

nconf
  .file("vault-postgres-storage", {
    file: nconf.get("paths:credentials:postgresStorage:relPath"),
    format: {
      parse: yaml.parse,
      stringify: yaml.stringify,
    },
  })
  .required([
    "postgresStorage:credentials:username",
    "postgresStorage:credentials:password",
  ]);

nconf.get("envAssignments").forEach(({ source, target }: EnvAssignment) => {
  const envValue = nconf.get(source);
  if (!!envValue) {
    nconf.set(target, envValue);
  }
});

nconf
  .get("configValueCombinations")
  .forEach(({ target, joiner, components }: ConfigValueCombination) => {
    const source = components.map(({ value, type }) => {
      switch (type) {
        case "configPath":
          return nconf.get(value);
        case "string":
          return value;
        default:
          throw new Error(`UNRECOGNIZED_CONFIG_COMPONENT_TYPE: "${type}"`);
      }
    });
    nconf.set(target, source.join(joiner));
  });

nconf
  .get("configValueChecks")
  .forEach(({ configPath, tests }: ConfigValueCheck) => {
    tests.forEach((params) => {
      const failMessagePrefix = `Assertion fail: ${configPath}: ${params.test} =>`;
      const configValue = nconf.get(configPath);
      switch (params.test) {
        case "type":
          assert(
            typeof configValue === params.value,
            [failMessagePrefix, params.value].join(" ")
          );
          break;

        case "lengthGreaterThan":
          assert(
            configValue.length > params.value,
            [failMessagePrefix, params.value].join(" ")
          );
          break;
        case "lengthLessThan":
          assert(
            configValue.length < params.value,
            [failMessagePrefix, params.value].join(" ")
          );
          break;

        case "valueGreaterThan":
          assert(
            configValue > params.value,
            [failMessagePrefix, params.value].join(" ")
          );
          break;
        case "valueLessThan":
          assert(
            configValue < params.value,
            [failMessagePrefix, params.value].join(" ")
          );
          break;

        case "valueEqualTo":
          assert(
            configValue === params.value,
            [failMessagePrefix, params.value].join(" ")
          );
          break;

        case "valueOneOf":
          assert(
            params.values.includes(configValue),
            [failMessagePrefix, configValue].join(" ")
          );
          break;

        case "valueIsALogLegalFormat":
          assert(
            LOG_CONFIG_ACCEPTED_FORMATS.includes(configValue),
            [failMessagePrefix, params.value, configValue].join(" ")
          );
          break;

        case "valueIsALogLegalLevel":
          const val = nconf.get(configPath);
          assert(
            LOG_CONFIG_ACCEPTED_LEVEL_KEYS.includes(val),
            [failMessagePrefix, params.value, val].join(" ")
          );
          break;

        default:
          // @ts-ignore
          throw new Error(`UNRECOGNIZED_TEST_TYPE: "${params.test}"`);
      }
    });
  });

nconf
  .get("configManualTransforms")
  .forEach(({ target, type }: ConfigManualTransform) => {
    const rawValue = nconf.get(target);
    switch (type) {
      case "upperCase":
        nconf.set(target, rawValue.toUpperCase());
        break;
      case "lowerCase":
        nconf.set(target, rawValue.toLowerCase());
        break;

      case "lowerCaseArray":
        nconf.set(
          target,
          rawValue.map((s: string) => s.toLowerCase())
        );
        break;
      case "upperCaseArray":
        nconf.set(
          target,
          rawValue.map((s: string) => s.toUpperCase())
        );
        break;

      default:
        throw new Error(`ILLEGAL_TRANSFORMATION: "${type}"`);
    }
  });

configPrinter.printConfig(nconf, {
  redactions: [
    "postgresStorage:credentials:username",
    "postgresStorage:credentials:password",
  ],
});

export default nconf;
