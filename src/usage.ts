import type { Schema } from './args';

export type RenderOptions = {
  header: string;
};

export function renderUsage<O extends Schema>(
  schema: O,
  options: RenderOptions,
): string {
  const { header } = options;
  const lines: Array<string> = [];
  lines.push(header);
  const items = Object.entries(schema).sort(([a], [b]) => a.localeCompare(b));
  for (const [name, definition] of items) {
    const alias = definition.alias?.slice(0, 1);
    const prefix = alias ? ` -${alias}, ` : `     `;
    const optionName =
      definition.type === 'flag'
        ? `--${name}`
        : `--${name} ${definition.typeLabel}`;
    lines.push(
      prefix + optionName.padEnd(14, ' ') + '  ' + definition.description,
    );
  }
  return lines.join('\n') + '\n';
}
