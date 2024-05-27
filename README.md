# Command Line Arguments Parser

Fully-typed command line arguments parser.

```sh
npm install @sstur/clargs
```

## Demo

[Demo on StackBlitz](https://stackblitz.com/edit/node-x91snn?file=main.ts)

## Example

```js
import { defineSchema, createParser } from '@sstur/clargs';

const schema = defineSchema(({ arg, flag }) => ({
  help: flag({
    alias: 'h',
    description: 'Show help',
  }),
  // This is a boolean option, the flag is either present in the cli args or not
  verbose: flag({
    alias: 'v',
    description: 'Enable verbose output',
  }),
  // This is an option with a parameter
  message: arg({
    alias: 'm',
    optional: true,
    typeLabel: '<message>',
    description: 'The message you want to specify',
  }),
}));

const parsed = createParser(schema).parse(process.argv.slice(2));

console.log(parsed);
```

Output:

```
$ node my-app.js -v --message "Foo"
{ verbose: true, message: 'Foo' }
```

## Example with renderUsage()

```js
import { defineSchema, createParser, renderUsage } from '@sstur/clargs';

const schema = defineSchema(({ arg, flag }) => ({
  help: flag({
    alias: 'h',
    description: 'Show help',
  }),
  // ... other options
}));

const parsed = createParser(schema).parse(process.argv.slice(2));

if (parsed.help) {
  const header = 'Usage: node my-app.js [options...]';
  console.log(renderUsage(schema, { header }));
  process.exit(0);
}
```

Output:

```
$ node my-app.js -h
Usage: node my-app.js [options...]
 -h, --help          Show help
 -a, --add <item>    The item to add
 -v, --verbose       Enable verbose output
```
