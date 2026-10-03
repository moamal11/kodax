/**
 * Code Syntax Highlighter Component
 * تلوين أكواد البرمجة في الدروس
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';

interface CodeHighlightProps {
  code: string;
  language: string;
}

/**
 * نص عربي داخل سطر كود LTR: خوارزمية الاتجاه الثنائي تُعيد ترتيب ما حوله
 * (مثلاً 'قلم', 1.5, 3 تظهر بترتيب معكوس). علامتا العزل FSI/PDI (غير مرئيتين)
 * تُبقيان موضع النص ثابتاً. على الويب فقط حيث تحققنا من المشكلة والحل.
 */
const ARABIC = /[؀-ۿ]/;
function isolateRtl(token: string): string {
  return Platform.OS === 'web' && ARABIC.test(token) ? `⁨${token}⁩` : token;
}

// ألوان Syntax Highlighting
const SYNTAX_COLORS = {
  keyword: '#c678dd', // البنفسجي - const, let, function, class
  string: '#98c379', // الأخضر - "نص"
  comment: '#5c6370', // الرمادي - // تعليق
  number: '#d19a66', // البرتقالي - 123
  function: '#61afef', // الأزرق - functionName()
  operator: '#56b6c2', // السماوي - =, +, -, *
  variable: '#e06c75', // الأحمر الوردي - متغير
  tag: '#e06c75', // HTML tags
  attribute: '#d19a66', // HTML attributes
  className: '#e5c07b', // أصفر - ClassName
  bracket: '#abb2bf', // رمادي فاتح - {}, [], ()
  default: '#abb2bf', // النص العادي
};

// كلمات JavaScript المفتاحية
const JS_KEYWORDS = [
  'const',
  'let',
  'var',
  'function',
  'async',
  'await',
  'return',
  'if',
  'else',
  'for',
  'while',
  'do',
  'switch',
  'case',
  'break',
  'continue',
  'try',
  'catch',
  'finally',
  'throw',
  'new',
  'class',
  'extends',
  'import',
  'export',
  'default',
  'from',
  'as',
  'typeof',
  'instanceof',
  'this',
  'super',
  'static',
  'get',
  'set',
  'true',
  'false',
  'null',
  'undefined',
  'void',
  'delete',
  'in',
  'of',
];

// كلمات Python المفتاحية
const PYTHON_KEYWORDS = [
  'def',
  'class',
  'if',
  'elif',
  'else',
  'for',
  'while',
  'return',
  'import',
  'from',
  'as',
  'try',
  'except',
  'finally',
  'raise',
  'with',
  'pass',
  'break',
  'continue',
  'lambda',
  'yield',
  'global',
  'nonlocal',
  'True',
  'False',
  'None',
  'and',
  'or',
  'not',
  'in',
  'is',
  'async',
  'await',
  'print',
  'len',
  'range',
  'str',
  'int',
];

// كلمات C++ المفتاحية
const CPP_KEYWORDS = [
  'int',
  'float',
  'double',
  'char',
  'bool',
  'void',
  'string',
  'if',
  'else',
  'for',
  'while',
  'do',
  'switch',
  'case',
  'break',
  'continue',
  'return',
  'class',
  'struct',
  'public',
  'private',
  'protected',
  'namespace',
  'using',
  'include',
  'define',
  'const',
  'static',
  'virtual',
  'override',
  'new',
  'delete',
  'this',
  'true',
  'false',
  'nullptr',
  'auto',
  'cout',
  'cin',
  'endl',
];

// HTML tags
const HTML_TAGS = [
  'html',
  'head',
  'body',
  'title',
  'meta',
  'link',
  'script',
  'style',
  'div',
  'span',
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'a',
  'img',
  'ul',
  'ol',
  'li',
  'table',
  'tr',
  'td',
  'th',
  'form',
  'input',
  'button',
  'select',
  'option',
  'textarea',
  'header',
  'footer',
  'nav',
  'section',
  'article',
  'aside',
];

export default function CodeHighlight({ code, language }: CodeHighlightProps) {
  const highlightCode = (code: string, lang: string): React.ReactNode[] => {
    const lines = code.split('\n');

    return lines.map((line, lineIndex) => {
      const tokens: React.ReactNode[] = [];
      let currentPos = 0;

      // تحليل السطر
      const processLine = () => {
        const remaining = line.slice(currentPos);

        // تخطي المسافات
        const spaceMatch = remaining.match(/^(\s+)/);
        if (spaceMatch) {
          tokens.push(
            <Text key={`${lineIndex}-space-${currentPos}`}>
              {spaceMatch[1]}
            </Text>
          );
          currentPos += spaceMatch[1].length;
          return true;
        }

        // تعليقات
        if (lang === 'javascript' || lang === 'typescript' || lang === 'cpp') {
          if (remaining.startsWith('//')) {
            tokens.push(
              <Text
                key={`${lineIndex}-comment-${currentPos}`}
                style={{ color: SYNTAX_COLORS.comment }}
              >
                {remaining}
              </Text>
            );
            currentPos = line.length;
            return false;
          }
        } else if (lang === 'python') {
          if (remaining.startsWith('#')) {
            tokens.push(
              <Text
                key={`${lineIndex}-comment-${currentPos}`}
                style={{ color: SYNTAX_COLORS.comment }}
              >
                {remaining}
              </Text>
            );
            currentPos = line.length;
            return false;
          }
        }

        // Strings
        const stringMatch = remaining.match(/^(['"`])(.*?)\1/);
        if (stringMatch) {
          tokens.push(
            <Text
              key={`${lineIndex}-string-${currentPos}`}
              style={{ color: SYNTAX_COLORS.string }}
            >
              {isolateRtl(stringMatch[0])}
            </Text>
          );
          currentPos += stringMatch[0].length;
          return true;
        }

        // Numbers
        const numberMatch = remaining.match(/^(\d+\.?\d*)/);
        if (numberMatch) {
          tokens.push(
            <Text
              key={`${lineIndex}-number-${currentPos}`}
              style={{ color: SYNTAX_COLORS.number }}
            >
              {numberMatch[1]}
            </Text>
          );
          currentPos += numberMatch[1].length;
          return true;
        }

        // Keywords
        let keywords: string[] = [];
        if (lang === 'javascript' || lang === 'typescript') {
          keywords = JS_KEYWORDS;
        } else if (lang === 'python') {
          keywords = PYTHON_KEYWORDS;
        } else if (lang === 'cpp') {
          keywords = CPP_KEYWORDS;
        }

        const wordMatch = remaining.match(/^([a-zA-Z_]\w*)/);
        if (wordMatch) {
          const word = wordMatch[1];
          const isKeyword = keywords.includes(word);

          tokens.push(
            <Text
              key={`${lineIndex}-word-${currentPos}`}
              style={{
                color: isKeyword
                  ? SYNTAX_COLORS.keyword
                  : SYNTAX_COLORS.default,
              }}
            >
              {word}
            </Text>
          );
          currentPos += word.length;
          return true;
        }

        // HTML tags
        if (lang === 'html' || lang === 'xml') {
          const tagMatch = remaining.match(/^<\/?([a-zA-Z]\w*)/);
          if (tagMatch) {
            tokens.push(
              <Text
                key={`${lineIndex}-tag-${currentPos}`}
                style={{ color: SYNTAX_COLORS.bracket }}
              >
                {'<'}
              </Text>
            );
            currentPos += 1;

            if (tagMatch[0].includes('/')) {
              tokens.push(
                <Text
                  key={`${lineIndex}-slash-${currentPos}`}
                  style={{ color: SYNTAX_COLORS.bracket }}
                >
                  {'/'}
                </Text>
              );
              currentPos += 1;
            }

            tokens.push(
              <Text
                key={`${lineIndex}-tagname-${currentPos}`}
                style={{ color: SYNTAX_COLORS.tag }}
              >
                {tagMatch[1]}
              </Text>
            );
            currentPos += tagMatch[1].length;
            return true;
          }
        }

        // Operators and brackets
        const opMatch = remaining.match(/^([+\-*/%=<>!&|?.,:;{}()\[\]])/);
        if (opMatch) {
          const char = opMatch[1];
          const isBracket = '{}[]()'.includes(char);
          tokens.push(
            <Text
              key={`${lineIndex}-op-${currentPos}`}
              style={{
                color: isBracket
                  ? SYNTAX_COLORS.bracket
                  : SYNTAX_COLORS.operator,
              }}
            >
              {char}
            </Text>
          );
          currentPos += 1;
          return true;
        }

        // أي شيء آخر — نص غير ASCII (العربية مثلاً) يُجمع كتلة واحدة مع المسافات بين كلماته:
        // عنصر لكل حرف يمنع المتصفح من وصل الحروف العربية فتظهر متقطعة
        const otherMatch = remaining.match(/^[^\x00-\x7F]+(?:\s+[^\x00-\x7F]+)*/);
        const other = otherMatch ? otherMatch[0] : remaining[0];
        tokens.push(
          <Text key={`${lineIndex}-other-${currentPos}`}>{other}</Text>
        );
        currentPos += other.length;
        return true;
      };

      // معالجة السطر بالكامل
      while (currentPos < line.length) {
        if (!processLine()) break;
      }

      return (
        <View key={lineIndex} style={styles.line}>
          <Text style={styles.lineNumber}>
            {String(lineIndex + 1).padStart(2, ' ')}
          </Text>
          <Text style={styles.lineContent}>{tokens}</Text>
        </View>
      );
    });
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.container}>
        {highlightCode(code, language.toLowerCase())}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#282c34',
    borderRadius: 12,
    padding: 16,
    minWidth: '100%',
    direction: 'ltr' as any,
  },
  line: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  lineNumber: {
    color: '#5c6370',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    marginRight: 16,
    minWidth: 24,
    textAlign: 'right',
    writingDirection: 'ltr' as const,
  },
  lineContent: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: SYNTAX_COLORS.default,
    lineHeight: 20,
    textAlign: 'left' as const,
    writingDirection: 'ltr' as const,
  },
});
