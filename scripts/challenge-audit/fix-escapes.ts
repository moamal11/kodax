/**
 * يصلح الـbackslash الضائعة داخل template literals في ملفات المحتوى
 * (يضاعفها حتى تظهر في الكود كما كتبها المؤلف). شغّله مرة واحدة ثم
 * تحقّق بـ scan-escapes.ts --strict (يجب أن يكون الناتج 0).
 */
import * as ts from 'typescript';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(__dirname, '../../src/constants');
const BACKSLASH = String.fromCharCode(92);
const LF = String.fromCharCode(10);
const CR = String.fromCharCode(13);

for (const f of readdirSync(dir).filter((x) => x.endsWith('.ts'))) {
  const path = join(dir, f);
  const src = readFileSync(path, 'utf8');
  const sf = ts.createSourceFile(f, src, ts.ScriptTarget.Latest, true);
  const positions: number[] = [];
  const visit = (n: ts.Node) => {
    if (
      ts.isNoSubstitutionTemplateLiteral(n) ||
      ts.isTemplateHead(n) ||
      ts.isTemplateMiddle(n) ||
      ts.isTemplateTail(n)
    ) {
      const start = n.getStart(sf);
      const raw = n.getText(sf);
      for (let i = 1; i < raw.length - 1; i++) {
        if (raw[i] !== BACKSLASH) continue;
        const nx = raw[i + 1];
        if (nx === BACKSLASH) {
          i++;
          continue;
        }
        if (nx !== '`' && nx !== '$' && nx !== LF && nx !== CR) positions.push(start + i);
        i++;
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  if (!positions.length) continue;
  let out = src;
  for (const p of positions.sort((a, b) => b - a)) {
    out = out.slice(0, p) + BACKSLASH + out.slice(p);
  }
  writeFileSync(path, out, 'utf8');
  console.log(`${f}: fixed ${positions.length}`);
}
