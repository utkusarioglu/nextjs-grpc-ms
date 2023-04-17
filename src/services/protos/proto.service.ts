import config from "../../config";
import { resolve } from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

class ProtoService {
  private protosPath: string;

  constructor(protosPath: string) {
    this.protosPath = protosPath;
  }

  public getProtoPackageDef(relPath: string): grpc.GrpcObject {
    const protoDef = protoLoader.loadSync(resolve(this.protosPath, relPath), {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const packageDef = grpc.loadPackageDefinition(protoDef);
    return packageDef;
  }
}

export default new ProtoService(config.get("REPO_PROTOS_ABSPATH"));
