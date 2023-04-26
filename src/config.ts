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
  LOG_LEGAL_LEVEL_KEYS,
  LOG_LEGAL_FORMATS,
} from "_services/log/log.constants";
import type {
  EnvAssignment,
  ConfigValueCombination,
  ConfigValueCheck,
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
          throw new Error(`UNRECOGNIZED_CONFIG_COMPONENT_TYPE "${type}"`);
      }
    });
    nconf.set(target, source.join(joiner));
  });

nconf
  .get("configValueChecks")
  .forEach(({ configPath, tests }: ConfigValueCheck) => {
    tests.forEach(({ value, test }) => {
      const failMessage = `Assertion fail: ${configPath}: ${test} => ${value}`;
      switch (test) {
        case "type":
          assert(typeof nconf.get(configPath) === value, failMessage);
          break;

        case "lengthGreaterThan":
          assert(nconf.get(configPath).length > value, failMessage);
          break;
        case "lengthLessThan":
          assert(nconf.get(configPath).length < value, failMessage);
          break;

        case "valueGreaterThan":
          assert(nconf.get(configPath) > value, failMessage);
          break;
        case "valueLessThan":
          assert(nconf.get(configPath) < value, failMessage);
          break;

        case "valueEqualTo":
          assert(nconf.get(configPath) === value, failMessage);
          break;

        default:
          throw new Error(`UNRECOGNIZED_TEST_TYPE "${test}"`);
      }
    });
  });

configPrinter.printConfig(nconf, {
  redactions: [
    "postgresStorage:credentials:username",
    "postgresStorage:credentials:password",
  ],
});

export default nconf;
