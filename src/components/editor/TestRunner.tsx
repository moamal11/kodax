/**
 * TestRunner.tsx
 *
 * Visual test execution component with pass/fail indicators
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

export interface TestCase {
  id: string;
  name: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
  executionTime?: number;
}

interface TestRunnerProps {
  tests: TestCase[];
  isRunning?: boolean;
}

export function TestRunner({ tests, isRunning = false }: TestRunnerProps) {
  const passedTests = tests.filter((t) => t.passed === true).length;
  const failedTests = tests.filter((t) => t.passed === false).length;
  const totalTests = tests.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="science" size={20} color="#ff6b9d" />
          <Text style={styles.headerTitle}>Test Cases</Text>
        </View>
        <View style={styles.stats}>
          <Text style={styles.statsText}>
            {passedTests}/{totalTests} Passed
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      {totalTests > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={['#10b981', '#34d399'] as [string, string, ...string[]]}
              style={[
                styles.progressFill,
                { width: `${(passedTests / totalTests) * 100}%` },
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round((passedTests / totalTests) * 100)}%
          </Text>
        </View>
      )}

      {/* Test List */}
      <ScrollView style={styles.testList} showsVerticalScrollIndicator={false}>
        {tests.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="science" size={48} color="#4b5563" />
            <Text style={styles.emptyText}>No test cases defined</Text>
            <Text style={styles.emptySubtext}>
              Add test cases to validate your code
            </Text>
          </View>
        ) : (
          tests.map((test, index) => (
            <Animated.View
              key={test.id}
              entering={FadeInDown.delay(index * 50).duration(300)}
            >
              <TestCaseCard test={test} isRunning={isRunning} />
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function TestCaseCard({
  test,
  isRunning,
}: {
  test: TestCase;
  isRunning: boolean;
}) {
  const getStatusIcon = () => {
    if (isRunning) return 'hourglass-empty';
    if (test.passed === true) return 'check-circle';
    if (test.passed === false) return 'cancel';
    return 'radio-button-unchecked';
  };

  const getStatusColor = () => {
    if (isRunning) return '#f59e0b';
    if (test.passed === true) return '#10b981';
    if (test.passed === false) return '#ef4444';
    return '#6b7280';
  };

  return (
    <View style={styles.testCard}>
      <View style={styles.testHeader}>
        <View style={styles.testTitleRow}>
          <MaterialIcons
            name={getStatusIcon()}
            size={20}
            color={getStatusColor()}
          />
          <Text style={styles.testName}>{test.name}</Text>
        </View>
        {test.executionTime && (
          <Text style={styles.executionTime}>{test.executionTime}ms</Text>
        )}
      </View>

      {/* Input */}
      <View style={styles.testSection}>
        <Text style={styles.sectionLabel}>Input:</Text>
        <View style={styles.codeBlock}>
          <Text style={styles.codeText}>{test.input || '(empty)'}</Text>
        </View>
      </View>

      {/* Expected Output */}
      <View style={styles.testSection}>
        <Text style={styles.sectionLabel}>Expected Output:</Text>
        <View style={styles.codeBlock}>
          <Text style={styles.codeText}>{test.expectedOutput}</Text>
        </View>
      </View>

      {/* Actual Output (if executed) */}
      {test.actualOutput !== undefined && (
        <View style={styles.testSection}>
          <Text style={styles.sectionLabel}>Actual Output:</Text>
          <View
            style={[
              styles.codeBlock,
              test.passed === false && styles.codeBlockError,
            ]}
          >
            <Text style={styles.codeText}>{test.actualOutput}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  stats: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  statsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10b981',
    minWidth: 40,
  },
  testList: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  testCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    marginBottom: 12,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  testTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  testName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
  },
  executionTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
  testSection: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  codeBlock: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  codeBlockError: {
    borderColor: 'rgba(239, 68, 68, 0.5)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  codeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#e5e7eb',
  },
});
