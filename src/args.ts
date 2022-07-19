/* eslint-disable @typescript-eslint/no-explicit-any */
type ArgType = 'boolean' | 'string';

type ArgDefInput<A extends string, T extends ArgType, M extends boolean> = {
  alias?: A;
  typeLabel?: string;
  description: string;
  type?: T;
  multiple?: M;
};

type ArgDef<
  N extends string,
  A extends string,
  T extends ArgType,
  M extends boolean,
> = {
  name: N;
  alias: A;
  typeLabel: string;
  description: string;
  type: T;
  multiple: M;
};

function defineSchema<
  O extends Record<
    string,
    (name: string) => ArgDef<string, string, ArgType, boolean>
  >,
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

type WithDefaults<I extends ArgDefInput<string, ArgType, boolean>> =
  I extends ArgDefInput<infer A, infer T, infer M>
    ? {
        alias: string extends A ? '_' : A;
        typeLabel: string;
        description: string;
        type: ArgType extends T ? 'string' : T;
        multiple: [M] extends [true] ? true : false;
      }
    : never;

function withDefaults<I extends ArgDefInput<string, ArgType, boolean>>(
  input: I,
): WithDefaults<I> {
  const { alias, typeLabel, description, type, multiple } = input;
  return {
    alias: alias ?? '_',
    typeLabel: typeLabel ?? '',
    description,
    type: type ?? 'string',
    multiple: multiple ?? false,
  } as any;
}

function arg<
  A extends string,
  T extends ArgType,
  M extends boolean,
  I extends ArgDefInput<A, T, M>,
>(input: I) {
  return <N extends string>(name: N): Expand<{ name: N } & WithDefaults<I>> =>
    ({ name, ...withDefaults(input) } as any);
}

type ArgDefiner = typeof arg;

const _result = defineSchema((arg) => ({
  foo: arg({ alias: 'f', description: 'Foo' }),
  bar: arg({ alias: 'b', description: 'Bar' }),
}));
