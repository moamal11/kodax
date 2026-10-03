/**
 * عرض Markdown لرسائل المساعد: عناوين، قوائم، اقتباس، جداول بسيطة، نص عريض/مائل، كود سطري،
 * وكتل كود بزر نسخ (CodeBlock). اتجاه كل فقرة حسب لغتها (RTL للعربي، LTR للإنجليزي)،
 * والكود دائماً LTR.
 */
import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, Linking, ScrollView } from 'react-native';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { C, FONT_MONO, isRtlText } from './theme';

type Block =
  | { type: 'code'; lang: string; code: string }
  | { type: 'heading'; level: number; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'table'; rows: string[][] }
  | { type: 'hr' }
  | { type: 'para'; text: string };

export function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r/g, '').split('\n');
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const fence = line.match(/^\s*```\s*([\w+#.-]*)\s*$/);
    if (fence) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) code.push(lines[i++]);
      i++; // سطر الإغلاق (إن وجد)
      blocks.push({ type: 'code', lang: fence[1] || 'text', code: code.join('\n') });
      continue;
    }
    if (!line.trim()) {
      i++;
      continue;
    }
    const h = line.match(/^(#{1,4})\s+(.+)/);
    if (h) {
      blocks.push({ type: 'heading', level: h[1].length, text: h[2].trim() });
      i++;
      continue;
    }
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }
    if (/^\s*\|.*\|\s*$/.test(line)) {
      const rows: string[][] = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        const cells = lines[i].trim().slice(1, -1).split('|').map((c) => c.trim());
        if (!cells.every((c) => /^:?-{2,}:?$/.test(c))) rows.push(cells);
        i++;
      }
      blocks.push({ type: 'table', rows });
      continue;
    }
    if (/^\s*>\s?/.test(line)) {
      const q: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) q.push(lines[i++].replace(/^\s*>\s?/, ''));
      blocks.push({ type: 'quote', text: q.join('\n') });
      continue;
    }
    const li = line.match(/^\s*([-*•]|\d+[.)])\s+(.+)/);
    if (li) {
      const ordered = /\d/.test(li[1]);
      const items: string[] = [];
      while (i < lines.length) {
        const m = lines[i].match(/^\s*([-*•]|\d+[.)])\s+(.+)/);
        if (m && /\d/.test(m[1]) === ordered) {
          items.push(m[2]);
          i++;
        } else if (lines[i].trim() && /^\s{2,}\S/.test(lines[i]) && items.length) {
          items[items.length - 1] += ' ' + lines[i].trim();
          i++;
        } else break;
      }
      blocks.push({ type: 'list', ordered, items });
      continue;
    }
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^\s*```/.test(lines[i]) &&
      !/^#{1,4}\s/.test(lines[i]) &&
      !/^\s*([-*•]|\d+[.)])\s+/.test(lines[i]) &&
      !/^\s*>/.test(lines[i]) &&
      !/^\s*\|.*\|\s*$/.test(lines[i])
    ) {
      para.push(lines[i++]);
    }
    blocks.push({ type: 'para', text: para.join('\n') });
  }
  return blocks;
}

/** تنسيق سطري: **عريض**، *مائل*، `كود`، [رابط](url) */
function Inline({ text, color }: { text: string; color: string }) {
  const parts: React.ReactNode[] = [];
  const re = /(\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|\*([^*\s][^*\n]*?)\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[2]) parts.push(<Text key={k++} style={styles.bold}>{m[2]}</Text>);
    else if (m[3]) parts.push(<Text key={k++} style={styles.inlineCode}>{` ${m[3]} `}</Text>);
    else if (m[4]) {
      const url = m[5];
      parts.push(
        <Text key={k++} style={styles.link} onPress={() => Linking.openURL(url).catch(() => undefined)}>
          {m[4]}
        </Text>
      );
    } else if (m[6]) parts.push(<Text key={k++} style={styles.italic}>{m[6]}</Text>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <Text style={{ color }}>{parts}</Text>;
}

function dirStyle(text: string) {
  return isRtlText(text)
    ? ({ textAlign: 'right', writingDirection: 'rtl' } as const)
    : ({ textAlign: 'left', writingDirection: 'ltr' } as const);
}

interface Props {
  content: string;
  /** رسالة المستخدم: نص أبيض على خلفية ملونة */
  variant?: 'assistant' | 'user';
  compact?: boolean;
}

function ChatMarkdownImpl({ content, variant = 'assistant', compact }: Props) {
  const blocks = useMemo(() => parseBlocks(content), [content]);
  const color = variant === 'user' ? '#ffffff' : C.text;
  const fontSize = compact ? 14.5 : 15.5;
  const lineHeight = compact ? 23 : 26;

  return (
    <View style={[styles.root, variant === 'assistant' && styles.rootFull]}>
      {blocks.map((b, idx) => {
        switch (b.type) {
          case 'code':
            return (
              <View key={idx} style={styles.code}>
                <CodeBlock code={b.code} language={b.lang} maxHeight={420} />
              </View>
            );
          case 'heading':
            return (
              <Text
                key={idx}
                style={[
                  styles.heading,
                  { color, fontSize: b.level <= 2 ? fontSize + 3 : fontSize + 1 },
                  dirStyle(b.text),
                ]}
              >
                <Inline text={b.text} color={color} />
              </Text>
            );
          case 'hr':
            return <View key={idx} style={styles.hr} />;
          case 'quote':
            return (
              <View key={idx} style={[styles.quote, isRtlText(b.text) ? styles.quoteRtl : styles.quoteLtr]}>
                <Text style={[{ color: C.textSoft, fontSize, lineHeight }, dirStyle(b.text)]}>
                  <Inline text={b.text} color={C.textSoft} />
                </Text>
              </View>
            );
          case 'list': {
            const rtl = isRtlText(b.items[0] ?? '');
            return (
              <View key={idx} style={styles.list}>
                {b.items.map((it, j) => (
                  <View key={j} style={[styles.li, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                    <Text style={[styles.bullet, { color: C.accent, fontSize, lineHeight }]}>
                      {b.ordered ? `${j + 1}.` : '•'}
                    </Text>
                    <Text style={[{ flex: 1, color, fontSize, lineHeight }, dirStyle(it)]}>
                      <Inline text={it} color={color} />
                    </Text>
                  </View>
                ))}
              </View>
            );
          }
          case 'table':
            return (
              <ScrollView key={idx} horizontal showsHorizontalScrollIndicator={false} style={styles.tableWrap}>
                <View>
                  {b.rows.map((r, j) => (
                    <View key={j} style={[styles.tr, j === 0 && styles.thRow]}>
                      {r.map((cell, k) => (
                        <View key={k} style={styles.td}>
                          <Text style={[{ color, fontSize: fontSize - 1.5, lineHeight: lineHeight - 4 }, j === 0 && styles.bold, dirStyle(cell)]}>
                            <Inline text={cell} color={color} />
                          </Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </ScrollView>
            );
          default:
            return (
              <Text key={idx} selectable style={[{ color, fontSize, lineHeight }, dirStyle(b.text)]}>
                <Inline text={b.text} color={color} />
              </Text>
            );
        }
      })}
    </View>
  );
}

export const ChatMarkdown = memo(ChatMarkdownImpl);

const styles = StyleSheet.create({
  root: { gap: 10 },
  // رسالة المستخدم داخل فقاعة بعرض المحتوى: عرض 100% فيها يسبب ارتفاعاً زائداً على Android
  rootFull: { width: '100%' },
  code: { width: '100%', marginVertical: 2 },
  heading: { fontWeight: '700', marginTop: 4 },
  bold: { fontWeight: '700' },
  italic: { fontStyle: 'italic' },
  link: { color: C.accent2, textDecorationLine: 'underline' },
  inlineCode: {
    fontFamily: FONT_MONO,
    fontSize: 13.5,
    backgroundColor: C.inlineCodeBg,
    color: C.inlineCode,
    borderRadius: 5,
  },
  hr: { height: 1, backgroundColor: C.border, marginVertical: 4 },
  quote: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: C.surface, borderRadius: 8 },
  quoteRtl: { borderRightWidth: 3, borderRightColor: C.accent },
  quoteLtr: { borderLeftWidth: 3, borderLeftColor: C.accent },
  list: { gap: 6 },
  li: { gap: 8, alignItems: 'flex-start' },
  bullet: { fontWeight: '700', minWidth: 16, textAlign: 'center' },
  tableWrap: { borderRadius: 10, borderWidth: 1, borderColor: C.border },
  tr: { flexDirection: 'row-reverse', borderBottomWidth: 1, borderBottomColor: C.border },
  thRow: { backgroundColor: C.surfaceStrong },
  td: { minWidth: 110, maxWidth: 260, paddingHorizontal: 10, paddingVertical: 8 },
});
