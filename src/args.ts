/* eslint-disable @typescript-eslint/no-explicit-any */
type ArgDef = {
  type: 'arg';
  alias?: string;
  typeLabel: string;
  description: string;
};

type ArgListDef = {
  type: 'list';
  alias?: string;
  typeLabel: string;
  description: string;
};

type ArgDefInput<M extends boolean> = Expand<
  Omit<ArgDef, 'type'> & { multiple?: M }
>;

type FlagDef = {
  type: 'flag';
  alias?: string;
  description: string;
};

type FlagDefInput = Omit<FlagDef, 'type'>;

type OptionDef = ArgDef | ArgListDef | FlagDef;

type Definers = {
  arg: ArgDefiner;
  flag: FlagDefiner;
};

function defineSchema<O extends Record<string, OptionDef>>(
  getSchema: (definers: Definers) => O,
) {
  return getSchema({ arg, flag });
}

// TODO: Should we split this up into two functions?
function arg<M extends boolean>(
  input: ArgDefInput<M>,
): [M] extends [true] ? ArgListDef : ArgDef {
  const { multiple, ...rest } = input;
  const result = multiple
    ? { type: 'list', ...rest }
    : { type: 'arg', ...rest };
  return result as any;
}

type ArgDefiner = typeof arg;

function flag(input: Expand<FlagDefInput>): FlagDef {
  return { type: 'flag', ...input };
}

type FlagDefiner = typeof flag;

// ==========

type ExtractType<D extends OptionDef> = D['type'] extends 'flag'
  ? boolean
  : D['type'] extends 'arg'
  ? string
  : D['type'] extends 'list'
  ? Array<string>
  : never;

type ParsedResult<O extends Record<string, OptionDef>> = {
  [K in keyof O]: ExtractType<O[K]>;
};

// ==========

const _result = defineSchema(({ arg, flag }) => ({
  foo: arg({ alias: 'f', typeLabel: '<foo>', description: 'Foo' }),
  bar: flag({ alias: 'b', description: 'Bar' }),
}));

type Foo = ParsedResult<typeof _result>;
