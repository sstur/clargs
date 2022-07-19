/* eslint-disable @typescript-eslint/no-explicit-any */
type ArgType = 'boolean' | 'string';

type ArgDefInput<A extends string, T extends ArgType> = {
  alias?: A;
  typeLabel?: string;
  description: string;
  type?: T;
  lazyMultiple?: boolean;
};

type ArgDef<A extends string, T extends ArgType> = Expand<
  Required<ArgDefInput<A, T>>
>;

type RenderOptions = {
  header: string;
};

type Parser<O extends Record<string, ArgDef<string, ArgType>>> = {
  parse: (args: Array<string>) => ExtractTypes<O>;
  renderUsage: (options: RenderOptions) => string;
};

type ToType<T> = T extends 'boolean'
  ? boolean
  : T extends 'number'
  ? number
  : T extends 'string'
  ? string
  : never;

type ExtractAlias<D> = D extends ArgDef<infer A, infer _T> ? A : never;
type ExtractType<D> = D extends ArgDef<infer _A, infer T> ? ToType<T> : never;

type AggregateTypes<O extends Record<string, ArgDef<string, ArgType>>> = {
  [K in keyof O]: ExtractType<O[K]>;
};
type AggregateAliasTypes<O extends Record<string, ArgDef<string, ArgType>>> =
  Omit<
    {
      [K in keyof O as ExtractAlias<O[K]>]: ExtractType<O[K]>;
    },
    '_'
  >;

type ExtractTypes<O extends Record<string, ArgDef<string, ArgType>>> = Expand<
  Partial<AggregateTypes<O> & AggregateAliasTypes<O>> & {
    _unknown: Array<string>;
  }
>;

function expand<T>(input: T): T extends ArgDefInput<infer A, infer T>
  ? {
      alias: string extends A ? '_' : A;
      typeLabel: string;
      description: string;
      type: ArgType extends T ? 'string' : T;
      lazyMultiple: boolean;
    }
  : never {
  const { alias, typeLabel, description, type, lazyMultiple } =
    input as unknown as ArgDefInput<string, ArgType>;
  return {
    alias: alias ?? '_',
    typeLabel: typeLabel ?? '',
    description,
    type: type ?? 'string',
    lazyMultiple: lazyMultiple ?? false,
  } as any;
}

function defineArg<
  A extends string,
  T extends ArgType,
  I extends ArgDefInput<A, T>,
>(input: I) {
  return expand(input);
}

export function createParser<O extends Record<string, ArgDef<string, ArgType>>>(
  schema: O,
) {
  return schema as any as Parser<O>;
}

export function defineSchema<O extends Record<string, ArgDef<string, ArgType>>>(
  definer: (arg: typeof defineArg) => O,
) {
  return definer(defineArg);
}

export { defineArg as defineArgForTesting };
