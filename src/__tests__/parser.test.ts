import { defineSchema } from '../args';
import { createParser } from '../parser';

describe('defineArg', () => {
  const schema = defineSchema(({ arg, argList, flag }) => ({
    data: arg({
      alias: 'd',
      typeLabel: '<data>',
      optional: true,
      description: 'HTTP POST data',
    }),
    header: argList({
      alias: 'H',
      typeLabel: '<header/@file>',
      description: 'Pass custom header(s) to server',
    }),
    help: flag({
      alias: 'h',
      description: 'Get help for commands',
    }),
    include: flag({
      alias: 'i',
      description: 'Include protocol response headers in the output',
    }),
    'list-only': flag({
      alias: 'l',
      description: 'List only mode',
    }),
    output: arg({
      alias: 'o',
      typeLabel: '<file>',
      optional: true,
      description: 'Write to file instead of stdout',
    }),
  }));

  const schemaTwo = defineSchema(({ arg, flag }) => ({
    include: flag({
      alias: 'i',
      description: 'Include protocol response headers in the output',
    }),
    data: arg({
      alias: 'd',
      typeLabel: '<data>',
      description: 'HTTP POST data',
    }),
  }));

  it('should handle basic use case', () => {
    const parser = createParser(schema);
    const args = fromCommand(`curl -i http://foo`);
    const parsed = parser.parse(args);
    expect(parsed).toEqual({
      include: true,
      header: [],
      _rest: ['http://foo'],
    });
  });

  it('should accept long and short boolean args', () => {
    const parser = createParser(schema);
    const args = fromCommand(`curl --include -l`);
    const parsed = parser.parse(args);
    expect(parsed).toEqual({
      include: true,
      'list-only': true,
      header: [],
      _rest: [],
    });
  });

  it('should accept stacked shorthand args', () => {
    const parser = createParser(schema);
    const args = fromCommand(`curl -ih`);
    const parsed = parser.parse(args);
    expect(parsed).toEqual({
      include: true,
      help: true,
      header: [],
      _rest: [],
    });
  });

  it('should allow the final shorthand arg in a stack to have a value', () => {
    const parser = createParser(schema);
    const args = fromCommand(`curl -id "a=1" "http://foo"`);
    const parsed = parser.parse(args);
    expect(parsed).toEqual({
      include: true,
      data: 'a=1',
      header: [],
      _rest: ['http://foo'],
    });
  });

  it('should handle a mix of stacked shorthand and longhand', () => {
    const parser = createParser(schema);
    const args = fromCommand(`curl -il --header "x"`);
    const parsed = parser.parse(args);
    expect(parsed).toEqual({
      include: true,
      'list-only': true,
      header: ['x'],
      _rest: [],
    });
  });

  it('should throw on unrecognized flag', () => {
    const parser = createParser(schema);
    const args = fromCommand(`curl -i --foo bar`);
    expect(() => {
      parser.parse(args);
    }).toThrow('Unexpected option "--foo"');
  });

  it('should throw on missing required option', () => {
    const parser = createParser(schemaTwo);
    const args = fromCommand(`curl -i http://foo`);
    expect(() => {
      parser.parse(args);
    }).toThrow('Option "--data" expects a value but none was provided');
  });
});

/**
 * A hacky command parser to get args from an example command
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
