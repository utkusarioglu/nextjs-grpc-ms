import grpcService from "_services/grpc/grpc.service";
import httpService from "_services/http/http.service";

export function main() {
  grpcService.addServices().startServer();
  httpService.startServer();
}
