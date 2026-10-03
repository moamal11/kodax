/**
 * يكشف الـbackslash الضائعة داخل template literals في ملفات المحتوى:
 * `\s` داخل backticks تصبح "s" وقت التشغيل، و `\b` تصبح حرف backspace.
 *
 *   npx tsx scripts/challenge-audit/scan-escapes.ts            # هروب غير صالح (ضائع حتماً)
 *   npx tsx scripts/challenge-audit/scan-escapes.ts --strict   # أي backslash مفردة داخل الكود
 *   ... --all  لعرض كل المواضع
 */
import * as ts from 'typescript';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(__dirname, '../../src/constants');
const BACKSLASH = String.fromCharCode(92);
const LF = String.fromCharCode(10);
const CR = String.fromCharCode(13);
// مسموح في template literal: \\ \` \$ \n \t \r \' \" \u \x \0 وسطر جديد
const VALID = new Set([BACKSLASH, '`', '$', 'n', 't', 'r', "'", '"', 'u', 'x', '0', LF, CR]);
const strict = process.argv.includes('--strict');
const showAll = process.argv.includes('--all');

let total = 0;
const perFile: Record<string, number> = {};
const perKind: Record<string, number> = {};
const samples: string[] = [];

for (const f of readdirSync(dir).filter((x) => x.endsWith('.ts'))) {
  const src = readFileSync(join(dir, f), 'utf8');
  const sf = ts.createSourceFile(f, src, ts.ScriptTarget.Latest, true);
  const visit = (n: ts.Node) => {
    if (
      ts.isNoSubstitutionTemplateLiteral(n) ||
      ts.isTemplateHead(n) ||
      ts.isTemplateMiddle(n) ||
      ts.isTemplateTail(n)
    ) {
      const raw = n.getText(sf);
      for (let i = 1; i < raw.length - 1; i++) {
        if (raw[i] !== BACKSLASH) continue;
        const nx = raw[i + 1];
        if (nx === BACKSLASH) {
          i++;
          continue;
        }
        const suspicious = strict
          ? nx !== '`' && nx !== '$' && nx !== LF && nx !== CR
          : !VALID.has(nx) || nx === 'b';
        if (suspicious) {
          total++;
          perFile[f] = (perFile[f] || 0) + 1;
          perKind[nx] = (perKind[nx] || 0) + 1;
          if (showAll || samples.length < 30) {
            const line = sf.getLineAndCharacterOfPosition(n.getStart(sf) + i).line + 1;
            samples.push(
              `${f}:${line}  …${raw.slice(Math.max(0, i - 25), i + 12).split(LF).join('⏎')}…`
            );
          }
        }
        i++;
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
}
console.log(strict ? 'suspicious escapes (strict):' : 'lost escapes:', total);
console.log('by file:', perFile);
console.log('by char after backslash:', perKind);
console.log(samples.join(LF));
