import http from "http";
import { InflationModel } from "_models/inflation/inflation.model";
import { pipeline } from "stream";
import log from "_services/log/log.service";
import {
  JsonArrayTransformer,
  StringTransformer,
} from "_utils/transformer/transformer.utils";
import config from "_config";

// On second call, the http callback doesn't return anything
// Grpc callback only returns default values
class HttpService {
  private requestListener() {
    const requestListener: http.RequestListener = async function (req, res) {
      res.writeHead(200);
      const url = new URL(req.url || "", `http://${req.headers.host}`);
      switch (url.pathname) {
        case "/liveness":
          const response = { status: "live" };
          log.debug("Responding to liveness probe", { response });
          res.statusCode = 200;
          res.write(JSON.stringify(response));
          res.end();
          break;

        case "/decade-stats":
          const codes = url.searchParams.get("codes");
          if (!codes) {
            res.write(JSON.stringify({ error: "Missing codes" }));
            res.end();
            return;
          }
          const codesArray = codes.split(",");
          log.debug("Http GET /decade-stats", { codesArray });
          const stringTransformer = new StringTransformer();
          const jsonArrayTransformer = new JsonArrayTransformer();
          const source = InflationModel.decadeStats({ codes: codesArray });
          pipeline(
            source,
            stringTransformer,
            jsonArrayTransformer,
            res,
            (e) => {
              if (e) {
                log.error("Something broken in pipeline", { error: e });
              }
            }
          );
          // TODO you need to handle premature abortion manually, according to:
          // https://github.com/knex/knex/wiki/Manually-Closing-Streams
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
    const httpServerPort = config.get("httpServer:port");
    log.info("Starting http server", { port: httpServerPort });
    const httpServer = http.createServer(this.requestListener());
    httpServer.listen(httpServerPort, () => {
      log.info("Started http server", { port: httpServerPort });
    });
  }
}

export default new HttpService();
