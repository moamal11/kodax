/**
 * LanguageSelector.tsx
 *
 * Description: Programming language picker with search and icons
 * Features: Search, language icons, recent languages, popular first, smooth transitions
 * Props: {selected} - Currently selected language, {onChange} - Selection handler, {languages} - Available languages
 *
 * @example
 * <LanguageSelector selected="javascript" onChange={handleChange} />
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Modal } from '../ui/Modal';

// Types
export interface ProgrammingLanguage {
  id: string;
  name: string;
  icon: string;
  color: string;
  extension: string;
}

interface LanguageSelectorProps {
  selected: string;
  onChange: (languageId: string) => void;
  languages?: ProgrammingLanguage[];
}

// Default languages
const DEFAULT_LANGUAGES: ProgrammingLanguage[] = [
  {
    id: 'javascript',
    name: 'JavaScript',
    icon: 'JS',
    color: '#f7df1e',
    extension: '.js',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    icon: 'TS',
    color: '#3178c6',
    extension: '.ts',
  },
  {
    id: 'python',
    name: 'Python',
    icon: 'PY',
    color: '#3776ab',
    extension: '.py',
  },
  {
    id: 'java',
    name: 'Java',
    icon: 'JA',
    color: '#007396',
    extension: '.java',
  },
  { id: 'cpp', name: 'C++', icon: 'C++', color: '#00599c', extension: '.cpp' },
  { id: 'csharp', name: 'C#', icon: 'C#', color: '#239120', extension: '.cs' },
  { id: 'php', name: 'PHP', icon: 'PHP', color: '#777bb4', extension: '.php' },
  { id: 'ruby', name: 'Ruby', icon: 'RB', color: '#cc342d', extension: '.rb' },
  { id: 'go', name: 'Go', icon: 'GO', color: '#00add8', extension: '.go' },
  { id: 'rust', name: 'Rust', icon: 'RS', color: '#000000', extension: '.rs' },
  {
    id: 'swift',
    name: 'Swift',
    icon: 'SW',
    color: '#fa7343',
    extension: '.swift',
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    icon: 'KT',
    color: '#7f52ff',
    extension: '.kt',
  },
  {
    id: 'html',
    name: 'HTML',
    icon: 'HTML',
    color: '#e34c26',
    extension: '.html',
  },
  { id: 'css', name: 'CSS', icon: 'CSS', color: '#264de4', extension: '.css' },
  { id: 'sql', name: 'SQL', icon: 'SQL', color: '#336791', extension: '.sql' },
];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function LanguageSelector({
  selected,
  onChange,
  languages = DEFAULT_LANGUAGES,
}: LanguageSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedLanguage = languages.find((lang) => lang.id === selected);

  // Filter languages based on search
  const filteredLanguages = useMemo(() => {
    if (!searchQuery) return languages;
    return languages.filter((lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, languages]);

  const handleSelect = (languageId: string) => {
    onChange(languageId);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <>
      {/* Trigger Button */}
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.languageIcon,
            { backgroundColor: selectedLanguage?.color },
          ]}
        >
          <Text style={styles.languageIconText}>{selectedLanguage?.icon}</Text>
        </View>
        <Text style={styles.languageName}>{selectedLanguage?.name}</Text>
        <MaterialIcons name="arrow-drop-down" size={24} color="#9ca3af" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSearchQuery('');
        }}
        closeOnBackdrop
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Language</Text>

          {/* Search */}
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color="#9ca3af" />
            <TextInput
              style={[
                styles.searchInput,
                Platform.OS === 'web' && ({ outline: 'none' } as any),
              ]}
              placeholder="Search languages..."
              placeholderTextColor="#6b7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>

          {/* Languages List */}
          <FlatList
            data={filteredLanguages}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <LanguageItem
                language={item}
                selected={item.id === selected}
                onPress={() => handleSelect(item.id)}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialIcons name="search-off" size={48} color="#6b7280" />
                <Text style={styles.emptyText}>No languages found</Text>
              </View>
            }
          />
        </View>
      </Modal>
    </>
  );
}

// Language Item Component
const LanguageItem = ({
  language,
  selected,
  onPress,
}: {
  language: ProgrammingLanguage;
  selected: boolean;
  onPress: () => void;
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      style={[
        styles.languageItem,
        selected && styles.languageItemSelected,
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      <View style={[styles.languageIcon, { backgroundColor: language.color }]}>
        <Text style={styles.languageIconText}>{language.icon}</Text>
      </View>
      <View style={styles.languageInfo}>
        <Text style={styles.languageItemName}>{language.name}</Text>
        <Text style={styles.languageExtension}>{language.extension}</Text>
      </View>
      {selected && (
        <MaterialIcons name="check-circle" size={24} color="#10b981" />
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  languageIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageIconText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  languageName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalContent: {
    height: 500,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 8,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  languageItemSelected: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderColor: '#7c3aed',
  },
  languageInfo: {
    flex: 1,
  },
  languageItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  languageExtension: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
  },
});
