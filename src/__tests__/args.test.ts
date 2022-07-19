import { expectTypeOf } from 'expect-type';

import {
  createParser,
  defineSchema,
  defineArgForTesting as defineArg,
} from '../args';

describe('defineArg', () => {
  const schema = defineSchema((arg) => ({
    message: arg({
      alias: 'm',
      typeLabel: '<msg>',
      description: 'Use the given <msg> as the commit message',
    }),
    all: arg({
      alias: 'a',
      type: 'boolean',
      description: 'Automatically stage files',
    }),
    author: arg({
      typeLabel: '<author>',
      description: 'Override the commit author',
    }),
    branch: arg({
      type: 'boolean',
      description: 'Show the branch',
    }),
    file: arg({
      description: 'Take the commit message from the given file',
    }),
    interactive: arg({
      alias: 'i',
      type: 'boolean',
      description: 'Interactive',
    }),
  }));

  const parser = createParser(schema);

  it('should handle long and short boolean args', () => {
    expect(parser.parse(fromCommand(`git commit -a --branch`))).toEqual({
      all: true,
      branch: true,
      _rest: ['commit'],
    });
  });

  it('should handle long and short string args', () => {
    expect(
      parser.parse(fromCommand(`git commit -m "Hello World" --author 'Foo'`)),
    ).toEqual({
      message: 'Hello World',
      author: 'Foo',
      _rest: ['commit'],
    });
  });

  it('should handle stacked shorthand args', () => {
    expect(parser.parse(fromCommand(`foo -ai`))).toEqual({
      all: true,
      interactive: true,
    });
    expect(parser.parse(fromCommand(`git commit -aim "Hello world"`))).toEqual({
      all: true,
      interactive: true,
      message: 'Hello world',
      _rest: ['commit'],
    });
  });

  it('should typecheck individually', () => {
    const one = defineArg({
      description: 'Some great description',
    });
    expectTypeOf(one).toEqualTypeOf<{
      alias: '_';
      typeLabel: string;
      description: string;
      type: 'string';
      multiple: false;
    }>();

    const two = defineArg({
      alias: 'a',
      description: '',
    });
    expectTypeOf(two).toEqualTypeOf<{
      alias: 'a';
      typeLabel: string;
      description: string;
      type: 'string';
      multiple: false;
    }>();

    const three = defineArg({
      alias: 'b',
      description: '',
      typeLabel: '',
      type: 'boolean',
    });
    expectTypeOf(three).toEqualTypeOf<{
      alias: 'b';
      typeLabel: string;
      description: string;
      type: 'boolean';
      multiple: false;
    }>();
  });

  it('should typecheck in aggregate', () => {
    const schema = defineSchema((arg) => ({
      foo: arg({
        description: 'This is a foo',
      }),
      bar: arg({
        alias: 'X',
        typeLabel: '<command>',
        description: 'Some great description',
      }),
      baz: arg({
        alias: 'b',
        typeLabel: '<thing>',
        description: '',
        multiple: true,
      }),
    }));
    const parser = createParser(schema);
    const parsed = parser.parse([]);
    expectTypeOf(parsed).toEqualTypeOf<{
      foo?: string;
      bar?: string;
      X?: string;
      baz?: Array<string>;
      b?: Array<string>;
      _rest: Array<string>;
    }>();
  });
});

/**
 * A contrived helper to get args from an example command
 */
function fromCommand(command: string) {
  return command
    .replace(
      /("|')(.*?)\1/g,
      (_, q, arg) => '"' + encodeURIComponent(arg) + '"',
    )
    .split(' ')
    .slice(1)
    .map((arg) => arg.replace(/"(.*?)"/g, (_, arg) => decodeURIComponent(arg)));
}
