/**
 * محرر الأكواد الاحترافي - Professional Code Editor
 * ✅ محرر حقيقي مع Syntax Highlighting
 * ✅ Auto-complete dropdown حقيقي لكل اللغات
 * ✅ زر Run مع عرض النتائج
 * ✅ وضع مشروع (HTML+CSS+JS) مع معاينة ويب مباشرة
 * ✅ Language selector مضغوط
 * ✅ عنوان/وصف في dialog عند النشر
 */

import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Dimensions,
  ActivityIndicator,
  Modal,
  FlatList,
  ViewStyle,
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MaterialIcons,
  MaterialCommunityIcons,
  Ionicons,
} from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeIn,
  SlideInDown,
} from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';

import { useAuth } from '../_layout';
import { useResponsiveLayout } from '@/hooks';
import { tokenizeCode, Token, TokenType } from '@/utils/syntaxHighlighter';
import { createSnippet, updateSnippet } from '@/services/codeFeedService';
import AsyncStorage from '@/lib/platformStorage';

// قواعد النشر: الأكواد والمشاريع المنشورة يراها ويشغّلها الآخرون
const PUBLISH_RULES_KEY = '@kodax_publish_rules_accepted_v1';
const PUBLISH_RULES = [
  'لا تنشر صفحات تطلب كلمات مرور أو بيانات دفع أو معلومات شخصية.',
  'لا كود ضار أو مخفي، ولا محتوى مسيء أو مخالف.',
  'احترم حقوق الآخرين ولا تنشر عملاً ليس لك دون إذن.',
  'المحتوى المخالف يُخفى بعد البلاغات وقد يُحذف.',
];
import { executeCode } from '@/services/codeExecution';
import { WebView } from 'react-native-webview';
import MobileWebEditor, {
  type MobileWebEditorRef,
} from '@/components/editor/MobileWebEditor';

// Web-only: CodeMirror professional editor
let CodeMirrorEditor: any = null;
if (Platform.OS === 'web') {
  try {
    CodeMirrorEditor = require('@/components/editor/CodeMirrorEditor').default;
  } catch (e) {
    // Fallback to TextInput on web if CodeMirror fails to load
    CodeMirrorEditor = null;
  }
}

const { width: SW, height: SH } = Dimensions.get('window');

// ==================== Types ====================
type EditorMode = 'snippet' | 'project';
type ProjectTab = 'html' | 'css' | 'js';
interface ProjectFiles {
  html: string;
  css: string;
  js: string;
}

// ==================== Constants ====================
const LANGUAGES = [
  {
    id: 'web',
    name: 'ويب',
    full: 'مشروع ويب (HTML+CSS+JS)',
    color: '#10b981',
    icon: 'globe',
  },
  {
    id: 'javascript',
    name: 'JS',
    full: 'JavaScript',
    color: '#f7df1e',
    icon: 'logo-javascript',
  },
  {
    id: 'typescript',
    name: 'TS',
    full: 'TypeScript',
    color: '#3178c6',
    icon: 'code-slash',
  },
  {
    id: 'python',
    name: 'PY',
    full: 'Python',
    color: '#3776ab',
    icon: 'logo-python',
  },
  {
    id: 'html',
    name: 'HTML',
    full: 'HTML',
    color: '#e34c26',
    icon: 'logo-html5',
  },
  {
    id: 'react',
    name: 'JSX',
    full: 'React JSX',
    color: '#61dafb',
    icon: 'logo-react',
  },
  { id: 'cpp', name: 'C++', full: 'C++', color: '#00599c', icon: 'code-slash' },
  { id: 'java', name: 'Java', full: 'Java', color: '#ed8b00', icon: 'cafe' },
  { id: 'csharp', name: 'C#', full: 'C#', color: '#68217a', icon: 'code' },
  { id: 'php', name: 'PHP', full: 'PHP', color: '#777bb4', icon: 'server' },
  {
    id: 'swift',
    name: 'Swift',
    full: 'Swift',
    color: '#fa7343',
    icon: 'logo-apple',
  },
  {
    id: 'kotlin',
    name: 'KT',
    full: 'Kotlin',
    color: '#7f52ff',
    icon: 'logo-android',
  },
  { id: 'go', name: 'Go', full: 'Go', color: '#00add8', icon: 'code-working' },
  {
    id: 'rust',
    name: 'Rust',
    full: 'Rust',
    color: '#dea584',
    icon: 'hardware-chip',
  },
  { id: 'sql', name: 'SQL', full: 'SQL', color: '#336791', icon: 'server' },
  {
    id: 'json',
    name: 'JSON',
    full: 'JSON',
    color: '#6b7280',
    icon: 'document-text',
  },
  { id: 'dart', name: 'Dart', full: 'Dart', color: '#0175c2', icon: 'flash' },
];

const TC: Record<TokenType, string> = {
  keyword: '#c678dd',
  string: '#98c379',
  number: '#d19a66',
  function: '#61afef',
  comment: '#5c6370',
  operator: '#56b6c2',
  punctuation: '#abb2bf',
  className: '#e5c07b',
  property: '#e06c75',
  boolean: '#d19a66',
  constant: '#d19a66',
  tag: '#e06c75',
  attribute: '#d19a66',
  variable: '#e06c75',
  default: '#abb2bf',
};

// ===== Full autocomplete database for all languages =====
const AUTOCOMPLETE: Record<
  string,
  { label: string; insert: string; kind: string }[]
> = {
  javascript: [
    { label: 'console.log', insert: 'console.log($1);', kind: 'fn' },
    { label: 'console.error', insert: 'console.error($1);', kind: 'fn' },
    { label: 'console.warn', insert: 'console.warn($1);', kind: 'fn' },
    { label: 'function', insert: 'function $1($2) {\n  $3\n}', kind: 'kw' },
    { label: 'const', insert: 'const $1 = $2;', kind: 'kw' },
    { label: 'let', insert: 'let $1 = $2;', kind: 'kw' },
    { label: 'var', insert: 'var $1 = $2;', kind: 'kw' },
    { label: 'if', insert: 'if ($1) {\n  $2\n}', kind: 'kw' },
    { label: 'else if', insert: 'else if ($1) {\n  $2\n}', kind: 'kw' },
    { label: 'else', insert: 'else {\n  $1\n}', kind: 'kw' },
    {
      label: 'for',
      insert: 'for (let i = 0; i < $1; i++) {\n  $2\n}',
      kind: 'kw',
    },
    {
      label: 'for...of',
      insert: 'for (const $1 of $2) {\n  $3\n}',
      kind: 'kw',
    },
    {
      label: 'for...in',
      insert: 'for (const $1 in $2) {\n  $3\n}',
      kind: 'kw',
    },
    { label: 'while', insert: 'while ($1) {\n  $2\n}', kind: 'kw' },
    {
      label: 'switch',
      insert:
        'switch ($1) {\n  case $2:\n    $3\n    break;\n  default:\n    break;\n}',
      kind: 'kw',
    },
    {
      label: 'class',
      insert: 'class $1 {\n  constructor($2) {\n    $3\n  }\n}',
      kind: 'kw',
    },
    {
      label: 'async function',
      insert: 'async function $1($2) {\n  $3\n}',
      kind: 'kw',
    },
    { label: 'arrow function', insert: '($1) => {\n  $2\n}', kind: 'fn' },
    { label: 'async arrow', insert: 'async ($1) => {\n  $2\n}', kind: 'fn' },
    {
      label: 'try...catch',
      insert: 'try {\n  $1\n} catch (error) {\n  console.error(error);\n}',
      kind: 'kw',
    },
    { label: 'import', insert: "import { $1 } from '$2';", kind: 'kw' },
    { label: 'export', insert: 'export $1;', kind: 'kw' },
    { label: 'export default', insert: 'export default $1;', kind: 'kw' },
    { label: 'return', insert: 'return $1;', kind: 'kw' },
    {
      label: 'setTimeout',
      insert: 'setTimeout(() => {\n  $1\n}, $2);',
      kind: 'fn',
    },
    {
      label: 'setInterval',
      insert: 'setInterval(() => {\n  $1\n}, $2);',
      kind: 'fn',
    },
    {
      label: 'Promise',
      insert: 'new Promise((resolve, reject) => {\n  $1\n});',
      kind: 'fn',
    },
    {
      label: 'fetch',
      insert:
        "fetch('$1')\n  .then(res => res.json())\n  .then(data => {\n    $2\n  });",
      kind: 'fn',
    },
    {
      label: 'async fetch',
      insert:
        "const response = await fetch('$1');\nconst data = await response.json();",
      kind: 'fn',
    },
    {
      label: 'addEventListener',
      insert: "addEventListener('$1', ($2) => {\n  $3\n});",
      kind: 'fn',
    },
    {
      label: 'querySelector',
      insert: "document.querySelector('$1')",
      kind: 'fn',
    },
    {
      label: 'querySelectorAll',
      insert: "document.querySelectorAll('$1')",
      kind: 'fn',
    },
    {
      label: 'getElementById',
      insert: "document.getElementById('$1')",
      kind: 'fn',
    },
    {
      label: 'createElement',
      insert: "document.createElement('$1')",
      kind: 'fn',
    },
    { label: 'map', insert: '.map(($1) => $2)', kind: 'fn' },
    { label: 'filter', insert: '.filter(($1) => $2)', kind: 'fn' },
    { label: 'reduce', insert: '.reduce((acc, $1) => $2, $3)', kind: 'fn' },
    { label: 'forEach', insert: '.forEach(($1) => {\n  $2\n})', kind: 'fn' },
    { label: 'find', insert: '.find(($1) => $2)', kind: 'fn' },
    { label: 'includes', insert: '.includes($1)', kind: 'fn' },
    { label: 'JSON.stringify', insert: 'JSON.stringify($1)', kind: 'fn' },
    { label: 'JSON.parse', insert: 'JSON.parse($1)', kind: 'fn' },
    { label: 'Object.keys', insert: 'Object.keys($1)', kind: 'fn' },
    { label: 'Object.values', insert: 'Object.values($1)', kind: 'fn' },
    { label: 'Object.entries', insert: 'Object.entries($1)', kind: 'fn' },
    { label: 'Array.from', insert: 'Array.from($1)', kind: 'fn' },
    { label: 'Array.isArray', insert: 'Array.isArray($1)', kind: 'fn' },
    { label: 'Math.random', insert: 'Math.random()', kind: 'fn' },
    { label: 'Math.floor', insert: 'Math.floor($1)', kind: 'fn' },
    { label: 'Math.ceil', insert: 'Math.ceil($1)', kind: 'fn' },
    { label: 'Math.max', insert: 'Math.max($1)', kind: 'fn' },
    { label: 'Math.min', insert: 'Math.min($1)', kind: 'fn' },
    { label: 'template literal', insert: '`${$1}`', kind: 'sn' },
    { label: 'destructure', insert: 'const { $1 } = $2;', kind: 'sn' },
    { label: 'spread', insert: '...$1', kind: 'sn' },
    { label: 'typeof', insert: 'typeof $1', kind: 'kw' },
    { label: 'instanceof', insert: '$1 instanceof $2', kind: 'kw' },
    { label: 'this', insert: 'this.$1', kind: 'kw' },
    { label: 'new', insert: 'new $1($2)', kind: 'kw' },
    { label: 'delete', insert: 'delete $1', kind: 'kw' },
    { label: 'null', insert: 'null', kind: 'kw' },
    { label: 'undefined', insert: 'undefined', kind: 'kw' },
    { label: 'true', insert: 'true', kind: 'kw' },
    { label: 'false', insert: 'false', kind: 'kw' },
  ],
  typescript: [
    { label: 'interface', insert: 'interface $1 {\n  $2: $3;\n}', kind: 'kw' },
    { label: 'type', insert: 'type $1 = $2;', kind: 'kw' },
    { label: 'enum', insert: 'enum $1 {\n  $2,\n}', kind: 'kw' },
    { label: 'const', insert: 'const $1: $2 = $3;', kind: 'kw' },
    { label: 'let', insert: 'let $1: $2 = $3;', kind: 'kw' },
    {
      label: 'function',
      insert: 'function $1($2: $3): $4 {\n  $5\n}',
      kind: 'kw',
    },
    {
      label: 'async function',
      insert: 'async function $1($2: $3): Promise<$4> {\n  $5\n}',
      kind: 'kw',
    },
    {
      label: 'arrow function',
      insert: '($1: $2): $3 => {\n  $4\n}',
      kind: 'fn',
    },
    {
      label: 'class',
      insert: 'class $1 {\n  constructor($2) {\n    $3\n  }\n}',
      kind: 'kw',
    },
    {
      label: 'abstract class',
      insert: 'abstract class $1 {\n  abstract $2(): $3;\n}',
      kind: 'kw',
    },
    { label: 'console.log', insert: 'console.log($1);', kind: 'fn' },
    { label: 'if', insert: 'if ($1) {\n  $2\n}', kind: 'kw' },
    {
      label: 'for',
      insert: 'for (let i = 0; i < $1; i++) {\n  $2\n}',
      kind: 'kw',
    },
    {
      label: 'for...of',
      insert: 'for (const $1 of $2) {\n  $3\n}',
      kind: 'kw',
    },
    { label: 'while', insert: 'while ($1) {\n  $2\n}', kind: 'kw' },
    {
      label: 'switch',
      insert: 'switch ($1) {\n  case $2:\n    $3\n    break;\n}',
      kind: 'kw',
    },
    {
      label: 'try...catch',
      insert: 'try {\n  $1\n} catch (error) {\n  console.error(error);\n}',
      kind: 'kw',
    },
    { label: 'import', insert: "import { $1 } from '$2';", kind: 'kw' },
    { label: 'export', insert: 'export $1;', kind: 'kw' },
    { label: 'export default', insert: 'export default $1;', kind: 'kw' },
    { label: 'return', insert: 'return $1;', kind: 'kw' },
    {
      label: 'Promise',
      insert: 'new Promise<$1>((resolve, reject) => {\n  $2\n});',
      kind: 'fn',
    },
    { label: 'Record', insert: 'Record<$1, $2>', kind: 'tp' },
    { label: 'Partial', insert: 'Partial<$1>', kind: 'tp' },
    { label: 'Required', insert: 'Required<$1>', kind: 'tp' },
    { label: 'Pick', insert: 'Pick<$1, $2>', kind: 'tp' },
    { label: 'Omit', insert: 'Omit<$1, $2>', kind: 'tp' },
    { label: 'keyof', insert: 'keyof $1', kind: 'kw' },
    { label: 'typeof', insert: 'typeof $1', kind: 'kw' },
    { label: 'as', insert: 'as $1', kind: 'kw' },
    { label: 'readonly', insert: 'readonly $1', kind: 'kw' },
    { label: 'string', insert: 'string', kind: 'tp' },
    { label: 'number', insert: 'number', kind: 'tp' },
    { label: 'boolean', insert: 'boolean', kind: 'tp' },
    { label: 'void', insert: 'void', kind: 'tp' },
    { label: 'any', insert: 'any', kind: 'tp' },
    { label: 'unknown', insert: 'unknown', kind: 'tp' },
    { label: 'never', insert: 'never', kind: 'tp' },
    { label: 'null', insert: 'null', kind: 'kw' },
    { label: 'undefined', insert: 'undefined', kind: 'kw' },
    { label: 'true', insert: 'true', kind: 'kw' },
    { label: 'false', insert: 'false', kind: 'kw' },
    { label: 'map', insert: '.map(($1) => $2)', kind: 'fn' },
    { label: 'filter', insert: '.filter(($1) => $2)', kind: 'fn' },
    { label: 'reduce', insert: '.reduce((acc, $1) => $2, $3)', kind: 'fn' },
    { label: 'forEach', insert: '.forEach(($1) => {\n  $2\n})', kind: 'fn' },
    {
      label: 'fetch',
      insert:
        "const response = await fetch('$1');\nconst data = await response.json();",
      kind: 'fn',
    },
  ],
  python: [
    { label: 'print', insert: 'print($1)', kind: 'fn' },
    { label: 'input', insert: "input('$1')", kind: 'fn' },
    { label: 'def', insert: 'def $1($2):\n    $3', kind: 'kw' },
    {
      label: 'class',
      insert: 'class $1:\n    def __init__(self$2):\n        $3',
      kind: 'kw',
    },
    { label: 'if', insert: 'if $1:\n    $2', kind: 'kw' },
    { label: 'elif', insert: 'elif $1:\n    $2', kind: 'kw' },
    { label: 'else', insert: 'else:\n    $1', kind: 'kw' },
    { label: 'for', insert: 'for $1 in $2:\n    $3', kind: 'kw' },
    { label: 'for range', insert: 'for i in range($1):\n    $2', kind: 'kw' },
    { label: 'while', insert: 'while $1:\n    $2', kind: 'kw' },
    {
      label: 'try...except',
      insert: 'try:\n    $1\nexcept Exception as e:\n    print(e)',
      kind: 'kw',
    },
    {
      label: 'with open',
      insert: "with open('$1', '$2') as f:\n    $3",
      kind: 'kw',
    },
    { label: 'import', insert: 'import $1', kind: 'kw' },
    { label: 'from...import', insert: 'from $1 import $2', kind: 'kw' },
    { label: 'return', insert: 'return $1', kind: 'kw' },
    { label: 'lambda', insert: 'lambda $1: $2', kind: 'kw' },
    { label: 'list comprehension', insert: '[$1 for $2 in $3]', kind: 'sn' },
    {
      label: 'dict comprehension',
      insert: '{$1: $2 for $3 in $4}',
      kind: 'sn',
    },
    { label: 'len', insert: 'len($1)', kind: 'fn' },
    { label: 'range', insert: 'range($1)', kind: 'fn' },
    { label: 'enumerate', insert: 'enumerate($1)', kind: 'fn' },
    { label: 'zip', insert: 'zip($1, $2)', kind: 'fn' },
    { label: 'map', insert: 'map($1, $2)', kind: 'fn' },
    { label: 'filter', insert: 'filter($1, $2)', kind: 'fn' },
    { label: 'sorted', insert: 'sorted($1)', kind: 'fn' },
    { label: 'reversed', insert: 'reversed($1)', kind: 'fn' },
    { label: 'int', insert: 'int($1)', kind: 'fn' },
    { label: 'str', insert: 'str($1)', kind: 'fn' },
    { label: 'float', insert: 'float($1)', kind: 'fn' },
    { label: 'list', insert: 'list($1)', kind: 'fn' },
    { label: 'dict', insert: 'dict($1)', kind: 'fn' },
    { label: 'set', insert: 'set($1)', kind: 'fn' },
    { label: 'tuple', insert: 'tuple($1)', kind: 'fn' },
    { label: 'type', insert: 'type($1)', kind: 'fn' },
    { label: 'isinstance', insert: 'isinstance($1, $2)', kind: 'fn' },
    { label: 'append', insert: '.append($1)', kind: 'fn' },
    { label: 'extend', insert: '.extend($1)', kind: 'fn' },
    { label: 'join', insert: "'$1'.join($2)", kind: 'fn' },
    { label: 'split', insert: ".split('$1')", kind: 'fn' },
    { label: 'strip', insert: '.strip()', kind: 'fn' },
    { label: 'replace', insert: ".replace('$1', '$2')", kind: 'fn' },
    { label: 'f-string', insert: "f'$1{$2}$3'", kind: 'sn' },
    { label: 'True', insert: 'True', kind: 'kw' },
    { label: 'False', insert: 'False', kind: 'kw' },
    { label: 'None', insert: 'None', kind: 'kw' },
    { label: 'self', insert: 'self.$1', kind: 'kw' },
    { label: 'pass', insert: 'pass', kind: 'kw' },
    { label: 'break', insert: 'break', kind: 'kw' },
    { label: 'continue', insert: 'continue', kind: 'kw' },
    { label: 'yield', insert: 'yield $1', kind: 'kw' },
    {
      label: '__init__',
      insert: 'def __init__(self, $1):\n        self.$2 = $3',
      kind: 'fn',
    },
    {
      label: '__str__',
      insert: 'def __str__(self):\n        return $1',
      kind: 'fn',
    },
    { label: 'super', insert: 'super().__init__($1)', kind: 'fn' },
    {
      label: '@property',
      insert: '@property\ndef $1(self):\n    return self._$2',
      kind: 'sn',
    },
    {
      label: '@staticmethod',
      insert: '@staticmethod\ndef $1($2):\n    $3',
      kind: 'sn',
    },
    { label: 'async def', insert: 'async def $1($2):\n    $3', kind: 'kw' },
    { label: 'await', insert: 'await $1', kind: 'kw' },
  ],
  java: [
    {
      label: 'System.out.println',
      insert: 'System.out.println($1);',
      kind: 'fn',
    },
    {
      label: 'public class',
      insert: 'public class $1 {\n    $2\n}',
      kind: 'kw',
    },
    {
      label: 'public static void main',
      insert: 'public static void main(String[] args) {\n    $1\n}',
      kind: 'fn',
    },
    { label: 'public', insert: 'public $1', kind: 'kw' },
    { label: 'private', insert: 'private $1', kind: 'kw' },
    { label: 'protected', insert: 'protected $1', kind: 'kw' },
    { label: 'static', insert: 'static $1', kind: 'kw' },
    { label: 'void', insert: 'void $1($2) {\n    $3\n}', kind: 'kw' },
    { label: 'if', insert: 'if ($1) {\n    $2\n}', kind: 'kw' },
    {
      label: 'for',
      insert: 'for (int i = 0; i < $1; i++) {\n    $2\n}',
      kind: 'kw',
    },
    {
      label: 'for-each',
      insert: 'for ($1 item : $2) {\n    $3\n}',
      kind: 'kw',
    },
    { label: 'while', insert: 'while ($1) {\n    $2\n}', kind: 'kw' },
    {
      label: 'switch',
      insert:
        'switch ($1) {\n    case $2:\n        $3\n        break;\n    default:\n        break;\n}',
      kind: 'kw',
    },
    {
      label: 'try...catch',
      insert:
        'try {\n    $1\n} catch (Exception e) {\n    e.printStackTrace();\n}',
      kind: 'kw',
    },
    { label: 'import', insert: 'import $1;', kind: 'kw' },
    { label: 'return', insert: 'return $1;', kind: 'kw' },
    { label: 'new', insert: 'new $1($2)', kind: 'kw' },
    { label: 'this', insert: 'this.$1', kind: 'kw' },
    { label: 'String', insert: 'String $1 = "$2";', kind: 'tp' },
    { label: 'int', insert: 'int $1 = $2;', kind: 'tp' },
    { label: 'boolean', insert: 'boolean $1 = $2;', kind: 'tp' },
    {
      label: 'ArrayList',
      insert: 'ArrayList<$1> $2 = new ArrayList<>();',
      kind: 'tp',
    },
    {
      label: 'HashMap',
      insert: 'HashMap<$1, $2> $3 = new HashMap<>();',
      kind: 'tp',
    },
    { label: 'null', insert: 'null', kind: 'kw' },
    { label: 'true', insert: 'true', kind: 'kw' },
    { label: 'false', insert: 'false', kind: 'kw' },
    { label: 'interface', insert: 'interface $1 {\n    $2\n}', kind: 'kw' },
    { label: 'extends', insert: 'extends $1', kind: 'kw' },
    { label: 'implements', insert: 'implements $1', kind: 'kw' },
    { label: 'abstract', insert: 'abstract $1', kind: 'kw' },
    { label: 'final', insert: 'final $1', kind: 'kw' },
    { label: 'throw', insert: 'throw new $1("$2");', kind: 'kw' },
  ],
  cpp: [
    { label: 'cout', insert: 'std::cout << $1 << std::endl;', kind: 'fn' },
    { label: 'cin', insert: 'std::cin >> $1;', kind: 'fn' },
    { label: 'include', insert: '#include <$1>', kind: 'kw' },
    {
      label: 'include string',
      insert: '#include <iostream>\n#include <string>',
      kind: 'kw',
    },
    { label: 'using namespace', insert: 'using namespace std;', kind: 'kw' },
    {
      label: 'int main',
      insert: 'int main() {\n    $1\n    return 0;\n}',
      kind: 'fn',
    },
    {
      label: 'class',
      insert: 'class $1 {\npublic:\n    $1($2) {\n        $3\n    }\n};',
      kind: 'kw',
    },
    { label: 'struct', insert: 'struct $1 {\n    $2\n};', kind: 'kw' },
    { label: 'if', insert: 'if ($1) {\n    $2\n}', kind: 'kw' },
    {
      label: 'for',
      insert: 'for (int i = 0; i < $1; i++) {\n    $2\n}',
      kind: 'kw',
    },
    {
      label: 'for auto',
      insert: 'for (auto& $1 : $2) {\n    $3\n}',
      kind: 'kw',
    },
    { label: 'while', insert: 'while ($1) {\n    $2\n}', kind: 'kw' },
    {
      label: 'switch',
      insert:
        'switch ($1) {\n    case $2:\n        $3\n        break;\n    default:\n        break;\n}',
      kind: 'kw',
    },
    {
      label: 'try...catch',
      insert:
        'try {\n    $1\n} catch (const std::exception& e) {\n    std::cerr << e.what();\n}',
      kind: 'kw',
    },
    { label: 'vector', insert: 'std::vector<$1> $2;', kind: 'tp' },
    { label: 'string', insert: 'std::string $1 = "$2";', kind: 'tp' },
    { label: 'map', insert: 'std::map<$1, $2> $3;', kind: 'tp' },
    { label: 'template', insert: 'template <typename $1>\n$2', kind: 'kw' },
    { label: 'nullptr', insert: 'nullptr', kind: 'kw' },
    { label: 'auto', insert: 'auto $1 = $2;', kind: 'kw' },
    { label: 'const', insert: 'const $1', kind: 'kw' },
    { label: 'return', insert: 'return $1;', kind: 'kw' },
    { label: 'void', insert: 'void $1($2) {\n    $3\n}', kind: 'kw' },
    { label: 'new', insert: 'new $1($2)', kind: 'kw' },
    { label: 'delete', insert: 'delete $1;', kind: 'kw' },
    { label: 'true', insert: 'true', kind: 'kw' },
    { label: 'false', insert: 'false', kind: 'kw' },
    { label: 'namespace', insert: 'namespace $1 {\n    $2\n}', kind: 'kw' },
    { label: 'enum', insert: 'enum $1 {\n    $2\n};', kind: 'kw' },
  ],
  html: [
    {
      label: '!DOCTYPE',
      insert:
        '<!DOCTYPE html>\n<html lang="ar" dir="ltr">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>$1</title>\n</head>\n<body>\n  $2\n</body>\n</html>',
      kind: 'sn',
    },
    { label: 'div', insert: '<div class="$1">\n  $2\n</div>', kind: 'tg' },
    { label: 'span', insert: '<span>$1</span>', kind: 'tg' },
    { label: 'p', insert: '<p>$1</p>', kind: 'tg' },
    { label: 'h1', insert: '<h1>$1</h1>', kind: 'tg' },
    { label: 'h2', insert: '<h2>$1</h2>', kind: 'tg' },
    { label: 'h3', insert: '<h3>$1</h3>', kind: 'tg' },
    { label: 'a', insert: '<a href="$1">$2</a>', kind: 'tg' },
    { label: 'img', insert: '<img src="$1" alt="$2" />', kind: 'tg' },
    { label: 'input', insert: '<input type="$1" name="$2" />', kind: 'tg' },
    { label: 'button', insert: '<button>$1</button>', kind: 'tg' },
    {
      label: 'form',
      insert: '<form action="$1" method="$2">\n  $3\n</form>',
      kind: 'tg',
    },
    { label: 'ul', insert: '<ul>\n  <li>$1</li>\n</ul>', kind: 'tg' },
    { label: 'ol', insert: '<ol>\n  <li>$1</li>\n</ol>', kind: 'tg' },
    {
      label: 'table',
      insert:
        '<table>\n  <thead>\n    <tr>\n      <th>$1</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>$2</td>\n    </tr>\n  </tbody>\n</table>',
      kind: 'tg',
    },
    { label: 'section', insert: '<section>\n  $1\n</section>', kind: 'tg' },
    { label: 'header', insert: '<header>\n  $1\n</header>', kind: 'tg' },
    { label: 'footer', insert: '<footer>\n  $1\n</footer>', kind: 'tg' },
    { label: 'nav', insert: '<nav>\n  $1\n</nav>', kind: 'tg' },
    { label: 'main', insert: '<main>\n  $1\n</main>', kind: 'tg' },
    { label: 'article', insert: '<article>\n  $1\n</article>', kind: 'tg' },
    { label: 'script', insert: '<script>\n  $1\n</script>', kind: 'tg' },
    { label: 'script src', insert: '<script src="$1"></script>', kind: 'tg' },
    { label: 'style', insert: '<style>\n  $1\n</style>', kind: 'tg' },
    {
      label: 'link css',
      insert: '<link rel="stylesheet" href="$1" />',
      kind: 'tg',
    },
    { label: 'meta', insert: '<meta name="$1" content="$2" />', kind: 'tg' },
    { label: 'class', insert: 'class="$1"', kind: 'at' },
    { label: 'id', insert: 'id="$1"', kind: 'at' },
    { label: 'style attr', insert: 'style="$1"', kind: 'at' },
    { label: 'textarea', insert: '<textarea>$1</textarea>', kind: 'tg' },
    {
      label: 'select',
      insert: '<select>\n  <option value="$1">$2</option>\n</select>',
      kind: 'tg',
    },
    { label: 'video', insert: '<video src="$1" controls></video>', kind: 'tg' },
    { label: 'audio', insert: '<audio src="$1" controls></audio>', kind: 'tg' },
    {
      label: 'canvas',
      insert: '<canvas id="$1" width="$2" height="$3"></canvas>',
      kind: 'tg',
    },
  ],
  css: [
    {
      label: 'display: flex',
      insert: 'display: flex;\njustify-content: $1;\nalign-items: $2;',
      kind: 'pr',
    },
    {
      label: 'display: grid',
      insert: 'display: grid;\ngrid-template-columns: $1;\ngap: $2;',
      kind: 'pr',
    },
    {
      label: 'position',
      insert: 'position: $1;\ntop: $2;\nleft: $3;',
      kind: 'pr',
    },
    { label: 'margin', insert: 'margin: $1;', kind: 'pr' },
    { label: 'padding', insert: 'padding: $1;', kind: 'pr' },
    { label: 'border', insert: 'border: $1px solid $2;', kind: 'pr' },
    { label: 'border-radius', insert: 'border-radius: $1px;', kind: 'pr' },
    { label: 'background', insert: 'background: $1;', kind: 'pr' },
    { label: 'background-color', insert: 'background-color: $1;', kind: 'pr' },
    {
      label: 'background-image',
      insert: "background-image: url('$1');",
      kind: 'pr',
    },
    {
      label: 'linear-gradient',
      insert: 'background: linear-gradient($1, $2, $3);',
      kind: 'pr',
    },
    { label: 'color', insert: 'color: $1;', kind: 'pr' },
    { label: 'font-size', insert: 'font-size: $1px;', kind: 'pr' },
    { label: 'font-weight', insert: 'font-weight: $1;', kind: 'pr' },
    { label: 'font-family', insert: 'font-family: $1;', kind: 'pr' },
    { label: 'text-align', insert: 'text-align: $1;', kind: 'pr' },
    { label: 'text-decoration', insert: 'text-decoration: $1;', kind: 'pr' },
    { label: 'width', insert: 'width: $1;', kind: 'pr' },
    { label: 'height', insert: 'height: $1;', kind: 'pr' },
    { label: 'max-width', insert: 'max-width: $1;', kind: 'pr' },
    { label: 'min-height', insert: 'min-height: $1;', kind: 'pr' },
    { label: 'overflow', insert: 'overflow: $1;', kind: 'pr' },
    { label: 'z-index', insert: 'z-index: $1;', kind: 'pr' },
    { label: 'opacity', insert: 'opacity: $1;', kind: 'pr' },
    { label: 'transform', insert: 'transform: $1;', kind: 'pr' },
    { label: 'transition', insert: 'transition: $1 $2s ease;', kind: 'pr' },
    { label: 'animation', insert: 'animation: $1 $2s $3;', kind: 'pr' },
    {
      label: '@keyframes',
      insert: '@keyframes $1 {\n  0% { $2 }\n  100% { $3 }\n}',
      kind: 'sn',
    },
    {
      label: '@media',
      insert: '@media (max-width: $1px) {\n  $2\n}',
      kind: 'sn',
    },
    {
      label: 'box-shadow',
      insert: 'box-shadow: $1px $2px $3px $4;',
      kind: 'pr',
    },
    {
      label: 'text-shadow',
      insert: 'text-shadow: $1px $2px $3px $4;',
      kind: 'pr',
    },
    { label: 'cursor', insert: 'cursor: pointer;', kind: 'pr' },
    { label: 'var()', insert: 'var(--$1)', kind: 'fn' },
    { label: 'calc()', insert: 'calc($1)', kind: 'fn' },
    { label: ':root', insert: ':root {\n  --$1: $2;\n}', kind: 'sn' },
    { label: ':hover', insert: ':hover {\n  $1\n}', kind: 'sn' },
    {
      label: '::before',
      insert: "::before {\n  content: '$1';\n  $2\n}",
      kind: 'sn',
    },
    {
      label: '::after',
      insert: "::after {\n  content: '$1';\n  $2\n}",
      kind: 'sn',
    },
    { label: 'flex-direction', insert: 'flex-direction: $1;', kind: 'pr' },
    { label: 'gap', insert: 'gap: $1;', kind: 'pr' },
    { label: 'flex-wrap', insert: 'flex-wrap: wrap;', kind: 'pr' },
    { label: 'object-fit', insert: 'object-fit: cover;', kind: 'pr' },
    { label: 'list-style', insert: 'list-style: none;', kind: 'pr' },
  ],
  sql: [
    { label: 'SELECT', insert: 'SELECT $1 FROM $2;', kind: 'kw' },
    { label: 'SELECT *', insert: 'SELECT * FROM $1;', kind: 'kw' },
    { label: 'INSERT', insert: 'INSERT INTO $1 ($2) VALUES ($3);', kind: 'kw' },
    { label: 'UPDATE', insert: 'UPDATE $1 SET $2 = $3 WHERE $4;', kind: 'kw' },
    { label: 'DELETE', insert: 'DELETE FROM $1 WHERE $2;', kind: 'kw' },
    {
      label: 'CREATE TABLE',
      insert: 'CREATE TABLE $1 (\n  id SERIAL PRIMARY KEY,\n  $2\n);',
      kind: 'kw',
    },
    {
      label: 'ALTER TABLE',
      insert: 'ALTER TABLE $1 ADD COLUMN $2;',
      kind: 'kw',
    },
    { label: 'DROP TABLE', insert: 'DROP TABLE IF EXISTS $1;', kind: 'kw' },
    { label: 'WHERE', insert: 'WHERE $1 = $2', kind: 'kw' },
    { label: 'JOIN', insert: 'JOIN $1 ON $2 = $3', kind: 'kw' },
    { label: 'LEFT JOIN', insert: 'LEFT JOIN $1 ON $2 = $3', kind: 'kw' },
    { label: 'ORDER BY', insert: 'ORDER BY $1 DESC', kind: 'kw' },
    { label: 'GROUP BY', insert: 'GROUP BY $1', kind: 'kw' },
    { label: 'HAVING', insert: 'HAVING $1', kind: 'kw' },
    { label: 'LIMIT', insert: 'LIMIT $1', kind: 'kw' },
    { label: 'COUNT', insert: 'COUNT($1)', kind: 'fn' },
    { label: 'SUM', insert: 'SUM($1)', kind: 'fn' },
    { label: 'AVG', insert: 'AVG($1)', kind: 'fn' },
    { label: 'MAX', insert: 'MAX($1)', kind: 'fn' },
    { label: 'MIN', insert: 'MIN($1)', kind: 'fn' },
    { label: 'DISTINCT', insert: 'DISTINCT $1', kind: 'kw' },
    { label: 'AS', insert: 'AS $1', kind: 'kw' },
    { label: 'LIKE', insert: "LIKE '%$1%'", kind: 'kw' },
    { label: 'IN', insert: 'IN ($1)', kind: 'kw' },
    { label: 'BETWEEN', insert: 'BETWEEN $1 AND $2', kind: 'kw' },
    { label: 'IS NULL', insert: 'IS NULL', kind: 'kw' },
    { label: 'IS NOT NULL', insert: 'IS NOT NULL', kind: 'kw' },
    { label: 'AND', insert: 'AND $1', kind: 'kw' },
    { label: 'OR', insert: 'OR $1', kind: 'kw' },
    { label: 'NOT', insert: 'NOT $1', kind: 'kw' },
    {
      label: 'CASE',
      insert: 'CASE\n  WHEN $1 THEN $2\n  ELSE $3\nEND',
      kind: 'kw',
    },
    { label: 'INDEX', insert: 'CREATE INDEX $1 ON $2 ($3);', kind: 'kw' },
  ],
  react: [
    {
      label: 'useState',
      insert: 'const [$1, set$2] = useState($3);',
      kind: 'fn',
    },
    {
      label: 'useEffect',
      insert: 'useEffect(() => {\n  $1\n}, [$2]);',
      kind: 'fn',
    },
    { label: 'useRef', insert: 'const $1 = useRef($2);', kind: 'fn' },
    {
      label: 'useCallback',
      insert: 'const $1 = useCallback(($2) => {\n  $3\n}, [$4]);',
      kind: 'fn',
    },
    {
      label: 'useMemo',
      insert: 'const $1 = useMemo(() => {\n  return $2;\n}, [$3]);',
      kind: 'fn',
    },
    { label: 'useContext', insert: 'const $1 = useContext($2);', kind: 'fn' },
    {
      label: 'component',
      insert:
        'function $1({ $2 }) {\n  return (\n    <div>\n      $3\n    </div>\n  );\n}\n\nexport default $1;',
      kind: 'sn',
    },
    {
      label: 'arrow component',
      insert:
        'const $1 = ({ $2 }) => {\n  return (\n    <div>\n      $3\n    </div>\n  );\n};\n\nexport default $1;',
      kind: 'sn',
    },
    {
      label: 'return JSX',
      insert: 'return (\n  <div className="$1">\n    $2\n  </div>\n);',
      kind: 'sn',
    },
    { label: 'import React', insert: "import React from 'react';", kind: 'kw' },
    {
      label: 'props interface',
      insert: 'interface $1Props {\n  $2: $3;\n}',
      kind: 'tp',
    },
    {
      label: 'map JSX',
      insert: '{$1.map(($2) => (\n  <div key={$3}>\n    {$4}\n  </div>\n))}',
      kind: 'sn',
    },
    { label: 'conditional render', insert: '{$1 && (\n  $2\n)}', kind: 'sn' },
    {
      label: 'ternary render',
      insert: '{$1 ? (\n  $2\n) : (\n  $3\n)}',
      kind: 'sn',
    },
    {
      label: 'event handler',
      insert: 'const handle$1 = ($2) => {\n  $3\n};',
      kind: 'fn',
    },
    { label: 'className', insert: 'className="$1"', kind: 'at' },
    { label: 'onClick', insert: 'onClick={$1}', kind: 'at' },
    {
      label: 'onChange',
      insert: 'onChange={(e) => $1(e.target.value)}',
      kind: 'at',
    },
    {
      label: 'onSubmit',
      insert: 'onSubmit={(e) => {\n  e.preventDefault();\n  $1\n}}',
      kind: 'at',
    },
    { label: 'children', insert: 'children: React.ReactNode', kind: 'tp' },
    { label: 'fragment', insert: '<>\n  $1\n</>', kind: 'sn' },
    { label: 'console.log', insert: 'console.log($1);', kind: 'fn' },
  ],
  go: [
    { label: 'fmt.Println', insert: 'fmt.Println($1)', kind: 'fn' },
    { label: 'fmt.Printf', insert: 'fmt.Printf("$1\\n", $2)', kind: 'fn' },
    { label: 'func', insert: 'func $1($2) $3 {\n\t$4\n}', kind: 'kw' },
    { label: 'func main', insert: 'func main() {\n\t$1\n}', kind: 'fn' },
    { label: 'if', insert: 'if $1 {\n\t$2\n}', kind: 'kw' },
    { label: 'if err', insert: 'if err != nil {\n\treturn $1\n}', kind: 'sn' },
    {
      label: 'for',
      insert: 'for $1 := 0; $1 < $2; $1++ {\n\t$3\n}',
      kind: 'kw',
    },
    {
      label: 'for range',
      insert: 'for $1, $2 := range $3 {\n\t$4\n}',
      kind: 'kw',
    },
    {
      label: 'switch',
      insert: 'switch $1 {\ncase $2:\n\t$3\ndefault:\n\t$4\n}',
      kind: 'kw',
    },
    { label: 'struct', insert: 'type $1 struct {\n\t$2 $3\n}', kind: 'kw' },
    { label: 'interface', insert: 'type $1 interface {\n\t$2\n}', kind: 'kw' },
    { label: 'package', insert: 'package $1', kind: 'kw' },
    { label: 'import', insert: 'import (\n\t"$1"\n)', kind: 'kw' },
    { label: 'return', insert: 'return $1', kind: 'kw' },
    { label: 'var', insert: 'var $1 $2', kind: 'kw' },
    { label: 'const', insert: 'const $1 = $2', kind: 'kw' },
    { label: 'make', insert: 'make($1, $2)', kind: 'fn' },
    { label: 'append', insert: 'append($1, $2)', kind: 'fn' },
    { label: 'len', insert: 'len($1)', kind: 'fn' },
    { label: 'nil', insert: 'nil', kind: 'kw' },
    { label: 'true', insert: 'true', kind: 'kw' },
    { label: 'false', insert: 'false', kind: 'kw' },
    { label: 'goroutine', insert: 'go func() {\n\t$1\n}()', kind: 'sn' },
    { label: 'channel', insert: '$1 := make(chan $2)', kind: 'sn' },
    { label: 'defer', insert: 'defer $1', kind: 'kw' },
    { label: 'map', insert: 'map[$1]$2', kind: 'tp' },
    { label: 'slice', insert: '[]$1{$2}', kind: 'tp' },
    { label: 'error', insert: 'fmt.Errorf("$1")', kind: 'fn' },
  ],
  rust: [
    { label: 'println!', insert: 'println!("$1", $2);', kind: 'fn' },
    { label: 'fn', insert: 'fn $1($2) -> $3 {\n    $4\n}', kind: 'kw' },
    { label: 'fn main', insert: 'fn main() {\n    $1\n}', kind: 'fn' },
    { label: 'let', insert: 'let $1 = $2;', kind: 'kw' },
    { label: 'let mut', insert: 'let mut $1 = $2;', kind: 'kw' },
    { label: 'if', insert: 'if $1 {\n    $2\n}', kind: 'kw' },
    {
      label: 'match',
      insert: 'match $1 {\n    $2 => $3,\n    _ => $4,\n}',
      kind: 'kw',
    },
    { label: 'for', insert: 'for $1 in $2 {\n    $3\n}', kind: 'kw' },
    { label: 'while', insert: 'while $1 {\n    $2\n}', kind: 'kw' },
    { label: 'loop', insert: 'loop {\n    $1\n}', kind: 'kw' },
    { label: 'struct', insert: 'struct $1 {\n    $2: $3,\n}', kind: 'kw' },
    { label: 'enum', insert: 'enum $1 {\n    $2,\n}', kind: 'kw' },
    { label: 'impl', insert: 'impl $1 {\n    $2\n}', kind: 'kw' },
    {
      label: 'trait',
      insert: 'trait $1 {\n    fn $2(&self) -> $3;\n}',
      kind: 'kw',
    },
    { label: 'use', insert: 'use $1;', kind: 'kw' },
    { label: 'mod', insert: 'mod $1;', kind: 'kw' },
    { label: 'return', insert: 'return $1;', kind: 'kw' },
    { label: 'Vec', insert: 'Vec<$1>', kind: 'tp' },
    { label: 'String', insert: 'String::from("$1")', kind: 'tp' },
    { label: 'Option', insert: 'Option<$1>', kind: 'tp' },
    { label: 'Result', insert: 'Result<$1, $2>', kind: 'tp' },
    { label: 'Some', insert: 'Some($1)', kind: 'kw' },
    { label: 'None', insert: 'None', kind: 'kw' },
    { label: 'Ok', insert: 'Ok($1)', kind: 'kw' },
    { label: 'Err', insert: 'Err($1)', kind: 'kw' },
    { label: 'unwrap', insert: '.unwrap()', kind: 'fn' },
    { label: 'pub', insert: 'pub $1', kind: 'kw' },
    { label: 'mut', insert: 'mut $1', kind: 'kw' },
    { label: 'clone', insert: '.clone()', kind: 'fn' },
    { label: 'iter', insert: '.iter()', kind: 'fn' },
    { label: 'collect', insert: '.collect::<$1>()', kind: 'fn' },
  ],
  swift: [
    { label: 'print', insert: 'print($1)', kind: 'fn' },
    { label: 'func', insert: 'func $1($2) -> $3 {\n    $4\n}', kind: 'kw' },
    { label: 'var', insert: 'var $1: $2 = $3', kind: 'kw' },
    { label: 'let', insert: 'let $1: $2 = $3', kind: 'kw' },
    { label: 'if', insert: 'if $1 {\n    $2\n}', kind: 'kw' },
    { label: 'if let', insert: 'if let $1 = $2 {\n    $3\n}', kind: 'kw' },
    {
      label: 'guard let',
      insert: 'guard let $1 = $2 else {\n    return\n}',
      kind: 'kw',
    },
    { label: 'for', insert: 'for $1 in $2 {\n    $3\n}', kind: 'kw' },
    { label: 'while', insert: 'while $1 {\n    $2\n}', kind: 'kw' },
    {
      label: 'switch',
      insert: 'switch $1 {\ncase $2:\n    $3\ndefault:\n    $4\n}',
      kind: 'kw',
    },
    {
      label: 'class',
      insert: 'class $1 {\n    init($2) {\n        $3\n    }\n}',
      kind: 'kw',
    },
    { label: 'struct', insert: 'struct $1 {\n    $2\n}', kind: 'kw' },
    { label: 'enum', insert: 'enum $1 {\n    case $2\n}', kind: 'kw' },
    { label: 'protocol', insert: 'protocol $1 {\n    $2\n}', kind: 'kw' },
    { label: 'import', insert: 'import $1', kind: 'kw' },
    { label: 'return', insert: 'return $1', kind: 'kw' },
    { label: 'nil', insert: 'nil', kind: 'kw' },
    { label: 'true', insert: 'true', kind: 'kw' },
    { label: 'false', insert: 'false', kind: 'kw' },
    { label: 'self', insert: 'self.$1', kind: 'kw' },
    { label: 'optional', insert: '$1?', kind: 'tp' },
    { label: 'closure', insert: '{ ($1) -> $2 in\n    $3\n}', kind: 'sn' },
    {
      label: 'do...catch',
      insert: 'do {\n    try $1\n} catch {\n    print(error)\n}',
      kind: 'kw',
    },
  ],
  kotlin: [
    { label: 'println', insert: 'println($1)', kind: 'fn' },
    { label: 'fun', insert: 'fun $1($2): $3 {\n    $4\n}', kind: 'kw' },
    { label: 'fun main', insert: 'fun main() {\n    $1\n}', kind: 'fn' },
    { label: 'val', insert: 'val $1 = $2', kind: 'kw' },
    { label: 'var', insert: 'var $1 = $2', kind: 'kw' },
    { label: 'if', insert: 'if ($1) {\n    $2\n}', kind: 'kw' },
    { label: 'for', insert: 'for ($1 in $2) {\n    $3\n}', kind: 'kw' },
    {
      label: 'when',
      insert: 'when ($1) {\n    $2 -> $3\n    else -> $4\n}',
      kind: 'kw',
    },
    { label: 'while', insert: 'while ($1) {\n    $2\n}', kind: 'kw' },
    { label: 'class', insert: 'class $1($2) {\n    $3\n}', kind: 'kw' },
    {
      label: 'data class',
      insert: 'data class $1(\n    val $2: $3\n)',
      kind: 'kw',
    },
    { label: 'object', insert: 'object $1 {\n    $2\n}', kind: 'kw' },
    { label: 'interface', insert: 'interface $1 {\n    $2\n}', kind: 'kw' },
    { label: 'import', insert: 'import $1', kind: 'kw' },
    { label: 'return', insert: 'return $1', kind: 'kw' },
    { label: 'null', insert: 'null', kind: 'kw' },
    { label: 'true', insert: 'true', kind: 'kw' },
    { label: 'false', insert: 'false', kind: 'kw' },
    {
      label: 'try...catch',
      insert: 'try {\n    $1\n} catch (e: Exception) {\n    println(e)\n}',
      kind: 'kw',
    },
    { label: 'listOf', insert: 'listOf($1)', kind: 'fn' },
    { label: 'mutableListOf', insert: 'mutableListOf($1)', kind: 'fn' },
    { label: 'mapOf', insert: 'mapOf($1 to $2)', kind: 'fn' },
    { label: 'lambda', insert: '{ $1 -> $2 }', kind: 'sn' },
    {
      label: 'suspend fun',
      insert: 'suspend fun $1($2): $3 {\n    $4\n}',
      kind: 'kw',
    },
    {
      label: 'companion object',
      insert: 'companion object {\n    $1\n}',
      kind: 'kw',
    },
  ],
  php: [
    { label: 'echo', insert: 'echo $1;', kind: 'fn' },
    { label: 'var_dump', insert: 'var_dump($1);', kind: 'fn' },
    { label: 'print_r', insert: 'print_r($1);', kind: 'fn' },
    { label: 'function', insert: 'function $1($2) {\n    $3\n}', kind: 'kw' },
    {
      label: 'class',
      insert:
        'class $1 {\n    public function __construct($2) {\n        $3\n    }\n}',
      kind: 'kw',
    },
    { label: 'if', insert: 'if ($1) {\n    $2\n}', kind: 'kw' },
    { label: 'foreach', insert: 'foreach ($1 as $2) {\n    $3\n}', kind: 'kw' },
    {
      label: 'for',
      insert: 'for ($i = 0; $i < $1; $i++) {\n    $2\n}',
      kind: 'kw',
    },
    { label: 'while', insert: 'while ($1) {\n    $2\n}', kind: 'kw' },
    {
      label: 'switch',
      insert:
        'switch ($1) {\n    case $2:\n        $3\n        break;\n    default:\n        break;\n}',
      kind: 'kw',
    },
    {
      label: 'try...catch',
      insert:
        'try {\n    $1\n} catch (Exception $e) {\n    echo $e->getMessage();\n}',
      kind: 'kw',
    },
    { label: 'return', insert: 'return $1;', kind: 'kw' },
    { label: 'require', insert: "require_once '$1';", kind: 'kw' },
    { label: 'array', insert: 'array($1)', kind: 'fn' },
    { label: 'isset', insert: 'isset($1)', kind: 'fn' },
    { label: 'empty', insert: 'empty($1)', kind: 'fn' },
    { label: 'strlen', insert: 'strlen($1)', kind: 'fn' },
    { label: 'count', insert: 'count($1)', kind: 'fn' },
    { label: 'explode', insert: "explode('$1', $2)", kind: 'fn' },
    { label: 'implode', insert: "implode('$1', $2)", kind: 'fn' },
    { label: '$this', insert: '$this->$1', kind: 'kw' },
    { label: 'null', insert: 'null', kind: 'kw' },
    { label: 'true', insert: 'true', kind: 'kw' },
    { label: 'false', insert: 'false', kind: 'kw' },
    { label: 'public', insert: 'public $1', kind: 'kw' },
    { label: 'private', insert: 'private $1', kind: 'kw' },
    { label: 'protected', insert: 'protected $1', kind: 'kw' },
    { label: 'static', insert: 'static $1', kind: 'kw' },
  ],
  dart: [
    { label: 'print', insert: 'print($1);', kind: 'fn' },
    { label: 'void main', insert: 'void main() {\n  $1\n}', kind: 'fn' },
    { label: 'var', insert: 'var $1 = $2;', kind: 'kw' },
    { label: 'final', insert: 'final $1 = $2;', kind: 'kw' },
    { label: 'const', insert: 'const $1 = $2;', kind: 'kw' },
    { label: 'if', insert: 'if ($1) {\n  $2\n}', kind: 'kw' },
    {
      label: 'for',
      insert: 'for (var i = 0; i < $1; i++) {\n  $2\n}',
      kind: 'kw',
    },
    { label: 'for in', insert: 'for (var $1 in $2) {\n  $3\n}', kind: 'kw' },
    { label: 'while', insert: 'while ($1) {\n  $2\n}', kind: 'kw' },
    {
      label: 'switch',
      insert: 'switch ($1) {\n  case $2:\n    $3\n    break;\n}',
      kind: 'kw',
    },
    {
      label: 'class',
      insert: 'class $1 {\n  $1($2) {\n    $3\n  }\n}',
      kind: 'kw',
    },
    {
      label: 'StatelessWidget',
      insert:
        'class $1 extends StatelessWidget {\n  @override\n  Widget build(BuildContext context) {\n    return $2;\n  }\n}',
      kind: 'sn',
    },
    {
      label: 'StatefulWidget',
      insert:
        'class $1 extends StatefulWidget {\n  @override\n  State<$1> createState() => _$1State();\n}\n\nclass _$1State extends State<$1> {\n  @override\n  Widget build(BuildContext context) {\n    return $2;\n  }\n}',
      kind: 'sn',
    },
    { label: 'Future', insert: 'Future<$1> $2() async {\n  $3\n}', kind: 'fn' },
    {
      label: 'Stream',
      insert: 'Stream<$1> $2() async* {\n  $3\n}',
      kind: 'fn',
    },
    {
      label: 'try...catch',
      insert: 'try {\n  $1\n} catch (e) {\n  print(e);\n}',
      kind: 'kw',
    },
    { label: 'import', insert: "import '$1';", kind: 'kw' },
    { label: 'return', insert: 'return $1;', kind: 'kw' },
    { label: 'async', insert: 'async {\n  $1\n}', kind: 'kw' },
    { label: 'await', insert: 'await $1', kind: 'kw' },
    { label: 'null', insert: 'null', kind: 'kw' },
    { label: 'true', insert: 'true', kind: 'kw' },
    { label: 'false', insert: 'false', kind: 'kw' },
    { label: 'Map', insert: 'Map<$1, $2> $3 = {};', kind: 'tp' },
    { label: 'List', insert: 'List<$1> $2 = [];', kind: 'tp' },
    { label: 'setState', insert: 'setState(() {\n  $1\n});', kind: 'fn' },
    {
      label: 'Navigator.push',
      insert:
        'Navigator.push(context, MaterialPageRoute(builder: (context) => $1()));',
      kind: 'fn',
    },
  ],
  csharp: [
    {
      label: 'Console.WriteLine',
      insert: 'Console.WriteLine($1);',
      kind: 'fn',
    },
    { label: 'Console.ReadLine', insert: 'Console.ReadLine()', kind: 'fn' },
    { label: 'class', insert: 'class $1\n{\n    $2\n}', kind: 'kw' },
    { label: 'public', insert: 'public $1', kind: 'kw' },
    { label: 'private', insert: 'private $1', kind: 'kw' },
    { label: 'static', insert: 'static $1', kind: 'kw' },
    { label: 'void', insert: 'void $1($2)\n{\n    $3\n}', kind: 'kw' },
    {
      label: 'Main',
      insert: 'static void Main(string[] args)\n{\n    $1\n}',
      kind: 'fn',
    },
    { label: 'if', insert: 'if ($1)\n{\n    $2\n}', kind: 'kw' },
    {
      label: 'for',
      insert: 'for (int i = 0; i < $1; i++)\n{\n    $2\n}',
      kind: 'kw',
    },
    {
      label: 'foreach',
      insert: 'foreach (var $1 in $2)\n{\n    $3\n}',
      kind: 'kw',
    },
    { label: 'while', insert: 'while ($1)\n{\n    $2\n}', kind: 'kw' },
    {
      label: 'switch',
      insert:
        'switch ($1)\n{\n    case $2:\n        $3\n        break;\n    default:\n        break;\n}',
      kind: 'kw',
    },
    {
      label: 'try...catch',
      insert:
        'try\n{\n    $1\n}\ncatch (Exception ex)\n{\n    Console.WriteLine(ex.Message);\n}',
      kind: 'kw',
    },
    { label: 'using', insert: 'using $1;', kind: 'kw' },
    { label: 'namespace', insert: 'namespace $1\n{\n    $2\n}', kind: 'kw' },
    { label: 'return', insert: 'return $1;', kind: 'kw' },
    { label: 'new', insert: 'new $1($2)', kind: 'kw' },
    { label: 'string', insert: 'string $1 = "$2";', kind: 'tp' },
    { label: 'int', insert: 'int $1 = $2;', kind: 'tp' },
    { label: 'bool', insert: 'bool $1 = $2;', kind: 'tp' },
    { label: 'List', insert: 'List<$1> $2 = new List<$1>();', kind: 'tp' },
    {
      label: 'Dictionary',
      insert: 'Dictionary<$1, $2> $3 = new Dictionary<$1, $2>();',
      kind: 'tp',
    },
    { label: 'null', insert: 'null', kind: 'kw' },
    { label: 'true', insert: 'true', kind: 'kw' },
    { label: 'false', insert: 'false', kind: 'kw' },
    {
      label: 'async Task',
      insert: 'async Task $1($2)\n{\n    $3\n}',
      kind: 'kw',
    },
    { label: 'await', insert: 'await $1;', kind: 'kw' },
    { label: 'interface', insert: 'interface I$1\n{\n    $2\n}', kind: 'kw' },
    { label: 'enum', insert: 'enum $1\n{\n    $2\n}', kind: 'kw' },
    { label: 'var', insert: 'var $1 = $2;', kind: 'kw' },
    { label: 'LINQ', insert: '$1.Where(x => $2).Select(x => $3)', kind: 'fn' },
  ],
};

// Default autocomplete for languages without specific entries
const DEFAULT_AC: { label: string; insert: string; kind: string }[] = [
  { label: 'if', insert: 'if ($1) {\n  $2\n}', kind: 'kw' },
  { label: 'else', insert: 'else {\n  $1\n}', kind: 'kw' },
  { label: 'for', insert: 'for ($1) {\n  $2\n}', kind: 'kw' },
  { label: 'while', insert: 'while ($1) {\n  $2\n}', kind: 'kw' },
  { label: 'function', insert: 'function $1($2) {\n  $3\n}', kind: 'kw' },
  { label: 'class', insert: 'class $1 {\n  $2\n}', kind: 'kw' },
  { label: 'return', insert: 'return $1;', kind: 'kw' },
  { label: 'import', insert: 'import $1', kind: 'kw' },
  { label: 'true', insert: 'true', kind: 'kw' },
  { label: 'false', insert: 'false', kind: 'kw' },
  { label: 'null', insert: 'null', kind: 'kw' },
  { label: 'try', insert: 'try {\n  $1\n} catch ($2) {\n  $3\n}', kind: 'kw' },
  {
    label: 'switch',
    insert: 'switch ($1) {\n  case $2:\n    $3\n}',
    kind: 'kw',
  },
  { label: 'const', insert: 'const $1 = $2;', kind: 'kw' },
  { label: 'let', insert: 'let $1 = $2;', kind: 'kw' },
  { label: 'var', insert: 'var $1 = $2;', kind: 'kw' },
];

const PROJECT_STARTER: ProjectFiles = {
  html: `<!DOCTYPE html>
<html lang="ar" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>مشروعي</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>مرحباً بك!</h1>
    <p>ابدأ بتعديل الملفات</p>
    <button id="btn">اضغط هنا</button>
  </div>
  <script src="script.js"><\/script>
</body>
</html>`,
  css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Segoe UI', Tahoma, sans-serif;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  color: #fff; min-height: 100vh;
  display: flex; justify-content: center; align-items: center;
}
.container { text-align: center; padding: 40px; }
h1 {
  font-size: 2.5em; margin-bottom: 16px;
  background: linear-gradient(135deg, #8b5cf6, #3b82f6);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
button {
  margin-top: 24px; padding: 12px 32px; font-size: 16px;
  border: none; border-radius: 12px; background: #8b5cf6;
  color: white; cursor: pointer; transition: transform 0.2s;
}
button:hover { transform: scale(1.05); }`,
  js: `const btn = document.getElementById('btn');
btn.addEventListener('click', () => {
  alert('مرحباً من Kodax!');
});
console.log('المشروع يعمل بنجاح!');`,
};

// ==================== Helpers ====================
function getIndent(line: string): string {
  return line.match(/^(\s*)/)?.[1] || '';
}
function haptic(style: 'light' | 'medium' = 'light') {
  if (Platform.OS !== 'web') {
    try {
      Haptics.impactAsync(
        style === 'light'
          ? Haptics.ImpactFeedbackStyle.Light
          : Haptics.ImpactFeedbackStyle.Medium
      );
    } catch {}
  }
}

// Process insert template: remove $N placeholders, put cursor content
function processInsert(template: string): string {
  return template.replace(/\$\d+/g, '').replace(/\n\s*\n/g, '\n');
}

// ==================== Main Component ====================

export default function AddCodeScreen() {
  const { user } = useAuth();
  const { isLargeScreen } = useResponsiveLayout();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const codeInputRef = useRef<TextInput>(null);
  const mobileEditorRef = useRef<MobileWebEditorRef>(null);

  // ===== Keyboard height tracking for Android toolbar =====
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Get initial language from params
  const initialLang =
    typeof params.lang === 'string' &&
    LANGUAGES.find((l) => l.id === params.lang)
      ? params.lang
      : 'javascript';
  const langFromParam = !!params.lang;
  const isWebProject = initialLang === 'web';

  // Edit mode params
  const editSnippetId =
    typeof params.editId === 'string' ? params.editId : null;
  const editOwnerId =
    typeof params.ownerId === 'string' ? params.ownerId : null;
  const editCode = typeof params.code === 'string' ? params.code : null;
  const editLang = typeof params.editLang === 'string' ? params.editLang : null;
  const editTitle =
    typeof params.editTitle === 'string' ? params.editTitle : '';
  const editDesc = typeof params.editDesc === 'string' ? params.editDesc : '';
  const isEditMode = !!editSnippetId;
  const isOwnerEdit = isEditMode && editOwnerId === user?.id;

  // Mode - auto-set to 'project' if web is selected
  const [mode, setMode] = useState<EditorMode>(
    isWebProject ? 'project' : 'snippet'
  );

  // Snippet state
  const [language, setLanguage] = useState(
    editLang || (isWebProject ? 'javascript' : initialLang)
  );
  const [code, setCode] = useState(editCode || '');

  // Project state
  const [activeTab, setActiveTab] = useState<ProjectTab>('html');
  const [projectFiles, setProjectFiles] = useState<ProjectFiles>({
    ...PROJECT_STARTER,
  });

  // Autocomplete
  const [acItems, setAcItems] = useState<
    { label: string; insert: string; kind: string }[]
  >([]);
  const [acVisible, setAcVisible] = useState(false);
  const [cursorPos, setCursorPos] = useState(0);

  // Run / Preview
  const [showRunPanel, setShowRunPanel] = useState(false);
  const [runOutput, setRunOutput] = useState('');
  const [showWebPreview, setShowWebPreview] = useState(false);

  // Publish dialog
  const [showPublish, setShowPublish] = useState(false);
  const [pubTitle, setPubTitle] = useState(editTitle);
  const [pubDesc, setPubDesc] = useState(editDesc);
  const [publishing, setPublishing] = useState(false);
  const [rulesAccepted, setRulesAccepted] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PUBLISH_RULES_KEY)
      .then((v: string | null) => setRulesAccepted(v === '1'))
      .catch(() => {});
  }, []);

  const toggleRules = useCallback(() => {
    setRulesAccepted((prev) => {
      const next = !prev;
      AsyncStorage.setItem(PUBLISH_RULES_KEY, next ? '1' : '0').catch(() => {});
      return next;
    });
  }, []);
  const [saving, setSaving] = useState(false);

  // UI
  const [copied, setCopied] = useState(false);

  const selectedLang = LANGUAGES.find((l) => l.id === language) || LANGUAGES[0];
  const activeCode = mode === 'project' ? projectFiles[activeTab] : code;
  const activeLang = mode === 'project' ? activeTab : language;
  const lineCount = useMemo(() => activeCode.split('\n').length, [activeCode]);

  // ===== Syntax tokens =====
  const tokens = useMemo(
    () => tokenizeCode(activeCode, activeLang),
    [activeCode, activeLang]
  );
  const lines = useMemo(() => activeCode.split('\n'), [activeCode]);

  // ===== Autocomplete engine =====
  useEffect(() => {
    if (!activeCode || cursorPos === 0) {
      setAcItems([]);
      setAcVisible(false);
      return;
    }
    const before = activeCode.slice(0, cursorPos);
    const parts = before.split(/[\s\n\r\t{}()\[\];,.<>!@#$%^&*+=|?\/~`"':]+/);
    const word = parts[parts.length - 1]?.toLowerCase() || '';
    if (word.length < 1) {
      setAcItems([]);
      setAcVisible(false);
      return;
    }

    const db = AUTOCOMPLETE[activeLang] || DEFAULT_AC;
    const matches = db
      .filter(
        (item) =>
          item.label.toLowerCase().includes(word) &&
          item.label.toLowerCase() !== word
      )
      .slice(0, 10);

    setAcItems(matches);
    setAcVisible(matches.length > 0);
  }, [activeCode, cursorPos, activeLang]);

  // Insert autocomplete item
  const insertAcItem = useCallback(
    (item: { label: string; insert: string }) => {
      const processed = processInsert(item.insert);

      if (Platform.OS !== 'web' && mobileEditorRef.current) {
        // Mobile: replace word via WebView editor
        mobileEditorRef.current.replaceWord(processed);
      } else {
        // Web: replace via TextInput / CodeMirror
        const cur = mode === 'project' ? projectFiles[activeTab] : code;
        const before = cur.slice(0, cursorPos);
        const after = cur.slice(cursorPos);
        const parts = before.split(
          /[\s\n\r\t{}()\[\];,.<>!@#$%^&*+=|?\/~`"':]+/
        );
        const word = parts[parts.length - 1] || '';
        const insertionPt = before.length - word.length;
        const newCode = cur.slice(0, insertionPt) + processed + after;
        if (mode === 'project') {
          setProjectFiles({ ...projectFiles, [activeTab]: newCode });
        } else {
          setCode(newCode);
        }
        setCursorPos(insertionPt + processed.length);
      }
      setAcVisible(false);
      setAcItems([]);
      haptic();
    },
    [code, cursorPos, mode, projectFiles, activeTab]
  );

  // Handle code change — auto-indent is now handled inside WebView
  const handleCodeChange = useCallback(
    (newCode: string) => {
      if (mode === 'project')
        setProjectFiles({ ...projectFiles, [activeTab]: newCode });
      else setCode(newCode);
    },
    [mode, projectFiles, activeTab]
  );

  // Quick insert char with auto-close
  const insertChar = useCallback(
    (char: string) => {
      const pairs: Record<string, string> = {
        '{': '{}',
        '(': '()',
        '[': '[]',
        '"': '""',
        "'": "''",
        '<': '<>',
        '`': '``',
      };
      const insertText = pairs[char] || char;
      const cursorBackOffset = pairs[char] ? insertText.length - 1 : 0;

      if (Platform.OS !== 'web' && mobileEditorRef.current) {
        // Mobile: insert via WebView editor
        mobileEditorRef.current.insertText(insertText, cursorBackOffset);
        mobileEditorRef.current.focus();
      } else {
        // Web: insert via TextInput / CodeMirror
        const cur = mode === 'project' ? projectFiles[activeTab] : code;
        const before = cur.slice(0, cursorPos);
        const after = cur.slice(cursorPos);
        const newCode = before + insertText + after;
        if (mode === 'project')
          setProjectFiles({ ...projectFiles, [activeTab]: newCode });
        else setCode(newCode);
        setCursorPos(cursorPos + (pairs[char] ? 1 : char.length));
        codeInputRef.current?.focus();
      }
      haptic();
    },
    [code, cursorPos, mode, projectFiles, activeTab]
  );

  // Copy
  const handleCopy = useCallback(async () => {
    if (mode === 'project') {
      const combined = `<!-- HTML -->\n${projectFiles.html}\n\n/* CSS */\n${projectFiles.css}\n\n// JS\n${projectFiles.js}`;
      await Clipboard.setStringAsync(combined);
    } else {
      await Clipboard.setStringAsync(code);
    }
    setCopied(true);
    haptic('medium');
    setTimeout(() => setCopied(false), 2000);
  }, [code, mode, projectFiles]);

  // ===== Run / Execute =====
  const handleRun = useCallback(async () => {
    if (mode === 'project') {
      // Show web preview for project mode
      setShowWebPreview(true);
      haptic('medium');
      return;
    }
    // For snippet mode: execute code
    setShowRunPanel(true);
    haptic('medium');
    try {
      const lang = activeLang;
      if (lang === 'javascript' || lang === 'typescript' || lang === 'react') {
        // Client-side execution for JS/TS/React
        const logs: string[] = [];
        const fakeConsole = {
          log: (...args: any[]) =>
            logs.push(
              args
                .map((a) =>
                  typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
                )
                .join(' ')
            ),
          error: (...args: any[]) =>
            logs.push('[خطأ] ' + args.map((a) => String(a)).join(' ')),
          warn: (...args: any[]) =>
            logs.push('[تحذير] ' + args.map((a) => String(a)).join(' ')),
          info: (...args: any[]) =>
            logs.push('[معلومة] ' + args.map((a) => String(a)).join(' ')),
        };
        const safeCode = code
          .replace(/console\.log/g, '__c.log')
          .replace(/console\.error/g, '__c.error')
          .replace(/console\.warn/g, '__c.warn')
          .replace(/console\.info/g, '__c.info');
        try {
          const fn = new Function('__c', safeCode);
          const result = fn(fakeConsole);
          if (result !== undefined && logs.length === 0) {
            logs.push('→ ' + String(result));
          }
        } catch (e: any) {
          logs.push('[خطأ] خطأ: ' + (e.message || String(e)));
        }
        setRunOutput(
          logs.length > 0
            ? logs.join('\n')
            : '[نجاح] تم التنفيذ بنجاح (لا يوجد إخراج)'
        );
      } else if (lang === 'html') {
        // For HTML, show web preview
        setShowRunPanel(false);
        setShowWebPreview(true);
      } else {
        // Execute via Piston API for all other languages
        setRunOutput('جاري تنفيذ الكود...');
        try {
          const result = await executeCode({ language: lang, code });
          if (result.success) {
            const output = result.output?.trim();
            setRunOutput(
              output
                ? `[نجاح] النتيجة:\n${output}`
                : '[نجاح] تم التنفيذ بنجاح (لا يوجد إخراج)'
            );
          } else {
            setRunOutput(
              `[خطأ] خطأ في التنفيذ:\n${result.error || 'خطأ غير معروف'}`
            );
          }
        } catch (execError: any) {
          setRunOutput(
            `[خطأ] فشل الاتصال بخادم التنفيذ:\n${execError.message || 'تحقق من اتصال الإنترنت'}`
          );
        }
      }
    } catch (e: any) {
      setRunOutput('[خطأ] خطأ: ' + (e.message || String(e)));
    }
  }, [code, mode, activeLang, projectFiles, selectedLang.full]);

  // Build web preview HTML
  const webPreviewHtml = useMemo(() => {
    if (mode === 'project') {
      return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${projectFiles.css}</style></head>
<body>${projectFiles.html.replace(/<link[^>]*href=["']style\.css["'][^>]*\/?>/gi, '').replace(/<script[^>]*src=["']script\.js["'][^>]*><\/script>/gi, '')}
<script>${projectFiles.js}<\/script></body></html>`;
    }
    if (activeLang === 'html') {
      return code;
    }
    return '';
  }, [mode, projectFiles, code, activeLang]);

  // Back handler
  const handleBack = useCallback(() => {
    const hasCode =
      mode === 'project'
        ? projectFiles.html !== PROJECT_STARTER.html ||
          projectFiles.css !== PROJECT_STARTER.css ||
          projectFiles.js !== PROJECT_STARTER.js
        : code.trim().length > 0;
    if (hasCode) setShowPublish(true);
    else router.back();
  }, [code, mode, projectFiles]);

  // Publish or Update
  const handlePublish = useCallback(async () => {
    if (!user?.id || !pubTitle.trim()) return;
    setPublishing(true);
    haptic('medium');
    const finalCode =
      mode === 'project'
        ? `<!-- HTML -->\n${projectFiles.html}\n\n<style>\n${projectFiles.css}\n</style>\n\n<script>\n${projectFiles.js}\n<\/script>`
        : code;

    let result: { id?: string | null; error?: string | null };
    if (isEditMode && isOwnerEdit && editSnippetId) {
      // Owner editing their own code → update in place
      const { error } = await updateSnippet(editSnippetId, {
        title: pubTitle.trim(),
        description: pubDesc.trim() || undefined,
        code: finalCode,
        language: mode === 'project' ? 'html' : language,
      });
      result = { id: editSnippetId, error };
    } else {
      // New snippet or fork
      result = await createSnippet({
        userId: user.id,
        title: pubTitle.trim(),
        description: pubDesc.trim() || undefined,
        code: finalCode,
        language: mode === 'project' ? 'html' : language,
        isPublic: true,
      });
    }

    setPublishing(false);
    if (!result.error && result.id) {
      setShowPublish(false);
      router.back();
    }
  }, [
    user?.id,
    pubTitle,
    pubDesc,
    code,
    language,
    mode,
    projectFiles,
    isEditMode,
    isOwnerEdit,
    editSnippetId,
  ]);

  // Save draft
  const handleDraft = useCallback(async () => {
    if (!user?.id || !pubTitle.trim()) return;
    setSaving(true);
    const finalCode =
      mode === 'project'
        ? `<!-- HTML -->\n${projectFiles.html}\n\n<style>\n${projectFiles.css}\n</style>\n\n<script>\n${projectFiles.js}\n<\/script>`
        : code;
    const { error } = await createSnippet({
      userId: user.id,
      title: pubTitle.trim(),
      description: pubDesc.trim() || undefined,
      code: finalCode,
      language: mode === 'project' ? 'html' : language,
      isPublic: false,
    });
    setSaving(false);
    if (!error) {
      setShowPublish(false);
      router.back();
    }
  }, [user?.id, pubTitle, pubDesc, code, language, mode, projectFiles]);

  // Autocomplete kind icon
  const getKindIcon = (kind: string) => {
    switch (kind) {
      case 'fn':
        return { icon: 'cube-outline' as const, color: '#61afef' };
      case 'kw':
        return { icon: 'key-outline' as const, color: '#c678dd' };
      case 'tp':
        return { icon: 'shapes-outline' as const, color: '#e5c07b' };
      case 'sn':
        return { icon: 'code-slash' as const, color: '#98c379' };
      case 'tg':
        return { icon: 'pricetag-outline' as const, color: '#e06c75' };
      case 'at':
        return { icon: 'at-outline' as const, color: '#d19a66' };
      case 'pr':
        return { icon: 'brush-outline' as const, color: '#56b6c2' };
      default:
        return { icon: 'code-outline' as const, color: '#abb2bf' };
    }
  };

  // ==================== RENDER ====================
  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[s.container, isLargeScreen && wS.container]}>
          {/* ===== HEADER ===== */}
          <View style={s.header}>
            <TouchableOpacity style={s.hBtn} onPress={handleBack}>
              <Ionicons name="arrow-back" size={22} color="#d1d5db" />
            </TouchableOpacity>

            <View style={s.headerCenter}>
              <MaterialCommunityIcons
                name={mode === 'project' ? 'folder-open' : 'code-tags'}
                size={18}
                color="#8b5cf6"
              />
              <Text style={s.headerTitle}>
                {mode === 'project'
                  ? '\u0645\u0634\u0631\u0648\u0639 \u0648\u064a\u0628'
                  : '\u0645\u062d\u0631\u0631 \u0627\u0644\u0623\u0643\u0648\u0627\u062f'}
              </Text>
            </View>

            <View style={s.hRight}>
              <TouchableOpacity style={s.hBtn} onPress={handleCopy}>
                <Ionicons
                  name={copied ? 'checkmark' : 'copy-outline'}
                  size={18}
                  color={copied ? '#10b981' : '#d1d5db'}
                />
              </TouchableOpacity>
              <TouchableOpacity style={s.runBtn} onPress={handleRun}>
                <Ionicons name="play" size={16} color="#10b981" />
                <Text style={s.runBtnTxt}>تشغيل</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.pubBtn}
                onPress={() => setShowPublish(true)}
              >
                <MaterialIcons
                  name={isOwnerEdit ? 'save' : 'publish'}
                  size={16}
                  color="#fff"
                />
                <Text style={s.pubBtnTxt}>{isOwnerEdit ? 'تحديث' : 'نشر'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ===== LANGUAGE STRIP ===== */}
          {mode === 'snippet' && !langFromParam && (
            <FlatList
              data={LANGUAGES}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(i) => i.id}
              style={s.langStrip}
              contentContainerStyle={s.langStripInner}
              renderItem={({ item }) => {
                const on = language === item.id;
                return (
                  <TouchableOpacity
                    style={[
                      s.langChip,
                      on && {
                        backgroundColor: item.color + '25',
                        borderColor: item.color,
                      },
                    ]}
                    onPress={() => {
                      setLanguage(item.id);
                      haptic();
                    }}
                  >
                    <View
                      style={[
                        s.langDot,
                        { backgroundColor: on ? item.color : '#4b5563' },
                      ]}
                    />
                    <Text style={[s.langTxt, on && { color: item.color }]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}

          {/* ===== SELECTED LANGUAGE BADGE (when lang from param) ===== */}
          {mode === 'snippet' && langFromParam && (
            <View style={s.selectedLangBadge}>
              <View
                style={[
                  s.selectedLangIcon,
                  { backgroundColor: selectedLang.color + '30' },
                ]}
              >
                <Ionicons
                  name={selectedLang.icon as any}
                  size={20}
                  color={selectedLang.color}
                />
              </View>
              <View style={s.selectedLangTextWrap}>
                <Text style={s.selectedLangLabel}>لغة البرمجة</Text>
                <Text
                  style={[s.selectedLangName, { color: selectedLang.color }]}
                >
                  {selectedLang.full}
                </Text>
              </View>
              <View
                style={[
                  s.selectedLangDot,
                  { backgroundColor: selectedLang.color },
                ]}
              />
            </View>
          )}

          {/* ===== PROJECT TABS ===== */}
          {mode === 'project' && (
            <View style={s.projTabs}>
              {(['html', 'css', 'js'] as ProjectTab[]).map((tab) => {
                const on = activeTab === tab;
                const c =
                  tab === 'html'
                    ? '#e34c26'
                    : tab === 'css'
                      ? '#1572b6'
                      : '#f7df1e';
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[
                      s.projTab,
                      on && {
                        borderBottomColor: c,
                        backgroundColor: '#1a1a3e',
                      },
                    ]}
                    onPress={() => {
                      setActiveTab(tab);
                      // Push new tab's code to WebView
                      if (Platform.OS !== 'web' && mobileEditorRef.current) {
                        mobileEditorRef.current.setCodeExternal(
                          projectFiles[tab]
                        );
                      }
                      haptic();
                    }}
                  >
                    <View style={[s.projTabDot, { backgroundColor: c }]} />
                    <Text style={[s.projTabTxt, on && { color: '#fff' }]}>
                      {tab === 'html'
                        ? 'index.html'
                        : tab === 'css'
                          ? 'style.css'
                          : 'script.js'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* ===== STATUS BAR ===== */}
          <View style={s.statusBar}>
            <View style={s.statusL}>
              <View style={s.dots}>
                <View style={[s.dot, { backgroundColor: '#ef4444' }]} />
                <View style={[s.dot, { backgroundColor: '#f59e0b' }]} />
                <View style={[s.dot, { backgroundColor: '#10b981' }]} />
              </View>
              <Text style={s.fileName}>
                {mode === 'project'
                  ? activeTab === 'html'
                    ? 'index.html'
                    : activeTab === 'css'
                      ? 'style.css'
                      : 'script.js'
                  : `main.${selectedLang.id === 'react' ? 'jsx' : selectedLang.id === 'csharp' ? 'cs' : selectedLang.id}`}
              </Text>
            </View>
            <Text style={s.statusInfo}>
              {lineCount} سطر • {activeCode.length} حرف
            </Text>
          </View>

          {/* ===== CODE EDITOR ===== */}
          <View style={[s.editorWrap, isLargeScreen && wS.editorWrap]}>
            {/* Web: CodeMirror professional editor */}
            {Platform.OS === 'web' && CodeMirrorEditor ? (
              <CodeMirrorEditor
                code={activeCode}
                language={activeLang}
                onChange={handleCodeChange}
              />
            ) : (
              /* Mobile: WebView-based editor (no text duplication!) */
              <MobileWebEditor
                ref={mobileEditorRef}
                initialCode={activeCode}
                language={activeLang}
                onChange={handleCodeChange}
                onCursorChange={(pos: number) => setCursorPos(pos)}
              />
            )}

            {/* ===== AUTOCOMPLETE DROPDOWN (mobile only) ===== */}
            {Platform.OS !== 'web' && acVisible && (
              <Animated.View
                entering={FadeIn.duration(150)}
                style={s.acDropdown}
              >
                <View style={s.acHeader}>
                  <Ionicons name="bulb-outline" size={12} color="#f59e0b" />
                  <Text style={s.acHeaderTxt}>اقتراحات</Text>
                  <TouchableOpacity onPress={() => setAcVisible(false)}>
                    <Ionicons name="close" size={14} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                <ScrollView
                  style={s.acList}
                  keyboardShouldPersistTaps="always"
                  nestedScrollEnabled
                >
                  {acItems.map((item, i) => {
                    const ki = getKindIcon(item.kind);
                    return (
                      <TouchableOpacity
                        key={i}
                        style={s.acItem}
                        onPress={() => insertAcItem(item)}
                      >
                        <Ionicons name={ki.icon} size={14} color={ki.color} />
                        <Text style={s.acLabel}>{item.label}</Text>
                        <Text style={s.acKind}>
                          {item.kind === 'fn'
                            ? 'دالة'
                            : item.kind === 'kw'
                              ? 'كلمة'
                              : item.kind === 'sn'
                                ? 'قالب'
                                : item.kind === 'tp'
                                  ? 'نوع'
                                  : item.kind === 'tg'
                                    ? 'وسم'
                                    : item.kind === 'pr'
                                      ? 'خاصية'
                                      : 'آخر'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </Animated.View>
            )}
          </View>

          {/* ===== BOTTOM TOOLBAR (mobile only) ===== */}
          {Platform.OS !== 'web' && (
            <View
              style={[
                s.bottomBar,
                keyboardHeight > 0
                  ? Platform.OS === 'android' && {
                      paddingBottom: keyboardHeight,
                    }
                  : { paddingBottom: Math.max(4, insets.bottom) },
              ]}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.qInsertRow}
                keyboardShouldPersistTaps="always"
              >
                {[
                  '  ',
                  '{',
                  '}',
                  '(',
                  ')',
                  '[',
                  ']',
                  '<',
                  '>',
                  '/',
                  ';',
                  ':',
                  '"',
                  "'",
                  '`',
                  '=',
                  '.',
                  ',',
                  '!',
                  '&',
                  '|',
                  '#',
                  '_',
                  '-',
                ].map((c, i) => (
                  <TouchableOpacity
                    key={i}
                    style={s.qKey}
                    onPress={() => insertChar(c)}
                  >
                    <Text style={s.qKeyTxt}>{c === '  ' ? '⇥' : c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* ===== RUN OUTPUT PANEL ===== */}
        <Modal
          visible={showRunPanel}
          transparent
          animationType="slide"
          onRequestClose={() => setShowRunPanel(false)}
        >
          <TouchableOpacity
            style={s.overlay}
            activeOpacity={1}
            onPress={() => setShowRunPanel(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {}}
              style={[s.runPanel, isLargeScreen && wS.dialog]}
            >
              <View style={s.panelHandle} />
              <View style={s.runPanelHeader}>
                <Text style={s.runPanelTitle}>الإخراج</Text>
                <TouchableOpacity onPress={() => setShowRunPanel(false)}>
                  <Ionicons name="close-circle" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <ScrollView style={s.outputScroll}>
                <Text style={s.outputText} selectable>
                  {runOutput}
                </Text>
              </ScrollView>
              <View style={s.runPanelActions}>
                <TouchableOpacity
                  style={s.runAgainBtn}
                  onPress={() => {
                    setShowRunPanel(false);
                    setTimeout(handleRun, 200);
                  }}
                >
                  <Ionicons name="refresh" size={16} color="#8b5cf6" />
                  <Text style={s.runAgainTxt}>إعادة التشغيل</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.closeOutputBtn}
                  onPress={() => setShowRunPanel(false)}
                >
                  <Text style={s.closeOutputTxt}>إغلاق</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* ===== WEB PREVIEW (for projects & HTML) ===== */}
        <Modal
          visible={showWebPreview}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setShowWebPreview(false)}
        >
          <SafeAreaView style={s.previewSafe}>
            <View style={s.previewHeader}>
              <TouchableOpacity
                style={s.hBtn}
                onPress={() => setShowWebPreview(false)}
              >
                <Ionicons name="close" size={22} color="#d1d5db" />
              </TouchableOpacity>
              <Text style={s.previewTitle}>معاينة المشروع</Text>
              <TouchableOpacity
                style={s.hBtn}
                onPress={() => {
                  setShowWebPreview(false);
                  setTimeout(() => setShowWebPreview(true), 100);
                }}
              >
                <Ionicons name="refresh" size={20} color="#d1d5db" />
              </TouchableOpacity>
            </View>
            {Platform.OS === 'web' ? (
              <View style={s.iframeWrap}>
                {/* @ts-ignore - dangerouslySetInnerHTML for web only */}
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#ffffff',
                    borderRadius: 8,
                    overflow: 'hidden',
                  }}
                >
                  <iframe
                    srcDoc={webPreviewHtml}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    sandbox="allow-scripts allow-same-origin"
                    title="preview"
                  />
                </div>
              </View>
            ) : (
              <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <WebView
                  source={{ html: webPreviewHtml }}
                  style={{ flex: 1 }}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  startInLoadingState={true}
                  scalesPageToFit={true}
                  originWhitelist={['*']}
                />
              </View>
            )}
          </SafeAreaView>
        </Modal>

        {/* ===== PUBLISH DIALOG ===== */}
        <Modal
          visible={showPublish}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPublish(false)}
        >
          <KeyboardAvoidingView
            style={s.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <TouchableOpacity
              style={s.overlay}
              activeOpacity={1}
              onPress={() => setShowPublish(false)}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {}}
                style={[s.pubSheet, isLargeScreen && wS.dialog]}
              >
                <View style={s.panelHandle} />
                <Text style={s.pubSheetTitle}>نشر الكود</Text>
                <Text style={s.pubSheetSub}>
                  أضف عنوان ووصف للكود قبل النشر
                </Text>

                <Text style={s.fieldLabel}>عنوان الكود *</Text>
                <TextInput
                  style={[
                    s.fieldInput,
                    Platform.OS === 'web' && ({ outline: 'none' } as any),
                  ]}
                  placeholder="مثال: دالة ترتيب المصفوفات"
                  placeholderTextColor="#4b5563"
                  value={pubTitle}
                  onChangeText={setPubTitle}
                  maxLength={100}
                  autoFocus
                />

                <Text style={s.fieldLabel}>
                  وصف{' '}
                  <Text style={{ color: '#4b5563', fontSize: 12 }}>
                    (اختياري)
                  </Text>
                </Text>
                <TextInput
                  style={[
                    s.fieldInput,
                    s.fieldDesc,
                    Platform.OS === 'web' && ({ outline: 'none' } as any),
                  ]}
                  placeholder="اشرح ما يفعله الكود..."
                  placeholderTextColor="#4b5563"
                  value={pubDesc}
                  onChangeText={setPubDesc}
                  maxLength={500}
                  multiline
                  numberOfLines={3}
                />

                <View style={s.pubPreview}>
                  <View
                    style={[
                      s.pubPreviewDot,
                      { backgroundColor: selectedLang.color },
                    ]}
                  />
                  <Text style={s.pubPreviewLang}>
                    {mode === 'project' ? 'مشروع HTML' : selectedLang.full}
                  </Text>
                  <Text style={s.pubPreviewLines}>{lineCount} سطر</Text>
                </View>

                <TouchableOpacity
                  style={s.rulesBox}
                  onPress={toggleRules}
                  activeOpacity={0.8}
                >
                  <View style={s.rulesHeader}>
                    <Ionicons
                      name={rulesAccepted ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={rulesAccepted ? '#10b981' : '#9ca3af'}
                    />
                    <Text style={s.rulesTitle}>أوافق على قواعد النشر</Text>
                  </View>
                  {PUBLISH_RULES.map((rule) => (
                    <Text key={rule} style={s.rulesItem}>
                      • {rule}
                    </Text>
                  ))}
                </TouchableOpacity>

                <View style={s.pubActions}>
                  <TouchableOpacity
                    style={s.discardBtn}
                    onPress={() => {
                      setShowPublish(false);
                      router.back();
                    }}
                  >
                    <MaterialIcons
                      name="delete-outline"
                      size={16}
                      color="#ef4444"
                    />
                    <Text style={s.discardTxt}>تجاهل</Text>
                  </TouchableOpacity>
                  {!isEditMode && (
                    <TouchableOpacity
                      style={[s.draftBtn, !pubTitle.trim() && s.disabled]}
                      onPress={handleDraft}
                      disabled={!pubTitle.trim() || saving}
                    >
                      {saving ? (
                        <ActivityIndicator size="small" color="#9ca3af" />
                      ) : (
                        <Text style={s.draftTxt}>مسودة</Text>
                      )}
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[
                      s.pubDialogBtn,
                      (!pubTitle.trim() || !rulesAccepted) && s.disabled,
                    ]}
                    onPress={handlePublish}
                    disabled={!pubTitle.trim() || !rulesAccepted || publishing}
                  >
                    {publishing ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <MaterialIcons
                          name={isOwnerEdit ? 'save' : 'publish'}
                          size={16}
                          color="#fff"
                        />
                        <Text style={s.pubDialogTxt}>
                          {isOwnerEdit ? 'تحديث الكود' : 'نشر'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={s.cancelBtn}
                  onPress={() => setShowPublish(false)}
                >
                  <Text style={s.cancelTxt}>إلغاء - العودة للتحرير</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ==================== Styles ====================
const MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const s = StyleSheet.create({
  rulesBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 4,
  },
  rulesHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  rulesTitle: { color: '#e5e7eb', fontSize: 14, fontWeight: '700' },
  rulesItem: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'right',
    lineHeight: 18,
  },
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: '#0f0f1e' },
  container: { flex: 1, backgroundColor: '#0f0f1e' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a3e',
  },
  hBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1a3e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  runBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#10b98120',
    borderWidth: 1,
    borderColor: '#10b98140',
  },
  runBtnTxt: { fontSize: 12, fontWeight: '700', color: '#10b981' },
  pubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#8b5cf6',
  },
  pubBtnTxt: { fontSize: 12, fontWeight: '700', color: '#fff' },

  // Header center
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Language strip
  langStrip: {
    maxHeight: 38,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a3e',
  },
  langStripInner: {
    paddingHorizontal: 10,
    gap: 5,
    alignItems: 'center',
    height: 38,
  },
  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: '#141428',
    borderWidth: 1,
    borderColor: '#252550',
  },
  langDot: { width: 5, height: 5, borderRadius: 2.5 },
  langTxt: { fontSize: 11, fontWeight: '700', color: '#6b7280' },

  // Selected language badge (when lang from param)
  selectedLangBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 12,
    backgroundColor: '#141428',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#252550',
  },
  selectedLangIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedLangTextWrap: {
    flex: 1,
  },
  selectedLangLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 2,
  },
  selectedLangName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  selectedLangDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Project tabs
  projTabs: {
    flexDirection: 'row',
    backgroundColor: '#0d0d1a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e3a',
  },
  projTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  projTabDot: { width: 7, height: 7, borderRadius: 3.5 },
  projTabTxt: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    fontFamily: MONO,
  },

  // Status bar
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: '#0a0a16',
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e3a',
  },
  statusL: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  fileName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
    fontFamily: MONO,
  },
  statusInfo: { fontSize: 10, color: '#4b5563' },

  // Editor
  editorWrap: { flex: 1, overflow: 'hidden', position: 'relative' },
  editorScroll: { flex: 1, backgroundColor: '#0d0d1a' },
  editorRow: { flexDirection: 'row', minWidth: SW, minHeight: SH * 0.45 },
  lineNums: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    backgroundColor: '#08081a',
    borderRightWidth: 1,
    borderRightColor: '#1e1e3a',
    alignItems: 'flex-end',
    minWidth: 36,
  },
  lineNum: {
    fontSize: 12,
    lineHeight: 20,
    color: '#374151',
    fontFamily: MONO,
    textAlign: 'right',
  },
  codeArea: {
    flex: 1,
    minWidth: SW - 50,
    minHeight: SH * 0.45,
    position: 'relative',
    textAlign: 'left' as const,
    writingDirection: 'ltr' as const,
    direction: 'ltr' as any,
  },
  hlLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 10,
    zIndex: 1,
    direction: 'ltr' as any,
  } as ViewStyle,
  hlText: {
    fontSize: 13,
    fontFamily: MONO,
    lineHeight: 20,
    textAlign: 'left' as const,
    writingDirection: 'ltr' as const,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  codeInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 10,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: MONO,
    color: 'transparent',
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web'
      ? ({ caretColor: '#8b5cf6', outlineStyle: 'none' } as any)
      : {}),
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
    textAlignVertical: 'top',
    textAlign: 'left' as const,
    writingDirection: 'ltr' as const,
    zIndex: 2,
  },

  // Autocomplete dropdown
  acDropdown: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#141428',
    borderTopWidth: 1,
    borderTopColor: '#252550',
    maxHeight: 220,
    zIndex: 100,
  },
  acHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e3a',
  },
  acHeaderTxt: { flex: 1, fontSize: 11, fontWeight: '600', color: '#f59e0b' },
  acList: { flex: 1 },
  acItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1e1e3a',
  },
  acLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#d1d5db',
    fontFamily: MONO,
  },
  acKind: {
    fontSize: 10,
    color: '#4b5563',
    backgroundColor: '#0d0d1a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  // Bottom toolbar
  bottomBar: {
    backgroundColor: '#0a0a16',
    borderTopWidth: 1,
    borderTopColor: '#1e1e3a',
    paddingBottom: Platform.OS === 'ios' ? 4 : 2,
  },
  qInsertRow: { paddingHorizontal: 6, paddingVertical: 4, gap: 3 },
  qKey: {
    width: 34,
    height: 30,
    borderRadius: 5,
    backgroundColor: '#141428',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252550',
  },
  qKeyTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9ca3af',
    fontFamily: MONO,
  },

  // Overlays
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  panelHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#374151',
    alignSelf: 'center',
    marginBottom: 14,
  },

  // Run output panel
  runPanel: {
    backgroundColor: '#0f0f1e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: SH * 0.6,
    paddingBottom: Platform.OS === 'ios' ? 36 : 80,
  },
  runPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  runPanelTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  outputScroll: {
    backgroundColor: '#0a0a16',
    borderRadius: 12,
    padding: 14,
    maxHeight: SH * 0.3,
    borderWidth: 1,
    borderColor: '#1e1e3a',
  },
  outputText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#d1d5db',
    fontFamily: MONO,
  },
  runPanelActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  runAgainBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#8b5cf620',
    borderWidth: 1,
    borderColor: '#8b5cf640',
  },
  runAgainTxt: { fontSize: 13, fontWeight: '600', color: '#8b5cf6' },
  closeOutputBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1a1a3e',
  },
  closeOutputTxt: { fontSize: 13, fontWeight: '600', color: '#9ca3af' },

  // Web preview
  previewSafe: { flex: 1, backgroundColor: '#0f0f1e' },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a3e',
  },
  previewTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  iframeWrap: {
    flex: 1,
    margin: 8,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#252550',
  },
  noPreviewWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  noPreviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9ca3af',
    marginTop: 8,
  },
  noPreviewSub: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  copyPreviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1a1a3e',
    borderWidth: 1,
    borderColor: '#8b5cf640',
    marginTop: 12,
  },
  copyPreviewTxt: { fontSize: 14, fontWeight: '600', color: '#8b5cf6' },

  // Publish dialog
  pubSheet: {
    backgroundColor: '#0f0f1e',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 22,
    paddingBottom: Platform.OS === 'ios' ? 36 : 22,
    maxHeight: SH * 0.75,
  },
  pubSheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  pubSheetSub: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 3,
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#d1d5db',
    marginBottom: 6,
  },
  fieldInput: {
    backgroundColor: '#1a1a3e',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#252550',
    textAlign: 'right',
    marginBottom: 14,
  },
  fieldDesc: { minHeight: 60, textAlignVertical: 'top' },
  pubPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#141428',
    borderRadius: 8,
    marginBottom: 16,
  },
  pubPreviewDot: { width: 7, height: 7, borderRadius: 3.5 },
  pubPreviewLang: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d1d5db',
    flex: 1,
  },
  pubPreviewLines: { fontSize: 11, color: '#6b7280' },
  pubActions: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  discardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#ef444415',
    borderWidth: 1,
    borderColor: '#ef444440',
  },
  discardTxt: { fontSize: 12, fontWeight: '600', color: '#ef4444' },
  draftBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#1a1a3e',
    borderWidth: 1,
    borderColor: '#252550',
  },
  draftTxt: { fontSize: 13, fontWeight: '600', color: '#9ca3af' },
  pubDialogBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#8b5cf6',
  },
  pubDialogTxt: { fontSize: 13, fontWeight: '700', color: '#fff' },
  disabled: { opacity: 0.4 },
  cancelBtn: { alignItems: 'center', paddingVertical: 10 },
  cancelTxt: { fontSize: 13, color: '#6b7280' },
});

const wS = {
  container: {
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
  } as ViewStyle,
  editorWrap: { flex: 1 } as ViewStyle,
  dialog: {
    maxWidth: 560,
    alignSelf: 'center',
    width: '100%',
    borderRadius: 22,
    marginBottom: 40,
  } as ViewStyle,
};
