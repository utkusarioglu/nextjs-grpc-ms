import grpcService from "_services/grpc/grpc.class";
import httpService from "_services/http/http.service";
// import { counter } from "_utils/instrumentation/counter.utils";

// class Rando {
//   @counter("rando_counter")
//   public static someRando(): void {
//     console.log("rando");
//   }
// }

export function main() {
  // Rando.someRando();
  // Rando.someRando();
  // Rando.someRando();

  grpcService.addServices().startServer();
  httpService.startServer();
}
