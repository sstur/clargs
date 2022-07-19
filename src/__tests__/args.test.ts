import { expectTypeOf } from 'expect-type';

import {
  createParser,
  defineSchema,
  defineArgForTesting as defineArg,
} from '../args';

describe('defineArg', () => {
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

  it('should aggregate the right types', () => {
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
      _unknown: Array<string>;
    }>();
  });
});
