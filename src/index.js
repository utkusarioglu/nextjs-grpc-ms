#!/usr/local/bin/node
require("dotenv").config();
const http = require("http");
const PROTO_PATH = "../proto/greeting.proto";
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const fs = require("fs");
const util = require("util");
const readFile = util.promisify(fs.readFile);

function main() {
  console.log("main called");
  console.log(
    "process.env.GRPC_CHECK_CLIENT_CERT: ",
    process.env.GRPC_CHECK_CLIENT_CERT,
    process.env.GRPC_CHECK_CLIENT_CERT === "true"
  );
  const opentelemetry = require("@opentelemetry/api");

  const greetingProtoDef = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  const greetingProto = grpc.loadPackageDefinition(greetingProtoDef);

  const server = new grpc.Server();

  server.addService(greetingProto.ms.nextjs_grpc.Greeter.service, {
    sendGreeting: async (call, callback) => {
      const span = opentelemetry.trace.getSpan(opentelemetry.context.active());
      span.addEvent("Sending Greeting");
      span.setAttribute("some-attribute", "set some attribute");
      try {
        const { name, age, job, fav_movies } = call.request;
        const delayDuration = Math.random() * 3000 + 1000;
        const message = [
          `Your name is ${name}`,
          `you are ${age} years old`,
          `you are a ${job.toLowerCase()}`,
          `and your favorite movies are: ${fav_movies.join(", ")}`,
          `You like the number ${Math.floor(Math.random() * 10)}`,
          `is local: ${process.env.IS_LOCAL}`,
          `is aws: ${process.env.IS_AWS}`,
          `delay was: ${Math.round(delayDuration / 10) / 100} seconds`,
        ];
        span.addEvent("delay", { duration: delayDuration });
        setTimeout(() => {
          callback(null, { greeting: message.join(", ") });
        }, delayDuration);
      } catch (e) {
        span.recordException(e);
        span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR });
        console.log(e);
      } finally {
        // span.addEvent("Finished Sending Greeting");
        // span.end();
      }
    },
  });

  const url = `${process.env.HOST}:${process.env.PORT}`;

  const crtPromise = readFile(`${process.env.GRPC_SERVER_CERT_PATH}/tls.crt`);
  const keyPromise = readFile(`${process.env.GRPC_SERVER_CERT_PATH}/tls.key`);

  Promise.all([crtPromise, keyPromise]).then(([crt, key]) => {
    const credentials = grpc.ServerCredentials.createSsl(
      crt,
      [
        {
          private_key: key,
          cert_chain: crt,
        },
      ],
      process.env.GRPC_CHECK_CLIENT_CERT === "true"
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

  const requestListener = function (req, res) {
    res.writeHead(200);
    res.end("Hello, World!");
  };

  const httpServer = http.createServer(requestListener);
  httpServer.listen(80);
}

module.exports = { main };
