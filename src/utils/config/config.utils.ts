import { ConfigPrinter } from "./config-printer.class";
import { ConfigTransformer } from "./config-transformer.class";

export const configPrinter = new ConfigPrinter();
export const configTransformer = new ConfigTransformer();

export type { Prop } from "./config.utils.types";
