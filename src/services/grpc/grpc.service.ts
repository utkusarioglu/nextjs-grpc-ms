import * as grpc from "@grpc/grpc-js";
import config from "_config";
import { readFileSync } from "fs";
import { InflationModel } from "_models/inflation/inflation.model";
import log from "_services/log/log.service";
import { pipeline } from "node:stream";
import { inflationDefinition } from "_gen/src/inflation/decade-stats.grpc-server";

type PackageDefs = Record<string, grpc.ServiceDefinition>;
interface TlsSet {
  ca: Buffer;
  crt: Buffer;
  key: Buffer;
}

type TlsProps = TlsSet & {
  clients: TlsSet[];
};

class GrpcService {
  private packageDefs: PackageDefs;
  private tlsProps: TlsProps;
  private server: grpc.Server;

  constructor(packageDefs: PackageDefs, tlsProps: TlsProps) {
    this.packageDefs = packageDefs;
    this.tlsProps = tlsProps;
    this.server = new grpc.Server();
  }

  private getService(
    serviceName: keyof typeof this.packageDefs
  ): grpc.ServiceDefinition {
    const grpcService = this.packageDefs[serviceName];
    if (!grpcService) {
      throw new Error("No such package");
    }
    // const grpcService = grpcPackage["service"];
    // if (!grpcService) {
    //   throw new Error("No Service defined for given package");
    // }
    return grpcService;
  }

  public addServices(): this {
    const inflationService = this.getService("inflation");
    this.server.addService(inflationService, {
      // TODO you have an `any` type here
      decadeStats: async (call: any) => {
        log.debug("Received grpc.decadeStats", { request: call.request });
        // @ts-expect-error
        const source = InflationModel.decadeStats(call.request);
        pipeline(source, call, (e: unknown) => {
          if (e) {
            log.error("Something went wrong in decadeStats pipeline", {
              error: e,
            });
          }
          log.debug("Grpc call finished");
        });
      },
    });
    return this;
  }

  public startServer(): void {
    const serverUrl = config.get("grpcServer:url");
    const credentials = config.get("grpcServer:tls:enabled")
      ? grpc.ServerCredentials.createSsl(
          this.tlsProps.ca,
          [
            {
              private_key: this.tlsProps.key,
              // cert_chain: this.tlsProps.crt,
              cert_chain: Buffer.concat([this.tlsProps.crt, this.tlsProps.ca]),
            },
            {
              private_key: this.tlsProps.clients[0]!.key,
              cert_chain: Buffer.concat([
                this.tlsProps.clients[0]!.crt,
                this.tlsProps.clients[0]!.ca,
              ]),
            },
          ],
          config.get("grpcServer:tls:checkClientCert")
        )
      : grpc.ServerCredentials.createInsecure();
    this.server.bindAsync(serverUrl, credentials, (err, _port) => {
      if (err) {
        log.error({ message: `Error occurred: `, error: err });
        return;
      }
      log.info(`Server started at ${serverUrl}`);
      this.server.start();
    });
  }
}

export default new GrpcService(
  {
    inflation: inflationDefinition,
    // inflation:
    //   // @ts-ignore
    //   protos.getProtoPackageDef("inflation/decade-stats.proto")["ms"][
    //     "nextjs_grpc"
    //   ]["Inflation"],
  },
  {
    ca: readFileSync(config.get("paths:certificates:grpcServer:caCrtAbsPath")),
    crt: readFileSync(
      config.get("paths:certificates:grpcServer:tlsCrtAbsPath")
    ),
    key: readFileSync(
      config.get("paths:certificates:grpcServer:tlsKeyAbsPath")
    ),
    clients: [
      {
        ca: readFileSync(
          config.get("paths:certificates:grpcServer:caCrtAbsPath")
        ),
        crt: readFileSync(
          config.get("paths:certificates:grpcServer:tlsCrtAbsPath")
        ),
        key: readFileSync(
          config.get("paths:certificates:grpcServer:tlsKeyAbsPath")
        ),
      },
    ],
  }
);

// "@bufbuild/buf": "^1.23.1",
// "grpc-tools": "^1.12.4",
// "grpc_tools_node_protoc_ts": "^5.3.3",
// "typescript": "^5.0.4"
