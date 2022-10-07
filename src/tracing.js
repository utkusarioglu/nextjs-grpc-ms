require("dotenv").config();
const opentelemetry = require("@opentelemetry/sdk-node");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");
const { diag, DiagConsoleLogger, DiagLogLevel } = require("@opentelemetry/api");
const { PrometheusExporter } = require("@opentelemetry/exporter-prometheus");
// const {
//   BasicTracerProvider,
//   SimpleSpanProcessor,
// } = require("@opentelemetry/sdk-trace-base");
const { Metadata, credentials } = require("@grpc/grpc-js");
const {
  SemanticResourceAttributes,
} = require("@opentelemetry/semantic-conventions");
const { Resource } = require("@opentelemetry/resources");
const {
  OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-grpc");
const { MeterProvider } = require("@opentelemetry/sdk-metrics-base");
const { HostMetrics } = require("@opentelemetry/host-metrics");

const prometheusPort = 9464;
const serviceName = "nextjs-grpc-ms";
const serviceNamespace = "ms";
const traceUrl = `grpc://${process.env.OTEL_TRACE_HOST}:${process.env.OTEL_TRACE_PORT}`;
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
  { port: prometheusPort, startServer: true },
  () =>
    console.log(`metrics @ ${process.env.HOSTNAME}:${prometheusPort}/metrics`)
);
const meterProvider = new MeterProvider({
  exporter: metricExporter,
  interval: 1000,
});
// this is probably temporary, without this prometheus metrics don't work
// and this command is not given in any of the documentation.
meterProvider.addMetricReader(metricExporter);

const hostMetrics = new HostMetrics({ meterProvider, name: serviceName });
hostMetrics.start();

const sdk = new opentelemetry.NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    [SemanticResourceAttributes.SERVICE_NAMESPACE]: serviceNamespace,
  }),
  metricExporter,
  traceExporter,
  instrumentations,
});

sdk.start().then(() => {
  const { main } = require("./index");
  console.log("sdk.start().then() running");
  const meter = meterProvider.getMeter(serviceName);
  const counter = meter.createCounter("some_counter", {
    description: "some test value",
  });
  counter.add(3);
  main();
});

process.on("SIGTERM", () => {
  sdk
    .shutdown()
    .then(() => console.log("Tracing terminated"))
    .catch((error) => console.log("Error terminating tracing", error))
    .finally(() => process.exit(0));
});
