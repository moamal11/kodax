/**
 * عرض محتوى الدرس (Markdown مبسّط) — بديل للمحلل السطري القديم الذي كان يعرض
 * كتل الكود و **الخط العريض** والجداول كنص خام.
 *
 * يدعم: # ## ### ####، القوائم (- * 1.)، القوائم الفرعية، كتل الكود ```lang،
 * `كود داخل السطر`، **عريض**، الجداول | a | b |، والملاحظات > (callout).
 * العرض بنظام التصميم: خط قراءة مريح، كود LTR بخط mono، وعزل الكود داخل السطر.
 */
import React, { useMemo } from 'react';
import { View, ScrollView, Text as RNText } from 'react-native';
import { Text, Row, CodeView, useTheme, type TextVariant, type Tone } from '@/design';

type Block =
  | { type: 'h'; level: 1 | 2 | 3 | 4; text: string }
  | { type: 'p'; text: string }
  | { type: 'li'; text: string; marker: string; depth: number }
  | { type: 'code'; code: string; lang?: string }
  | { type: 'table'; header: string[]; rows: string[][] }
  | { type: 'quote'; text: string }
  | { type: 'space' };

const splitRow = (line: string) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());

export function parseLessonContent(content: string): Block[] {
  const lines = content.replace(/\r\n?/g, '\n').trim().split('\n');
  const blocks: Block[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fence = line.match(/^\s*```\s*([\w+#.-]*)\s*$/);
    if (fence) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) code.push(lines[i++]);
      blocks.push({ type: 'code', code: code.join('\n'), lang: fence[1] || undefined });
      continue;
    }
    // جدول: سطر |..| يليه سطر فاصل |---|
    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const header = splitRow(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) rows.push(splitRow(lines[i++]));
      i--;
      blocks.push({ type: 'table', header, rows });
      continue;
    }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      blocks.push({ type: 'h', level: h[1].length as 1 | 2 | 3 | 4, text: h[2] });
      continue;
    }
    const li = line.match(/^(\s*)([-*•]|\d+\.)\s+(.*)$/);
    if (li) {
      blocks.push({ type: 'li', text: li[3], marker: li[2], depth: li[1].length >= 2 ? 1 : 0 });
      continue;
    }
    const q = line.match(/^>\s?(.*)$/);
    if (q) {
      const prev = blocks[blocks.length - 1];
      if (prev && prev.type === 'quote') prev.text += `\n${q[1]}`;
      else blocks.push({ type: 'quote', text: q[1] });
      continue;
    }
    if (line.trim() === '') {
      if (blocks.length && blocks[blocks.length - 1].type !== 'space') blocks.push({ type: 'space' });
      continue;
    }
    blocks.push({ type: 'p', text: line });
  }
  return blocks;
}

/** نص مع **عريض** و `كود` داخل السطر (الكود معزول LTR حتى لا تنقلب أقواسه داخل الجملة العربية) */
function Inline({ text, variant = 'body', tone = 'secondary', weight, style }: { text: string; variant?: TextVariant; tone?: Tone; weight?: 'regular' | 'medium' | 'semibold' | 'bold'; style?: any }) {
  const t = useTheme();
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return (
    <Text variant={variant} tone={tone} weight={weight} style={style}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <RNText key={i} style={{ fontFamily: t.font.semibold, color: t.colors.text }}>
              {part.slice(2, -2)}
            </RNText>
          );
        }
        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
          return (
            <RNText key={i} style={{ fontFamily: t.font.mono, fontSize: 14, color: t.colors.brandText, backgroundColor: t.colors.brandSoft }}>
              {`⁦${part.slice(1, -1)}⁩`}
            </RNText>
          );
        }
        return <RNText key={i}>{part}</RNText>;
      })}
    </Text>
  );
}

export function LessonContent({ content, defaultLanguage, title }: { content: string; defaultLanguage?: string; /** عنوان الدرس المعروض فوق المحتوى: لا نكرره إن بدأ المحتوى به */ title?: string }) {
  const t = useTheme();
  const blocks = useMemo(() => {
    const all = parseLessonContent(content || '');
    const first = all.findIndex((b) => b.type !== 'space');
    if (title && first >= 0 && all[first].type === 'h' && (all[first] as any).text.trim() === title.trim()) all.splice(first, 1);
    return all;
  }, [content, title]);
  return (
    <View style={{ gap: 2 }}>
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'h': {
            const v: TextVariant = b.level === 1 ? 'title' : b.level === 2 ? 'heading' : 'body';
            return <Inline key={i} text={b.text} variant={v} tone="default" weight={b.level >= 3 ? 'semibold' : 'bold'} style={{ marginTop: b.level <= 2 ? 18 : 12, marginBottom: 6 }} />;
          }
          case 'li': {
            const numbered = /\d/.test(b.marker);
            return (
              <Row key={i} gap={10} align="flex-start" style={{ paddingRight: b.depth ? 24 : 4, marginBottom: 6 }}>
                <Text variant="body" tone="brand" weight="semibold" ltr={numbered} style={{ minWidth: numbered ? 22 : 12 }} align="right">
                  {numbered ? b.marker : '•'}
                </Text>
                <View style={{ flex: 1 }}>
                  <Inline text={b.text} />
                </View>
              </Row>
            );
          }
          case 'code':
            return <CodeView key={i} code={b.code} language={(b.lang || defaultLanguage || 'javascript').toLowerCase()} style={{ marginVertical: 10 }} />;
          case 'table':
            return (
              <ScrollView key={i} horizontal style={{ marginVertical: 10 }} contentContainerStyle={{ flexGrow: 1 }}>
                <View style={{ borderWidth: 1, borderColor: t.colors.border, borderRadius: t.radius.md, overflow: 'hidden', minWidth: '100%' }}>
                  <Row style={{ backgroundColor: t.colors.surfaceRaised }}>
                    {b.header.map((c, j) => (
                      <View key={j} style={{ flex: 1, minWidth: 110, padding: 10 }}>
                        <Inline text={c} variant="bodySm" tone="default" weight="semibold" />
                      </View>
                    ))}
                  </Row>
                  {b.rows.map((r, j) => (
                    <Row key={j} style={{ borderTopWidth: 1, borderTopColor: t.colors.border }}>
                      {b.header.map((_, k) => (
                        <View key={k} style={{ flex: 1, minWidth: 110, padding: 10 }}>
                          <Inline text={r[k] ?? ''} variant="bodySm" />
                        </View>
                      ))}
                    </Row>
                  ))}
                </View>
              </ScrollView>
            );
          case 'quote':
            return (
              <View key={i} style={{ borderRightWidth: 3, borderRightColor: t.colors.warning, backgroundColor: t.colors.warningSoft, padding: 12, borderRadius: t.radius.sm, marginVertical: 8 }}>
                <Inline text={b.text} tone="default" variant="bodySm" />
              </View>
            );
          case 'space':
            return <View key={i} style={{ height: 10 }} />;
          default:
            return <Inline key={i} text={b.text} style={{ marginBottom: 4 }} />;
        }
      })}
    </View>
  );
}

export default LessonContent;
