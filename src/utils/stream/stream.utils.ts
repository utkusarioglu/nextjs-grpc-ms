import log from "_services/log/log.service";
import { Transform } from "node:stream";

export const streamLogger = () =>
  new Transform({
    objectMode: true,
    transform(chunk, _, callback) {
      log.debug("Received grpc pipeline chunk", { chunk });
      return callback(null, chunk);
    },
  });
