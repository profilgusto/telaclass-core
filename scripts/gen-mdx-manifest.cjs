// scripts/gen-mdx-manifest.cjs
const fg = require('fast-glob');
const { writeFileSync } = require('node:fs');
const { resolve, sep } = require('node:path');

const ROOT = resolve(process.cwd(), 'content/disciplinas');

(async () => {
  // Collect only canonical module content files
  const files = await fg(['**/content.mdx', '!**/_bak/**'], { cwd: ROOT });

  const entries = files.map((rel) => {
    const key = '/' + rel.split(sep).join('/');
    const importPath = `@/content/disciplinas${key}`;
    return `  '${key}': () => import('${importPath}') as Promise<{ default: React.ComponentType<any> }>`;
  });

  const out = `/* AUTO-GENERATED. DO NOT EDIT.
   * Run: npm run gen:mdx-manifest
   */
export const MDX_MANIFEST = {
${entries.join(',\n')}
} as const;

export type MdxKey = keyof typeof MDX_MANIFEST;
`;

  writeFileSync('content/mdx-manifest.ts', out, 'utf8');
  console.log(`Wrote content/mdx-manifest.ts with \${files.length} entries`);
})();