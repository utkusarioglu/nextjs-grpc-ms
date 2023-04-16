import { api } from "@opentelemetry/sdk-node";
import config from "./config";
import http from "http";
const PROTO_PATH = "../proto/src/inflation/decade-stats.proto";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import fs from "fs";
import util from "util";
import { decadeStats } from "./models/inflation/inflation.model";
const readFile = util.promisify(fs.readFile);

const INSECURE = false

const url = [config.get("HOST"), config.get("PORT")].join(":");
const grpcServerCertPath = [
  config.get("CERTS_PATH"),
  config.get("GRPC_SERVER_CERT_SUBPATH"),
].join("/");
const crtPromise = readFile(`${grpcServerCertPath}/tls.crt`);
const keyPromise = readFile(`${grpcServerCertPath}/tls.key`);

export function main() {
  const greetingProtoDef = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  const inflationProto = grpc.loadPackageDefinition(greetingProtoDef);
  const server = new grpc.Server();

  // @ts-ignore
  server.addService(inflationProto.ms.nextjs_grpc.Inflation.service, {
    decadeStats: async (call: any) => {
      // console.log({call, callback})
      const span = api.trace.getSpan(api.context.active());
      span?.addEvent("Retrieving Inflation decade stats");
      span?.setAttribute("some-attribute", "set some attribute");
      try {
        // decadeStats(["USA", "TUR"], call);
        decadeStats(call.request, call);
      } catch (e: any) {
        span?.recordException(e);
        span?.setStatus({ code: api.SpanStatusCode.ERROR });
        console.log(e);
      } finally {
        // call.end();
        // TODO find out if it's safe to enable these
        // span.addEvent("Finished Sending Greeting");
        // span.end();
      }
    },
  });

  Promise.all([crtPromise, keyPromise]).then(([crt, key]) => {
    
    const credentials = INSECURE
      ? grpc.ServerCredentials.createInsecure()
      : grpc.ServerCredentials.createSsl(
        crt,
        [
          {
            private_key: key,
            cert_chain: crt,
          },
        ],
        config.get("GRPC_CHECK_CLIENT_CERT")
      );
    server.bindAsync(url, credentials, (error, _port) => {
      if (error) {
        console.log(`Error occurred: `, error);
        return;
      }
      console.log(`Server started at ${url}`);
      server.start();
    });
  });

  const requestListener: http.RequestListener = function (_req, res) {
    res.writeHead(200);
    console.log("Received http request")
    const rows: any[] = []
    decadeStats(["USA", "TUR"], {
      write: (row) => rows.push(row),
      end: () => res.end(JSON.stringify(rows, null, 2))
    });
    console.log("Sent http request", rows);
  };

  const httpServer = http.createServer(requestListener);
  httpServer.listen(8000);
}
