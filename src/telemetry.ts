import config from "./config";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
// const {
//   BasicTracerProvider,
//   SimpleSpanProcessor,
// } = require("@opentelemetry/sdk-trace-base");
import { Metadata, credentials } from "@grpc/grpc-js";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { Resource } from "@opentelemetry/resources";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { MeterProvider } from "@opentelemetry/sdk-metrics-base";
import { HostMetrics } from "@opentelemetry/host-metrics";

const prometheusPort = 9464;
const serviceName = "nextjs-grpc-ms";
const serviceNamespace = "ms";
// const traceUrl = `grpc://${process.env.OTEL_TRACE_HOST}:${process.env.OTEL_TRACE_PORT}`;
const traceUrl = `grpc://${config.get("OTEL_TRACE_HOST")}:${config.get(
  "OTEL_TRACE_PORT"
)}`;
console.log(`Trace url: ${traceUrl}`);

const instrumentations = [getNodeAutoInstrumentations()];

const metadata = new Metadata();
// const traceProvider = new BasicTracerProvider();
// const traceExporter = new OTLPTraceExporter({
//   url: traceUrl,
//   credentials: credentials.createInsecure(),
//   metadata,
// });
const traceExporter = new OTLPTraceExporter({
  url: traceUrl,
  credentials: credentials.createInsecure(),
  metadata,
});

// traceProvider.addSpanProcessor(new SimpleSpanProcessor(traceExporter));
// traceProvider.register();

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const metricExporter = new PrometheusExporter(
  // @ts-ignore
  { port: prometheusPort, startServer: true },
  () => console.log(`metrics @ ms.ms:${prometheusPort}/metrics`)
);
const meterProvider = new MeterProvider({
  // @ts-ignore
  exporter: metricExporter,
  interval: 1000,
});
// this is probably temporary, without this prometheus metrics don't work
// and this command is not given in any of the documentation.
// meterProvider.addMetricReader(metricExporter);

// @ts-ignore
const hostMetrics = new HostMetrics({ meterProvider, name: serviceName });
hostMetrics.start();

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    [SemanticResourceAttributes.SERVICE_NAMESPACE]: serviceNamespace,
  }),
  // @ts-ignore
  metricExporter,
  traceExporter,
  instrumentations,
});

sdk.start()
//   .then(() => {
//   const { main } = require("./index");
//   console.log("sdk.start().then() running");
//   const meter = meterProvider.getMeter(serviceName);
//   const counter = meter.createCounter("some_counter", {
//     description: "some test value",
//   });
//   counter.add(3);
//   main();
// });

process.on("SIGTERM", () => {
  sdk
    .shutdown()
    .then(() => console.log("Tracing terminated"))
    .catch((error: any) => console.log("Error terminating tracing", error))
    .finally(() => process.exit(0));
});
