import { readdir, readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import assert from 'node:assert/strict';
async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else files.push(path);
  }
  return files;
}
const files = await walk('dist');
const htmlFiles = files.filter((file) => extname(file) === '.html');
assert.equal(htmlFiles.length, 24, 'Expected all 24 public HTML routes');
assert.ok(!files.some((file) => /__(qa|axe)/.test(file)), 'Review tools must not be deployed');
let links = 0;
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  assert.match(html, /<div id="root">[\s\S]*<h1/, `${file} must contain prerendered content`);
  assert.equal(
    (html.match(/<h1[\s>]/g) ?? []).length,
    1,
    `${file} must have exactly one primary heading`,
  );
  for (const match of html.matchAll(/(?:src|href)="([^"#?]+)(?:[?#][^"]*)?"/g)) {
    const target = match[1];
    if (!target.startsWith('/')) continue;
    const path = target === '/' ? 'dist/index.html' : `dist${target}`;
    let found = false;
    for (const candidate of [path, `${path}.html`, `${path}/index.html`]) {
      try {
        if ((await stat(candidate)).isFile()) {
          found = true;
          break;
        }
      } catch {
        /* Try the canonical HTML form. */
      }
    }
    assert.ok(found, `Unresolved local resource ${target} in ${file}`);
    links++;
  }
}
console.log(
  `Verified ${htmlFiles.length} prerendered pages and ${links} local resource references.`,
);
