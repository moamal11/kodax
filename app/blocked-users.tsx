/**
 * المستخدمون المحظورون — من user_blocks (RLS: حظر المستخدم الحالي فقط) مع إلغاء الحظر بتأكيد.
 */
import React, { useCallback, useState } from 'react';
import { Pressable, RefreshControl, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getBlockedUsers, unblockUser, type BlockedUser } from '@/services/codeFeedService';
import { showToast } from '@/components/ui/Toast';
import { Screen, AppBar, Text, Row, Col, Avatar, Button, Sheet, EmptyState, ErrorState, ListSkeleton, Surface, useTheme } from '@/design';

export default function BlockedUsersScreen() {
  const t = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [confirm, setConfirm] = useState<BlockedUser | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    const { data, error: err } = await getBlockedUsers();
    setError(!!err);
    if (!err) setItems(data);
    setLoading(false);
  }, [user?.id]);
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const unblock = async () => {
    if (!confirm) return;
    setBusy(true);
    const res = await unblockUser(confirm.id);
    setBusy(false);
    if (res.success) {
      setItems((prev) => prev.filter((u) => u.id !== confirm.id));
      showToast.success(`تم إلغاء حظر ${confirm.full_name || confirm.username || 'المستخدم'}`);
      setConfirm(null);
    } else showToast.error('تعذّر إلغاء الحظر. حاول مرة أخرى.');
  };

  const name = (u: BlockedUser) => u.full_name || u.username || 'مستخدم';

  return (
    <Screen
      width="reading"
      header={<AppBar title="المستخدمون المحظورون" fallback="/profile" />}
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
    >
      {loading ? (
        <ListSkeleton rows={3} />
      ) : error ? (
        <ErrorState
          onRetry={() => {
            setLoading(true);
            load();
          }}
        />
      ) : items.length === 0 ? (
        <EmptyState icon="shield-checkmark-outline" title="ما حظرت أحداً" body="عند حظر عضو لن يستطيع مراسلتك، ولن ترى أكواده. تقدر تلغي الحظر من هنا بأي وقت." />
      ) : (
        <Col gap={12}>
          <Text variant="bodySm" tone="muted">
            المحظور لا يستطيع مراسلتك ولا ترى أكواده. إلغاء الحظر يعيد ذلك.
          </Text>
          <Surface padding={0}>
            {items.map((u, i) => (
              <Row key={u.id} gap={12} style={{ paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: t.colors.border }}>
                <Pressable onPress={() => router.push(`/user/${u.id}` as any)} accessibilityRole="link" accessibilityLabel={`ملف ${name(u)}`} style={{ flex: 1 }}>
                  <Row gap={12}>
                    <Avatar uri={u.avatar_url} name={name(u)} size={40} />
                    <View style={{ flex: 1 }}>
                      <Text variant="label" weight="semibold" numberOfLines={1}>
                        {name(u)}
                      </Text>
                      <Text variant="caption" tone="muted">
                        حُظر في {new Date(u.blocked_at).toLocaleDateString('ar-IQ-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Baghdad' })}
                      </Text>
                    </View>
                  </Row>
                </Pressable>
                <Button label="إلغاء الحظر" variant="secondary" size="sm" onPress={() => setConfirm(u)} accessibilityLabel={`إلغاء حظر ${name(u)}`} />
              </Row>
            ))}
          </Surface>
        </Col>
      )}
      <Sheet visible={!!confirm} onClose={() => setConfirm(null)} title={confirm ? `إلغاء حظر ${name(confirm)}؟` : ''} maxWidth={400}>
        <Col gap={14}>
          <Text variant="body" tone="secondary">
            سيتمكن من مراسلتك مجدداً وسترى أكواده.
          </Text>
          <Row gap={8}>
            <Button label="إلغاء الحظر" onPress={unblock} loading={busy} style={{ flex: 1 }} />
            <Button label="رجوع" variant="secondary" onPress={() => setConfirm(null)} style={{ flex: 1 }} />
          </Row>
        </Col>
      </Sheet>
    </Screen>
  );
}
