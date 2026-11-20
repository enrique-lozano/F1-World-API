import * as fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import ts from 'typescript';

/**
 * tsoa writes the enums of `src/models/enums/*.enums.ts` to `src/swagger.json` but it ignores the JSDoc of their members.
 * This adds it as `x-enum-descriptions` (one description per value, in the order of `enum`), so it reaches the
 * generated types of the frontend (`npm run api:types`). Run it after `tsoa spec-and-routes` (`npm run swagger`)
 */
const enumsDir = path.resolve('src/models/enums');
const specPath = path.resolve('src/swagger.json');

const sources = fs
  .readdirSync(enumsDir)
  .filter((file) => file.endsWith('.enums.ts'))
  .map((file) => {
    const filePath = path.join(enumsDir, file);
    return ts.createSourceFile(
      filePath,
      fs.readFileSync(filePath, 'utf8'),
      ts.ScriptTarget.Latest,
      true
    );
  });

/** Enum name -> value -> description */
const docs = new Map<string, Map<string, string>>();

for (const node of sources.flatMap((source) => [...source.statements])) {
  if (!ts.isEnumDeclaration(node)) continue;

  const members = new Map<string, string>();
  for (const member of node.members) {
    if (!member.initializer || !ts.isStringLiteralLike(member.initializer))
      continue;

    const description = ts
      .getJSDocCommentsAndTags(member)
      .filter(ts.isJSDoc)
      .map((doc) => ts.getTextOfJSDocComment(doc.comment))
      .join(' ')
      .trim();

    members.set(member.initializer.text, description);
  }
  docs.set(node.name.text, members);
}

const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const schemas = spec.components.schemas as Record<
  string,
  { enum?: string[]; [key: string]: unknown }
>;

let count = 0;
for (const [name, members] of docs) {
  const schema = schemas[name];
  if (!schema?.enum) continue;

  const missing = schema.enum.filter((value) => !members.get(value));
  if (missing.length > 0)
    throw new Error(
      `The values ${missing.join(', ')} of the enum ${name} need a JSDoc comment`
    );

  schema['x-enum-descriptions'] = schema.enum.map((v) => members.get(v)!);
  count++;
}

fs.writeFileSync(specPath, JSON.stringify(spec, null, '\t') + '\n');
console.log(
  pc.green('[OK]: ') + `Descriptions of ${count} enum(s) added to the spec`
);
