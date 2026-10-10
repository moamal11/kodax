import { profilePath } from '@/services/profileLinks';
/**
 * لوحة الصدارة: كل العراق أو محافظة واحدة (التصفية على السيرفر، لا من أفضل 50 فقط)، وترتيبك.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, RefreshControl, View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import { formatXp } from '@/features/rewards/level';
import { Screen, AppBar, Text, Row, Col, Avatar, Chip, ChipBar, Surface, EmptyState, ErrorState, ListSkeleton, useTheme } from '@/design';

const PROVINCES = ['بغداد', 'البصرة', 'نينوى', 'أربيل', 'السليمانية', 'دهوك', 'كركوك', 'ديالى', 'الأنبار', 'النجف', 'كربلاء', 'بابل', 'واسط', 'ميسان', 'ذي قار', 'المثنى', 'القادسية', 'صلاح الدين'];
type Row_ = { id: string; full_name: string | null; username: string | null; avatar_url: string | null; xp: number | null; province: string | null; is_verified: boolean | null };

export default function LeaderboardScreen() {
  const t = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [province, setProvince] = useState<string | null>(null);
  const [rows, setRows] = useState<Row_[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const request=useRef(0);
  const load = useCallback(async () => {
    const version=++request.current;
    let q = supabase.from('profiles').select('id, full_name, username, avatar_url, xp, province, is_verified').order('xp', { ascending: false }).limit(50);
    if (province) q = q.eq('province', province);
    const { data, error: err } = await q;
    if(version!==request.current)return;
    setError(!!err);
    if (!err) setRows((data ?? []) as Row_[]);
    setLoading(false);
  }, [province]);
  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const myIndex = rows.findIndex((r) => r.id === user?.id);

  return (
    <Screen
      width="reading"
      scroll={false}
      padded={false}
      header={<AppBar title="لوحة الصدارة" subtitle={province ?? 'كل العراق'} fallback="/" />}
    >
      <FlatList
        data={loading || error ? [] : rows}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
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
          <Col gap={12} style={{ paddingVertical: 8 }}>
            <ChipBar>
              <Chip label="كل العراق" icon="flag-outline" selected={!province} onPress={() => setProvince(null)} />
              {PROVINCES.map((p) => (
                <Chip key={p} label={p} selected={province === p} onPress={() => setProvince(p)} />
              ))}
            </ChipBar>
            {!loading && !error && (
              <Surface variant="brand" padding={12}>
                <Text variant="label">{myIndex >= 0 ? `ترتيبك ${myIndex + 1} ضمن المتصدرين` : province ? `لست ضمن أفضل 50 في ${province} بعد` : 'لست ضمن أفضل 50 بعد'}</Text>
                <Text variant="caption" tone="secondary">
                  الترتيب حسب XP. كل درس وتحدٍّ جديد يقرّبك.
                </Text>
              </Surface>
            )}
          </Col>
        }
        ListEmptyComponent={
          loading ? (
            <ListSkeleton rows={4} />
          ) : error ? (
            <ErrorState onRetry={load} />
          ) : (
            <EmptyState icon="podium-outline" title={province?`ماكو متعلمين من ${province} بعد`:'الصدارة بانتظار أول متعلّم'} body="كل درس جديد يضيف خطوة لترتيبك." action="تابع التعلم" onAction={()=>router.push('/learn' as any)} compact />
          )
        }
        renderItem={({ item, index }) => {
          const me = item.id === user?.id;
          const name = item.full_name || item.username || 'عضو';
          const medal = index < 3;
          return (
            <Pressable
              onPress={() => router.push(me ? '/profile' : (profilePath(item.id,item.username) as any))}
              accessibilityRole="link"
              accessibilityLabel={`المركز ${index + 1}: ${name}${me ? ' (أنت)' : ''}، ${item.xp ?? 0} XP${item.province ? `، ${item.province}` : ''}`}
              style={(s: any) => ({ borderRadius: t.radius.md, backgroundColor: me ? t.colors.brandSoft : s.hovered || s.pressed ? t.colors.surfacePressed : 'transparent' })}
            >
              <Row gap={12} style={{ paddingHorizontal: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: t.colors.border }}>
                <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: medal ? t.colors.xpSoft : 'transparent' }}>
                  <Text variant="label" weight="bold" tone={medal ? 'xp' : 'muted'} align="center" tabular ltr>
                    {index + 1}
                  </Text>
                </View>
                <Avatar uri={item.avatar_url} name={name} size={38} />
                <View style={{ flex: 1 }}>
                  <Row gap={4} style={{ justifyContent: 'flex-start' }}>
                    <Text variant="body" weight={me ? 'bold' : 'medium'} numberOfLines={1} style={{ flexShrink: 1 }}>
                      {name}
                      {me ? ' (أنت)' : ''}
                    </Text>
                    <VerifiedBadge verified={item.is_verified} size={14} />
                  </Row>
                  {!!item.province && (
                    <Text variant="caption" tone="muted">
                      {item.province}
                    </Text>
                  )}
                </View>
                <Text variant="label" tone="secondary" tabular ltr>
                  {formatXp(item.xp ?? 0)} XP
                </Text>
              </Row>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}
