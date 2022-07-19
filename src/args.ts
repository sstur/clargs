/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
type ArgType = 'boolean' | 'string';

type ArgDefInput<A extends string, T extends ArgType, M extends boolean> = {
  alias?: A;
  typeLabel?: string;
  description: string;
  type?: T;
  multiple?: M;
};

type ArgDef<A extends string, T extends ArgType, M extends boolean> = Expand<
  Required<ArgDefInput<A, T, M>>
>;

type RenderOptions = {
  header: string;
};

type Parser<O extends Record<string, ArgDef<string, ArgType, boolean>>> = {
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

type ExtractAlias<D> = D extends ArgDef<infer A, infer _T, infer _M>
  ? A
  : never;

type ExtractType<D> = D extends ArgDef<infer _A, infer T, infer M>
  ? [M] extends [true]
    ? Array<ToType<T>>
    : ToType<T>
  : never;

type AggregateTypes<
  O extends Record<string, ArgDef<string, ArgType, boolean>>,
> = {
  [K in keyof O]: ExtractType<O[K]>;
};

type AggregateAliasTypes<
  O extends Record<string, ArgDef<string, ArgType, boolean>>,
> = Omit<
  {
    [K in keyof O as ExtractAlias<O[K]>]: ExtractType<O[K]>;
  },
  '_'
>;

type ExtractTypes<O extends Record<string, ArgDef<string, ArgType, boolean>>> =
  Expand<
    Partial<AggregateTypes<O> & AggregateAliasTypes<O>> & {
      _unknown: Array<string>;
    }
  >;

function expand<T>(input: T): T extends ArgDefInput<infer A, infer T, infer M>
  ? {
      alias: string extends A ? '_' : A;
      typeLabel: string;
      description: string;
      type: ArgType extends T ? 'string' : T;
      multiple: [M] extends [true] ? true : false;
    }
  : never {
  const { alias, typeLabel, description, type, multiple } =
    input as unknown as ArgDefInput<string, ArgType, boolean>;
  return {
    alias: alias ?? '_',
    typeLabel: typeLabel ?? '',
    description,
    type: type ?? 'string',
    multiple: multiple ?? false,
  } as any;
}

function defineArg<
  A extends string,
  T extends ArgType,
  M extends boolean,
  I extends ArgDefInput<A, T, M>,
>(input: I) {
  return expand(input);
}

export function createParser<
  O extends Record<string, ArgDef<string, ArgType, boolean>>,
>(schema: O) {
  const parser: Parser<O> = {
    parse(args) {
      const unknown: Array<string> = [];
      const parsed: Record<string, unknown> = { _unknown: unknown };
      let i = 0;
      const addValue = (name: string, value: unknown) => {
        if (schema[name]?.multiple) {
          const existingValue = parsed[name];
          if (Array.isArray(existingValue)) {
            existingValue.push(value);
          } else {
            parsed[name] = [value];
          }
        } else {
          parsed[name] = value;
        }
      };
      const processArg = (
        prefix: string,
        name: string,
        canHaveValue: boolean,
      ) => {
        const argDef = schema[name];
        if (!argDef) {
          unknown.push(prefix + name);
          return;
        }
        if (argDef.type === 'boolean') {
          addValue(name, true);
          return;
        }
        if (!canHaveValue) {
          // TODO: Revisit this error
          throw new Error(
            `Option "${name}" must have value of type "${argDef.type}" but none provided.`,
          );
        }
        addValue(name, args[++i] ?? '');
      };
      while (true) {
        const arg = args[++i];
        if (arg === undefined) {
          break;
        }
        if (arg.startsWith('--')) {
          const name = arg.slice(2);
          processArg('--', name, true);
        } else if (arg.startsWith('-')) {
          const chars = arg.slice(1);
          const lastIndex = chars.length - 1;
          for (let j = 0; j < chars.length; j++) {
            const canHaveValue = j === lastIndex;
            processArg('-', chars[j]!, canHaveValue);
          }
        } else {
          unknown.push(arg);
        }
      }
      return parsed as any;
    },
    renderUsage(options) {
      // TODO
      return options.header + '\n';
    },
  };
  return parser;
}

export function defineSchema<
  O extends Record<string, ArgDef<string, ArgType, boolean>>,
>(definer: (arg: typeof defineArg) => O) {
  return definer(defineArg);
}

export { defineArg as defineArgForTesting };
