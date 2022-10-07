require("dotenv").config();
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const PROTO_PATH = "../proto/greeting.proto";
const { readFileSync } = require("fs");
const greetingProtoDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

grpc.logVerbosity(0); // DEBUG

const Greeter =
  grpc.loadPackageDefinition(greetingProtoDef).ms.nextjs_grpc.Greeter;

const credentials = grpc.credentials.createSsl(
  readFileSync(`${process.env.GRPC_SERVER_CERT_PATH}/grpc-server/ca.crt`),
  readFileSync(`${process.env.GRPC_SERVER_CERT_PATH}/grpc-server/tls.key`),
  readFileSync(`${process.env.GRPC_SERVER_CERT_PATH}/grpc-server/tls.crt`)
);

const greetingService = new Greeter(
  "localhost:50051",
  // grpc.credentials.createInsecure()
  credentials
);

async function sendGreeting(greeting) {
  return new Promise((resolve, reject) => {
    greetingService.sendGreeting(greeting, (error, response) => {
      if (error) {
        console.log(error);
        reject(error);
        return;
      }
      console.log("response sent:", response);
      resolve(response);
    });
  });
}

sendGreeting({
  name: "utku",
  age: 3,
  job: 0,
  fav_movies: ["hda", "dfd", "als"],
}).then((greeting) => {
  console.log("greeting response", greeting);
});
