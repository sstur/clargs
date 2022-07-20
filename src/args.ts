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

type ArgDefInput<T> = Omit<ArgDef<T>, 'type'>;

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

type OptionDef<T> = ArgDef<T> | ArgListDef<T> | FlagDef;

type Definers = {
  arg: ArgDefiner;
  argList: ArgListDefiner;
  flag: FlagDefiner;
};

function defineSchema<O extends Record<string, OptionDef<unknown>>>(
  getSchema: (definers: Definers) => O,
) {
  return getSchema({ arg, argList, flag });
}

function arg<T, I extends ArgDefInput<T>>(
  input: I,
): 'validator' extends keyof I
  ? ArgDef<ReturnTypeOr<I['validator'], string>>
  : ArgDef<string> {
  return { type: 'arg', ...input } as any;
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
  : D extends ArgListDef<infer T>
  ? Array<T>
  : never;

type ParsedResult<O extends Record<string, OptionDef<unknown>>> = {
  [K in keyof O]: ExtractType<O[K]>;
};

// ==========

const _result = defineSchema(({ arg, flag }) => ({
  foo: arg({
    alias: 'f',
    typeLabel: '<foo>',
    description: 'Foo',
    validator: (x) => Number(x),
  }),
  bar: argList({ alias: 'b', typeLabel: '<bar>', description: 'Bar' }),
  baz: flag({ alias: 'z', description: 'Baz' }),
}));

type Foo = ParsedResult<typeof _result>;
