import { profilePath } from '@/services/profileLinks';
/**
 * محادثة خاصة.
 * - الفقاعة بعرض أقصى نسبي والنص يلتف (حتى الروابط الطويلة) — F01
 * - فواصل الأيام، الوقت، «معدّلة»، الحذف
 * - رسائلي: تعديل/حذف بضغطة مطوّلة؛ رسائل الطرف الآخر: إبلاغ
 * - الرجوع بلا سجل تنقّل يذهب لقائمة الرسائل — F21
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { getConversationDetail, sendMessage, markMessagesAsRead, subscribeToMessages, editMessage, deleteMessage, type ConversationDetail, type Message } from '@/services/messageService';
import { blockUser, unblockUser, isUserBlocked } from '@/services/codeFeedService';
import ReportUserSheet from '@/components/social/ReportUserSheet';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import { useKeyboardOverlap } from '@/hooks/useKeyboardOverlap';
import { SharedMessageCard } from '@/features/community/SharedMessageCard';
import { showToast } from '@/components/ui/Toast';
import { Screen, AppBar, Text, Row, Col, Avatar, IconButton, Button, Field, Sheet, ListGroup, ListRow, Surface, EmptyState, ErrorState, ListSkeleton, useTheme } from '@/design';

type Msg = Message & { sender?: { id: string; full_name: string | null; username: string | null; avatar_url: string | null } };

const dayKey = (iso: string) => new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Asia/Baghdad' });
function dayLabel(iso: string) {
  const k = dayKey(iso);
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Baghdad' });
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA', { timeZone: 'Asia/Baghdad' });
  if (k === today) return 'اليوم';
  if (k === yesterday) return 'أمس';
  return new Date(iso).toLocaleDateString('ar-IQ-u-nu-latn', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Baghdad' });
}
const timeOf = (iso: string) => new Date(iso).toLocaleTimeString('ar-IQ-u-nu-latn', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Baghdad' });

export default function ConversationScreen() {
  const keyboardRoot = useRef<View>(null);
  const keyboardOverlap = useKeyboardOverlap(keyboardRoot);
  const t = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [conv, setConv] = useState<ConversationDetail | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [blockBusy, setBlockBusy] = useState(false);
  const [report, setReport] = useState<{ messageId: string | null; preview: string | null } | null>(null);
  const [menu, setMenu] = useState<null | { kind: 'mine'; msg: Msg } | { kind: 'chat' } | { kind: 'confirmDelete'; msg: Msg } | { kind: 'confirmBlock' }>(null);
  const [editing, setEditing] = useState<{ msg: Msg; text: string } | null>(null);
  const listRef = useRef<FlatList>(null);

  const load = useCallback(async () => {
    if (!id || !user?.id) return;
    const { data, error: err } = await getConversationDetail(id, user.id);
    if (err || !data) {
      setError(true);
      setLoading(false);
      return;
    }
    setError(false);
    setConv(data);
    setMessages(data.messages as Msg[]);
    setLoading(false);
    if (data.other_user?.id) isUserBlocked(data.other_user.id).then(setBlocked);
    markMessagesAsRead(id, user.id);
  }, [id, user?.id]);
  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!id || !user?.id) return;
    return subscribeToMessages(id, {
      onInsert: (m) => {
        setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m as Msg]));
        if (m.sender_id !== user.id) markMessagesAsRead(id, user.id);
      },
      onUpdate: (m) => setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, ...m, sender: x.sender } : x))),
      onDelete: (m) => setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, ...m, sender: x.sender } : x))),
    });
  }, [id, user?.id]);

  // عناصر القائمة: رسائل + فواصل أيام
  const rows = useMemo(() => {
    const out: ({ type: 'day'; key: string; label: string } | { type: 'msg'; key: string; msg: Msg; first: boolean })[] = [];
    let lastDay = '';
    let lastSender = '';
    for (const m of messages) {
      const d = dayKey(m.created_at);
      if (d !== lastDay) {
        out.push({ type: 'day', key: 'd' + d, label: dayLabel(m.created_at) });
        lastDay = d;
        lastSender = '';
      }
      out.push({ type: 'msg', key: m.id, msg: m, first: m.sender_id !== lastSender });
      lastSender = m.sender_id;
    }
    return out;
  }, [messages]);

  const other = conv?.other_user;
  const name = other?.full_name || other?.username || 'عضو';

  const send = async () => {
    const content = text.trim();
    if (!content || !id || !user?.id || sending) return;
    setText('');
    setSending(true);
    setSendError(null);
    const { data, error: err } = await sendMessage(id, user.id, content);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    if (err) {
      setText(content);
      setSendError(err?.code === '42501' || String(err?.message ?? '').includes('row-level security') ? 'لا يمكن إرسال رسائل إلى هذا العضو.' : 'تعذّر الإرسال. حاول مرة أخرى.');
    } else if (data) {
      setMessages((prev) => (prev.some((x) => x.id === data.id) ? prev : [...prev, data as Msg]));
    }
    setSending(false);
  };

  const toggleBlock = async () => {
    if (!other?.id || blockBusy) return;
    setBlockBusy(true);
    const res = blocked ? await unblockUser(other.id) : await blockUser(other.id);
    setBlockBusy(false);
    setMenu(null);
    if (!res.success) return showToast.error(blocked ? 'تعذّر إلغاء الحظر. حاول مرة أخرى.' : 'تعذّر الحظر. حاول مرة أخرى.');
    setBlocked(!blocked);
    showToast.success(blocked ? `تم إلغاء حظر ${name}` : `تم حظر ${name}`);
  };

  const saveEdit = async () => {
    if (!editing?.text.trim()) return;
    const { error: err } = await editMessage(editing.msg.id, editing.text.trim());
    if (err) showToast.error('تعذّر تعديل الرسالة');
    else setMessages((prev) => prev.map((x) => (x.id === editing.msg.id ? { ...x, content: editing.text.trim(), is_edited: true } : x)));
    setEditing(null);
  };
  const remove = async (msg: Msg) => {
    setMenu(null);
    const { error: err } = await deleteMessage(msg.id);
    if (err) showToast.error('تعذّر حذف الرسالة');
    else setMessages((prev) => prev.map((x) => (x.id === msg.id ? { ...x, is_deleted: true } : x)));
  };

  const header = (
    <AppBar
      fallback={'/messages' as any}
      border
      center={
        other ? (
          <Pressable onPress={() => router.push(profilePath(other.id,other.username) as any)} accessibilityRole="link" accessibilityLabel={`ملف ${name}`}>
            <Row gap={10} style={{ justifyContent: 'flex-start' }}>
              <Avatar uri={other.avatar_url} name={name} size={34} />
              <Row gap={4} style={{ flexShrink: 1 }}>
                <Text variant="heading" numberOfLines={1} style={{ flexShrink: 1 }}>
                  {name}
                </Text>
                <VerifiedBadge verified={other.is_verified} size={15} />
              </Row>
            </Row>
          </Pressable>
        ) : (
          <Text variant="heading">محادثة</Text>
        )
      }
      actions={other ? <IconButton icon="ellipsis-horizontal" label="خيارات المحادثة: إبلاغ أو حظر" onPress={() => setMenu({ kind: 'chat' })} /> : undefined}
    />
  );

  if (loading) {
    return (
      <Screen header={header} width="reading">
        <ListSkeleton rows={3} />
      </Screen>
    );
  }
  if (error || !conv) {
    return (
      <Screen header={header} width="reading">
        <ErrorState
          title="تعذّر فتح المحادثة"
          onRetry={() => {
            setLoading(true);
            load();
          }}
        />
      </Screen>
    );
  }

  return (
    <View ref={keyboardRoot} style={{ flex: 1, backgroundColor: t.colors.bg }}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, paddingBottom: keyboardOverlap }}>
      <Screen
        header={header}
        width="reading"
        scroll={false}
        padded={false}
        footer={
          <View style={{ borderTopWidth: 1, borderTopColor: t.colors.border, backgroundColor: t.colors.bg }}>
            <View style={{ width: '100%', maxWidth: t.layout.readingWidth, alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 8 }}>
              {blocked ? (
                <Surface variant="danger" padding={12}>
                  <Text variant="bodySm" style={{ marginBottom: 8 }}>
                    حظرت {name}. لا يمكن تبادل الرسائل حتى تلغي الحظر.
                  </Text>
                  <Button label="إلغاء الحظر" variant="secondary" size="sm" onPress={toggleBlock} loading={blockBusy} style={{ alignSelf: 'flex-start' }} />
                </Surface>
              ) : (
                <Row gap={8} align="flex-end">
                  <Field label="اكتب رسالة" hideLabel placeholder="اكتب رسالة…" value={text} onChangeText={setText} multiline minHeight={48} maxLength={2000} style={{ flex: 1 }} error={sendError} />
                  <IconButton icon="send" label="إرسال" variant="brand" onPress={send} disabled={!text.trim() || sending} style={{ marginBottom: sendError ? 26 : 2, transform: [{ scaleX: -1 }] }} />
                </Row>
              )}
            </View>
          </View>
        }
      >
        <FlatList
          ref={listRef}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
          data={rows}
          keyExtractor={(r) => r.key}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12, flexGrow: 1 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={<EmptyState icon="chatbubble-ellipses-outline" title={`ابدأ المحادثة مع ${name}`} body="رسالة قصيرة تكفي: سؤال عن كوده أو فكرة تشتغلون عليها." compact />}
          renderItem={({ item }) => {
            if (item.type === 'day') {
              return (
                <View style={{ alignItems: 'center', marginVertical: 10 }}>
                  <Text variant="caption" tone="muted" style={{ paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10, backgroundColor: t.colors.surface }}>
                    {item.label}
                  </Text>
                </View>
              );
            }
            const m = item.msg;
            const mine = m.sender_id === user?.id;
            const shared = !m.is_deleted && !!m.shared_type && !!m.shared_id;
            const showMessageText = !shared || !/^(مشاركة (كود|منشور)|كود مشارك|منشور مشارك)$/.test(m.content.trim());
            return (
              <View style={{ alignItems: mine ? 'flex-end' : 'flex-start', marginTop: item.first ? 10 : 3 }}>
                <Pressable
                  onLongPress={() => {
                    if (m.is_deleted) return;
                    if (mine) setMenu({ kind: 'mine', msg: m });
                    else setReport({ messageId: m.id, preview: m.content });
                  }}
                  delayLongPress={350}
                  accessibilityRole="text"
                  accessibilityLabel={`${mine ? 'أنت' : name}: ${m.is_deleted ? 'رسالة محذوفة' : m.content}، ${timeOf(m.created_at)}`}
                  accessibilityHint={m.is_deleted ? undefined : mine ? 'اضغط مطوّلاً للتعديل أو الحذف' : 'اضغط مطوّلاً للإبلاغ'}
                  style={{
                    maxWidth: '82%',
                    width: shared ? 280 : undefined,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 16,
                    borderTopRightRadius: !shared && mine && item.first ? 4 : 16,
                    borderTopLeftRadius: !shared && !mine && item.first ? 4 : 16,
                    backgroundColor: m.is_deleted ? 'transparent' : shared ? t.colors.surfaceRaised : mine ? t.colors.brandStrong : t.colors.surfaceRaised,
                    borderWidth: shared || m.is_deleted || !mine ? 1 : 0,
                    borderColor: t.colors.border,
                    ...(shared ? { borderTopWidth: 2, borderTopColor: t.colors.brand, paddingTop: 14 } : {}),
                  }}
                >
                  {showMessageText && <Text
                    variant="body"
                    selectable={!m.is_deleted}
                    style={[{ color: m.is_deleted ? t.colors.textMuted : mine && !shared ? '#fff' : t.colors.text, fontStyle: m.is_deleted ? 'italic' : 'normal', marginBottom: shared ? 10 : 0 }, Platform.OS === 'web' ? ({ wordBreak: 'break-word', overflowWrap: 'anywhere' } as any) : null]}
                  >
                    {m.is_deleted ? 'حُذفت هذه الرسالة' : m.content}
                  </Text>}
                  {!m.is_deleted&&m.shared_type&&m.shared_id&&<SharedMessageCard type={m.shared_type} id={m.shared_id}/>}
                  <Text variant="caption" style={{ color: mine && !m.is_deleted && !shared ? 'rgba(255,255,255,0.7)' : t.colors.textMuted, fontSize: 11, lineHeight: 14, marginTop: shared ? 12 : 2, ...(shared ? { paddingTop: 8, borderTopWidth: 1, borderTopColor: t.colors.border } : {}) }} align={mine ? 'left' : 'right'}>
                    {timeOf(m.created_at)}
                    {m.is_edited && !m.is_deleted ? ' · معدّلة' : ''}
                    {mine && !m.is_deleted ? (m.is_read ? ' · قُرئت' : '') : ''}
                  </Text>
                </Pressable>
              </View>
            );
          }}
        />
      </Screen>

      <Sheet
        visible={!!menu}
        onClose={() => setMenu(null)}
        title={menu?.kind === 'confirmDelete' ? 'حذف الرسالة؟' : menu?.kind === 'confirmBlock' ? `حظر ${name}؟` : menu?.kind === 'mine' ? 'رسالتك' : name}
        maxWidth={420}
      >
        {menu?.kind === 'mine' && (
          <ListGroup>
            <ListRow
              icon="create-outline"
              title="تعديل"
              chevron={false}
              onPress={() => {
                setEditing({ msg: menu.msg, text: menu.msg.content });
                setMenu(null);
              }}
            />
            <ListRow icon="trash-outline" title="حذف" danger chevron={false} last onPress={() => setMenu({ kind: 'confirmDelete', msg: menu.msg })} />
          </ListGroup>
        )}
        {menu?.kind === 'confirmDelete' && (
          <Col gap={14}>
            <Text variant="body" tone="secondary">
              تظهر للطرفين «حُذفت هذه الرسالة».
            </Text>
            <Row gap={8}>
              <Button label="حذف" variant="danger" onPress={() => remove(menu.msg)} style={{ flex: 1 }} />
              <Button label="إلغاء" variant="secondary" onPress={() => setMenu(null)} style={{ flex: 1 }} />
            </Row>
          </Col>
        )}
        {menu?.kind === 'chat' && (
          <ListGroup>
            <ListRow
              icon="person-outline"
              title="عرض الملف"
              onPress={() => {
                setMenu(null);
                other && router.push(profilePath(other.id,other.username) as any);
              }}
            />
            <ListRow
              icon="flag-outline"
              title="إبلاغ"
              subtitle="يراجعه فريق الإشراف"
              chevron={false}
              onPress={() => {
                setMenu(null);
                setReport({ messageId: null, preview: null });
              }}
            />
            <ListRow icon="ban-outline" title={blocked ? 'إلغاء الحظر' : 'حظر'} danger={!blocked} chevron={false} last onPress={() => (blocked ? toggleBlock() : setMenu({ kind: 'confirmBlock' }))} />
          </ListGroup>
        )}
        {menu?.kind === 'confirmBlock' && (
          <Col gap={14}>
            <Text variant="body" tone="secondary">
              لن يستطيع مراسلتك ولن تستطيع مراسلته حتى تلغي الحظر. الرسائل السابقة تبقى كما هي.
            </Text>
            <Row gap={8}>
              <Button label="حظر" variant="danger" onPress={toggleBlock} loading={blockBusy} style={{ flex: 1 }} />
              <Button label="إلغاء" variant="secondary" onPress={() => setMenu(null)} style={{ flex: 1 }} />
            </Row>
          </Col>
        )}
      </Sheet>

      <Sheet visible={!!editing} onClose={() => setEditing(null)} title="تعديل الرسالة" maxWidth={480} footer={<Button label="حفظ" onPress={saveEdit} disabled={!editing?.text.trim()} full />}>
        <Field label="الرسالة" hideLabel value={editing?.text ?? ''} onChangeText={(v) => setEditing((e) => (e ? { ...e, text: v } : e))} multiline maxLength={2000} />
      </Sheet>

      {report && other && (
        <ReportUserSheet visible onClose={() => setReport(null)} userId={other.id} userName={name} messageId={report.messageId} messagePreview={report.preview} hideBlock={blocked} onBlocked={() => setBlocked(true)} />
      )}
    </KeyboardAvoidingView>
    </View>
  );
}
