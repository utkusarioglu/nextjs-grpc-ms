import { api } from "@opentelemetry/sdk-node";
import log from "_services/log/log.service";

export function trace<T extends (...params: any[]) => any>(): MethodDecorator {
  return (
    target: unknown,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    const original = descriptor.value as T;
    descriptor.value = (
      ...args: Parameters<typeof descriptor.value>
    ): ReturnType<typeof descriptor.value> => {
      log.debug(`Tracing ${propertyKey.toString()}`);
      const span = api.trace.getSpan(api.context.active());
      if (!span) {
        return original.call<
          typeof target,
          Parameters<typeof descriptor.value>,
          ReturnType<T>
        >(target, ...args);
        // throw new Error("SPAN_NOT_AVAILABLE");
      }
      span.addEvent(`Before  ${propertyKey.toString()} run`);
      span.setAttribute("propertyKey", propertyKey.toString());

      type ExpandedParams = [...Parameters<T>, api.Span];
      const response = original.call<
        typeof target,
        ExpandedParams,
        ReturnType<T>
        // TODO figure out the types here
        // @ts-expect-error
      >(target, ...args, span);

      span.addEvent(`After ${propertyKey.toString()} run`);
      return response;
    };
  };
}
