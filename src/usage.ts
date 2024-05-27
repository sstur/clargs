import type { Schema } from './args';

export type RenderOptions = {
  header: string;
  sort?: boolean;
};

export function renderUsage<O extends Schema>(
  schema: O,
  options: RenderOptions,
): string {
  const { header } = options;
  const lines: Array<string> = [];
  lines.push(header);
  const items = Object.entries(schema);
  if (options.sort !== false) {
    items.sort(([a], [b]) => a.localeCompare(b));
  }
  for (const [name, definition] of items) {
    const { alias } = definition;
    // At this point `names` can be any combination of 1 or 2 short/long names
    const names = alias ? [name, alias] : [name];
    // Despite that, this next logic grabs the first short name, if exists, and
    // the first long name, if exists.
    const shortName = names.find((n) => n.length === 1);
    const longName = names.find((n) => n.length > 1);
    let line = shortName ? ` -${shortName}` : `   `;
    if (longName) {
      line += (shortName ? ', ' : '  ') + `--${longName}`;
    }
    if (definition.type !== 'flag') {
      line += ` ${definition.typeLabel}`;
    }
    lines.push(line.padEnd(19, ' ') + '  ' + definition.description);
  }
  return lines.join('\n') + '\n';
}
