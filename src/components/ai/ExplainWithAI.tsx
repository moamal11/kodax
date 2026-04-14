/**
 * ExplainWithAI.tsx
 *
 * مكون زر "شرح بالذكاء" للتحديات
 * يتحقق من الاشتراك ويوفر شرح تفصيلي للمشتركين
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { AIMessageRenderer } from './AIMessageRenderer';
import { aiChatService } from '@/services/aiChatService';
import { conversationsService } from '@/services/conversationsService';
import { supabase } from '@/lib/supabase';
import { showAlert } from '@/utils/crossPlatformAlert';
import {
  aiFreeUsesService,
  type AIFreeUses,
} from '@/services/aiFreeUsesService';

interface TestCaseInfo {
  input: string;
  expectedOutput: string;
  description: string;
}

interface ExplainWithAIProps {
  challengeId: string;
  challengeTitle: string;
  challengeDescription: string;
  starterCode?: string;
  language: string;
  isSubscribed: boolean;
  onSubscribePress: () => void;
  contentType?: 'challenge' | 'lesson';
  // Full challenge context for AI
  testCases?: TestCaseInfo[];
  hints?: string[];
  solution?: string;
  userCode?: string;
}

// Global cache: keyed by challengeId
const explanationCache: Record<string, string> = {};

export const ExplainWithAI: React.FC<ExplainWithAIProps> = ({
  challengeId,
  challengeTitle,
  challengeDescription,
  starterCode,
  language,
  isSubscribed,
  onSubscribePress,
  contentType = 'challenge',
  testCases,
  hints,
  solution,
  userCode,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [freeUses, setFreeUses] = useState<AIFreeUses>({
    solve: 3,
    explain: 3,
  });
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = width >= 768;

  // تحديد نوع الاستخدام: challenge = solve, lesson = explain
  const useType = contentType === 'challenge' ? 'solve' : 'explain';
  const remainingFree = useType === 'solve' ? freeUses.solve : freeUses.explain;

  // جلب المحاولات المتبقية عند التحميل
  React.useEffect(() => {
    const loadFreeUses = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const uses = await aiFreeUsesService.getFreeUses(session.user.id);
          setFreeUses(uses);
        }
      } catch (e) {
        // Failed to load AI free uses
      }
    };
    if (!isSubscribed) {
      loadFreeUses();
    }
  }, [isSubscribed]);

  // Build full-context AI prompt
  const buildPrompt = useCallback(() => {
    if (contentType === 'lesson') {
      return `أنت مدرب برمجة خبير. اشرح الدرس التالي بالتفصيل باللغة العربية:

📚 **الدرس:** ${challengeTitle}
📝 **المحتوى:** ${challengeDescription}
💻 **اللغة:** ${language}
${starterCode ? `\n🔧 **مثال الكود:**\n\`\`\`${language}\n${starterCode}\n\`\`\`` : ''}

✨ **المطلوب:**
1. شرح مفصل للمفاهيم الأساسية
2. أمثلة عملية مع الكود الكامل والمنسق
3. نصائح وأفضل الممارسات
4. أخطاء شائعة يجب تجنبها

⚠️ **مهم:** تأكد من كتابة كود كامل، صحيح، ومنسق بشكل ممتاز.`;
    }

    // Challenge mode: include FULL context
    let prompt = `أنت مبرمج محترف. ساعدني في حل هذا التحدي:

🎯 **التحدي:** ${challengeTitle}
📝 **الوصف:** ${challengeDescription}
💻 **اللغة:** ${language}`;

    if (starterCode) {
      prompt += `\n\n🔧 **الكود البدائي:**\n\`\`\`${language}\n${starterCode}\n\`\`\``;
    }

    if (userCode && userCode !== starterCode) {
      prompt += `\n\n👤 **كود المستخدم الحالي:**\n\`\`\`${language}\n${userCode}\n\`\`\``;
    }

    if (testCases && testCases.length > 0) {
      prompt += `\n\n🧪 **حالات الاختبار:**`;
      testCases.forEach((tc, i) => {
        prompt += `\n${i + 1}. ${tc.description}`;
        if (tc.input) prompt += `\n   المدخل: \`${tc.input}\``;
        prompt += `\n   المتوقع: \`${tc.expectedOutput}\``;
      });
    }

    if (hints && hints.length > 0) {
      prompt += `\n\n💡 **تلميحات التحدي:**`;
      hints.forEach((h, i) => {
        prompt += `\n${i + 1}. ${h}`;
      });
    }

    prompt += `\n\n✨ **المطلوب:**
1. شرح استراتيجية الحل خطوة بخطوة
2. كتابة الحل الكامل بكود صحيح ومنسق
3. شرح كل جزء من الكود
4. تأكد أن الحل يجتاز جميع حالات الاختبار أعلاه`;

    if (userCode && userCode !== starterCode) {
      prompt += `\n5. وضّح الأخطاء في كود المستخدم الحالي (إن وُجدت)`;
    }

    prompt += `\n\n⚠️ **مهم:** 
- اكتب الحل بكود كامل جاهز للتشغيل
- تأكد من التنسيق الصحيح
- استخدم أفضل الممارسات في ${language}`;

    return prompt;
  }, [
    contentType,
    challengeTitle,
    challengeDescription,
    language,
    starterCode,
    userCode,
    testCases,
    hints,
  ]);

  // Core function to fetch AI explanation
  const fetchExplanation = useCallback(
    async (forceRefresh: boolean = false) => {
      // Check cache first
      if (!forceRefresh && explanationCache[challengeId]) {
        setExplanation(explanationCache[challengeId]);
        return;
      }

      setIsLoading(true);
      setExplanation('');

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (userId) {
          aiChatService.setUser(userId);
          conversationsService.setUser(userId);

          if (!isSubscribed && !forceRefresh) {
            const remaining = await aiFreeUsesService.useAttempt(
              userId,
              useType
            );
            setFreeUses((prev) => ({
              ...prev,
              [useType]: Math.max(0, remaining),
            }));
          }
        }

        const message = buildPrompt();
        const result = await aiChatService.sendMessage(
          message,
          contentType === 'lesson' ? 'lesson-explain' : 'challenge-explain',
          []
        );

        if (result && result.response) {
          setExplanation(result.response);
          explanationCache[challengeId] = result.response;

          if (result.tokensUsed && result.tokensUsed > 0) {
            await conversationsService.trackTokenUsage(result.tokensUsed);
          }
        } else {
          throw new Error('لم يتم الحصول على رد من الذكاء الاصطناعي');
        }
      } catch (error: any) {
        const errorMessage = error?.message || 'حدث خطأ غير معروف';

        if (
          errorMessage.includes('Edge Function') ||
          errorMessage.includes('Failed to fetch')
        ) {
          setExplanation(
            '**خدمة الذكاء الاصطناعي غير متاحة حالياً**\n\n' +
              'للأسف، لا يمكننا الوصول لخدمة الذكاء الاصطناعي في الوقت الحالي. ' +
              `حاول مرة أخرى بعد قليل${contentType === 'challenge' ? '، أو استخدم التلميحات المتوفرة في التحدي' : ''}.\n\n` +
              (contentType === 'challenge'
                ? '**نصيحة:** يمكنك استخدام زر "تلميحات" في الأعلى للحصول على مساعدة فورية.'
                : '**نصيحة:** راجع محتوى الدرس مرة أخرى للفهم الأفضل.')
          );
        } else if (
          errorMessage.includes('not subscribed') ||
          errorMessage.includes('subscription')
        ) {
          setExplanation(
            '**الاشتراك مطلوب**\n\n' +
              'ميزة الشرح بالذكاء الاصطناعي متاحة فقط للمشتركين المميزين.\n\n' +
              '**مع الاشتراك تحصل على:**\n' +
              '- شرح مفصل وذكي لكل تحدي ودرس\n' +
              '- أمثلة عملية وكود جاهز\n' +
              '- نصائح وأفضل الممارسات\n' +
              '- دعم غير محدود\n\n' +
              'اضغط "اشترك الآن" أعلاه للحصول على الاشتراك!'
          );
        } else {
          setExplanation(
            '**عذراً، حدث خطأ**\n\n' +
              `حاول مرة ثانية. إذا استمرت المشكلة، راجع ${contentType === 'lesson' ? 'محتوى الدرس' : 'التلميحات المتوفرة في التحدي'}.\n\n` +
              `**تفاصيل الخطأ:** ${errorMessage}`
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [challengeId, isSubscribed, useType, buildPrompt, contentType]
  );

  const handleExplainPress = async () => {
    // Allow showing cached result even with no free uses
    if (!isSubscribed && remainingFree <= 0 && !explanationCache[challengeId]) {
      showAlert(
        'انتهت المحاولات المجانية',
        'لقد استخدمت جميع المحاولات المجانية.\n\nاشترك للحصول على استخدام غير محدود للذكاء الاصطناعي!',
        [
          { text: 'إلغاء', style: 'cancel' },
          { text: 'اشترك الآن', style: 'default', onPress: onSubscribePress },
        ]
      );
      return;
    }

    setModalVisible(true);
    // Show cached result immediately
    if (explanationCache[challengeId]) {
      setExplanation(explanationCache[challengeId]);
      return;
    }
    await fetchExplanation(false);
  };

  const handleRefresh = async () => {
    if (!isSubscribed && remainingFree <= 0) {
      showAlert(
        'انتهت المحاولات المجانية',
        'إعادة الشرح تتطلب محاولة مجانية أو اشتراك.',
        [
          { text: 'إلغاء', style: 'cancel' },
          { text: 'اشترك الآن', style: 'default', onPress: onSubscribePress },
        ]
      );
      return;
    }
    await fetchExplanation(true);
  };

  return (
    <>
      {/* زر شرح بالذكاء */}
      <TouchableOpacity
        style={styles.explainButton}
        onPress={handleExplainPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#7c3aed', '#a855f7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buttonGradient}
        >
          <Ionicons name="bulb" size={20} color="#fff" />
          <Text style={styles.buttonText}>
            {contentType === 'challenge' ? 'حل بالذكاء' : 'شرح بالذكاء'}
          </Text>
          {!isSubscribed &&
            (remainingFree > 0 ? (
              <View style={styles.freeUsesBadge}>
                <Text style={styles.freeUsesText}>{remainingFree}</Text>
              </View>
            ) : (
              <View style={styles.lockBadge}>
                <MaterialIcons name="lock" size={12} color="#fff" />
              </View>
            ))}
        </LinearGradient>
      </TouchableOpacity>

      {/* مودال الشرح */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={[
            styles.modalOverlay,
            Platform.OS === 'android' && {
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
            },
          ]}
        >
          {Platform.OS !== 'android' && (
            <BlurView
              intensity={30}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          )}
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={[
              styles.modalContainer,
              isWeb &&
                isLargeScreen && {
                  marginTop: 80,
                  marginHorizontal: 'auto',
                  maxWidth: 900,
                  width: '90%',
                  alignSelf: 'center',
                },
            ]}
          >
            <LinearGradient
              colors={['#1a1a2e', '#16213e']}
              style={styles.modalContent}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.headerLeft}>
                  <View style={styles.aiIcon}>
                    <MaterialIcons
                      name="auto-awesome"
                      size={24}
                      color="#a855f7"
                    />
                  </View>
                  <View>
                    <Text style={styles.modalTitle}>شرح ذكي</Text>
                    <Text style={styles.modalSubtitle}>{challengeTitle}</Text>
                  </View>
                </View>
                <View style={styles.headerActions}>
                  {explanation && !isLoading && (
                    <TouchableOpacity
                      onPress={handleRefresh}
                      style={styles.refreshButton}
                    >
                      <MaterialIcons name="refresh" size={22} color="#a855f7" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <MaterialIcons name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Content */}
              <ScrollView
                style={styles.modalBody}
                showsVerticalScrollIndicator={false}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#a855f7" />
                    <Text style={styles.loadingText}>جاري تحضير الشرح...</Text>
                    <Text style={styles.loadingSubtext}>
                      الذكاء الاصطناعي يحلل{' '}
                      {contentType === 'lesson' ? 'الدرس' : 'التحدي'} ويجهز شرح
                      مفصل إلك
                    </Text>
                  </View>
                ) : explanation ? (
                  <Animated.View entering={FadeIn.delay(200)}>
                    {/* الشرح مع تنسيق الأكواد */}
                    <AIMessageRenderer content={explanation} isUser={false} />

                    {/* نصائح إضافية */}
                    <View style={styles.tipsContainer}>
                      <View style={styles.tipHeader}>
                        <Ionicons name="rocket" size={20} color="#10b981" />
                        <Text style={styles.tipTitle}>نصائح للحل</Text>
                      </View>
                      <Text style={styles.tipText}>
                        • جرب تشغل الكود خطوة بخطوة{'\n'}• استخدم console.log()
                        لفحص القيم{'\n'}• اقرأ رسائل الأخطاء زين{'\n'}• لو عجزت،
                        راجع الدروس المشابهة
                      </Text>
                    </View>
                  </Animated.View>
                ) : null}
              </ScrollView>

              {/* Footer */}
              {!isLoading && (
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.tryButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.tryButtonText}>جربها بنفسك</Text>
                    <Ionicons name="arrow-forward" size={20} color="#a855f7" />
                  </TouchableOpacity>
                </View>
              )}
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  explainButton: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  lockBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  freeUsesBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.5)',
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 4,
  },
  freeUsesText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    marginTop: 60,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  aiIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 8,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 20,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  tipsContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  tipText: {
    fontSize: 14,
    color: '#e0e0e0',
    lineHeight: 22,
  },
  modalFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  tryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderWidth: 1,
    borderColor: '#a855f7',
  },
  tryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a855f7',
  },
});
