/** قائمة المحادثات: شريط جانبي على الشاشات الكبيرة، ونافذة على الهاتف */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Conversation } from '@/services/conversationsService';
import { C } from './theme';

interface Props {
  conversations: Conversation[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onClose?: () => void;
}

function relTime(iso: string): string {
  const d = new Date(iso).getTime();
  if (!d) return '';
  const mins = Math.round((Date.now() - d) / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `قبل ${mins} د`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `قبل ${hours} س`;
  const days = Math.round(hours / 24);
  return days < 30 ? `قبل ${days} يوم` : new Date(iso).toLocaleDateString('ar-IQ');
}

export function ConversationPanel({ conversations, currentId, onSelect, onNew, onDelete, onClose }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={styles.title}>المحادثات</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.iconBtn} accessibilityLabel="إغلاق">
            <Ionicons name="close" size={20} color={C.text} />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity style={styles.newBtn} onPress={onNew} accessibilityRole="button">
        <Ionicons name="add" size={18} color="#fff" />
        <Text style={styles.newText}>محادثة جديدة</Text>
      </TouchableOpacity>
      <FlatList
        data={conversations}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingBottom: 16, gap: 4 }}
        ListEmptyComponent={<Text style={styles.empty}>ما عندك محادثات سابقة بعد.</Text>}
        renderItem={({ item }) => {
          const active = item.id === currentId;
          return (
            <TouchableOpacity style={[styles.item, active && styles.itemActive]} onPress={() => onSelect(item.id)}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, active && { color: '#fff' }]} numberOfLines={1}>
                  {item.title || 'محادثة'}
                </Text>
                <Text style={styles.itemMeta} numberOfLines={1}>
                  {relTime(item.last_message_at || item.created_at)}
                </Text>
              </View>
              <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.delBtn} accessibilityLabel="حذف المحادثة">
                <Ionicons name="trash-outline" size={16} color={C.muted} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 14, gap: 10 },
  head: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#fff', fontSize: 16, fontWeight: '700' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: C.surface },
  newBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.userA,
  },
  newText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  empty: { color: C.muted, textAlign: 'center', marginTop: 24, fontSize: 13 },
  item: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  itemActive: { backgroundColor: C.accentSoft, borderWidth: 1, borderColor: C.borderStrong },
  itemTitle: { color: C.textSoft, fontSize: 14, textAlign: 'right', writingDirection: 'rtl' },
  itemMeta: { color: C.muted, fontSize: 11.5, textAlign: 'right', marginTop: 2 },
  delBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18 },
});
