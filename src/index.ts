import http from "http";
import grpcService from "./services/grpc/grpc.class";
import { decadeStats } from "./models/inflation/inflation.model";
import { pipeline, Transform } from "stream";

export function main() {
  grpcService.addServices().startServer();

  const requestListener: http.RequestListener = async function (req, res) {
    res.writeHead(200);
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    switch (url.pathname) {
      case "/decade-stats":
        const codes = url.searchParams.get("codes");
        if (!codes) {
          res.write(JSON.stringify({ error: "Missing codes" }));
          res.end();
          return;
        }
        const codesArray = codes.split(",");
        console.log("Received http request", codesArray);
        const transformer = new Transform({
          async transform(chunk, _encoding, callback) {
            let stringified = "";
            for (const byte of chunk) {
              stringified += String.fromCharCode(byte);
            }
            // @ts-expect-error
            callback(stringified);
          },
        });
        decadeStats(codesArray, transformer);
        pipeline(transformer, res, (error) => {
          console.log({ message: "something in pipeline", error });
        });
        return;
      default:
        res.write(JSON.stringify({ message: "Not implemented" }));
        res.end();
        return;
    }
  };

  const httpServer = http.createServer(requestListener);
  httpServer.listen(8000);
}
