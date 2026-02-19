import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { showAlert } from '@/utils/crossPlatformAlert';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeInDown,
  FadeIn,
  SlideInRight,
} from 'react-native-reanimated';
import { SubscriptionModal } from '@/components';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { usePoints } from '@/contexts/PointsContext';
import PointsModal from '@/components/subscription/PointsModal';
import { supabase } from '@/lib/supabase';
import { useResponsiveLayout } from '@/hooks';
import {
  aiChatService,
  ChatMessage,
  CHAT_MODES,
} from '@/services/aiChatService';
import {
  conversationsService,
  Conversation,
  AIUsageStats,
} from '@/services/conversationsService';
import { contextMemoryService } from '@/services/contextMemoryService';
import ConversationsList from '@/components/ai/ConversationsList';
import UsageStatsModal from '@/components/ai/UsageStatsModal';
import { AIMessageRenderer } from '@/components/ai/AIMessageRenderer';

// Features array - outside component to avoid re-creation
const FEATURES = [
  {
    icon: 'chat',
    title: 'محادثة ذكية',
    description: 'اسأل أي سؤال واحصل على إجابات فورية',
  },
  {
    icon: 'code',
    title: 'شرح الكود',
    description: 'فهم أي كود برمجي بطريقة بسيطة',
  },
  {
    icon: 'build',
    title: 'إصلاح الأخطاء',
    description: 'اكتشف وأصلح الأخطاء بمساعدة AI',
  },
  {
    icon: 'lightbulb',
    title: 'اقتراحات ذكية',
    description: 'احصل على أفكار لتحسين كودك',
  },
  {
    icon: 'school',
    title: 'دروس مخصصة',
    description: 'تعلم بأسلوب يناسب مستواك',
  },
  {
    icon: 'psychology',
    title: 'تحليل متقدم',
    description: 'تحليل عميق لكودك وأدائه',
  },
];

export default function AIScreen() {
  const {
    isSubscribed,
    openSubscriptionModal,
    subscriptionModalVisible,
    closeSubscriptionModal,
    plans,
    refreshSubscription,
  } = useSubscription();

  const { isPremium, points, premiumDaysRemaining, PREMIUM_COST } = usePoints();
  const { isLargeScreen, isWeb, contentPaddingTop, contentPaddingBottom } =
    useResponsiveLayout();

  const [userId, setUserId] = useState('');
  const [showPointsModal, setShowPointsModal] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState('general');
  const scrollViewRef = useRef<FlatList>(null);

  // New: Conversations State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | any
  >(null);
  const [showConversations, setShowConversations] = useState(false);

  // New: Usage Stats State
  const [usageStats, setUsageStats] = useState<AIUsageStats | null>(null);
  const [showUsageModal, setShowUsageModal] = useState(false);

  // Focus state for input
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Typing effect state
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Track if user is at bottom of scroll (to prevent auto-scroll when reading old messages)
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);
  const isUserAtBottomRef = useRef(true);

  const w = Dimensions.get('window').width;

  useEffect(() => {
    loadUser();
  }, []); // Empty dependency - only run once on mount

  useEffect(() => {
    if (userId && isPremium) {
      loadConversations();
      loadUsageStats();
      // تحميل سياق المستخدم
      contextMemoryService.setUser(userId);
    }
  }, [userId, isPremium]); // Only re-run when these values change

  const loadUser = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      setUserId(session.user.id);
      aiChatService.setUser(session.user.id);
      conversationsService.setUser(session.user.id);
    }
  }, []);

  const scrollToBottom = useCallback((force = false) => {
    try {
      // Only auto-scroll if user is at bottom OR if force is true (e.g., when sending message)
      if (force || isUserAtBottomRef.current) {
        // Use setTimeout to ensure content is rendered before scrolling
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 50);
      }
    } catch {}
  }, []);

  // Handle scroll events to detect if user scrolled away from bottom
  const handleScroll = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 50; // threshold in pixels
    const isAtBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;

    isUserAtBottomRef.current = isAtBottom;
    setIsUserAtBottom(isAtBottom);
  }, []);

  const loadConversations = useCallback(async () => {
    const convs = await conversationsService.getConversations();
    setConversations(convs);

    // إذا لم تكن هناك محادثة حالية، إنشاء واحدة جديدة
    if (convs.length > 0 && !currentConversationId) {
      setCurrentConversationId(convs[0].id);
      loadConversationMessages(convs[0].id);
    }
  }, []);

  const loadConversationMessages = useCallback(
    async (conversationId: string) => {
      const result = await conversationsService.getConversation(conversationId);
      if (result) {
        const mappedMessages: ChatMessage[] = result.messages.map(
          (msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            mode: msg.mode,
            created_at: msg.created_at,
          })
        );
        setMessages(mappedMessages);
        // Force scroll when loading conversation
        isUserAtBottomRef.current = true;
        setTimeout(() => scrollToBottom(true), 100);
      }
    },
    [scrollToBottom]
  );

  const loadUsageStats = useCallback(async () => {
    const stats = await conversationsService.getUsageStats();
    setUsageStats(stats);
  }, []);

  const handleNewConversation = useCallback(async () => {
    const title = 'محادثة جديدة';
    const newConv = await conversationsService.createConversation(
      title,
      selectedMode
    );

    if (newConv) {
      setConversations([newConv, ...conversations]);
      setCurrentConversationId(newConv.id);
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content:
            'مرحباً! أنا مساعدك الذكي في البرمجة. كيف يمكنني مساعدتك اليوم؟',
          created_at: new Date().toISOString(),
        },
      ]);
      setShowConversations(false);
    }
  }, [conversations, selectedMode]);

  const handleSelectConversation = useCallback((conversationId: string) => {
    setCurrentConversationId(conversationId);
    loadConversationMessages(conversationId);
    setShowConversations(false);
  }, []);

  const handleDeleteConversation = useCallback(
    (conversationId: string) => {
      showAlert('حذف المحادثة', 'هل أنت متأكد من حذف هذه المحادثة؟', [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            const success =
              await conversationsService.deleteConversation(conversationId);
            if (success) {
              const updatedConvs = conversations.filter(
                (c) => c.id !== conversationId
              );
              setConversations(updatedConvs);

              if (currentConversationId === conversationId) {
                if (updatedConvs.length > 0) {
                  setCurrentConversationId(updatedConvs[0].id);
                  loadConversationMessages(updatedConvs[0].id);
                } else {
                  setCurrentConversationId(null);
                  setMessages([]);
                  handleNewConversation();
                }
              }
            }
          },
        },
      ]);
    },
    [
      conversations,
      currentConversationId,
      loadConversationMessages,
      handleNewConversation,
    ]
  );

  // Typing effect function - memoized to prevent re-creation on every render
  const typeMessage = useCallback(
    (text: string, messageId: string) => {
      setIsTyping(true);
      setTypingText('');
      let currentIndex = 0;
      const typingSpeed = 5; // milliseconds per character (fast typing)
      let scrollDebounceTimer: ReturnType<typeof setTimeout> | null = null;

      const typeInterval = setInterval(() => {
        if (currentIndex < text.length) {
          currentIndex++;
          // Use slice to ensure correct character rendering, especially for Arabic
          setTypingText(text.slice(0, currentIndex));

          // Debounced scroll - only if user is at bottom
          if (!scrollDebounceTimer && isUserAtBottomRef.current) {
            scrollDebounceTimer = setTimeout(() => {
              scrollToBottom();
              scrollDebounceTimer = null;
            }, 100);
          }
        } else {
          clearInterval(typeInterval);
          if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer);
          setIsTyping(false);
          setTypingText('');

          // Update the actual message
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? { ...msg, content: text, isTyping: false }
                : msg
            )
          );

          // Final scroll to ensure bottom (only if user was at bottom)
          scrollToBottom();
        }
      }, typingSpeed);
    },
    [scrollToBottom]
  );

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    // التحقق من حد الاستخدام اليومي
    const usageCheck = await conversationsService.checkUsageLimit();
    if (!usageCheck.canUse) {
      showAlert(
        'تجاوزت الحد اليومي',
        `لقد استخدمت ${usageCheck.percentage}% من حد الاستخدام اليومي.\n\nمتبقي: 0 توكن من ${usageCheck.dailyLimit.toLocaleString()}\n\nسيتم إعادة تعيين الحد غداً.`,
        [{ text: 'حسناً', style: 'default' }]
      );
      return;
    }

    // تحذير عند 90%
    if (usageCheck.percentage >= 90 && usageCheck.percentage < 100) {
      showAlert(
        'اقتربت من الحد',
        `استخدمت ${usageCheck.percentage}% من حد الاستخدام اليومي.\n\nمتبقي: ${usageCheck.remaining.toLocaleString()} توكن`,
        [
          { text: 'إلغاء', style: 'cancel' },
          {
            text: 'متابعة',
            style: 'default',
            onPress: () => sendMessageAfterCheck(),
          },
        ]
      );
      return;
    }

    // المتابعة مباشرة إذا كان الاستخدام أقل من 90%
    await sendMessageAfterCheck();
  }, [
    inputText,
    isLoading,
    selectedMode,
    conversations,
    currentConversationId,
    messages,
    scrollToBottom,
    typeMessage,
  ]);

  const sendMessageAfterCheck = useCallback(async () => {
    const userMessage = inputText.trim();
    setInputText('');
    Keyboard.dismiss();

    // إنشاء محادثة جديدة إذا لم تكن موجودة
    let conversationId = currentConversationId;
    if (!conversationId) {
      const newConv = await conversationsService.createConversation(
        userMessage.substring(0, 50),
        selectedMode
      );
      if (newConv) {
        conversationId = newConv.id;
        setCurrentConversationId(conversationId);
        setConversations([newConv, ...conversations]);
      }
    } else {
      // تحديث عنوان المحادثة إذا كانت جديدة
      const currentConv = conversations.find((c) => c.id === conversationId);
      if (currentConv && currentConv.total_messages === 0) {
        await conversationsService.updateConversationTitle(
          conversationId,
          userMessage.substring(0, 50)
        );
      }
    }

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      mode: selectedMode,
      created_at: new Date().toISOString(),
    };

    // Add loading message
    const loadingMsg: ChatMessage = {
      id: 'loading',
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setIsLoading(true);
    // Force scroll to bottom when sending a new message
    isUserAtBottomRef.current = true;
    scrollToBottom(true);

    try {
      // Save user message
      await aiChatService.saveMessage(
        'user',
        userMessage,
        selectedMode,
        undefined,
        conversationId || undefined
      );

      // Get AI response
      const { response, tokensUsed } = await aiChatService.sendMessage(
        userMessage,
        selectedMode,
        messages
      );

      console.log(`🤖 AI Response received (${tokensUsed} tokens)`);

      // Save and display AI response
      const savedMsg = await aiChatService.saveMessage(
        'assistant',
        response,
        selectedMode,
        tokensUsed,
        conversationId || undefined
      );

      // Update usage stats directly (fallback if trigger doesn't exist)
      if (tokensUsed > 0) {
        await conversationsService.trackTokenUsage(tokensUsed);
      }

      const aiMsg: ChatMessage = {
        id: savedMsg?.id || `ai-${Date.now()}`,
        role: 'assistant',
        content: response,
        mode: selectedMode,
        created_at: new Date().toISOString(),
        isTyping: true, // Mark as typing for the effect
      };

      // Remove loading and add AI message (initially empty for typing effect)
      setMessages((prev) =>
        prev.filter((m) => m.id !== 'loading').concat(aiMsg)
      );

      // Start typing effect
      typeMessage(response, aiMsg.id);

      // Refresh conversations list and usage stats
      loadConversations();
      loadUsageStats();
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== 'loading')
          .concat({
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.',
            created_at: new Date().toISOString(),
          })
      );
    } finally {
      setIsLoading(false);
      // Force scroll after response
      isUserAtBottomRef.current = true;
      setTimeout(() => scrollToBottom(true), 100);
    }
  }, [
    inputText,
    selectedMode,
    conversations,
    currentConversationId,
    messages,
    scrollToBottom,
    typeMessage,
    loadConversations,
    loadUsageStats,
  ]);

  const currentMode =
    CHAT_MODES.find((m) => m.id === selectedMode) || CHAT_MODES[0];

  // Key extractor for FlatList - memoized
  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  // Animated Typing Indicator Component
  const TypingIndicator = useMemo(
    () => (
      <View style={styles.typingIndicator}>
        {[0, 1, 2].map((i) => (
          <Animated.View
            key={i}
            entering={FadeIn.delay(i * 150).duration(300)}
            style={[
              styles.typingDot,
              {
                opacity: 0.6 + i * 0.15,
              },
            ]}
          />
        ))}
      </View>
    ),
    []
  );

  // Render Chat Message - memoized render function for FlatList
  const renderMessage = useCallback(
    ({ item: message, index }: { item: ChatMessage; index: number }) => {
      const isUser = message.role === 'user';

      if (message.isLoading) {
        return (
          <Animated.View
            key={message.id}
            entering={FadeIn.duration(300)}
            style={[styles.messageRow, styles.messageRowAssistant]}
          >
            <View style={styles.aiAvatar}>
              <MaterialIcons name="smart-toy" size={20} color="#8b5cf6" />
            </View>
            <View style={[styles.messageBubble, styles.assistantBubble]}>
              {TypingIndicator}
            </View>
          </Animated.View>
        );
      }

      return (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={[
            styles.messageRow,
            isUser ? styles.messageRowUser : styles.messageRowAssistant,
          ]}
        >
          {!isUser && (
            <View style={styles.aiAvatar}>
              <MaterialIcons name="smart-toy" size={20} color="#8b5cf6" />
            </View>
          )}
          <View
            style={[
              styles.messageBubble,
              isUser ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            {/* استخدام AIMessageRenderer بدلاً من Text البسيط */}
            <AIMessageRenderer
              content={
                !isUser &&
                message.isTyping &&
                isTyping &&
                message.id === messages[messages.length - 1]?.id
                  ? typingText
                  : message.content
              }
              isUser={isUser}
            />
          </View>
        </Animated.View>
      );
    },
    [isTyping, typingText, messages]
  );

  // Render Mode Selector
  const renderModeSelector = () => (
    <View style={styles.modeSelectorContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.modesScroll}
      >
        {CHAT_MODES.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            style={[
              styles.modeChip,
              selectedMode === mode.id && {
                backgroundColor: `${mode.color}20`,
                borderColor: mode.color,
              },
            ]}
            onPress={() => setSelectedMode(mode.id)}
          >
            <Ionicons
              name={mode.icon as any}
              size={18}
              color={selectedMode === mode.id ? mode.color : '#9ca3af'}
            />
            <Text
              style={[
                styles.modeChipText,
                selectedMode === mode.id && { color: mode.color },
              ]}
            >
              {mode.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Render Chat Interface (for Premium users)
  const renderChatInterface = () => (
    <View
      style={[
        styles.mainContainer,
        { marginTop: Platform.OS === 'web' ? 30 : 0 },
      ]}
    >
      {/* Sidebar for web */}
      {isLargeScreen && (
        <View
          style={[
            styles.sidebar,
            { marginTop: Platform.OS === 'web' ? 60 : 0 },
          ]}
        >
          <ConversationsList
            conversations={conversations}
            selectedId={currentConversationId || undefined}
            onSelect={handleSelectConversation}
            onNew={handleNewConversation}
            onDelete={handleDeleteConversation}
          />
        </View>
      )}

      {/* Main Chat */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? (isWeb ? 0 : -75) : 0}
      >
        {/* Chat Header */}
        <View
          style={[
            styles.chatHeader,
            isWeb && isLargeScreen && { marginTop: contentPaddingTop },
          ]}
        >
          <View style={styles.chatHeaderLeft}>
            {!isLargeScreen && (
              <TouchableOpacity
                onPress={() => setShowConversations(!showConversations)}
                style={styles.menuButton}
              >
                <MaterialIcons name="menu" size={24} color="#fff" />
              </TouchableOpacity>
            )}
            <View
              style={[
                styles.modeIndicator,
                { backgroundColor: `${currentMode.color}20` },
              ]}
            >
              <Ionicons
                name={currentMode.icon as any}
                size={20}
                color={currentMode.color}
              />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.chatHeaderTitle}>{currentMode.name}</Text>
              <Text style={styles.chatHeaderSubtitle}>
                {conversations.length} محادثات • {premiumDaysRemaining}d
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            {/* Usage Stats Button */}
            <TouchableOpacity
              style={styles.statsButton}
              onPress={() => setShowUsageModal(true)}
            >
              {usageStats && usageStats.usage_percentage > 0 ? (
                <>
                  <MaterialIcons name="analytics" size={20} color="#8b5cf6" />
                  <View
                    style={[
                      styles.usagePercentage,
                      {
                        backgroundColor:
                          usageStats.usage_percentage >= 90
                            ? '#ef444420'
                            : usageStats.usage_percentage >= 70
                              ? '#f59e0b20'
                              : '#10b98120',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.usagePercentageText,
                        {
                          color:
                            usageStats.usage_percentage >= 90
                              ? '#ef4444'
                              : usageStats.usage_percentage >= 70
                                ? '#f59e0b'
                                : '#10b981',
                        },
                      ]}
                    >
                      {usageStats.usage_percentage}%
                    </Text>
                  </View>
                </>
              ) : (
                <MaterialIcons name="analytics" size={22} color="#6b7280" />
              )}
            </TouchableOpacity>

            {/* New Conversation Button */}
            <TouchableOpacity
              style={styles.newChatButton}
              onPress={handleNewConversation}
            >
              <MaterialIcons name="add" size={22} color="#8b5cf6" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Mode Selector */}
        {renderModeSelector()}

        {/* Messages */}
        <FlatList
          ref={scrollViewRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          style={styles.messagesContainer}
          contentContainerStyle={[
            styles.messagesContent,
            { paddingBottom: isWeb ? 100 : 0 },
          ]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollToBottom(true)}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews={Platform.OS !== 'web'}
        />

        {/* Input Area */}
        <View
          style={[
            styles.inputContainer,
            {
              paddingBottom: isWeb
                ? w < 760
                  ? 120
                  : Math.max(contentPaddingBottom, 16)
                : Math.max(contentPaddingBottom, 16),
            },
          ]}
        >
          <View
            style={[
              styles.inputWrapper,
              isInputFocused && styles.inputWrapperFocused,
            ]}
          >
            <TextInput
              style={[
                styles.textInput,
                Platform.OS === 'web' && ({ outline: 'none' } as any),
              ]}
              placeholder="اكتب رسالتك هنا..."
              placeholderTextColor="#6b7280"
              value={inputText}
              onChangeText={setInputText}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              multiline
              maxLength={2000}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons
                  name="send"
                  size={20}
                  color="#fff"
                  style={{ transform: [{ scaleX: -1 }] }}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Mobile Conversations Drawer */}
      {!isLargeScreen && showConversations && (
        <View style={styles.mobileDrawer}>
          <ConversationsList
            conversations={conversations}
            selectedId={currentConversationId || undefined}
            onSelect={handleSelectConversation}
            onNew={handleNewConversation}
            onDelete={handleDeleteConversation}
          />
        </View>
      )}
    </View>
  );

  // Render Lock Screen (for non-Premium users)
  const renderLockScreen = () => (
    <ScrollView
      style={styles.content}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: contentPaddingTop + 20,
          paddingBottom: Math.max(contentPaddingBottom + 20, 100),
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Lock Screen - same as before */}
      <Animated.View entering={FadeIn.duration(500)}>
        <BlurView intensity={60} tint="dark" style={styles.lockContainer}>
          <LinearGradient
            colors={
              ['rgba(139, 92, 246, 0.1)', 'rgba(168, 85, 247, 0.05)'] as [
                string,
                string,
                ...string[],
              ]
            }
            style={styles.lockGradient}
          >
            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              <View style={styles.lockIcon}>
                <MaterialIcons name="lock" size={64} color="#8b5cf6" />
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300).duration(500)}>
              <Text style={styles.lockTitle}>ميزة حصرية للمشتركين</Text>
              <Text style={styles.lockMessage}>
                احصل على وصول غير محدود لمدرب AI الذكي
              </Text>
              <View style={styles.pointsCostBadge}>
                <Ionicons name="diamond" size={20} color="#F59E0B" />
                <Text style={styles.pointsCostText}>
                  {PREMIUM_COST.toLocaleString()} نقطة / 30 يوم
                </Text>
              </View>
              <Text style={styles.currentPointsText}>
                نقاطك الحالية: {points.toLocaleString()}
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).duration(500)}>
              <TouchableOpacity
                style={styles.unlockButton}
                onPress={() => setShowPointsModal(true)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    ['#8b5cf6', '#a855f7'] as [string, string, ...string[]]
                  }
                  style={styles.unlockGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="diamond" size={24} color="#ffffff" />
                  <Text style={styles.unlockText}>اشترك بالنقاط</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </LinearGradient>
        </BlurView>
      </Animated.View>

      {/* Features Grid */}
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>اكتشف المميزات</Text>
        <View style={styles.featuresGrid}>
          {FEATURES.map((feature, index) => (
            <Animated.View
              key={index}
              entering={FadeInDown.delay(500 + index * 50).duration(400)}
              style={styles.featureCard}
            >
              <BlurView intensity={40} tint="dark" style={styles.featureBlur}>
                <LinearGradient
                  colors={
                    [
                      'rgba(139, 92, 246, 0.05)',
                      'rgba(99, 102, 241, 0.05)',
                    ] as [string, string, ...string[]]
                  }
                  style={styles.featureGradient}
                >
                  <View style={[styles.featureIcon, styles.featureIconLocked]}>
                    <MaterialIcons
                      name={feature.icon as any}
                      size={28}
                      color="#6b7280"
                    />
                    <View style={styles.featureLockBadge}>
                      <MaterialIcons name="lock" size={12} color="#fff" />
                    </View>
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                </LinearGradient>
              </BlurView>
            </Animated.View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Points Display - hidden in AI page, shown in header instead */}
      {/* يظهر في الـ header بدلاً من هنا */}

      {isPremium ? renderChatInterface() : renderLockScreen()}

      {/* Modals */}
      <PointsModal
        visible={showPointsModal}
        onClose={() => setShowPointsModal(false)}
      />

      <UsageStatsModal
        visible={showUsageModal}
        onClose={() => setShowUsageModal(false)}
        stats={usageStats}
      />

      <SubscriptionModal
        visible={subscriptionModalVisible}
        onClose={closeSubscriptionModal}
        plans={plans}
        userId={userId}
        onSubscribed={refreshSubscription}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  pointsDisplayContainer: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    gap: 24,
    paddingHorizontal: 16,
  },

  // Main Container (Chat + Sidebar)
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 320,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Chat Container
  chatContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  chatHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  chatHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  chatHeaderSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  statsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  usagePercentage: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  usagePercentageText: {
    fontSize: 12,
    fontWeight: '700',
  },
  newChatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Mode Selector
  modeSelectorContainer: {
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  modesScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },

  // Messages
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  messageRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAssistant: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#8b5cf6',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#ffffff',
  },
  assistantMessageText: {
    color: '#e5e7eb',
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 6,
    padding: 4,
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8b5cf6',
    opacity: 0.6,
  },

  // Input
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputWrapperFocused: {
    borderColor: 'rgba(139, 92, 246, 0.4)',
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },
  textInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#4b5563',
  },

  // Mobile Drawer
  mobileDrawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '85%',
    maxWidth: 320,
    backgroundColor: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },

  // Lock Screen Styles
  lockContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  lockGradient: {
    padding: 40,
    alignItems: 'center',
    gap: 24,
  },
  lockIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
  },
  lockMessage: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  unlockButton: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  unlockGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 36,
  },
  unlockText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  featuresContainer: {
    gap: 16,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureBlur: {
    flex: 1,
  },
  featureGradient: {
    padding: 20,
    minHeight: 160,
    gap: 8,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 107, 157, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  featureIconLocked: {
    backgroundColor: 'rgba(75, 85, 99, 0.2)',
  },
  featureLockBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  featureDescription: {
    fontSize: 13,
    color: '#9ca3af',
    lineHeight: 18,
  },
  pointsCostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
    gap: 8,
  },
  pointsCostText: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '700',
  },
  currentPointsText: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
