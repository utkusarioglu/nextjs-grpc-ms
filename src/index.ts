import { api } from "@opentelemetry/sdk-node";
import config from "./config";
import http from "http";
const PROTO_PATH = "../proto/greeting.proto";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import fs from "fs";
import util from "util";
import { countryList } from "./models/inflation/inflation.model";
const readFile = util.promisify(fs.readFile);

export function main() {
  const greetingProtoDef = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  const greetingProto = grpc.loadPackageDefinition(greetingProtoDef);
  const server = new grpc.Server();

  // @ts-ignore
  server.addService(greetingProto.ms.nextjs_grpc.Greeter.service, {
    // @ts-ignore
    sendGreeting: async (call, callback) => {
      const span = api.trace.getSpan(api.context.active());
      span?.addEvent("Sending Greeting");
      span?.setAttribute("some-attribute", "set some attribute");
      try {
        const response = await countryList(["USA", "TUR"]);
        // const { name, age, job, fav_movies } = call.request;
        const delayDuration = Math.random() * 3000 + 1000;
        const message = [
          // `Your name is ${name}`,
          // `you are ${age} years old`,
          // `you are a ${job.toLowerCase()}`,
          // `and your favorite movies are: ${fav_movies.join(", ")}`,
          // `You like the number ${Math.floor(Math.random() * 10)}`,
          // `is local: ${process.env.IS_LOCAL}`,
          // `is aws: ${process.env.IS_AWS}`,
          // "<br>",
          JSON.stringify(response, null, 2),
        ];
        span?.addEvent("delay", { duration: delayDuration });
        callback(null, { greeting: message.join(", ") });
      } catch (e: any) {
        span?.recordException(e);
        span?.setStatus({ code: api.SpanStatusCode.ERROR });
        console.log(e);
      } finally {
        // span.addEvent("Finished Sending Greeting");
        // span.end();
      }
    },
  });

  const url = [config.get("HOST"), config.get("PORT")].join(":");
  const grpcServerCertPath = [
    config.get("CERTS_PATH"),
    config.get("GRPC_SERVER_CERT_SUBPATH"),
  ].join("/");
  const crtPromise = readFile(`${grpcServerCertPath}/tls.crt`);
  const keyPromise = readFile(`${grpcServerCertPath}/tls.key`);

  Promise.all([crtPromise, keyPromise]).then(([crt, key]) => {
    console.log({ crt, key });
    const credentials = grpc.ServerCredentials.createSsl(
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

  const requestListener: http.RequestListener = function (_, res) {
    res.writeHead(200);
    res.end("Hello, World!a!");
  };

  const httpServer = http.createServer(requestListener);
  httpServer.listen(8000);
}
