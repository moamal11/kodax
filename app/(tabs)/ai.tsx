/**
 * صفحة مساعد Kodax
 * - الهاتف: محادثة بعرض الشاشة، حقل الكتابة ثابت أسفلها فوق الكيبورد، والمحادثات في نافذة.
 * - التابلت: عمود محادثة بعرض مريح في المنتصف.
 * - الكمبيوتر: شريط جانبي للمحادثات + عمود محادثة بعرض محدود وحقل كتابة ثابت أسفله.
 * الحصة تُعرض من السيرفر (ai_get_quota)، والردود الفورية لا تُحسب منها.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../_layout';
import { showAlert } from '@/utils/crossPlatformAlert';
import { aiChatService, AIServiceError, AI_UNAVAILABLE_MESSAGE } from '@/services/aiChatService';
import type { ChatMessage } from '@/services/aiChatService';
import { conversationsService, type Conversation } from '@/services/conversationsService';
import { coinService, type AIQuota } from '@/services/coinService';
import { isRewardedAdsSupported, watchRewardedAd, prepareRewardedAds } from '@/services/rewardedAds';
import { useTabBarMetrics } from '@/components/navigation/tabBarMetrics';
import { useKeyboardOverlap } from '@/hooks/useKeyboardOverlap';
import { MessageItem, AssistantAvatar, type UIMessage } from '@/components/ai/chat/MessageItem';
import { Composer } from '@/components/ai/chat/Composer';
import { QuotaBar } from '@/components/ai/chat/QuotaBar';
import { EmptyChat, TypingIndicator } from '@/components/ai/chat/EmptyChat';
import { ConversationPanel } from '@/components/ai/chat/ConversationPanel';
import { C, breakpointFor } from '@/components/ai/chat/theme';

const SIDEBAR_WIDTH = 290;

export default function AIScreen() {
  const { width } = useWindowDimensions();
  const bp = breakpointFor(width);
  const isPhone = bp === 'phone';
  const isDesktop = bp === 'desktop';
  const insets = useSafeAreaInsets();
  const tabBar = useTabBarMetrics();
  const { user: authUser } = useAuth();
  const userId = authUser?.id ?? '';

  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('general');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [quota, setQuota] = useState<AIQuota | null>(null);
  const [adLoading, setAdLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [atBottom, setAtBottom] = useState(true);
  const listRef = useRef<FlatList<UIMessage>>(null);
  const atBottomRef = useRef(true);
  // مثبّت على آخر رسالة حتى يسحب المستخدم القائمة بنفسه
  const pinnedRef = useRef(true);
  const adsSupported = isRewardedAdsSupported();
  // Android مع edge-to-edge: الكيبورد لا يصغّر النافذة، فنرفع حقل الكتابة بمقدار ما يغطيه
  const rootRef = useRef<View>(null);
  const keyboardOverlap = useKeyboardOverlap(rootRef);

  // ===== تحميل البيانات =====
  const refreshQuota = useCallback(async () => {
    const q = await coinService.getAIQuota();
    if (q) setQuota(q);
  }, []);

  const loadConversations = useCallback(async () => {
    setConversations(await conversationsService.getConversations());
  }, []);

  useEffect(() => {
    if (!userId) return;
    aiChatService.setUser(userId);
    conversationsService.setUser(userId);
    loadConversations();
    refreshQuota();
    if (adsSupported) prepareRewardedAds();
  }, [userId, loadConversations, refreshQuota, adsSupported]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  const scrollToEnd = useCallback((animated = true) => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated }));
  }, []);

  const openConversation = useCallback(
    async (id: string) => {
      setShowPanel(false);
      setCurrentId(id);
      const res = await conversationsService.getConversation(id);
      const msgs: UIMessage[] = (res?.messages ?? [])
        .filter((m: any) => m.role === 'user' || m.role === 'assistant')
        .map((m: any) => ({ id: m.id, role: m.role, content: m.content }));
      setMessages(msgs);
      atBottomRef.current = true;
      pinnedRef.current = true;
      setTimeout(() => scrollToEnd(false), 50);
    },
    [scrollToEnd]
  );

  const newConversation = useCallback(() => {
    setShowPanel(false);
    setCurrentId(null);
    setMessages([]);
    setInput('');
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      showAlert('حذف المحادثة', 'هل أنت متأكد من حذف هذه المحادثة؟', [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            await conversationsService.deleteConversation(id);
            setConversations((cs) => cs.filter((c) => c.id !== id));
            if (id === currentId) newConversation();
          },
        },
      ]);
    },
    [currentId, newConversation]
  );

  // ===== الإرسال =====
  const send = useCallback(
    async (textArg?: string) => {
      const text = (textArg ?? input).trim();
      if (!text || loading) return;
      if (!userId) {
        setMessages((m) => [...m, { id: `err-${Date.now()}`, role: 'error', content: 'سجّل الدخول لاستخدام مساعد Kodax.' }]);
        return;
      }
      setInput('');
      // سياق المحادثة: آخر الرسائل الحقيقية فقط (بدون رسائل الخطأ)
      const history: ChatMessage[] = messages
        .filter((m) => m.role !== 'error')
        .map((m) => ({ id: m.id, role: m.role as 'user' | 'assistant', content: m.content, created_at: '' }));
      const userMsg: UIMessage = { id: `u-${Date.now()}`, role: 'user', content: text };
      setMessages((m) => [...m.filter((x) => x.role !== 'error'), userMsg]);
      setLoading(true);
      atBottomRef.current = true;
      pinnedRef.current = true;
      scrollToEnd();

      let convId = currentId;
      try {
        if (!convId) {
          const conv = await conversationsService.createConversation(text.slice(0, 50), mode);
          if (conv) {
            convId = conv.id;
            setCurrentId(conv.id);
          }
        }
        aiChatService.saveMessage('user', text, mode, undefined, convId || undefined);

        const res = await aiChatService.sendMessage(text, mode, history);
        const aiMsg: UIMessage = { id: `a-${Date.now()}`, role: 'assistant', content: res.response, source: res.source };
        setMessages((m) => [...m, aiMsg]);
        aiChatService.saveMessage('assistant', res.response, mode, res.tokensUsed, convId || undefined);
        if (res.quota) setQuota(res.quota);
        else if (res.source === 'gemini') refreshQuota();
        if (res.tokensUsed > 0) conversationsService.trackTokenUsage(res.tokensUsed);
        loadConversations();
      } catch (e) {
        const err = e instanceof AIServiceError ? e : null;
        if (err?.quota) setQuota(err.quota);
        setMessages((m) => [
          ...m,
          {
            id: `err-${Date.now()}`,
            role: 'error',
            content:
              (err?.message ?? AI_UNAVAILABLE_MESSAGE) +
              (err?.code === 'quota_exceeded' && !adsSupported && err.quota?.ads.can_watch ? ' (الإعلانات المكافئة متاحة بتطبيق Kodax على الهاتف.)' : ''),
            quotaExceeded: err?.code === 'quota_exceeded',
            retryText: err?.code === 'quota_exceeded' ? undefined : text,
          },
        ]);
      } finally {
        setLoading(false);
        if (pinnedRef.current) scrollToEnd();
      }
    },
    [input, loading, userId, messages, currentId, mode, scrollToEnd, refreshQuota, loadConversations, adsSupported]
  );

  const retry = useCallback(
    (text: string) => {
      // إزالة رسالة المستخدم الفاشلة الأخيرة حتى لا تتكرر
      setMessages((m) => {
        const copy = m.filter((x) => x.role !== 'error');
        if (copy.length && copy[copy.length - 1].role === 'user' && copy[copy.length - 1].content === text) copy.pop();
        return copy;
      });
      setTimeout(() => send(text), 0);
    },
    [send]
  );

  // ===== الإعلانات =====
  const watchAd = useCallback(async () => {
    if (adLoading) return;
    setAdLoading(true);
    try {
      const r = await watchRewardedAd('ai_quota');
      if (r.success) {
        if (r.aiQuota) setQuota(r.aiQuota);
        else refreshQuota();
        setNotice(r.bonusUnlocked ? `تمت زيادة حصتك +${r.aiQuota?.ads.bonus_amount ?? ''} 🎉` : 'تم احتساب الإعلان ✅ شاهد الإعلان التالي لإكمال الزيادة.');
        setMessages((m) => m.filter((x) => !(x.role === 'error' && x.quotaExceeded)));
      } else if (r.message) {
        setNotice(r.message);
      }
    } finally {
      setAdLoading(false);
    }
  }, [adLoading, refreshQuota]);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const bottom = contentSize.height - contentOffset.y - layoutMeasurement.height < 80;
    atBottomRef.current = bottom;
    if (bottom) pinnedRef.current = true;
    setAtBottom((prev) => (prev === bottom ? prev : bottom));
  }, []);

  // ===== التخطيط =====
  const columnMax = isDesktop ? 820 : bp === 'tablet' ? 760 : undefined;
  const sidePad = isPhone ? 12 : 24;
  const column = useMemo(() => ({ width: '100%' as const, maxWidth: columnMax, alignSelf: 'center' as const }), [columnMax]);
  const bottomSpace = Platform.OS === 'web' ? tabBar.bottom : Math.max(tabBar.bottom, insets.bottom);
  const lastIsUser = messages.length > 0 && messages[messages.length - 1].role === 'user';

  const header = (
    <View style={[styles.header, { paddingHorizontal: sidePad }]}>
      <View style={[styles.headerInner, column]}>
        <View style={styles.headerTitleWrap}>
          <AssistantAvatar size={isPhone ? 34 : 38} />
          <View>
            <Text style={styles.headerTitle}>مساعد Kodax</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{loading ? 'يكتب…' : 'متصل · يعرف كل دروس Kodax'}</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerActions}>
          <QuotaBar quota={quota} adsSupported={adsSupported} adLoading={adLoading} onWatchAd={watchAd} compact={isPhone} />
          {!isDesktop && (
            <TouchableOpacity style={styles.iconBtn} onPress={() => setShowPanel(true)} accessibilityLabel="المحادثات">
              <Ionicons name="chatbubbles-outline" size={20} color={C.text} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.iconBtn} onPress={newConversation} accessibilityLabel="محادثة جديدة">
            <Ionicons name="create-outline" size={20} color={C.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const chat = (
    <View style={styles.chatCol}>
      {header}
      <View style={styles.listWrap}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <View style={column}>
            <MessageItem message={item} compact={isPhone} onRetry={retry} onWatchAd={watchAd} canWatchAd={adsSupported && !!quota?.ads.can_watch} />
          </View>
        )}
        ListEmptyComponent={<View style={column}><EmptyChat onPick={(t) => send(t)} bp={bp} /></View>}
        ListFooterComponent={loading && lastIsUser ? <View style={column}><TypingIndicator label="المساعد يكتب…" /></View> : null}
        contentContainerStyle={[styles.listContent, { paddingHorizontal: sidePad }]}
        onScroll={onScroll}
        scrollEventThrottle={64}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        onScrollBeginDrag={() => {
          pinnedRef.current = false;
        }}
        onContentSizeChange={() => pinnedRef.current && scrollToEnd()}
      />
      {!atBottom && messages.length > 0 && (
        <TouchableOpacity
          style={styles.toBottom}
          onPress={() => {
            pinnedRef.current = true;
            scrollToEnd();
          }}
          accessibilityLabel="الانتقال لآخر رسالة"
        >
          <Ionicons name="arrow-down" size={18} color="#fff" />
        </TouchableOpacity>
      )}
      </View>
      {notice && (
        <View style={styles.noticeWrap} pointerEvents="none">
          <Text style={styles.notice}>{notice}</Text>
        </View>
      )}
      <View style={[styles.composerWrap, { paddingHorizontal: sidePad, paddingBottom: 10 + (keyboardOverlap > 0 ? keyboardOverlap + insets.bottom : bottomSpace) }]}>
        <View style={column}>
          <Composer value={input} onChange={setInput} onSend={() => send()} loading={loading} mode={mode} onModeChange={setMode} compact={isPhone} />
        </View>
      </View>
    </View>
  );

  return (
    <View ref={rootRef} style={styles.root}>
      <LinearGradient colors={[C.bg, C.bgAlt, C.bg]} style={StyleSheet.absoluteFill} />
      {/* الويب على الشاشات الكبيرة: الشريط العلوي فوق الصفحة؛ غير ذلك: مساحة شريط الحالة.
          (لا نمرر paddingTop لـ SafeAreaView لأنه يلغي حشوة الـ safe area على الهاتف) */}
      <SafeAreaView edges={tabBar.top > 0 ? [] : ['top']} style={styles.safe}>
        {tabBar.top > 0 && <View style={{ height: tabBar.top }} />}
        <KeyboardAvoidingView style={styles.body} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {isDesktop && (
            <View style={[styles.sidebar, { width: SIDEBAR_WIDTH }]}>
              <ConversationPanel
                conversations={conversations}
                currentId={currentId}
                onSelect={openConversation}
                onNew={newConversation}
                onDelete={deleteConversation}
              />
            </View>
          )}
          {chat}
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Modal visible={showPanel && !isDesktop} transparent animationType="fade" onRequestClose={() => setShowPanel(false)}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowPanel(false)} accessibilityLabel="إغلاق" />
          <View style={[styles.sheet, { width: Math.min(360, width * 0.86), paddingTop: insets.top }]}>
            <ConversationPanel
              conversations={conversations}
              currentId={currentId}
              onSelect={openConversation}
              onNew={newConversation}
              onDelete={deleteConversation}
              onClose={() => setShowPanel(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  safe: { flex: 1 },
  body: { flex: 1, flexDirection: 'row-reverse' },
  sidebar: { borderLeftWidth: 1, borderLeftColor: C.border, backgroundColor: 'rgba(255,255,255,0.02)' },
  chatCol: { flex: 1, minWidth: 0 },
  header: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: 'rgba(11,11,24,0.85)' },
  headerInner: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  headerTitleWrap: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, flexShrink: 1 },
  headerTitle: { color: '#fff', fontSize: 16.5, fontWeight: '800', textAlign: 'right' },
  statusRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, marginTop: 2 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.success },
  statusText: { color: C.muted, fontSize: 11.5 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  listContent: { paddingTop: 12, paddingBottom: 12, flexGrow: 1 },
  composerWrap: { paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: 'rgba(11,11,24,0.92)' },
  listWrap: { flex: 1 },
  toBottom: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.userA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeWrap: { position: 'absolute', top: 70, left: 0, right: 0, alignItems: 'center' },
  notice: {
    color: '#fff',
    backgroundColor: 'rgba(30,30,55,0.97)',
    borderWidth: 1,
    borderColor: C.borderStrong,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    overflow: 'hidden',
    fontSize: 13.5,
    textAlign: 'center',
    maxWidth: 420,
  },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', flexDirection: 'row' },
  sheet: { position: 'absolute', right: 0, top: 0, bottom: 0, backgroundColor: '#101026', borderLeftWidth: 1, borderLeftColor: C.border },
});
