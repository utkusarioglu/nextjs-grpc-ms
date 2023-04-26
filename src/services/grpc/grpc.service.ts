import * as grpc from "@grpc/grpc-js";
import config from "_config";
import { readFileSync } from "fs";
import { InflationModel } from "_models/inflation/inflation.model";
import protos from "_services/protos/protos.service";
import log from "_services/log/log.service";
import { pipeline } from "node:stream";

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

  private getService(
    serviceName: keyof typeof this.packageDefs
  ): grpc.ServiceDefinition {
    const grpcPackage = this.packageDefs[serviceName];
    if (!grpcPackage) {
      throw new Error("No such package");
    }
    const grpcService = grpcPackage["service"];
    if (!grpcService) {
      throw new Error("No Service defined for given package");
    }
    // @ts-expect-error
    return grpcService as grpc.ServiceDefinition;
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
    const credentials = config.get("grpcServer:tls:disable")
      ? grpc.ServerCredentials.createInsecure()
      : grpc.ServerCredentials.createSsl(
          this.tlsProps.crt,
          [
            {
              private_key: this.tlsProps.key,
              cert_chain: this.tlsProps.crt,
            },
          ],
          config.get("grpcServer:tls:checkClientCert")
        );
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
    inflation:
      // @ts-ignore
      protos.getProtoPackageDef("inflation/decade-stats.proto")["ms"][
        "nextjs_grpc"
      ]["Inflation"],
  },
  {
    crt: readFileSync(
      config.get("paths:certificates:grpcServer:tlsCrtAbsPath")
    ),
    key: readFileSync(
      config.get("paths:certificates:grpcServer:tlsKeyAbsPath")
    ),
  }
);
