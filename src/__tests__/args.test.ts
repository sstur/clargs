/* eslint-disable @typescript-eslint/no-explicit-any */
import { expectTypeOf } from 'expect-type';

import { defineArg, ExtractTypes } from '../args';

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
    const args = {
      foo: defineArg({
        description: 'This is a foo',
      }),
      bar: defineArg({
        alias: 'X',
        typeLabel: '<command>',
        description: 'Some great description',
      }),
    };

    const parsed: ExtractTypes<typeof args> = {} as any;

    expectTypeOf(parsed).toEqualTypeOf<{
      foo?: string;
      bar?: string;
      X?: string;
    }>();
  });
});
