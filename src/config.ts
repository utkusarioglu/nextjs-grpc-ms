require("dotenv").config();
import nconf from "nconf";
import yaml from "yaml";

nconf
  .env({
    transform: (prop: Record<string, any>) => {
      if (prop["key"] === "GRPC_CHECK_CLIENT_CERT" && !!prop["value"]) {
        ["FALSE", "0"].includes(prop["value"].toUpperCase());
        prop["value"] = false;
      }
      return prop;
    },
  })
  .required([
    "HOST",
    "PORT",
    "POSTGRES_STORAGE_CREDS_PATH",
    "CERTS_PATH",
    "GRPC_SERVER_CERT_SUBPATH",
  ]);

nconf
  .file({
    file: nconf.get("POSTGRES_STORAGE_CREDS_PATH"),
    format: {
      parse: yaml.parse,
      stringify: yaml.stringify,
    },
  })
  .required(["username", "password"]);

nconf.defaults({
  GRPC_CHECK_CLIENT_CERT: true,
});

export default nconf;
