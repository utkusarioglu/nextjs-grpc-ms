import config from "./config";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { Metadata, credentials } from "@grpc/grpc-js";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { Resource } from "@opentelemetry/resources";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import {
  ConsoleSpanExporter,
  // InMemorySpanExporter,
  // SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";

const diagLogger = new DiagConsoleLogger();

const instrumentations = [
  getNodeAutoInstrumentations({
    "@opentelemetry/instrumentation-fs": {
      requireParentSpan: true,
    },
    "@opentelemetry/instrumentation-winston": {},
  }),
];

const traceExporter = config.get("OTEL_TRACE_TO_CONSOLE")
  ? () => new ConsoleSpanExporter()
  : () =>
      new OTLPTraceExporter({
        url: config.get("OTEL_TRACE_URL"),
        credentials: credentials.createInsecure(),
        metadata: new Metadata(),
      });
diag.setLogger(diagLogger, DiagLogLevel.INFO);

const prometheusPort = config.get("OTEL_METRICS_PORT");
const metricReader = new PrometheusExporter({ port: prometheusPort }, () =>
  diagLogger.info(`metrics @ ms.ms:${prometheusPort}/metrics`)
);

const serviceName = config.get("OTEL_SERVICE_NAME");
const serviceNamespace = config.get("OTEL_SERVICE_NAMESPACE");
const sdk = new NodeSDK({
  serviceName,
  autoDetectResources: true,
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    [SemanticResourceAttributes.SERVICE_NAMESPACE]: serviceNamespace,
  }),
  metricReader,
  traceExporter: traceExporter(),
  instrumentations,
});

sdk.start();
const { main } = require("./index");
main();

process.on("SIGTERM", () => {
  diagLogger.info("SIGTERM received, telemetry shutting down…");
  sdk
    .shutdown()
    .then(() => diagLogger.info("Telemetry terminated successfully"))
    .catch((err: unknown) =>
      diagLogger.error("Error during telemetry termination", { error: err })
    )
    .finally(() => process.exit(0));
});
