require("dotenv").config();
import nconf from "nconf";
import yaml from "yaml";
import {
  booleanAssumeTrue,
  booleanAssumeFalse,
  printConfig,
} from "./utils/config/config.utils";

nconf
  .env({
    transform: (prop: Record<string, any>) => {
      switch (prop["key"]) {
        case "GRPC_SERVER_CHECK_CLIENT_CERT":
        case "OTEL_ENABLE_INSTRUMENTATION":
          prop["value"] = booleanAssumeTrue(prop["value"]);
          break;
        case "GRPC_SERVER_TLS_DISABLE":
          prop["value"] = booleanAssumeFalse(prop["value"]);
          break;
        case "GRPC_SERVER_PORT":
        case "OTEL_TRACE_PORT":
          prop["value"] = parseInt(prop["value"]);
          break;
      }
      return prop;
    },
  })
  .required([
    "GRPC_SERVER_HOST",
    "GRPC_SERVER_PORT",
    "POSTGRES_STORAGE_CREDS_ABSPATH",
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

nconf.defaults({
  GRPC_CHECK_CLIENT_CERT: true,
  GRPC_TLS_DISABLE: false,
});

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

printConfig(nconf.get(), {
  redactions: {
    includes: ["PASSWORD"],
  },
});

export default nconf;
