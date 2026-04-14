/**
 * MonacoEditor.tsx
 *
 * Monaco Editor wrapper for web with syntax highlighting and IntelliSense
 * For mobile: falls back to TextInput with basic syntax highlighting
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Platform,
  ScrollView,
  Text as RNText,
} from 'react-native';

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  readOnly?: boolean;
  height?: number;
}

export function MonacoEditor({
  value,
  onChange,
  language,
  readOnly = false,
  height = 400,
}: MonacoEditorProps) {
  const editorRef = useRef<any>(null);
  const containerRef = useRef<View>(null);

  useEffect(() => {
    if (Platform.OS === 'web' && containerRef.current) {
      // Load Monaco Editor for web
      loadMonacoEditor();
    }
  }, []);

  useEffect(() => {
    if (editorRef.current && Platform.OS === 'web') {
      // Update editor language
      const model = editorRef.current.getModel();
      if (model) {
        (window as any).monaco?.editor.setModelLanguage(
          model,
          getMonacoLanguage(language)
        );
      }
    }
  }, [language]);

  const loadMonacoEditor = async () => {
    if (typeof window === 'undefined' || !(window as any).monaco) {
      // Dynamically load Monaco
      const script = document.createElement('script');
      script.src =
        'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs/loader.js';
      script.async = true;
      script.onload = () => {
        (window as any).require.config({
          paths: {
            vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs',
          },
        });
        (window as any).require(['vs/editor/editor.main'], () => {
          initializeMonaco();
        });
      };
      document.head.appendChild(script);
    } else {
      initializeMonaco();
    }
  };

  const initializeMonaco = () => {
    if (!containerRef.current || editorRef.current) return;

    const monaco = (window as any).monaco;
    const container = (containerRef.current as any)._nativeTag
      ? document.getElementById('monaco-container')
      : containerRef.current;

    if (!container) return;

    // Create editor
    editorRef.current = monaco.editor.create(container, {
      value,
      language: getMonacoLanguage(language),
      theme: 'vs-dark',
      automaticLayout: true,
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      readOnly,
      lineNumbers: 'on',
      glyphMargin: false,
      folding: true,
      lineDecorationsWidth: 10,
      renderLineHighlight: 'all',
      roundedSelection: true,
      scrollbar: {
        vertical: 'auto',
        horizontal: 'auto',
      },
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      wordBasedSuggestions: true,
    });

    // Listen to changes
    editorRef.current.onDidChangeModelContent(() => {
      const newValue = editorRef.current.getValue();
      onChange(newValue);
    });
  };

  const getMonacoLanguage = (lang: string): string => {
    const mapping: Record<string, string> = {
      javascript: 'javascript',
      typescript: 'typescript',
      python: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      csharp: 'csharp',
      php: 'php',
      ruby: 'ruby',
      go: 'go',
      rust: 'rust',
      swift: 'swift',
      kotlin: 'kotlin',
      html: 'html',
      css: 'css',
      sql: 'sql',
    };
    return mapping[lang] || 'plaintext';
  };

  // Mobile fallback: TextInput with line numbers
  if (Platform.OS !== 'web') {
    return (
      <View style={[styles.mobileContainer, { height }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.mobileEditor}>
            <View style={styles.lineNumbers}>
              {value.split('\n').map((_, i) => (
                <RNText key={i} style={styles.lineNumber}>
                  {i + 1}
                </RNText>
              ))}
            </View>
            <TextInput
              style={[styles.codeInput]}
              value={value}
              onChangeText={onChange}
              multiline
              placeholder="// Write your code here..."
              placeholderTextColor="#4b5563"
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              editable={!readOnly}
              textAlignVertical="top"
              textAlign="left"
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  // Web: Monaco Editor container
  return (
    <View style={[styles.webContainer, { height }]}>
      <div
        id="monaco-container"
        ref={containerRef as any}
        style={{ width: '100%', height: '100%' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1e1e1e',
  },
  mobileContainer: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    overflow: 'hidden',
  },
  mobileEditor: {
    flexDirection: 'row',
    minWidth: '100%',
  },
  lineNumbers: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  lineNumber: {
    height: 20,
    fontSize: 12,
    color: '#6b7280',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlign: 'right',
    minWidth: 30,
  },
  codeInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#e5e7eb',
    padding: 16,
    lineHeight: 20,
    textAlign: 'left' as const,
    writingDirection: 'ltr' as const,
  },
});
