// Post-build compatibility pass for older webOS TVs.
// Tailwind v4 wraps everything in CSS cascade layers (@layer), which Chromium < 99
// (webOS 22 and older) ignores completely -> the app would render unstyled.
// @csstools/postcss-cascade-layers flattens the layers while preserving their priority.
import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import cascadeLayers from '@csstools/postcss-cascade-layers';

const dir = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..', 'dist', 'assets');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.css'));
if (!files.length) { console.error('postbuild-compat: no CSS found in', dir); process.exit(1); }
for (const f of files) {
  const p = path.join(dir, f);
  const src = fs.readFileSync(p, 'utf8');
  const out = await postcss([cascadeLayers()]).process(src, { from: p, to: p });
  if (/@layer\b/.test(out.css)) { console.error('postbuild-compat: @layer still present in', f); process.exit(1); }
  fs.writeFileSync(p, out.css);
  console.log(`postbuild-compat: flattened @layer in ${f} (${src.length} -> ${out.css.length} bytes)`);
}
