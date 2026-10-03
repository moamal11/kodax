/**
 * عرض محتوى الدرس (Markdown مبسّط) — بديل للمحلل السطري القديم الذي كان يعرض
 * كتل الكود و **الخط العريض** والجداول كنص خام.
 *
 * يدعم: # ## ### ####، القوائم (- * 1.)، القوائم الفرعية، كتل الكود ```lang،
 * `كود داخل السطر`، **عريض**، الجداول | a | b |، والملاحظات > (callout).
 * الأنماط مطابقة للأنماط السابقة في شاشة الدرس حتى لا يتغيّر شكل الدروس النصية.
 */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import CodeHighlight from '@/components/ui/CodeHighlight';

const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

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

/** نص مع **عريض** و `كود` داخل السطر */
function Inline({ text, style }: { text: string; style: any }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return (
    <Text style={style}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <Text key={i} style={styles.bold}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
          return (
            <Text key={i} style={styles.inlineCode}>
              {part.slice(1, -1)}
            </Text>
          );
        }
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
}

export function LessonContent({ content, defaultLanguage }: { content: string; defaultLanguage?: string }) {
  const blocks = useMemo(() => parseLessonContent(content || ''), [content]);
  return (
    <View>
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'h':
            return <Inline key={i} text={b.text} style={[styles.h1, styles.h2, styles.h3, styles.h4][b.level - 1]} />;
          case 'li':
            return (
              <View key={i} style={[styles.listItem, b.depth ? styles.listNested : null]}>
                <Text style={/\d/.test(b.marker) ? styles.listNumber : styles.listBullet}>{/\d/.test(b.marker) ? b.marker : '•'}</Text>
                <Inline text={b.text} style={styles.listText} />
              </View>
            );
          case 'code':
            return (
              <View key={i} style={styles.codeBlock}>
                <CodeHighlight code={b.code} language={(b.lang || defaultLanguage || 'javascript').toLowerCase()} />
              </View>
            );
          case 'table':
            return (
              <ScrollView key={i} horizontal style={styles.tableWrap} contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.table}>
                  <View style={[styles.tableRow, styles.tableHeader]}>
                    {b.header.map((c, j) => (
                      <Inline key={j} text={c} style={[styles.tableCell, styles.tableHeaderText]} />
                    ))}
                  </View>
                  {b.rows.map((r, j) => (
                    <View key={j} style={styles.tableRow}>
                      {b.header.map((_, k) => (
                        <Inline key={k} text={r[k] ?? ''} style={styles.tableCell} />
                      ))}
                    </View>
                  ))}
                </View>
              </ScrollView>
            );
          case 'quote':
            return (
              <View key={i} style={styles.quote}>
                <Inline text={b.text} style={styles.quoteText} />
              </View>
            );
          case 'space':
            return <View key={i} style={{ height: 12 }} />;
          default:
            return <Inline key={i} text={b.text} style={styles.paragraph} />;
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 16, marginTop: 8 },
  h2: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 12, marginTop: 16 },
  h3: { fontSize: 16, fontWeight: '600', color: '#d1d5db', marginBottom: 8, marginTop: 12 },
  h4: { fontSize: 15, fontWeight: '600', color: '#9ca3af', marginBottom: 6, marginTop: 10 },
  paragraph: { fontSize: 15, color: '#d1d5db', lineHeight: 24, marginBottom: 8 },
  listItem: { flexDirection: 'row', marginBottom: 8, paddingRight: 8 },
  listNested: { paddingRight: 28 },
  listBullet: { color: '#3b82f6', fontSize: 16, marginLeft: 8, width: 16 },
  listNumber: { color: '#3b82f6', fontSize: 14, fontWeight: '600', marginLeft: 8, width: 24 },
  listText: { flex: 1, fontSize: 15, color: '#d1d5db', lineHeight: 22 },
  bold: { fontWeight: 'bold', color: '#fff' },
  inlineCode: {
    fontFamily: MONO,
    fontSize: 13,
    color: '#93c5fd',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  codeBlock: {
    backgroundColor: '#0d1117',
    padding: 14,
    borderRadius: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.4)',
    // direction خاصية تخطيط في React Native الأصلي؛ React Native Web يرفضها (يكفي dir في الويب)
    ...(Platform.OS === 'web' ? {} : { direction: 'ltr' as const }),
  },
  tableWrap: { marginVertical: 10 },
  table: { borderWidth: 1, borderColor: 'rgba(75, 85, 99, 0.5)', borderRadius: 10, overflow: 'hidden', minWidth: '100%' },
  tableRow: { flexDirection: 'row-reverse', borderBottomWidth: 1, borderBottomColor: 'rgba(75, 85, 99, 0.35)' },
  tableHeader: { backgroundColor: 'rgba(59, 130, 246, 0.12)' },
  tableHeaderText: { fontWeight: '700', color: '#fff' },
  tableCell: { flex: 1, minWidth: 110, padding: 8, fontSize: 14, color: '#d1d5db', textAlign: 'right' },
  quote: {
    borderRightWidth: 3,
    borderRightColor: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  quoteText: { fontSize: 14, color: '#fde68a', lineHeight: 22 },
});

export default LessonContent;
