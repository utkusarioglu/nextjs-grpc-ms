require("dotenv").config();
import { strict as assert } from "assert";
import nconf from "nconf";
import yaml from "yaml";
import {
  booleanAssumeTrue,
  booleanAssumeFalse,
  printConfig,
} from "_utils/config/config.utils";
import {
  LOG_LEGAL_LEVEL_KEYS,
  LOG_LEGAL_FORMATS,
} from "_services/log/log.constants";

nconf
  .env({
    transform: (prop: Record<string, any>) => {
      let transformed: any;
      switch (prop["key"]) {
        case "GRPC_SERVER_CHECK_CLIENT_CERT":
        case "FEATURE_INSTRUMENTATION":
        case "FEATURE_GRPC_SERVER":
        case "FEATURE_HTTP_SERVER":
          prop["value"] = booleanAssumeTrue(prop["value"]);
          break;
        case "GRPC_SERVER_TLS_DISABLE":
        case "POSTGRES_STORAGE_MOCK_CONNECTION":
        case "OTEL_TRACE_TO_CONSOLE":
          prop["value"] = booleanAssumeFalse(prop["value"]);
          break;
        case "GRPC_SERVER_PORT":
        case "OTEL_TRACE_PORT":
        case "POSTGRES_STORAGE_PORT":
        case "POSTGRES_STORAGE_QUERY_TIMEOUT":
          prop["value"] = parseInt(prop["value"]);
          break;
        case "LOG_FORMAT":
          transformed = prop["value"].toUpperCase();
          assert(
            LOG_LEGAL_FORMATS.includes(transformed),
            `${prop["value"]} is not a legal LOG_FORMAT value`
          );
          prop["value"] = transformed;
          break;
        case "LOG_LEVEL":
          transformed = prop["value"].toLowerCase();
          assert(
            LOG_LEGAL_LEVEL_KEYS.includes(transformed),
            `${prop["value"]} is not among accepted log levels`
          );
          prop["value"] = transformed;
          break;
        case "LOG_CONFIG_PRINT_LEVELS":
          prop["value"] = prop["value"]
            .toLowerCase()
            .split(",")
            .map((s: string) => s.trim());
          break;
      }
      return prop;
    },
  })
  .required([
    "GRPC_SERVER_HOST",
    "GRPC_SERVER_PORT",
    "POSTGRES_STORAGE_CREDS_ABSPATH",
    "POSTGRES_STORAGE_HOST",
    "POSTGRES_STORAGE_PORT",
    "CERTS_ABSPATH",
    "GRPC_SERVER_CERT_SUBPATH",
  ]);

nconf
  .file({
    file: nconf.get("POSTGRES_STORAGE_CREDS_ABSPATH"),
    format: {
      parse: yaml.parse,
      stringify: yaml.stringify,
    },
  })
  .required(["POSTGRES_STORAGE_USERNAME", "POSTGRES_STORAGE_PASSWORD"]);

nconf.set(
  "GRPC_SERVER_URL",
  [nconf.get("GRPC_SERVER_HOST"), nconf.get("GRPC_SERVER_PORT")].join(":")
);

nconf.set(
  "GRPC_SERVER_CERT_ABSPATH",
  [nconf.get("CERTS_ABSPATH"), nconf.get("GRPC_SERVER_CERT_SUBPATH")].join("/")
);

nconf.set(
  "GRPC_SERVER_CERT_TLS_CRT_ABSPATH",
  [nconf.get("GRPC_SERVER_CERT_ABSPATH"), "tls.crt"].join("/")
);

nconf.set(
  "GRPC_SERVER_CERT_TLS_KEY_ABSPATH",
  [nconf.get("GRPC_SERVER_CERT_ABSPATH"), "tls.key"].join("/")
);

nconf.set(
  "REPO_PROTOS_ABSPATH",
  [nconf.get("PROJECT_ROOT_ABSPATH"), nconf.get("REPO_PROTOS_SUBPATH")].join(
    "/"
  )
);

nconf.set(
  "OTEL_TRACE_URL",
  [
    "grpc://",
    nconf.get("OTEL_TRACE_HOST"),
    ":",
    nconf.get("OTEL_TRACE_PORT"),
  ].join("")
);

nconf.defaults({
  FEATURE_INSTRUMENTATION: true,
  FEATURE_GRPC_SERVER: true,
  FEATURE_HTTP_SERVER: true,

  OTEL_TRACE_TO_CONSOLE: false,

  GRPC_CHECK_CLIENT_CERT: true,
  GRPC_TLS_DISABLE: false,

  POSTGRES_STORAGE_QUERY_TIMEOUT: 5000,
  POSTGRES_STORAGE_MOCK_CONNECTION: false,

  LOG_FORMAT: "JSON",
  LOG_LEVEL: "warning",
  LOG_TIME_FORMAT: "YYYY-MM-DD HH:mm:ss",
  LOG_CONFIG_PRINT_LEVELS: ["info", "debug"],
});

const logLevel = nconf.get("LOG_LEVEL");
const logConfigPrintLevels = nconf.get("LOG_CONFIG_PRINT_LEVELS");
if (logConfigPrintLevels.includes(logLevel)) {
  printConfig(nconf.get(), {
    redactions: {
      includes: ["PASSWORD"],
    },
  });
}

export default nconf;
