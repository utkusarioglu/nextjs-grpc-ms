export interface Prop {
  key: string;
  value: string;
}

export type Primitives = string | boolean | Object | number;

// export interface RedactOptions {
//   // literal: string[];
//   // includes: string[];
// }
export type RedactOptions = string[];

interface ExcludeOptions {
  literal: string[];
  includes: string[];
}

export interface PrintConfigOptions {
  exclusions?: Partial<ExcludeOptions>;
  redactions?: RedactOptions;
}

export type NconfConfig = Record<string, any>;

export interface EnvAssignment {
  source: string;
  target: string;
}

interface ConfigValueCombinationComponentConfigPath {
  type: "configPath";
  value: string;
}

interface ConfigValueCombinationComponentString {
  type: "string";
  value: string;
}

export interface ConfigValueCombination {
  target: string;
  joiner: string;
  components: (
    | ConfigValueCombinationComponentConfigPath
    | ConfigValueCombinationComponentString
  )[];
}

interface TypeCheck {
  test: "type";
  value: "string" | "number" | "boolean" | "object";
}

interface LengthGreaterThanCheck {
  test: "lengthGreaterThan";
  value: number;
}

interface LengthLessThanCheck {
  test: "lengthLessThan";
  value: number;
}

interface ValueGreaterThanCheck {
  test: "valueGreaterThan";
  value: number;
}

interface ValueLessThanCheck {
  test: "valueLessThan";
  value: number;
}

interface ValueEqualToCheck {
  test: "valueEqualTo";
  value: number;
}

interface ValueOneOfCheck {
  test: "valueOneOf";
  values: (string | number)[];
}

interface ValueIsALogLegalLevelCheck {
  test: "valueIsALogLegalLevel";
  value: string;
}

interface ValueIsALogLegalFormatCheck {
  test: "valueIsALogLegalFormat";
  value: string;
}
export interface ConfigValueCheck {
  configPath: string;
  tests: (
    | TypeCheck
    | LengthGreaterThanCheck
    | LengthLessThanCheck
    | ValueGreaterThanCheck
    | ValueLessThanCheck
    | ValueEqualToCheck
    | ValueOneOfCheck
    | ValueIsALogLegalLevelCheck
    | ValueIsALogLegalFormatCheck
  )[];
}

export interface ConfigManualTransform {
  target: string;
  type: "lowerCase" | "upperCase" | "lowerCaseArray" | "upperCaseArray";
}
