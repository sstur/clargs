import { expectTypeOf } from 'expect-type';

import { createParser, defineArg, defineSchema } from '../args';

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
      lazyMultiple: boolean;
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
      lazyMultiple: boolean;
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
      lazyMultiple: boolean;
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
    }));

    const parser = createParser(schema);

    const parsed = parser.parse([]);

    expectTypeOf(parsed).toEqualTypeOf<{
      foo?: string;
      bar?: string;
      X?: string;
      _unknown: Array<string>;
    }>();
  });
});
