/**
 * CodeMirror Editor Component - Web Only
 * محرر أكواد احترافي باستخدام CodeMirror 6
 * يدعم: Syntax Highlighting, Autocomplete, Search, Formatting
 */
import React, { useEffect, useRef, useCallback, memo } from 'react';
import { Platform } from 'react-native';

// CodeMirror core
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightSpecialChars,
} from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap,
} from '@codemirror/autocomplete';
import { lintKeymap } from '@codemirror/lint';
import {
  indentOnInput,
  bracketMatching,
  foldGutter,
  foldKeymap,
  syntaxHighlighting,
  defaultHighlightStyle,
  indentUnit,
  HighlightStyle,
} from '@codemirror/language';
import { oneDark } from '@codemirror/theme-one-dark';

// Language support
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { sql } from '@codemirror/lang-sql';
import { json } from '@codemirror/lang-json';
import { rust } from '@codemirror/lang-rust';
import { php } from '@codemirror/lang-php';
import { markdown } from '@codemirror/lang-markdown';
import { tags } from '@lezer/highlight';

// Language mapping
const LANGUAGE_EXTENSIONS: Record<string, () => any> = {
  javascript: () => javascript({ jsx: false, typescript: false }),
  typescript: () => javascript({ jsx: false, typescript: true }),
  react: () => javascript({ jsx: true, typescript: false }),
  jsx: () => javascript({ jsx: true, typescript: false }),
  tsx: () => javascript({ jsx: true, typescript: true }),
  python: () => python(),
  java: () => java(),
  cpp: () => cpp(),
  c: () => cpp(),
  csharp: () => java(), // C# is close to Java syntax
  html: () => html({ matchClosingTags: true, autoCloseTags: true }),
  css: () => css(),
  sql: () => sql(),
  json: () => json(),
  rust: () => rust(),
  php: () => php(),
  markdown: () => markdown(),
  go: () => java(), // Go has Java-like syntax for highlighting
  swift: () => javascript({ typescript: true }), // Swift resembles TS
  kotlin: () => java(), // Kotlin is close to Java
  dart: () => java(), // Dart is close to Java
};

// Custom dark theme to match the app
const kodaxTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: '#0d0d1a',
      color: '#abb2bf',
      fontSize: '14px',
      fontFamily: 'JetBrains Mono, Fira Code, Menlo, Monaco, monospace',
      height: '100%',
      direction: 'ltr',
    },
    '.cm-content': {
      caretColor: '#8b5cf6',
      padding: '8px 0',
      minHeight: '100%',
      direction: 'ltr',
      textAlign: 'left',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: '#8b5cf6',
      borderLeftWidth: '2px',
    },
    '.cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: '#3e4451 !important',
    },
    '.cm-activeLine': {
      backgroundColor: '#1a1a3e40',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#1a1a3e60',
    },
    '.cm-gutters': {
      backgroundColor: '#0a0a15',
      color: '#4b5563',
      borderRight: '1px solid #1e1e3a',
      minWidth: '40px',
    },
    '.cm-lineNumbers .cm-gutterElement': {
      padding: '0 8px 0 4px',
      minWidth: '32px',
      fontSize: '12px',
    },
    '.cm-foldGutter .cm-gutterElement': {
      padding: '0 4px',
      cursor: 'pointer',
    },
    '.cm-tooltip': {
      backgroundColor: '#1a1a3e',
      border: '1px solid #252550',
      borderRadius: '8px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    },
    '.cm-tooltip.cm-tooltip-autocomplete': {
      '& > ul': {
        fontFamily: 'JetBrains Mono, Fira Code, Menlo, monospace',
        fontSize: '13px',
        maxHeight: '250px',
      },
      '& > ul > li': {
        padding: '4px 12px',
        lineHeight: '1.6',
      },
      '& > ul > li[aria-selected]': {
        backgroundColor: '#8b5cf630',
        color: '#ffffff',
      },
    },
    '.cm-tooltip-hover': {
      backgroundColor: '#1a1a3e',
      border: '1px solid #252550',
    },
    '.cm-matchingBracket': {
      backgroundColor: '#8b5cf630',
      outline: '1px solid #8b5cf6',
      color: '#ffffff !important',
    },
    '.cm-nonmatchingBracket': {
      color: '#ef4444 !important',
    },
    '.cm-searchMatch': {
      backgroundColor: '#f59e0b30',
      outline: '1px solid #f59e0b50',
    },
    '.cm-searchMatch.cm-searchMatch-selected': {
      backgroundColor: '#f59e0b50',
    },
    '.cm-selectionMatch': {
      backgroundColor: '#3b82f620',
    },
    '.cm-foldPlaceholder': {
      backgroundColor: '#1a1a3e',
      border: '1px solid #252550',
      color: '#8b5cf6',
      padding: '0 6px',
      borderRadius: '4px',
      margin: '0 4px',
    },
    '.cm-panels': {
      backgroundColor: '#0d0d1a',
      color: '#abb2bf',
      borderTop: '1px solid #252550',
    },
    '.cm-panel.cm-search': {
      padding: '8px 12px',
      '& input, & button, & label': {
        color: '#abb2bf',
        fontSize: '13px',
      },
      '& input': {
        backgroundColor: '#1a1a3e',
        border: '1px solid #252550',
        borderRadius: '4px',
        padding: '4px 8px',
        outline: 'none',
      },
      '& input:focus': {
        borderColor: '#8b5cf6',
      },
      '& button': {
        backgroundColor: '#252550',
        borderRadius: '4px',
        border: 'none',
        padding: '4px 12px',
        cursor: 'pointer',
      },
      '& button:hover': {
        backgroundColor: '#8b5cf630',
      },
    },
    '&.cm-focused': {
      outline: 'none',
    },
    '.cm-scroller': {
      overflow: 'auto',
      fontFamily: 'JetBrains Mono, Fira Code, Menlo, Monaco, monospace',
      direction: 'ltr',
      textAlign: 'left',
    },
  },
  { dark: true }
);

interface CodeMirrorEditorProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
  readOnly?: boolean;
  height?: string | number;
}

function CodeMirrorEditorInner({
  code,
  language,
  onChange,
  readOnly = false,
  height = '100%',
}: CodeMirrorEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorView | null>(null);
  const languageCompartment = useRef(new Compartment());
  const readOnlyCompartment = useRef(new Compartment());
  const onChangeRef = useRef(onChange);
  const isExternalUpdate = useRef(false);

  // Keep onChange ref current
  onChangeRef.current = onChange;

  // Get language extension
  const getLanguageExtension = useCallback((lang: string) => {
    const normalizedLang =
      lang?.toLowerCase().replace(/[^a-z]/g, '') || 'javascript';
    const factory = LANGUAGE_EXTENSIONS[normalizedLang];
    return factory ? factory() : javascript();
  }, []);

  // Initialize editor
  useEffect(() => {
    if (!containerRef.current || Platform.OS !== 'web') return;

    const langExt = getLanguageExtension(language);

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && !isExternalUpdate.current) {
        const newCode = update.state.doc.toString();
        onChangeRef.current(newCode);
      }
    });

    const state = EditorState.create({
      doc: code,
      extensions: [
        // Basic setup
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        foldGutter(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        bracketMatching(),
        closeBrackets(),
        autocompletion({
          activateOnTyping: true,
          maxRenderedOptions: 30,
        }),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        indentUnit.of('  '),

        // Keymaps
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...foldKeymap,
          ...completionKeymap,
          ...lintKeymap,
          indentWithTab,
        ]),

        // Language
        languageCompartment.current.of(langExt),

        // Read-only
        readOnlyCompartment.current.of(EditorState.readOnly.of(readOnly)),

        // Theme
        kodaxTheme,
        oneDark,

        // Change listener
        updateListener,

        // Editor sizing
        EditorView.lineWrapping,
      ],
    });

    const editor = new EditorView({
      state,
      parent: containerRef.current,
    });

    editorRef.current = editor;

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, []); // Only create once

  // Update language when it changes
  useEffect(() => {
    if (!editorRef.current) return;
    const langExt = getLanguageExtension(language);
    editorRef.current.dispatch({
      effects: languageCompartment.current.reconfigure(langExt),
    });
  }, [language, getLanguageExtension]);

  // Update read-only when it changes
  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.dispatch({
      effects: readOnlyCompartment.current.reconfigure(
        EditorState.readOnly.of(readOnly)
      ),
    });
  }, [readOnly]);

  // Update content when code changes externally
  useEffect(() => {
    if (!editorRef.current) return;
    const currentCode = editorRef.current.state.doc.toString();
    if (currentCode !== code) {
      isExternalUpdate.current = true;
      editorRef.current.dispatch({
        changes: {
          from: 0,
          to: currentCode.length,
          insert: code,
        },
      });
      isExternalUpdate.current = false;
    }
  }, [code]);

  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <div
      ref={containerRef}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        width: '100%',
        overflow: 'hidden',
        borderRadius: '0px',
      }}
    />
  );
}

export const CodeMirrorEditor = memo(CodeMirrorEditorInner);
export default CodeMirrorEditor;
