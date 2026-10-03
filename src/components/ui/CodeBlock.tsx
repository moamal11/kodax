import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { tokenizeCode } from '@/utils/syntaxHighlighter';
import { Token } from '@/utils/syntaxHighlighter';

/**
 * نص عربي داخل سطر كود LTR (تعليق، نص، اسم): خوارزمية الاتجاه الثنائي في المتصفح قد تقلب
 * موضع الرموز حوله (مثلاً "# تعليق" يظهر "تعليق #"). علامتا العزل LRI/PDI (غير مرئيتين)
 * تُبقيان الرمز في مكانه. على الويب فقط، والنسخ يستخدم الكود الأصلي بدونهما.
 */
const ARABIC = /[؀-ۿ]/;
function isolate(content: string): string {
  return Platform.OS === 'web' && ARABIC.test(content) ? `⁦${content}⁩` : content;
}

// ألوان Syntax Highlighting
const COLORS: Record<string, string> = {
  keyword: '#c084fc',
  string: '#34d399',
  number: '#fbbf24',
  function: '#60a5fa',
  comment: '#6b7280',
  operator: '#f472b6',
  punctuation: '#e5e7eb',
  className: '#22d3ee',
  property: '#a78bfa',
  boolean: '#fb923c',
  constant: '#fde047',
  tag: '#f87171',
  attribute: '#fbbf24',
  variable: '#e5e7eb',
  default: '#e5e7eb',
};

interface Props {
  code: string;
  language?: string;
  maxHeight?: number;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  code,
  language = 'javascript',
  maxHeight = 360,
  showLineNumbers = true,
}: Props) {
  const [copied, setCopied] = useState(false);
  const lines = code.replace(/\r/g, '').split('\n');

  const handleCopy = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for web
      if (Platform.OS === 'web' && navigator?.clipboard) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  }, [code]);

  return (
    <View style={styles.container}>
      {/* Header with language label and copy button */}
      <View style={styles.header}>
        <Text style={styles.languageLabel}>{language || 'code'}</Text>
        <TouchableOpacity
          style={styles.copyButton}
          onPress={handleCopy}
          activeOpacity={0.7}
        >
          <Ionicons
            name={copied ? 'checkmark' : 'copy-outline'}
            size={16}
            color={copied ? '#22c55e' : '#94a3b8'}
          />
          <Text style={[styles.copyText, copied && { color: '#22c55e' }]}>
            {copied ? 'تم النسخ' : 'نسخ'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ maxHeight, marginTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {lines.map((line, i) => {
          const tokens = tokenizeCode(line || ' ', language);

          return (
            <View key={i} style={styles.row}>
              {showLineNumbers && (
                <Text style={styles.lineNumber} selectable={false}>
                  {String(i + 1).padStart(2, '0')}
                </Text>
              )}

              <Text style={styles.codeLine} selectable={true}>
                {(tokens as Token[]).map((token: Token, idx: number) => (
                  <Text
                    key={idx}
                    style={{
                      color: COLORS[token.type] || COLORS.default,
                    }}
                  >
                    {isolate(token.content)}
                  </Text>
                ))}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    paddingTop: 0,
    paddingBottom: 33,
    ...(Platform.OS === 'web' ? {} : { direction: 'ltr' as const }),
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },

  languageLabel: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'monospace',
    textTransform: 'lowercase',
  },

  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  copyText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 20,
    paddingHorizontal: 12,
  },

  lineNumber: {
    width: 32,
    marginRight: 12,
    textAlign: 'right',
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'monospace',
    paddingTop: 2,
    ...(Platform.OS === 'web' ? { userSelect: 'none' as any } : {}),
  },

  codeLine: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlign: 'left' as const,
    writingDirection: 'ltr' as const,
  },
});
