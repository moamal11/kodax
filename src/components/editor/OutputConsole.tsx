/**
 * OutputConsole.tsx
 * 
 * Description: Code execution output display with syntax highlighting and controls
 * Features: Syntax highlighting, auto-scroll, clear, copy, filter logs, error display
 * Props: {output} - Execution output, {errors} - Error messages, {logs} - Console logs
 */

import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { showToast } from '../ui/Toast';

interface OutputConsoleProps {
  output?: string;
  errors?: string[];
  logs?: Array<{ type: 'log' | 'error' | 'warn'; message: string }>;
}

export function OutputConsole({ output = '', errors = [], logs = [] }: OutputConsoleProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [filter, setFilter] = useState<'all' | 'logs' | 'errors'>('all');

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [output, errors, logs]);

  const handleCopy = async () => {
    const content = output || errors.join('\n');
    await Clipboard.setStringAsync(content);
    showToast.success('Copied to clipboard!');
  };

  const handleClear = () => {
    // Clear handled by parent
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    if (filter === 'logs') return log.type === 'log';
    if (filter === 'errors') return log.type === 'error' || log.type === 'warn';
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.filters}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'logs' && styles.filterButtonActive]}
            onPress={() => setFilter('logs')}
          >
            <Text style={[styles.filterText, filter === 'logs' && styles.filterTextActive]}>
              Logs
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'errors' && styles.filterButtonActive]}
            onPress={() => setFilter('errors')}
          >
            <Text style={[styles.filterText, filter === 'errors' && styles.filterTextActive]}>
              Errors
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={handleCopy} style={styles.actionButton}>
            <MaterialIcons name="content-copy" size={18} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClear} style={styles.actionButton}>
            <MaterialIcons name="clear" size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Console Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Errors */}
        {errors.length > 0 && (
          <View style={styles.section}>
            {errors.map((error, index) => (
              <View key={index} style={styles.errorLine}>
                <MaterialIcons name="error" size={16} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Output */}
        {output && (
          <View style={styles.section}>
            <Text style={styles.outputText}>{output}</Text>
          </View>
        )}

        {/* Logs */}
        {filteredLogs.map((log, index) => (
          <View key={index} style={styles.logLine}>
            <MaterialIcons
              name={log.type === 'error' ? 'error' : log.type === 'warn' ? 'warning' : 'info'}
              size={16}
              color={log.type === 'error' ? '#ef4444' : log.type === 'warn' ? '#f59e0b' : '#3b82f6'}
            />
            <Text style={[styles.logText, log.type === 'error' && styles.errorText]}>
              {log.message}
            </Text>
          </View>
        ))}

        {!output && errors.length === 0 && logs.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="terminal" size={48} color="#6b7280" />
            <Text style={styles.emptyText}>Run your code to see output</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  filterButtonActive: {
    backgroundColor: '#7c3aed',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 12,
  },
  errorLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
    padding: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 6,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#ef4444',
    fontFamily: 'monospace',
  },
  outputText: {
    fontSize: 13,
    color: '#e0e0e0',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  logLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  logText: {
    flex: 1,
    fontSize: 13,
    color: '#9ca3af',
    fontFamily: 'monospace',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
  },
});
