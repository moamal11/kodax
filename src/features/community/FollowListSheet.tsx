import { profilePath } from '@/services/profileLinks';
/**
 * قائمة المتابِعين / المتابَعين (F09: الأرقام في الملف الشخصي صارت تفتح قائمة فعلية).
 */
import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getFollowers, getFollowing } from '@/services/followService';
import { Sheet, Segmented, Text, Row, Avatar, ListSkeleton, EmptyState, ErrorState, useTheme } from '@/design';
import { useAuth } from '@/contexts/AuthContext';

type Tab = 'followers' | 'following';
type Person = { id: string; username?: string | null; full_name?: string | null; avatar_url?: string | null; level?: number | null };

export function FollowListSheet({ userId, visible, initialTab, onClose, counts }: { userId: string; visible: boolean; initialTab: Tab; onClose: () => void; counts?: { followers: number; following: number } }) {
  const t = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [result, setResult] = useState<{ key: string; people: Person[] | null; error?: string }>({ key: '', people: null });
  const [retry, setRetry] = useState(0);
  const key = `${userId}:${tab}`;
  const people = result.key === key ? result.people : null;

  useEffect(() => {
    if (visible) setTab(initialTab);
  }, [visible, initialTab]);
  useEffect(() => {
    if (!visible) return;
    let alive = true;
    setResult({ key, people: null });
    (tab === 'followers' ? getFollowers(userId) : getFollowing(userId)).then((r) => alive && setResult({ key, people: r as Person[] })).catch(e => alive && setResult({ key, people: [], error: e.message }));
    return () => {
      alive = false;
    };
  }, [visible, tab, userId, retry]);

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
      {result.key === key && result.error ? (
        <ErrorState body={result.error} onRetry={() => setRetry(v => v + 1)} />
      ) : !people ? (
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
                  router.push(p.id === user?.id ? '/profile' : (profilePath(p.id,p.username) as any));
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
