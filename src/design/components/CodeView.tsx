/**
 * عرض كود مقروء: LTR دائماً، خط JetBrains Mono، تلوين بسيط، أرقام أسطر اختيارية.
 * النص العربي داخل الكود (نصوص/تعليقات) معزول حتى لا يقلب ترتيب ما حوله.
 */
import React, { useMemo } from 'react';
import { Platform, ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text as RNText } from 'react-native';
import { tokenizeCode, type Token } from '@/utils/syntaxHighlighter';
import { useTheme } from '../theme';
import { Text } from './Text';
import { Row } from './Layout';

const ARABIC = /[؀-ۿ]/;
const iso = (s: string) => (ARABIC.test(s) ? `⁨${s}⁩` : s);

type Props = {
  code: string;
  language?: string;
  /** يقص بعد عدد أسطر (للمعاينات) */
  maxLines?: number;
  lineNumbers?: boolean;
  /** شريط علوي باسم الملف/اللغة */
  title?: string;
  actions?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** حجم الخط */
  size?: 'sm' | 'md';
};

function splitLines(tokens: Token[]): Token[][] {
  const lines: Token[][] = [[]];
  for (const tk of tokens) {
    const parts = tk.content.split('\n');
    parts.forEach((p, i) => {
      if (i > 0) lines.push([]);
      if (p) lines[lines.length - 1].push({ content: p, type: tk.type });
    });
  }
  return lines;
}

export function CodeView({ code, language = 'text', maxLines, lineNumbers = true, title, actions, style, size = 'md' }: Props) {
  const t = useTheme();
  const c = t.colors;
  const colorOf = (type: Token['type']) =>
    ({
      keyword: c.codeKeyword,
      string: c.codeString,
      number: c.codeNumber,
      boolean: c.codeNumber,
      constant: c.codeNumber,
      function: c.codeFunction,
      className: '#E5C07B',
      comment: c.codeComment,
      tag: '#F07178',
      attribute: c.codeNumber,
      property: '#89DDFF',
      operator: '#89DDFF',
      punctuation: c.codeMuted,
      variable: c.codeText,
      default: c.codeText,
    })[type] ?? c.codeText;
  const lines = useMemo(() => {
    let all: Token[][];
    try {
      all = splitLines(tokenizeCode(code ?? '', language));
    } catch {
      all = (code ?? '').split('\n').map((l) => [{ content: l, type: 'default' as const }]);
    }
    while (all.length > 1 && all[all.length - 1].length === 0) all.pop();
    return all;
  }, [code, language]);
  const shown = maxLines ? lines.slice(0, maxLines) : lines;
  const fontSize = size === 'sm' ? 12.5 : 13.5;
  const lineHeight = size === 'sm' ? 20 : 22;
  const gutter = String(shown.length).length;

  return (
    <View style={[{ backgroundColor: c.codeBg, borderRadius: t.radius.md, borderWidth: 1, borderColor: c.codeBorder, overflow: 'hidden' }, style]}>
      {(title || actions) && (
        <Row justify="space-between" style={{ paddingHorizontal: 12, minHeight: 38, borderBottomWidth: 1, borderBottomColor: c.codeBorder }}>
          {actions ? <Row gap={2}>{actions}</Row> : <View />}
          {!!title && (
            <Text mono variant="caption" ltr style={{ color: c.codeMuted }}>
              {title}
            </Text>
          )}
        </Row>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={Platform.OS === 'web'} contentContainerStyle={{ paddingVertical: 10, minWidth: '100%' }}>
        <View style={{ paddingHorizontal: 12 }} accessible accessibilityLabel={`كود ${language}`}>
          {shown.map((ln, i) => (
            <View key={i} style={{ flexDirection: 'row' }}>
              {lineNumbers && (
                <RNText style={{ width: gutter * 9 + 14, color: c.codeMuted, fontFamily: t.font.mono, fontSize, lineHeight, textAlign: 'left' }} selectable={false}>
                  {i + 1}
                </RNText>
              )}
              <RNText selectable style={{ fontFamily: t.font.mono, fontSize, lineHeight, color: c.codeText, writingDirection: 'ltr', textAlign: 'left' }}>
                {ln.length === 0 ? ' ' : ln.map((tk, k) => (
                  <RNText key={k} style={{ color: colorOf(tk.type), fontStyle: tk.type === 'comment' ? 'italic' : 'normal' }}>
                    {iso(tk.content)}
                  </RNText>
                ))}
              </RNText>
            </View>
          ))}
          {maxLines && lines.length > maxLines && (
            <RNText style={{ color: c.codeMuted, fontFamily: t.font.mono, fontSize, lineHeight, textAlign: 'left' }}>{'…'}</RNText>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
