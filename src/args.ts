/* eslint-disable @typescript-eslint/no-explicit-any */
type ArgDef<M extends boolean> = {
  type: 'arg';
  alias?: string;
  typeLabel: string;
  description: string;
  multiple: M;
};

type ArgDefInput<M extends boolean> = Expand<
  Omit<ArgDef<M>, 'type' | 'multiple'> & { multiple?: M }
>;

type FlagDef = {
  type: 'flag';
  alias?: string;
  description: string;
};

type FlagDefInput = Omit<FlagDef, 'type'>;

type OptionDef<M extends boolean> = ArgDef<M> | FlagDef;

type Definers = {
  arg: ArgDefiner;
  flag: FlagDefiner;
};

function defineSchema<O extends Record<string, OptionDef<boolean>>>(
  getSchema: (definers: Definers) => O,
) {
  return getSchema({ arg, flag });
}

function arg<M extends boolean>(
  input: ArgDefInput<M>,
): [M] extends [true] ? ArgDef<true> : ArgDef<false> {
  const { multiple, ...rest } = input;
  const result = multiple
    ? { type: 'arg', multiple: true, ...rest }
    : { type: 'arg', multiple: false, ...rest };
  return result as any;
}

type ArgDefiner = typeof arg;

function flag(input: Expand<FlagDefInput>): FlagDef {
  return { type: 'flag', ...input };
}

type FlagDefiner = typeof flag;

const _result = defineSchema(({ arg, flag }) => ({
  foo: arg({ alias: 'f', typeLabel: '<foo>', description: 'Foo' }),
  bar: flag({ alias: 'b', description: 'Bar' }),
}));
