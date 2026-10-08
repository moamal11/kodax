/**
 * قائمة المتابِعين / المتابَعين (F09: الأرقام في الملف الشخصي صارت تفتح قائمة فعلية).
 */
import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getFollowers, getFollowing } from '@/services/followService';
import { Sheet, Segmented, Text, Row, Avatar, ListSkeleton, EmptyState, useTheme } from '@/design';
import { useAuth } from '@/contexts/AuthContext';

type Tab = 'followers' | 'following';
type Person = { id: string; username?: string | null; full_name?: string | null; avatar_url?: string | null; level?: number | null };

export function FollowListSheet({ userId, visible, initialTab, onClose, counts }: { userId: string; visible: boolean; initialTab: Tab; onClose: () => void; counts?: { followers: number; following: number } }) {
  const t = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [people, setPeople] = useState<Person[] | null>(null);

  useEffect(() => {
    if (visible) setTab(initialTab);
  }, [visible, initialTab]);
  useEffect(() => {
    if (!visible) return;
    let alive = true;
    setPeople(null);
    (tab === 'followers' ? getFollowers(userId) : getFollowing(userId)).then((r) => alive && setPeople(r as Person[]));
    return () => {
      alive = false;
    };
  }, [visible, tab, userId]);

  return (
    <Sheet visible={visible} onClose={onClose} title="المتابعات" maxWidth={440}>
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'followers', label: 'المتابِعون', count: counts?.followers },
          { value: 'following', label: 'يتابع', count: counts?.following },
        ]}
        style={{ marginBottom: 12 }}
      />
      {!people ? (
        <ListSkeleton rows={3} />
      ) : people.length === 0 ? (
        <EmptyState icon="people-outline" title={tab === 'followers' ? 'ماكو متابِعين بعد' : 'لا يتابع أحداً بعد'} compact />
      ) : (
        <View>
          {people.map((p, i) => {
            const name = p.full_name || p.username || 'عضو';
            return (
              <Pressable
                key={p.id}
                onPress={() => {
                  onClose();
                  router.push(p.id === user?.id ? '/profile' : (`/user/${p.id}` as any));
                }}
                accessibilityRole="link"
                accessibilityLabel={`ملف ${name}`}
                style={(s: any) => ({ borderRadius: t.radius.md, backgroundColor: s.hovered || s.pressed ? t.colors.surfacePressed : 'transparent' })}
              >
                <Row gap={12} style={{ paddingVertical: 10, paddingHorizontal: 6, borderBottomWidth: i === people.length - 1 ? 0 : 1, borderBottomColor: t.colors.border }}>
                  <Avatar uri={p.avatar_url} name={name} size={36} />
                  <View style={{ flex: 1 }}>
                    <Text variant="label" weight="semibold" numberOfLines={1}>
                      {name}
                    </Text>
                    {!!p.username && (
                      <Text variant="caption" tone="muted" ltr align="right" numberOfLines={1}>
                        @{p.username}
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-back" size={16} color={t.colors.textMuted} />
                </Row>
              </Pressable>
            );
          })}
        </View>
      )}
    </Sheet>
  );
}
