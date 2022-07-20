/* eslint-disable @typescript-eslint/no-explicit-any */

/** If T is a function, get the return type, else fall back to U */
type ReturnTypeOr<T, U> = T extends (...args: Array<any>) => any
  ? ReturnType<T>
  : U;

type ArgDef<T> = {
  type: 'arg';
  alias?: string;
  typeLabel: string;
  description: string;
  validator?: (input: string) => T;
};

type ArgOptionalDef<T> = {
  type: 'argOptional';
  alias?: string;
  typeLabel: string;
  description: string;
  validator?: (input: string) => T;
};

type ArgDefInput<T> = Expand<Omit<ArgDef<T>, 'type'> & { optional?: boolean }>;

type ArgListDef<T> = {
  type: 'argList';
  alias?: string;
  typeLabel: string;
  description: string;
  validator?: (input: string) => T;
};

type ArgListDefInput<T> = Omit<ArgListDef<T>, 'type'>;

type FlagDef = {
  type: 'flag';
  alias?: string;
  description: string;
};

type FlagDefInput = Omit<FlagDef, 'type'>;

type OptionDef<T> = ArgDef<T> | ArgOptionalDef<T> | ArgListDef<T> | FlagDef;

type Definers = {
  arg: ArgDefiner;
  argList: ArgListDefiner;
  flag: FlagDefiner;
};

export type Schema = Record<string, OptionDef<unknown>>;

export function defineSchema<O extends Schema>(
  getSchema: (definers: Definers) => O,
) {
  return getSchema({ arg, argList, flag });
}

type ArgDefPossiblyOptional<T, O> = [O] extends [true]
  ? ArgOptionalDef<T>
  : ArgDef<T>;

function arg<T, I extends ArgDefInput<T>>(
  input: I,
): ArgDefPossiblyOptional<
  'validator' extends keyof I ? ReturnTypeOr<I['validator'], string> : string,
  'optional' extends keyof I
    ? I['optional'] extends true
      ? true
      : false
    : false
> {
  const { optional, ...rest } = input;
  const result = optional
    ? { type: 'argOptional', ...rest }
    : { type: 'arg', ...rest };
  return result as any;
}

type ArgDefiner = typeof arg;

function argList<T, I extends ArgListDefInput<T>>(
  input: I,
): 'validator' extends keyof I
  ? ArgListDef<ReturnTypeOr<I['validator'], string>>
  : ArgListDef<string> {
  return { type: 'argList', ...input } as any;
}

type ArgListDefiner = typeof argList;

function flag(input: Expand<FlagDefInput>): FlagDef {
  return { type: 'flag', ...input };
}

type FlagDefiner = typeof flag;

// ==========

type ExtractType<D extends OptionDef<unknown>> = D extends FlagDef
  ? boolean
  : D extends ArgDef<infer T>
  ? T
  : D extends ArgOptionalDef<infer T>
  ? T
  : D extends ArgListDef<infer T>
  ? Array<T>
  : never;

type RequiredTypes<O extends Schema> = {
  [K in keyof O as O[K] extends ArgOptionalDef<unknown>
    ? never
    : K]: ExtractType<O[K]>;
};
type OptionalTypes<O extends Schema> = {
  [K in keyof O as O[K] extends ArgOptionalDef<unknown>
    ? K
    : never]?: ExtractType<O[K]>;
};

export type ParsedResult<O extends Schema> = Expand<
  RequiredTypes<O> & OptionalTypes<O>
>;
