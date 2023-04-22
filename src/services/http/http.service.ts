import http from "http";
import { decadeStats } from "_models/inflation/inflation.model";
import { pipeline, Transform } from "stream";
import log from "_services/log/log.service";
import {
  // charCodeTransformer,
  // bufferTransformer,
  jsonArrayTransformer,
  stringTransformer,
} from "_utils/transformer/transformer.utils";

// On second call, the http callback doesn't return anything
// Grpc callback only returns default values
class HttpService {
  private requestListener() {
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
          log.debug("Http GET /decade-stats", { codesArray });
          decadeStats({ codes: codesArray }, stringTransformer)
            .then((writeCounter) => {
              log.debug("DecadeStats finished", {
                writeCounter,
                // closed: charCodeTransformer.closed,
              });
            })
            .catch((e) => {
              log.debug("Catching decade stats", { error: e });
            });
          pipeline(
            stringTransformer,
            jsonArrayTransformer,
            // bufferTransformer,
            // charCodeTransformer,
            res,
            (e) => {
              if (e) {
                log.error("Something broken in pipeline", { error: e });
              }
            }
          );
          return;
        default:
          res.write(JSON.stringify({ message: "Not implemented" }));
          res.end();
          return;
      }
    };
    return requestListener;
  }

  public startServer() {
    const httpServer = http.createServer(this.requestListener());
    httpServer.listen(8000);
  }
}

export default new HttpService();
