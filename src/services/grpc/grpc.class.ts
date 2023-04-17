import * as grpc from "@grpc/grpc-js";
import config from "../../config";
import { readFileSync } from "fs";
import { api } from "@opentelemetry/sdk-node";
import { decadeStats } from "../../models/inflation/inflation.model";
import protoService from "../protos/proto.service";

type PackageDefs = Record<string, grpc.GrpcObject>;
interface TlsProps {
  crt: Buffer;
  key: Buffer;
}

class GrpcService {
  private packageDefs: PackageDefs;
  private tlsProps: TlsProps;
  private server: grpc.Server;

  constructor(packageDefs: PackageDefs, tlsProps: TlsProps) {
    this.packageDefs = packageDefs;
    this.tlsProps = tlsProps;
    this.server = new grpc.Server();
  }

  public addServices(): this {
    // inflationProto.ms.nextjs_grpc.Inflation.service
    const inflationService = this.packageDefs["inflation"]!["service"]!;
    // @ts-expect-error
    this.server.addService(inflationService, {
      decadeStats: async (call: any) => {
        // console.log({call, callback})
        const span = api.trace.getSpan(api.context.active());
        span?.addEvent("Retrieving Inflation decade stats");
        span?.setAttribute("some-attribute", "set some attribute");
        try {
          // decadeStats(["USA", "TUR"], call);
          console.log({ callRequest: call.request });
          decadeStats(call.request.codes, call);
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
    return this;
  }

  public startServer(): void {
    const credentials = config.get("GRPC_SERVER_TLS_DISABLE")
      ? grpc.ServerCredentials.createInsecure()
      : grpc.ServerCredentials.createSsl(
          this.tlsProps.crt,
          [
            {
              private_key: this.tlsProps.key,
              cert_chain: this.tlsProps.crt,
            },
          ],
          config.get("GRPC_SERVER_CHECK_CLIENT_CERT")
        );
    this.server.bindAsync(
      config.get("GRPC_SERVER_URL"),
      credentials,
      (error, _port) => {
        if (error) {
          console.log(`Error occurred: `, error);
          return;
        }
        console.log(`Server started at ${config.get("GRPC_SERVER_URL")}`);
        this.server.start();
      }
    );
  }
}

export default new GrpcService(
  {
    inflation:
      // @ts-ignore
      protoService.getProtoPackageDef("inflation/decade-stats.proto")["ms"][
        "nextjs_grpc"
      ]["Inflation"],
  },
  {
    crt: readFileSync(config.get("GRPC_SERVER_CERT_TLS_CRT_ABSPATH")),
    key: readFileSync(config.get("GRPC_SERVER_CERT_TLS_KEY_ABSPATH")),
  }
);
