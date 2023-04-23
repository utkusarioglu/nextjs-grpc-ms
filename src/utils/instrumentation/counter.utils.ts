import { metrics } from "@opentelemetry/api";
import log from "_services/log/log.service";

export function meterPerformance(meterName: string): MethodDecorator {
  const meter = metrics.getMeter(meterName);
  const counter = meter.createCounter(`${meterName}_call_count`);
  return (
    target: unknown,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    const meter = metrics.getMeter(meterName);
    const durationCounter = meter.createHistogram(`${meterName}_run_duration`);
    const original = descriptor.value;
    descriptor.value = (
      ...args: Parameters<typeof descriptor.value>
    ): ReturnType<typeof descriptor.value> => {
      const start = performance.now();
      const response = original.call(target, ...args);
      const end = performance.now();
      durationCounter.record(end - start);
      return response;
    };
  };
}

// export function meterRuns<T>() {
//   return function (
//     target: any,
//     propertyKey: string,
//     descriptor: PropertyDescriptor
//   ) {
//     const original = descriptor.value;
//     descriptor.value = <T extends any[]>(...args: T) => {
//       log.debug(`Function run: ${propertyKey}`, { args });
//       const altered = original.apply(target, args);
//       return altered;
//     };
//   };
// }

export function meterRuns(meterName: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const meter = metrics.getMeter(meterName);
    const runCounter = meter.createCounter(`${meterName}_run_count`);
    const original = descriptor.value;
    descriptor.value = <T extends any[]>(...args: T) => {
      log.debug(`Counting run for ${propertyKey}`);
      runCounter.add(1);
      return original.apply(target, args);
    };
  };
}
