import { defineSchema } from '../args';
import { createParser } from '../parser';

const expectedOutput = `
Usage: curl [options...] <url>
 -d, --data <data>   HTTP POST data
 -H, --header <header/@file>  Pass custom header(s) to server
 -h, --help          Get help for commands
 -i, --include       Include protocol response headers in the output
     --list-only     List only mode
 -o, --output <file>  Write to file instead of stdout
 -p                  Operate through an HTTP proxy tunnel (using CONNECT)
 -r <range>          Retrieve only the bytes within RANGE
 -v, --verbose       Make the operation more talkative
`.trimStart();

describe('usage', () => {
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
      description: 'List only mode',
    }),
    // Short flag without alias
    p: flag({
      description: 'Operate through an HTTP proxy tunnel (using CONNECT)',
    }),
    // Short arg without alias
    r: arg({
      typeLabel: '<range>',
      optional: true,
      description: 'Retrieve only the bytes within RANGE',
    }),
    output: arg({
      alias: 'o',
      typeLabel: '<file>',
      optional: true,
      description: 'Write to file instead of stdout',
    }),
    // Short one as primary, long one as alias
    v: flag({
      alias: 'verbose',
      description: 'Make the operation more talkative',
    }),
  }));

  it('should render usage', () => {
    const parser = createParser(schema);
    const header = `Usage: curl [options...] <url>`;
    const usage = parser.renderUsage({ header });
    expect(usage).toEqual(expectedOutput);
  });
});
