/**
 * SnippetListDrawer.tsx
 *
 * Drawer component for browsing and loading saved code snippets
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInRight, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CodeSnippet,
  loadUserSnippets,
  deleteSnippet,
} from '@/services/snippetService';
import { showToast } from '../ui/Toast';

interface SnippetListDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSelectSnippet: (snippet: CodeSnippet) => void;
  userId: string;
}

export function SnippetListDrawer({
  visible,
  onClose,
  onSelectSnippet,
  userId,
}: SnippetListDrawerProps) {
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [filteredSnippets, setFilteredSnippets] = useState<CodeSnippet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadSnippets();
    }
  }, [visible]);

  useEffect(() => {
    filterSnippets();
  }, [searchQuery, selectedLanguage, snippets]);

  const loadSnippets = async () => {
    setLoading(true);
    const result = await loadUserSnippets(userId);
    if (result.success && result.snippets) {
      setSnippets(result.snippets);
    } else {
      showToast.error('Failed to load snippets');
    }
    setLoading(false);
  };

  const filterSnippets = () => {
    let filtered = [...snippets];

    if (searchQuery) {
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedLanguage) {
      filtered = filtered.filter((s) => s.language === selectedLanguage);
    }

    setFilteredSnippets(filtered);
  };

  const handleDelete = async (snippetId: string) => {
    const result = await deleteSnippet(snippetId);
    if (result.success) {
      showToast.success('Snippet deleted');
      setSnippets(snippets.filter((s) => s.id !== snippetId));
    } else {
      showToast.error('Failed to delete snippet');
    }
  };

  const languages = Array.from(new Set(snippets.map((s) => s.language)));

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          entering={FadeInRight.duration(300).springify()}
          style={styles.drawerContainer}
        >
          <BlurView intensity={90} tint="dark" style={styles.drawer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <MaterialIcons name="folder" size={24} color="#8b5cf6" />
                <Text style={styles.headerTitle}>My Snippets</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={20} color="#9ca3af" />
              <TextInput
                style={[
                  styles.searchInput,
                  Platform.OS === 'web' && ({ outline: 'none' } as any),
                ]}
                placeholder="Search snippets..."
                placeholderTextColor="#6b7280"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Language Filter */}
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  !selectedLanguage && styles.filterChipActive,
                ]}
                onPress={() => setSelectedLanguage(null)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    !selectedLanguage && styles.filterChipTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.filterChip,
                    selectedLanguage === lang && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedLanguage(lang)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedLanguage === lang && styles.filterChipTextActive,
                    ]}
                  >
                    {lang}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Snippet List */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8b5cf6" />
                <Text style={styles.loadingText}>Loading snippets...</Text>
              </View>
            ) : filteredSnippets.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="code-off" size={64} color="#4b5563" />
                <Text style={styles.emptyText}>No snippets found</Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery || selectedLanguage
                    ? 'Try a different filter'
                    : 'Start coding and save your first snippet'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredSnippets}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                  <Animated.View
                    entering={FadeInDown.delay(index * 50).duration(300)}
                  >
                    <SnippetCard
                      snippet={item}
                      onSelect={() => {
                        onSelectSnippet(item);
                        onClose();
                      }}
                      onDelete={() => handleDelete(item.id)}
                    />
                  </Animated.View>
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            )}
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function SnippetCard({
  snippet,
  onSelect,
  onDelete,
}: {
  snippet: CodeSnippet;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <TouchableOpacity onPress={onSelect} style={styles.snippetCard}>
      <LinearGradient
        colors={
          ['rgba(139, 92, 246, 0.1)', 'rgba(168, 85, 247, 0.05)'] as [
            string,
            string,
            ...string[],
          ]
        }
        style={styles.snippetGradient}
      >
        <View style={styles.snippetHeader}>
          <View style={styles.snippetTitleRow}>
            <Text style={styles.snippetTitle}>{snippet.title}</Text>
            <TouchableOpacity
              onPress={() => setShowMenu(!showMenu)}
              style={styles.menuButton}
            >
              <MaterialIcons name="more-vert" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
          {snippet.description && (
            <Text style={styles.snippetDescription} numberOfLines={2}>
              {snippet.description}
            </Text>
          )}
        </View>

        <View style={styles.snippetMeta}>
          <View style={styles.languageTag}>
            <Text style={styles.languageText}>{snippet.language}</Text>
          </View>
          <Text style={styles.dateText}>
            {new Date(snippet.updatedAt).toLocaleDateString()}
          </Text>
        </View>

        {showMenu && (
          <View style={styles.menuOverlay}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onDelete();
                setShowMenu(false);
              }}
            >
              <MaterialIcons name="delete" size={18} color="#ef4444" />
              <Text style={styles.menuItemTextDanger}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  drawerContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '85%',
    maxWidth: 400,
  },
  drawer: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(139, 92, 246, 0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  closeButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8b5cf6',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
  },
  filterChipTextActive: {
    color: '#a855f7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  snippetCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  snippetGradient: {
    padding: 16,
  },
  snippetHeader: {
    marginBottom: 12,
  },
  snippetTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  snippetTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  menuButton: {
    padding: 4,
  },
  snippetDescription: {
    fontSize: 13,
    color: '#9ca3af',
    lineHeight: 18,
  },
  snippetMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 107, 157, 0.2)',
  },
  languageText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ff6b9d',
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 11,
    color: '#6b7280',
  },
  menuOverlay: {
    position: 'absolute',
    top: 40,
    right: 12,
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 4,
    minWidth: 120,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  menuItemTextDanger: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
});
