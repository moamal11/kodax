import { supabase } from '@/lib/supabase';
import { PROGRAMMING_FIELDS } from '@/constants';
import { ALL_COURSES, getCoursesByField, getLessonsByCourse, getChallengesByCourse } from '@/constants/courseData';
/**
 * شهاداتي: شهادات الإتمام حسب المستوى، والتحقق من أي شهادة برقمها.
 * الحالة الفارغة تشرح كيف تُكتسب الشهادة (F26: صياغة «لا توجد شهادات ذهبية بعد»).
 */
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, RefreshControl, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { certificateService } from '@/services/certificateService';
import { CERTIFICATE_LEVEL_CONFIG, type CertificateLevel, type UserCertificatesSummary } from '@/types/certificate';
import {
  Screen,
  AppBar,
  Text,
  Row,
  Col,
  Segmented,
  Surface,
  Tag,
  Button,
  IconButton,
  EmptyState,
  ErrorState,
  ListSkeleton,
  ProgressBar,
  useTheme,
} from '@/design';

type Filter = 'all' | CertificateLevel;
const EMPTY_LABEL: Record<CertificateLevel, string> = { silver: 'فضية', gold: 'ذهبية', platinum: 'بلاتينية' };

export default function CertificatesScreen() {
  const t = useTheme();
  const router = useRouter();
  const { user, fullName } = useAuth();
  const [summary, setSummary] = useState<UserCertificatesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [how, setHow] = useState(false);
  const [completed, setCompleted] = useState<Set<string> | null>(null);
  const request = useRef(0);
  const [filter, setFilter] = useState<Filter>('all');

  const load = useCallback(async () => {
    if (!user?.id) return;
    const version = ++request.current;
    try {
      certificateService.setUser(user.id);
      const [certs, progress] = await Promise.all([
        certificateService.getUserCertificates(),
        supabase.from('user_lesson_progress').select('lesson_id').eq('user_id', user.id).eq('completed', true),
      ]);
      if (version !== request.current) return;
      setSummary(certs);
      setCompleted(progress.error ? null : new Set((progress.data ?? []).map((r) => r.lesson_id)));
      setError(false);
    } catch {
      if (version !== request.current) return;
      const offline = await certificateService.getCertificatesOffline();
      if (offline) {
        setSummary(offline);
        setError(false);
      } else setError(true);
    } finally {
      if (version === request.current) setLoading(false);
    }
  }, [user?.id]);
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setSummary(null);
      setCompleted(null);
      load();
      return () => {
        request.current++;
      };
    }, [load])
  );

  const list = useMemo(() => (summary?.certificates ?? []).filter((c) => filter === 'all' || c.level === filter), [summary, filter]);

  const certs = summary?.certificates ?? [];
  const counts = {
    all: certs.length,
    silver: certs.filter((c) => c.level === 'silver').length,
    gold: certs.filter((c) => c.level === 'gold').length,
    platinum: certs.filter((c) => c.level === 'platinum').length,
  };
  const nearest = completed
    ? PROGRAMMING_FIELDS.map((field) => {
        const courses = getCoursesByField(field.id);
        const lessons = courses.flatMap((c) => getLessonsByCourse(c.id));
        const challenges = courses.flatMap((c) => getChallengesByCourse(c.id));
        const lessonDone = lessons.filter((l) => completed.has(l.id)).length;
        const challengeDone = challenges.filter((c) => completed.has(c.id)).length;
        const lp = lessons.length ? Math.round((100 * lessonDone) / lessons.length) : 0;
        const cp = challenges.length ? Math.round((100 * challengeDone) / challenges.length) : 100;
        return { field, courses, lessons, challenges, lessonDone, challengeDone, lp, cp, score: (Math.min(lp / 50, 1) + Math.min(cp / 25, 1)) / 2 };
      })
        .filter((f) => f.lessons.length > 0 && f.lessonDone + f.challengeDone > 0)
        .sort((a, b) => b.score - a.score)[0]
    : null;

  return (
    <Screen
      width="reading"
      header={
        <AppBar
          title="شهاداتي"
          fallback="/profile"
          actions={<IconButton icon="shield-checkmark-outline" label="التحقق من شهادة" onPress={() => router.push('/certificate/verify')} />}
        />
      }
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
        <ErrorState title="تعذّر تحميل الشهادات" onRetry={load} />
      ) : (
        <Col gap={16}>
          <Row gap={10}>
            <Ionicons name="ribbon-outline" size={30} color={t.colors.brandText} />
            <Col flex={1} gap={2}>
              <Text variant="heading">إنجاز يستحق ينحفظ</Text>
              <Text variant="bodySm" tone="secondary">
                {certs.length ? `${certs.length} شهادات إتمام، لكل واحدة رحلة ورقم تحقق.` : 'خطواتك في التعلّم تقرّبك من أول شهادة.'}
              </Text>
            </Col>
          </Row>
          <Segmented
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'الكل', count: counts.all },
              { value: 'silver', label: 'فضية', count: counts.silver },
              { value: 'gold', label: 'ذهبية', count: counts.gold },
              { value: 'platinum', label: 'بلاتينية', count: counts.platinum },
            ]}
          />
          {list.length === 0 ? (
            <Col gap={14}>
              <EmptyState
                icon="ribbon-outline"
                title={filter === 'all' ? 'ما عندك شهادات بعد' : `لا توجد شهادات ${EMPTY_LABEL[filter]} بعد`}
                body={filter === 'all' ? 'خطوتك الأولى تبدأ من درس، وتكتمل بالتحديات.' : 'جرّب فلتر الكل لعرض بقية شهاداتك.'}
                action={filter === 'all' ? 'تابع التعلم' : 'عرض كل الشهادات'}
                onAction={() => (filter === 'all' ? router.push('/learn' as any) : setFilter('all'))}
              />
              {filter === 'all' && nearest && (
                <Surface padding={18}>
                  <Col gap={10}>
                    <Text variant="label" tone="brand">
                      أقرب مسار لأول شهادة فضية
                    </Text>
                    <Text variant="heading">{nearest.field.nameAr}</Text>
                    <Text variant="bodySm" tone="secondary">
                      تقدمك الحالي: {nearest.lessonDone} من {nearest.lessons.length} درس، و{nearest.challengeDone} من {nearest.challenges.length} تحدٍّ.
                    </Text>
                    <ProgressBar value={nearest.lp / 50} label="تقدم الدروس نحو الفضية" />
                    <Text variant="caption" tone="secondary">
                      الدروس: {nearest.lp}% · المطلوب 50%
                    </Text>
                    <ProgressBar value={nearest.cp / 25} label="تقدم التحديات نحو الفضية" />
                    <Text variant="caption" tone="secondary">
                      التحديات: {nearest.cp}% · المطلوب 25%
                    </Text>
                    <Text variant="caption" tone="muted">
                      التقدم الحالي للتوجيه فقط؛ الأهلية والاستلام في صفحة الدورة.
                    </Text>
                    <Button label="كمّل هذا المسار" onPress={() => router.push(`/learn?field=${nearest.field.id}` as any)} />
                  </Col>
                </Surface>
              )}
            </Col>
          ) : (
            <Col gap={10}>
              {list.map((c) => {
                const cfg = CERTIFICATE_LEVEL_CONFIG[c.level];
                const archived = c.status === 'archived';
                return (
                  <Surface key={c.id} padding={16}>
                    <Col gap={12}>
                      <Row gap={14} align="flex-start">
                        <View
                          accessible
                          accessibilityLabel={`معاينة شهادة ${cfg.labelAr}`}
                          style={{
                            width: 90,
                            minHeight: 112,
                            backgroundColor: t.colors.brandSoft,
                            borderWidth: 1,
                            borderColor: t.colors.borderStrong,
                            borderRadius: 6,
                            padding: 9,
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <Ionicons name="ribbon-outline" size={24} color={t.colors.brandText} />
                          <Text variant="caption" align="center" tone="brand">
                            شهادة إتمام
                          </Text>
                          <View style={{ width: '80%', height: 2, backgroundColor: t.colors.borderStrong }} />
                          <Text variant="caption" align="center" numberOfLines={2}>
                            {fullName || 'Kodax'}
                          </Text>
                          <Text variant="caption" align="center" tone="secondary">
                            {cfg.labelAr}
                          </Text>
                        </View>
                        <Col flex={1} gap={5}>
                          <Text variant="heading">{c.field_name_ar || c.field_name || c.course_title_ar || c.course_title}</Text>
                          <Text variant="bodySm" tone="secondary">
                            شهادة إتمام {cfg.labelAr}
                          </Text>
                          <Tag
                            label={c.status === 'revoked' ? 'ملغاة' : archived ? 'مؤرشفة' : 'صالحة'}
                            tone={c.status === 'revoked' ? 'danger' : archived ? 'muted' : 'success'}
                          />
                          <Text variant="caption" tone="secondary">
                            {new Date(c.issued_at).toLocaleDateString('ar-IQ-u-nu-latn', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              timeZone: 'Asia/Baghdad',
                            })}
                          </Text>
                        </Col>
                      </Row>
                      <Button label="عرض الشهادة" icon="ribbon-outline" variant="secondary" onPress={() => router.push(`/certificate/${c.id}` as any)} />
                    </Col>
                  </Surface>
                );
              })}
            </Col>
          )}
          <Surface padding={14}>
            <Button label="كيف أحصل على شهادة؟" icon={how ? 'chevron-up' : 'chevron-down'} variant="ghost" onPress={() => setHow(!how)} />
            {how && (
              <Col gap={10} style={{ paddingTop: 12 }}>
                <Text variant="bodySm" tone="secondary">
                  كل مسار له ثلاثة مستويات. أكمل الدروس والتحديات، ثم استلم شهادتك من صفحة الدورة عند تحقق الأهلية.
                </Text>
                {[
                  ['الفضية', '50% دروس · 25% تحديات'],
                  ['الذهبية', '75% دروس · 60% تحديات'],
                  ['البلاتينية', '100% دروس · 100% تحديات بلا أخطاء حرجة'],
                ].map(([level, req]) => (
                  <Col key={level} gap={2}>
                    <Text variant="label">{level}</Text>
                    <Text variant="bodySm" tone="secondary">
                      {req}
                    </Text>
                  </Col>
                ))}
                <Text variant="caption" tone="muted">
                  شهادة Kodax توثّق إتمامك وتقدمك، وليست اعتمادًا أكاديميًا. التحقق متاح لمن لديه حساب.
                </Text>
              </Col>
            )}
          </Surface>
          <Button label="التحقق من شهادة برقمها" icon="shield-checkmark-outline" variant="secondary" onPress={() => router.push('/certificate/verify')} />
        </Col>
      )}
    </Screen>
  );
}
