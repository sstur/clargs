type ArgDef = {
  type: 'arg';
  alias?: string;
  typeLabel: string;
  description: string;
};

type ArgDefInput = Omit<ArgDef, 'type'>;

type ArgListDef = {
  type: 'argList';
  alias?: string;
  typeLabel: string;
  description: string;
};

type ArgListDefInput = Omit<ArgListDef, 'type'>;

type FlagDef = {
  type: 'flag';
  alias?: string;
  description: string;
};

type FlagDefInput = Omit<FlagDef, 'type'>;

type OptionDef = ArgDef | ArgListDef | FlagDef;

type Definers = {
  arg: ArgDefiner;
  argList: ArgListDefiner;
  flag: FlagDefiner;
};

function defineSchema<O extends Record<string, OptionDef>>(
  getSchema: (definers: Definers) => O,
) {
  return getSchema({ arg, argList, flag });
}

function arg(input: ArgDefInput): ArgDef {
  return { type: 'arg', ...input };
}

type ArgDefiner = typeof arg;

function argList(input: ArgListDefInput): ArgListDef {
  return { type: 'argList', ...input };
}

type ArgListDefiner = typeof argList;

function flag(input: Expand<FlagDefInput>): FlagDef {
  return { type: 'flag', ...input };
}

type FlagDefiner = typeof flag;

// ==========

type ExtractType<D extends OptionDef> = D['type'] extends 'flag'
  ? boolean
  : D['type'] extends 'arg'
  ? string
  : D['type'] extends 'argList'
  ? Array<string>
  : never;

type ParsedResult<O extends Record<string, OptionDef>> = {
  [K in keyof O]: ExtractType<O[K]>;
};

// ==========

const _result = defineSchema(({ arg, flag }) => ({
  foo: arg({ alias: 'f', typeLabel: '<foo>', description: 'Foo' }),
  bar: argList({ alias: 'b', typeLabel: '<bar>', description: 'Bar' }),
  baz: flag({ alias: 'z', description: 'Baz' }),
}));

type Foo = ParsedResult<typeof _result>;
