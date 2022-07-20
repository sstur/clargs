/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { ParsedResult, Schema } from './args';

type RenderOptions = {
  header: string;
};

export function createParser<O extends Schema>(schema: O) {
  const shortToLong = new Map<string, string>();
  for (const [name, definition] of Object.entries(schema)) {
    const { alias } = definition;
    if (alias !== undefined) {
      shortToLong.set(alias, name);
    }
  }
  return {
    parse(args: Array<string>): ParsedResult<O> {
      const rest: Array<string> = [];
      const parsed: Record<string, unknown> = {};
      let i = 0;
      const addValue = (name: string, value: unknown) => {
        if (schema[name]?.type === 'argList') {
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
        key: string,
        canHaveValue: boolean,
      ) => {
        const name = shortToLong.get(key) ?? key;
        const definition = schema[name];
        if (!definition) {
          // TODO: Revisit this error
          throw new Error(`Unexpected option "${prefix + key}"`);
          return;
        }
        if (definition.type === 'flag') {
          addValue(name, true);
          return;
        }
        if (!canHaveValue) {
          // TODO: Revisit this error
          throw new Error(
            `Option "${prefix + key}" expects a value but none was provided`,
          );
        }
        const { validator } = definition;
        const value = args[i++];
        if (value !== undefined) {
          addValue(name, validator ? validator(value) : value);
        }
      };
      while (true) {
        const arg = args[i++];
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
          rest.push(arg);
        }
      }
      const result: Record<string, unknown> = {};
      for (const [name, definition] of Object.entries(schema)) {
        const value = parsed[name];
        switch (definition.type) {
          case 'arg': {
            if (value === undefined) {
              // TODO: Revisit this error
              throw new Error(
                `Option "--${name}" expects a value but none was provided`,
              );
            }
            result[name] = value;
            break;
          }
          case 'argList': {
            result[name] = value ?? [];
            break;
          }
          case 'argOptional': {
            if (value !== undefined) {
              result[name] = value;
            }
            break;
          }
          case 'flag': {
            if (value === true) {
              result[name] = value;
            }
            break;
          }
        }
      }
      result._rest = rest;
      return result as ParsedResult<O>;
    },
    renderUsage(options: RenderOptions): string {
      // TODO
      return options.header + '\n';
    },
  };
}
