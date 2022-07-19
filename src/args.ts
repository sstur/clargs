/* eslint-disable @typescript-eslint/no-explicit-any */
type ArgType = 'flag' | 'arg';

type ArgDefInput<T extends ArgType, M extends boolean> = {
  alias?: string;
  typeLabel?: string;
  description: string;
  type?: T;
  multiple?: M;
};

type ArgDef<N extends string, T extends ArgType, M extends boolean> = {
  name: N;
  alias: string;
  typeLabel: string;
  description: string;
  type: T;
  multiple: M;
};

function defineSchema<
  O extends Record<string, (name: string) => ArgDef<string, ArgType, boolean>>,
>(
  definer: (arg: ArgDefiner) => O,
): { [K in keyof O]: Expand<{ name: K } & Omit<ReturnType<O[K]>, 'name'>> } {
  const object = definer(arg);
  return Object.fromEntries(
    Object.entries(object).map(
      ([name, getter]) => [name, getter(name)] as const,
    ),
  ) as any;
}

type WithDefaults<I extends ArgDefInput<ArgType, boolean>> =
  I extends ArgDefInput<infer T, infer M>
    ? {
        alias: string;
        typeLabel: string;
        description: string;
        type: ArgType extends T ? 'arg' : T;
        multiple: [M] extends [true] ? true : false;
      }
    : never;

function withDefaults<I extends ArgDefInput<ArgType, boolean>>(
  input: I,
): WithDefaults<I> {
  const { alias, typeLabel, description, type, multiple } = input;
  return {
    alias: alias ?? '_',
    typeLabel: typeLabel ?? '',
    description,
    type: type ?? 'arg',
    multiple: multiple ?? false,
  } as any;
}

function arg<T extends ArgType, M extends boolean, I extends ArgDefInput<T, M>>(
  input: I,
) {
  return <N extends string>(name: N): Expand<{ name: N } & WithDefaults<I>> =>
    ({ name, ...withDefaults(input) } as any);
}

type ArgDefiner = typeof arg;

const _result = defineSchema((arg) => ({
  foo: arg({ alias: 'f', description: 'Foo' }),
  bar: arg({ alias: 'b', description: 'Bar' }),
}));
