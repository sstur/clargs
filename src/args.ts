/* eslint-disable @typescript-eslint/no-explicit-any */
type ArgDefInput<A extends string> = {
  alias?: A;
  description: string;
};

type ArgDef<N extends string, A extends string> = {
  name: N;
  alias: A;
  description: string;
};

function defineSchema<
  O extends Record<string, (name: string) => ArgDef<string, string>>,
>(
  object: O,
): { [K in keyof O]: Expand<{ name: K } & Omit<ReturnType<O[K]>, 'name'>> } {
  return Object.fromEntries(
    Object.entries(object).map(
      ([name, getter]) => [name, getter(name)] as const,
    ),
  ) as any;
}

type WithDefaults<I extends ArgDefInput<string>> = I extends ArgDefInput<
  infer A
>
  ? {
      alias: string extends A ? '_' : A;
      // typeLabel: string;
      description: string;
      // type: ArgType extends T ? 'string' : T;
      // multiple: [M] extends [true] ? true : false;
    }
  : never;

function withDefaults<I extends ArgDefInput<string>>(
  input: I,
): WithDefaults<I> {
  const { alias, description } = input as unknown as ArgDefInput<string>;
  return {
    alias: alias ?? '_',
    // typeLabel: typeLabel ?? '',
    description,
    // type: type ?? 'string',
    // multiple: multiple ?? false,
  } as any;
}

function arg<A extends string, I extends ArgDefInput<A>>(input: I) {
  return <N extends string>(name: N): Expand<{ name: N } & WithDefaults<I>> =>
    ({ name, ...withDefaults(input) } as any);
}

const _result = defineSchema({
  foo: arg({ alias: 'f', description: 'Foo' }),
  bar: arg({ alias: 'b', description: 'Bar' }),
});
