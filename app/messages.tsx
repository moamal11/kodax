/**
 * الرسائل الخاصة: قائمة المحادثات.
 * - تتحدث عند العودة للشاشة (F13) وكل 20 ثانية
 * - غير المقروء: رقم بلون العلامة + اسم بخط أعرض (لا نقطة خضراء توحي بالاتصال)
 * - الخطأ ليس «فارغ» (C01)، والفارغ يقود لخطوة واضحة (F16)
 */
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getConversations, type Conversation } from '@/services/messageService';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import { timeAgo } from '@/components/editor/NotificationButton';
import { Screen, AppBar, Text, Row, Col, Avatar, EmptyState, ErrorState, ListSkeleton, useTheme, countAr } from '@/design';

export default function MessagesScreen() {
  const t = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    const { data, error: err } = await getConversations(user.id);
    if (err) setError(true);
    else {
      setError(false);
      setItems(data ?? []);
    }
    setLoading(false);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      load();
      const i = setInterval(load, 20000);
      return () => clearInterval(i);
    }, [load])
  );

  return (
    <Screen width="reading" scroll={false} padded={false} header={<AppBar title="الرسائل" fallback="/" />}>
      <FlatList
        data={loading || error ? [] : items}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
            tintColor={t.colors.brand}
          />
        }
        ListHeaderComponent={
          !loading && !error && items.length > 0 ? (
            <Col gap={3} style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
              <Text variant="heading">محادثاتك</Text>
              <Text variant="bodySm" tone="secondary">
                {items.length} محادثات · {items.reduce((n, c) => n + c.unread_count, 0)} رسائل غير مقروءة
              </Text>
            </Col>
          ) : null
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ padding: 16 }}>
              <ListSkeleton rows={4} />
            </View>
          ) : error ? (
            <ErrorState
              onRetry={() => {
                setLoading(true);
                load();
              }}
            />
          ) : (
            <EmptyState
              icon="chatbubbles-outline"
              title="ماكو محادثات بعد"
              body="افتح ملف أي عضو من المجتمع واضغط «مراسلة» لتبدأ."
              action="تصفّح المجتمع"
              onAction={() => router.push('/code')}
            />
          )
        }
        renderItem={({ item, index }) => {
          const o = item.other_user;
          const name = o?.full_name || o?.username || 'عضو';
          const unread = item.unread_count > 0;
          const mine = item.last_message?.sender_id === user?.id;
          return (
            <Pressable
              onPress={() => router.push(`/message/${item.id}` as any)}
              accessibilityRole="button"
              accessibilityLabel={`${name}${unread ? `، ${countAr(item.unread_count, ['رسالة غير مقروءة', 'رسالتان غير مقروءتين', 'رسائل غير مقروءة'])}` : ''}. ${item.last_message?.content ?? ''}`}
              style={(s: any) => ({ backgroundColor: s.hovered || s.pressed ? t.colors.surfacePressed : 'transparent' })}
            >
              <Row
                gap={12}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  backgroundColor: unread ? t.colors.surface : 'transparent',
                  borderBottomWidth: 1,
                  borderBottomColor: t.colors.border,
                }}
              >
                <Avatar uri={o?.avatar_url} name={name} size={48} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Row gap={8} justify="space-between">
                    <Row gap={4} style={{ flex: 1, justifyContent: 'flex-start' }}>
                      <Text variant="body" weight={unread ? 'bold' : 'medium'} numberOfLines={1} style={{ flexShrink: 1 }}>
                        {name}
                      </Text>
                      <VerifiedBadge verified={o?.is_verified} size={14} />
                    </Row>
                    {item.last_message && (
                      <Text variant="caption" tone={unread ? 'brand' : 'muted'}>
                        {timeAgo(new Date(item.last_message.created_at))}
                      </Text>
                    )}
                  </Row>
                  <Row gap={8}>
                    <Text variant="bodySm" tone={unread ? 'default' : 'muted'} numberOfLines={2} style={{ flex: 1 }}>
                      {item.last_message ? `${mine ? 'أنت: ' : ''}${item.last_message.content}` : 'ابدأ المحادثة'}
                    </Text>
                    {unread && (
                      <View
                        style={{
                          minWidth: 22,
                          height: 22,
                          borderRadius: 11,
                          paddingHorizontal: 6,
                          backgroundColor: t.colors.brand,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text variant="caption" weight="bold" align="center" style={{ color: '#fff', fontSize: 11, lineHeight: 14 }}>
                          {item.unread_count > 99 ? '99+' : item.unread_count}
                        </Text>
                      </View>
                    )}
                  </Row>
                </View>
              </Row>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}
