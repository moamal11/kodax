/**
 * AIMessageRenderer.tsx
 *
 * مكون لعرض رسائل الذكاء الاصطناعي
 * - تنسيق تلقائي للأكواد
 * - دعم code blocks و inline code
 * - جاهز لـ Kodax / KodaxPro
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CodeBlock } from '../ui/CodeBlock';

interface AIMessageRendererProps {
  content: string;
  isUser?: boolean;
}

/* =======================
   Utils
======================= */

export function normalizeCode(code: string) {
  return code
    .replace(/\t/g, '  ') // تحويل tabs إلى مسافات
    .replace(/\u00A0/g, ' ') // إزالة non-breaking spaces
    .replace(/\u200B/g, '') // إزالة zero-width spaces
    .replace(/\r\n/g, '\n') // توحيد نهاية الأسطر
    .replace(/\r/g, '\n')
    .replace(/^\n+/, '') // إزالة الأسطر الفارغة من البداية
    .replace(/\n+$/, '') // إزالة الأسطر الفارغة من النهاية
    .replace(/\n{3,}/g, '\n\n'); // تحديد الأسطر الفارغة المتتالية بسطرين فقط
}

const detectLanguage = (code: string): string => {
  const trimmedCode = code.trim();

  // TypeScript - فحص محسّن
  if (
    /\b(interface|type\s+\w+\s*=|enum\s+\w+|as\s+\w+|:\s*\w+\[\]|:\s*string|:\s*number|:\s*boolean)\b/.test(
      trimmedCode
    )
  ) {
    return 'typescript';
  }

  // JavaScript - فحص محسّن
  if (
    /\b(const|let|var|function|=>|async|await|export|import|require)\b/.test(
      trimmedCode
    )
  ) {
    return 'javascript';
  }

  // Python - فحص محسّن
  if (
    /\b(def\s+\w+|import\s+\w+|from\s+\w+|print\(|class\s+\w+:|if\s+__name__|self\.)\b/.test(
      trimmedCode
    )
  ) {
    return 'python';
  }

  // Java - فحص محسّن
  if (
    /\b(public\s+class|private\s+\w+|static\s+void|System\.out|@Override|extends|implements)\b/.test(
      trimmedCode
    )
  ) {
    return 'java';
  }

  // C++ - فحص محسّن
  if (
    /#include|std::|cout\s*<<|cin\s*>>|namespace\s+\w+|int\s+main\(/.test(
      trimmedCode
    )
  ) {
    return 'cpp';
  }

  // C# - فحص محسّن
  if (
    /\b(using\s+System|namespace\s+\w+|public\s+class|void\s+Main|Console\.WriteLine)\b/.test(
      trimmedCode
    )
  ) {
    return 'csharp';
  }

  // HTML/XML - فحص محسّن
  if (
    /<(!DOCTYPE|html|head|body|div|span|p|a|img|script|style|link)[^>]*>/i.test(
      trimmedCode
    )
  ) {
    return 'markup';
  }

  // CSS - فحص محسّن
  if (
    /[.#][\w-]+\s*\{[\s\S]*\}|@media|@keyframes|:hover|:before|:after/.test(
      trimmedCode
    )
  ) {
    return 'css';
  }

  // SQL - فحص محسّن
  if (
    /\b(SELECT|FROM|WHERE|INSERT\s+INTO|UPDATE|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE|DROP|JOIN)\b/i.test(
      trimmedCode
    )
  ) {
    return 'sql';
  }

  // JSON - فحص محسّن
  if (
    /^\s*[\{\[][\s\S]*[\}\]]\s*$/.test(trimmedCode) &&
    /["']:\s*["\'\{\[]/.test(trimmedCode)
  ) {
    return 'json';
  }

  // Default to javascript
  return 'javascript';
};

/* =======================
   Parser
======================= */

type MessagePart =
  | { type: 'text'; content: string }
  | { type: 'code'; content: string; language: string }
  | { type: 'inline-code'; content: string };

const parseMessageContent = (content: string): MessagePart[] => {
  const parts: MessagePart[] = [];
  // Improved regex: handle code blocks with/without language, with/without newlines
  // Supports: ```lang\ncode```, ```\ncode```, ```lang code```, and variations
  const codeBlockRegex =
    /```(\w+)?\s*\n([\s\S]*?)```|```(\w+)\s+([\s\S]*?)```|```\n?([\s\S]*?)```/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const textContent = content.slice(lastIndex, match.index).trim();
      if (textContent) {
        parts.push({
          type: 'text',
          content: textContent,
        });
      }
    }

    // Extract language and code from whichever group matched
    let language = '';
    let rawCode = '';

    if (match[1] !== undefined && match[2] !== undefined) {
      // ```lang\ncode```
      language = match[1];
      rawCode = match[2];
    } else if (match[3] !== undefined && match[4] !== undefined) {
      // ```lang code``` (no newline)
      language = match[3];
      rawCode = match[4];
    } else if (match[5] !== undefined) {
      // ```code``` (no language)
      rawCode = match[5];
    }

    const code = normalizeCode(rawCode);

    // تطبيع أسماء اللغات الشائعة
    const languageMap: { [key: string]: string } = {
      js: 'javascript',
      ts: 'typescript',
      py: 'python',
      'c++': 'cpp',
      'c#': 'csharp',
      cs: 'csharp',
      html: 'markup',
      xml: 'markup',
      jsx: 'javascript',
      tsx: 'typescript',
      sh: 'bash',
      bash: 'bash',
      shell: 'bash',
    };

    language =
      languageMap[language?.toLowerCase().trim()] ||
      language?.toLowerCase().trim() ||
      '';

    if (!language && code.trim()) {
      language = detectLanguage(code);
    }

    if (code.trim()) {
      parts.push({
        type: 'code',
        content: code,
        language: language,
      });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    const textContent = content.slice(lastIndex).trim();
    if (textContent) {
      parts.push({
        type: 'text',
        content: textContent,
      });
    }
  }

  // Post-processing: detect code-like content in text parts
  const processedParts: MessagePart[] = [];
  for (const part of parts) {
    if (part.type !== 'text') {
      processedParts.push(part);
      continue;
    }

    // Check if text contains multi-line code that wasn't in backtick fences
    const codePatterns = [
      // Multiple lines starting with code-like patterns
      /(?:^|\n)((?:(?:def |class |import |from |if |for |while |return |print\().*\n?){3,})/,
      /(?:^|\n)((?:(?:function |const |let |var |export |import |if |for |return ).*\n?){3,})/,
      /(?:^|\n)((?:(?:<\w+[^>]*>|<\/\w+>).*\n?){3,})/,
      /(?:^|\n)((?:(?:public |private |static |void |int |String |class ).*\n?){3,})/,
    ];

    let hasCodeBlock = false;
    for (const pattern of codePatterns) {
      const codeMatch = pattern.exec(part.content);
      if (codeMatch) {
        const beforeCode = part.content.slice(0, codeMatch.index).trim();
        const codeContent = normalizeCode(codeMatch[1]);
        const afterCode = part.content
          .slice(codeMatch.index + codeMatch[0].length)
          .trim();

        if (beforeCode) {
          processedParts.push({ type: 'text', content: beforeCode });
        }
        if (codeContent) {
          processedParts.push({
            type: 'code',
            content: codeContent,
            language: detectLanguage(codeContent),
          });
        }
        if (afterCode) {
          processedParts.push({ type: 'text', content: afterCode });
        }
        hasCodeBlock = true;
        break;
      }
    }

    if (!hasCodeBlock) {
      processedParts.push(part);
    }
  }

  // Inline code - تحسين معالجة الأكواد المضمنة
  const finalParts: MessagePart[] = [];
  const inlineRegex = /`([^`\n]+)`/g; // عدم السماح بسطور جديدة في الكود المضمن

  processedParts.forEach((part) => {
    if (part.type !== 'text') {
      finalParts.push(part);
      return;
    }

    let last = 0;
    let m: RegExpExecArray | null;
    const textContent = part.content;

    // إعادة تعيين lastIndex للـ regex
    inlineRegex.lastIndex = 0;

    while ((m = inlineRegex.exec(textContent)) !== null) {
      if (m.index > last) {
        const textBefore = textContent.slice(last, m.index).trim();
        if (textBefore) {
          finalParts.push({
            type: 'text',
            content: textBefore,
          });
        }
      }

      const inlineCode = m[1].trim();
      if (inlineCode) {
        finalParts.push({
          type: 'inline-code',
          content: inlineCode,
        });
      }

      last = m.index + m[0].length;
    }

    if (last < textContent.length) {
      const textAfter = textContent.slice(last).trim();
      if (textAfter) {
        finalParts.push({
          type: 'text',
          content: textAfter,
        });
      }
    }
  });

  return finalParts;
};

/* =======================
   Component
======================= */

export const AIMessageRenderer: React.FC<AIMessageRendererProps> = ({
  content,
  isUser = false,
}) => {
  const parts = parseMessageContent(content);

  return (
    <View style={styles.container}>
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return (
            <View key={index} style={styles.codeWrapper}>
              <CodeBlock
                code={part.content}
                language={part.language}
                maxHeight={400}
              />
            </View>
          );
        }

        if (part.type === 'inline-code') {
          return (
            <Text key={index} style={styles.inlineCode}>
              {part.content}
            </Text>
          );
        }

        // عرض النص مع معالجة الأسطر الجديدة
        const textLines = part.content.split('\n');
        return (
          <View key={index} style={styles.textWrapper}>
            {textLines.map((line, lineIndex) => (
              <Text
                key={`${index}-${lineIndex}`}
                style={[styles.text, isUser && styles.userText]}
              >
                {line}
                {lineIndex < textLines.length - 1 && '\n'}
              </Text>
            ))}
          </View>
        );
      })}
    </View>
  );
};

/* =======================
   Styles
======================= */

const styles = StyleSheet.create({
  container: {
    gap: 12,
    width: '100%',
  },
  textWrapper: {
    width: '100%',
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
    color: '#e5e7eb',
    marginBottom: 4,
  },
  userText: {
    color: '#1f2937',
  },
  codeWrapper: {
    width: '100%',
    minHeight: 50,
    marginVertical: 12,
  },
  inlineCode: {
    fontFamily: 'monospace',
    fontSize: 14,
    backgroundColor: 'rgba(139,92,246,0.2)',
    color: '#c4b5fd',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
  },
});

export default AIMessageRenderer;
