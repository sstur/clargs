/* eslint-disable @typescript-eslint/no-explicit-any */
import { expectTypeOf } from 'expect-type';

import { defineSchema, type ParsedResult } from '../args';

describe('defineArg', () => {
  it('should typecheck a schema with validation', () => {
    const schema = defineSchema(({ arg, argList, flag }) => ({
      foo: arg({
        alias: 'f',
        typeLabel: '<foo>',
        description: 'Foo',
        validator: (x) => Number(x),
      }),
      thing: argList({
        typeLabel: '<thing>',
        description: 'Add as many of these as you like',
        validator: (x) => x.length,
      }),
      bar: argList({ alias: 'b', typeLabel: '<bar>', description: 'Bar' }),
      baz: flag({ alias: 'z', description: 'Baz' }),
      qux: arg({
        alias: 'q',
        typeLabel: '<qux>',
        description: 'Qux',
        optional: true,
      }),
    }));

    const parsed: ParsedResult<typeof schema> = null as any;
    expectTypeOf(parsed).toEqualTypeOf<{
      foo: number;
      thing: Array<number>;
      bar: Array<string>;
      baz?: boolean | undefined;
      qux?: string | undefined;
      _rest: Array<string>;
    }>();
  });

  it('should typecheck a realistic schema', () => {
    const schema = defineSchema(({ arg, flag }) => ({
      message: arg({
        alias: 'm',
        typeLabel: '<msg>',
        description: 'Use the given <msg> as the commit message',
      }),
      all: flag({
        alias: 'a',
        description: 'Automatically stage files',
      }),
      author: arg({
        typeLabel: '<author>',
        description: 'Override the commit author',
      }),
      branch: flag({
        description: 'Show the branch',
      }),
      file: arg({
        typeLabel: '<file>',
        description: 'Take the commit message from the given file',
      }),
      interactive: flag({
        alias: 'i',
        description: 'Interactive',
      }),
    }));

    const parsed: ParsedResult<typeof schema> = null as any;
    expectTypeOf(parsed).toEqualTypeOf<{
      message: string;
      author: string;
      file: string;
      all?: boolean;
      branch?: boolean;
      interactive?: boolean;
      _rest: Array<string>;
    }>();
  });
});
