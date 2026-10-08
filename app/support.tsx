/**
 * الدعم الفني: رسالة جديدة، تذاكري، ومحادثة التذكرة مع فريق Kodax (+ حسابات التواصل).
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Linking, Platform, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { supportService, type SupportTicket, type SupportMessage, type SupportNotification } from '@/services/supportService';
import { timeAgo } from '@/components/editor/NotificationButton';
import { Screen, AppBar, Text, Row, Col, Segmented, Field, Button, IconButton, Surface, Tag, ListGroup, ListRow, EmptyState, ListSkeleton, SectionHeader, useTheme, type IconName } from '@/design';

const SOCIAL: { name: string; icon: IconName; url: string; handle: string }[] = [
  { name: 'Telegram', icon: 'paper-plane-outline', url: 'https://t.me/mo7za', handle: '@mo7za' },
  { name: 'Instagram', icon: 'logo-instagram', url: 'https://instagram.com/mo_nz.0', handle: '@mo_nz.0' },
  { name: 'TikTok', icon: 'logo-tiktok', url: 'https://tiktok.com/@irq.dv', handle: '@irq.dv' },
];
const STATUS: Record<string, { label: string; tone: 'warning' | 'info' | 'success' | 'muted' }> = {
  open: { label: 'مفتوحة', tone: 'warning' },
  in_progress: { label: 'قيد المعالجة', tone: 'info' },
  resolved: { label: 'تم الحل', tone: 'success' },
  closed: { label: 'مغلقة', tone: 'muted' },
};

export default function SupportScreen() {
  const t = useTheme();
  const { user } = useAuth();
  const [tab, setTab] = useState<'compose' | 'tickets'>('compose');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [notifications, setNotifications] = useState<SupportNotification[]>([]);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [chat, setChat] = useState<SupportMessage[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [reply, setReply] = useState('');
  const unsubRef = useRef<null | (() => void)>(null);

  const loadTickets = useCallback(async () => {
    setLoadingTickets(true);
    setTickets(await supportService.getUserTickets());
    setLoadingTickets(false);
  }, []);
  useEffect(() => {
    loadTickets();
    supportService.getUnreadNotifications().then(setNotifications);
  }, [loadTickets]);

  const loadChat = async (id: string) => {
    setLoadingChat(true);
    setChat(await supportService.getTicketMessages(id));
    setLoadingChat(false);
    await supportService.markNotificationsRead(id);
    setNotifications((prev) => prev.filter((n) => n.ticket_id !== id));
  };

  useEffect(() => {
    if (!user?.id) return;
    return supportService.subscribeToNotifications(user.id, (n) => {
      setNotifications((prev) => [n, ...prev]);
      if (ticket?.id === n.ticket_id) loadChat(n.ticket_id!);
    });
  }, [user?.id, ticket?.id]);
  useEffect(() => () => unsubRef.current?.(), []);

  const open = (tk: SupportTicket) => {
    unsubRef.current?.();
    setTicket(tk);
    loadChat(tk.id);
    unsubRef.current = supportService.subscribeToTicketMessages(tk.id, (m) => setChat((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m])));
  };
  const close = () => {
    unsubRef.current?.();
    unsubRef.current = null;
    setTicket(null);
    loadTickets();
  };

  const send = async () => {
    if (!message.trim()) return;
    setSending(true);
    setSendError(null);
    const r = await supportService.createTicket({ message: message.trim() });
    setSending(false);
    if (r.success) {
      setSent(true);
      setMessage('');
      loadTickets();
    } else setSendError(r.error || 'تعذّر إرسال الرسالة. حاول مرة أخرى.');
  };
  const sendReply = async () => {
    if (!reply.trim() || !ticket) return;
    if (await supportService.sendMessage(ticket.id, reply.trim())) {
      setReply('');
      loadChat(ticket.id);
    }
  };

  const unreadFor = (id: string) => notifications.filter((n) => n.ticket_id === id).length;

  if (ticket) {
    const st = STATUS[ticket.status ?? 'open'] ?? STATUS.open;
    return (
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Screen
          width="reading"
          header={<AppBar title={ticket.subject || 'تذكرة دعم'} subtitle={st.label} back={false} actions={<IconButton icon="close" label="العودة للتذاكر" onPress={close} />} border />}
          footer={
            ticket.status === 'closed' ? undefined : (
              <View style={{ borderTopWidth: 1, borderTopColor: t.colors.border, padding: 12 }}>
                <Row gap={8} align="flex-end" style={{ width: '100%', maxWidth: t.layout.readingWidth, alignSelf: 'center' }}>
                  <Field label="ردّك" hideLabel placeholder="اكتب ردك…" value={reply} onChangeText={setReply} multiline minHeight={48} style={{ flex: 1 }} />
                  <IconButton icon="send" label="إرسال الرد" variant="brand" onPress={sendReply} disabled={!reply.trim()} style={{ marginBottom: 2, transform: [{ scaleX: -1 }] }} />
                </Row>
              </View>
            )
          }
        >
          {loadingChat ? (
            <ListSkeleton rows={2} />
          ) : (
            <Col gap={10}>
              {chat.map((m) => {
                const mine = m.sender_type !== 'admin';
                return (
                  <View key={m.id} style={{ alignItems: mine ? 'flex-end' : 'flex-start' }}>
                    {!mine && (
                      <Text variant="caption" tone="brand" style={{ marginBottom: 2 }}>
                        فريق Kodax
                      </Text>
                    )}
                    <View style={{ maxWidth: '85%', padding: 12, borderRadius: 14, backgroundColor: mine ? t.colors.brandStrong : t.colors.surfaceRaised, borderWidth: mine ? 0 : 1, borderColor: t.colors.border }}>
                      <Text variant="body" selectable style={{ color: mine ? '#fff' : t.colors.text }}>
                        {m.message}
                      </Text>
                      <Text variant="caption" style={{ color: mine ? 'rgba(255,255,255,0.7)' : t.colors.textMuted, fontSize: 11, marginTop: 2 }}>
                        {timeAgo(new Date(m.created_at))}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </Col>
          )}
        </Screen>
      </KeyboardAvoidingView>
    );
  }

  return (
    <Screen width="reading" header={<AppBar title="الدعم الفني" fallback="/profile" />}>
      <Col gap={18}>
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'compose', label: 'رسالة جديدة' },
            { value: 'tickets', label: 'تذاكري', count: tickets.length || undefined },
          ]}
        />
        {tab === 'compose' ? (
          sent ? (
            <Surface variant="success" padding={16}>
              <Text variant="heading">وصلت رسالتك</Text>
              <Text variant="bodySm" tone="secondary" style={{ marginTop: 4 }}>
                يرد الفريق عادةً خلال يوم. يصلك إشعار عند الرد، وتلقى المحادثة في «تذاكري».
              </Text>
              <Row gap={8} style={{ marginTop: 12 }}>
                <Button label="تذاكري" onPress={() => setTab('tickets')} />
                <Button label="رسالة أخرى" variant="ghost" onPress={() => setSent(false)} />
              </Row>
            </Surface>
          ) : (
            <Col gap={12}>
              <Text variant="bodySm" tone="secondary">
                اكتب مشكلتك أو اقتراحك بالتفصيل (مثلاً اسم الدرس أو التحدي). نرسل الرد هنا وكإشعار.
              </Text>
              <Field label="رسالتك" placeholder="شنو صار وياك؟" value={message} onChangeText={setMessage} multiline minHeight={140} maxLength={2000} error={sendError} hint={user?.email ? `من: ${user.email}` : undefined} />
              <Button label="أرسل للدعم" icon="send-outline" onPress={send} loading={sending} disabled={!message.trim()} size="lg" />
            </Col>
          )
        ) : loadingTickets ? (
          <ListSkeleton rows={3} />
        ) : tickets.length === 0 ? (
          <EmptyState icon="chatbubbles-outline" title="ماكو تذاكر بعد" body="أرسل رسالتك الأولى من «رسالة جديدة»." action="رسالة جديدة" onAction={() => setTab('compose')} compact />
        ) : (
          <Surface padding={0}>
            {tickets.map((tk, i) => {
              const st = STATUS[tk.status ?? 'open'] ?? STATUS.open;
              const unread = unreadFor(tk.id);
              return (
                <Pressable key={tk.id} onPress={() => open(tk)} accessibilityRole="button" accessibilityLabel={`${tk.subject || 'تذكرة'}، ${st.label}${unread ? '، رد جديد' : ''}`} style={(s: any) => ({ backgroundColor: s.hovered || s.pressed ? t.colors.surfacePressed : 'transparent' })}>
                  <Row gap={10} style={{ padding: 14, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: t.colors.border }}>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text variant="label" weight={unread ? 'bold' : 'semibold'} numberOfLines={1}>
                        {tk.subject || 'تذكرة دعم'}
                      </Text>
                      <Row gap={6} style={{ justifyContent: 'flex-start' }}>
                        <Tag label={st.label} tone={st.tone === 'muted' ? 'muted' : st.tone} />
                        {unread > 0 && <Tag label="رد جديد" tone="brand" />}
                        <Text variant="caption" tone="muted">
                          {timeAgo(new Date(tk.updated_at || tk.created_at))}
                        </Text>
                      </Row>
                    </View>
                    <Ionicons name="chevron-back" size={18} color={t.colors.textMuted} />
                  </Row>
                </Pressable>
              );
            })}
          </Surface>
        )}

        <View>
          <SectionHeader title="تابعنا وراسلنا" />
          <ListGroup>
            {SOCIAL.map((s, i) => (
              <ListRow key={s.name} icon={s.icon} title={s.name} value={s.handle} onPress={() => Linking.openURL(s.url).catch(() => undefined)} last={i === SOCIAL.length - 1} accessibilityHint="يفتح خارج التطبيق" />
            ))}
          </ListGroup>
        </View>
      </Col>
    </Screen>
  );
}
