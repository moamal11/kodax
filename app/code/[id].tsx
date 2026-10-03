/**
 * صفحة تفاصيل الكود - Code Details
 * Full code view with syntax highlighting, likes, comments, and interactions
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
  Modal,
  ViewStyle,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MaterialIcons,
  MaterialCommunityIcons,
  Ionicons,
} from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useLocalSearchParams, router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { WebView } from 'react-native-webview';

import { useAuth } from '@/contexts/AuthContext';
import { useResponsiveLayout } from '@/hooks';
import { useApp } from '@/contexts/AppContext';
import { tokenizeCode, TokenType } from '@/utils/syntaxHighlighter';
import {
  getSnippetById,
  getComments,
  addComment,
  incrementViews,
  updateSnippet,
  createSnippet,
  getSnippetCounts,
  FeedSnippet,
  SnippetComment,
} from '@/services/codeFeedService';
import { checkIsFollowing } from '@/services/followService';
import { executeCode } from '@/services/codeExecution';
import FollowButton from '@/components/ui/FollowButton';
import UserAvatar from '@/components/ui/UserAvatar';
import SnippetModerationSheet from '@/components/editor/SnippetModerationSheet';

import VerifiedBadge from '@/components/ui/VerifiedBadge';

// ==================== Constants ====================

const TOKEN_COLORS: Record<TokenType, string> = {
  keyword: '#c678dd',
  string: '#98c379',
  number: '#d19a66',
  function: '#61afef',
  comment: '#5c6370',
  operator: '#56b6c2',
  punctuation: '#abb2bf',
  className: '#e5c07b',
  property: '#e06c75',
  boolean: '#d19a66',
  constant: '#d19a66',
  tag: '#e06c75',
  attribute: '#d19a66',
  variable: '#e06c75',
  default: '#abb2bf',
};

const LANGUAGE_COLORS: Record<string, string> = {
  javascript: '#f7df1e',
  typescript: '#3178c6',
  python: '#3776ab',
  html: '#e34c26',
  css: '#1572b6',
  react: '#61dafb',
  cpp: '#00599c',
  java: '#ed8b00',
  csharp: '#68217a',
  php: '#777bb4',
  swift: '#fa7343',
  kotlin: '#7f52ff',
  go: '#00add8',
  rust: '#dea584',
  sql: '#336791',
  json: '#6b7280',
  dart: '#0175c2',
};

// ==================== Project Parser ====================

interface ProjectFiles {
  html: string;
  css: string;
  js: string;
}

function parseProjectCode(code: string): ProjectFiles | null {
  // Detect project format: <!-- HTML --> ... <style>...</style> ... <script>...</script>
  if (
    !code.includes('<!-- HTML -->') ||
    !code.includes('<style>') ||
    !code.includes('<script>')
  ) {
    return null;
  }
  try {
    const htmlMatch = code.match(/<!-- HTML -->\n([\s\S]*?)\n\n<style>/);
    const cssMatch = code.match(/<style>\n([\s\S]*?)\n<\/style>/);
    const jsMatch = code.match(/<script>\n([\s\S]*?)\n<\/script>/);
    if (htmlMatch && cssMatch && jsMatch) {
      return { html: htmlMatch[1], css: cssMatch[1], js: jsMatch[1] };
    }
  } catch {}
  return null;
}

function buildPreviewHtml(project: ProjectFiles): string {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${project.css}</style></head>
<body>${project.html.replace(/<link[^>]*href=["']style\.css["'][^>]*\/?>/gi, '').replace(/<script[^>]*src=["']script\.js["'][^>]*><\/script>/gi, '')}
<script>${project.js}<\/script></body></html>`;
}

type ProjectTab = 'html' | 'css' | 'js';

// ==================== Helpers ====================

function formatTimestamp(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return date.toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  if (days > 0) return `منذ ${days} يوم`;
  if (hours > 0) return `منذ ${hours} ساعة`;
  if (minutes > 0) return `منذ ${minutes} دقيقة`;
  return 'الآن';
}

function getLangColor(lang: string): string {
  return LANGUAGE_COLORS[lang] || '#8b5cf6';
}

function getLangLabel(lang: string): string {
  const labels: Record<string, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    html: 'HTML',
    css: 'CSS',
    react: 'React JSX',
    cpp: 'C++',
    java: 'Java',
    csharp: 'C#',
    php: 'PHP',
    swift: 'Swift',
    kotlin: 'Kotlin',
    go: 'Go',
    rust: 'Rust',
    sql: 'SQL',
    json: 'JSON',
    dart: 'Dart',
  };
  return labels[lang] || lang;
}

// ==================== Comment Item ====================

const CommentItem = React.memo(
  ({ comment, index }: { comment: SnippetComment; index: number }) => {
    const name =
      comment.profiles?.full_name || comment.profiles?.username || 'مجهول';

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 50).duration(300)}
        style={styles.commentItem}
      >
        <UserAvatar
          userId={comment.user_id}
          avatarUrl={comment.profiles?.avatar_url}
          name={name}
          size="medium"
        />
        <View style={styles.commentBody}>
          <View style={styles.commentHeader}>
            <TouchableOpacity
              onPress={() => router.push(`/user/${comment.user_id}` as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.commentAuthor}>
                {name}
                <VerifiedBadge verified={comment.profiles?.is_verified} size={12} />
              </Text>
            </TouchableOpacity>
            <Text style={styles.commentTime}>
              {formatTimestamp(comment.created_at)}
            </Text>
          </View>
          <Text style={styles.commentContent}>{comment.content}</Text>
        </View>
      </Animated.View>
    );
  }
);

// ==================== Main Screen ====================

export default function CodeDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { isLargeScreen } = useResponsiveLayout();
  const {
    likedSnippets,
    toggleLike: globalToggleLike,
    syncLikes,
    updateLikeCounts,
    getLikeCount,
    updateViewCounts,
    getViewCount,
    updateCommentCounts,
    getCommentCount,
  } = useApp();
  const commentInputRef = useRef<TextInput>(null);

  // State
  const [snippet, setSnippet] = useState<FeedSnippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<SnippetComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Project mode
  const [activeProjectTab, setActiveProjectTab] = useState<ProjectTab>('html');
  const [showWebPreview, setShowWebPreview] = useState(false);
  const [showModeration, setShowModeration] = useState(false);
  const [showRunOutput, setShowRunOutput] = useState(false);
  const [runOutput, setRunOutput] = useState('');

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);

  // Load snippet data
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      const { data, error } = await getSnippetById(id);

      if (!error && data) {
        setSnippet(data);
        // مزامنة اللايكات عبر AppContext المركزي
        syncLikes([id]);

        // Fetch accurate counts for this snippet
        try {
          const { likeCounts, viewCounts, commentCounts } =
            await getSnippetCounts([id]);
          updateLikeCounts(likeCounts);
          updateViewCounts(viewCounts);
          updateCommentCounts(commentCounts);
        } catch (_e) {
          // Fallback: use data from snippet
          updateLikeCounts({ [id]: data.likes_count || 0 });
          updateViewCounts({ [id]: data.views_count || 0 });
          updateCommentCounts({ [id]: data.comments_count || 0 });
        }

        // Increment view count (once per user) and update AppContext
        incrementViews(id, user?.id).then(() => {
          // After view increment, update the view count in AppContext
          const currentViews = getViewCount(id, data.views_count || 0);
          updateViewCounts({ [id]: currentViews + 1 });
        });

        // Check follow status
        if (user?.id && data.user_id !== user.id) {
          const following = await checkIsFollowing(user.id, data.user_id);
          setIsFollowing(following);
        }
      }

      setLoading(false);
    };

    load();
  }, [id, user?.id]);

  // Load comments
  useEffect(() => {
    if (!id) return;

    const loadCommentsData = async () => {
      setLoadingComments(true);
      const { data } = await getComments(id);
      setComments(data);
      setLoadingComments(false);
    };

    loadCommentsData();
  }, [id]);

  // Syntax highlighting
  const highlightedTokens = useMemo(
    () => (snippet ? tokenizeCode(snippet.code, snippet.language) : []),
    [snippet?.code, snippet?.language]
  );

  const codeLines = useMemo(
    () => (snippet ? snippet.code.split('\n') : []),
    [snippet?.code]
  );

  // Project detection
  const projectFiles = useMemo(
    () => (snippet ? parseProjectCode(snippet.code) : null),
    [snippet?.code]
  );
  const isProject = projectFiles !== null;

  // Active code for project tabs
  const activeProjectCode = useMemo(() => {
    if (!projectFiles) return '';
    return projectFiles[activeProjectTab];
  }, [projectFiles, activeProjectTab]);

  const activeProjectTokens = useMemo(
    () => (isProject ? tokenizeCode(activeProjectCode, activeProjectTab) : []),
    [activeProjectCode, activeProjectTab, isProject]
  );

  const activeProjectLines = useMemo(
    () => (isProject ? activeProjectCode.split('\n') : []),
    [activeProjectCode, isProject]
  );

  // Build preview HTML
  const previewHtml = useMemo(() => {
    if (projectFiles) return buildPreviewHtml(projectFiles);
    if (snippet?.language === 'html') return snippet.code;
    return '';
  }, [projectFiles, snippet?.code, snippet?.language]);

  // ===== Actions =====

  const handleLike = useCallback(async () => {
    if (!user?.id || !id) return;

    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
    }

    // AppContext يدير Optimistic Update + Rollback + Debounce
    await globalToggleLike(id);
  }, [user?.id, id, globalToggleLike]);

  const handleCopy = useCallback(async () => {
    if (!snippet) return;
    await Clipboard.setStringAsync(snippet.code);
    setCopied(true);
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    }
    setTimeout(() => setCopied(false), 2000);
  }, [snippet]);

  const handleSendComment = useCallback(async () => {
    if (!user?.id || !id || !newComment.trim()) return;

    setSendingComment(true);

    const { success } = await addComment(user.id, id, newComment.trim());

    if (success) {
      setNewComment('');
      // Reload comments
      const { data } = await getComments(id);
      setComments(data);

      // Update comment count in AppContext (syncs back to code feed)
      updateCommentCounts({ [id]: data.length });

      if (snippet) {
        setSnippet({ ...snippet, comments_count: data.length });
      }
    }

    setSendingComment(false);
  }, [user?.id, id, newComment, snippet]);

  // Run code
  const handleRun = useCallback(async () => {
    if (!snippet) return;
    if (isProject || snippet.language === 'html') {
      setShowWebPreview(true);
      return;
    }
    if (
      snippet.language === 'javascript' ||
      snippet.language === 'typescript' ||
      snippet.language === 'react'
    ) {
      setShowRunOutput(true);
      const logs: string[] = [];
      const fc = {
        log: (...a: any[]) =>
          logs.push(
            a
              .map((x) =>
                typeof x === 'object' ? JSON.stringify(x, null, 2) : String(x)
              )
              .join(' ')
          ),
        error: (...a: any[]) =>
          logs.push('[خطأ] ' + a.map((x) => String(x)).join(' ')),
        warn: (...a: any[]) =>
          logs.push('[تحذير] ' + a.map((x) => String(x)).join(' ')),
        info: (...a: any[]) =>
          logs.push('[معلومة] ' + a.map((x) => String(x)).join(' ')),
      };
      try {
        const sc = snippet.code
          .replace(/console\.log/g, '__c.log')
          .replace(/console\.error/g, '__c.error')
          .replace(/console\.warn/g, '__c.warn')
          .replace(/console\.info/g, '__c.info');
        const fn = new Function('__c', sc);
        const r = fn(fc);
        if (r !== undefined && logs.length === 0) logs.push('→ ' + String(r));
      } catch (e: any) {
        logs.push('[خطأ] خطأ: ' + (e.message || String(e)));
      }
      setRunOutput(
        logs.length > 0
          ? logs.join('\n')
          : '[نجاح] تم التنفيذ بنجاح (لا يوجد إخراج)'
      );
    } else {
      // Execute via Piston API for all other languages
      setShowRunOutput(true);
      setRunOutput('جاري تنفيذ الكود...');
      try {
        const result = await executeCode({
          language: snippet.language,
          code: snippet.code,
        });
        if (result.success) {
          const output = result.output?.trim();
          setRunOutput(
            output
              ? `[نجاح] النتيجة:\n${output}`
              : '[نجاح] تم التنفيذ بنجاح (لا يوجد إخراج)'
          );
        } else {
          setRunOutput(
            `[خطأ] خطأ في التنفيذ:\n${result.error || 'خطأ غير معروف'}`
          );
        }
      } catch (execError: any) {
        setRunOutput(
          `[خطأ] فشل الاتصال بخادم التنفيذ:\n${execError.message || 'تحقق من اتصال الإنترنت'}`
        );
      }
    }
  }, [snippet, isProject]);

  // ===== Edit Mode Handlers =====

  const handleStartEdit = useCallback(() => {
    if (!snippet) return;
    // Navigate to the main editor with snippet data
    router.push({
      pathname: '/code/add',
      params: {
        editId: snippet.id,
        ownerId: snippet.user_id,
        code: snippet.code,
        editLang: snippet.language,
        editTitle: snippet.title || '',
        editDesc: snippet.description || '',
        lang: snippet.language,
      },
    } as any);
  }, [snippet]);

  const handleCodeEdit = useCallback((newCode: string) => {
    setEditedCode(newCode);
    setHasUnsavedChanges(true);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!snippet || !user?.id) return;
    setSavingEdit(true);

    const isOwner = user.id === snippet.user_id;

    if (isOwner) {
      // Update own snippet
      const { success, error } = await updateSnippet(snippet.id, {
        code: editedCode,
      });
      if (success) {
        setSnippet({ ...snippet, code: editedCode });
        setIsEditing(false);
        setHasUnsavedChanges(false);
      } else {
        if (Platform.OS === 'web') {
          alert('فشل حفظ التعديلات: ' + (error || ''));
        } else {
          Alert.alert('خطأ', 'فشل حفظ التعديلات');
        }
      }
    } else {
      // Fork: create a new snippet under current user
      const { id: newId, error } = await createSnippet({
        userId: user.id,
        title: snippet.title,
        description: snippet.description || undefined,
        code: editedCode,
        language: snippet.language,
        isPublic: true,
      });
      if (!error && newId) {
        setIsEditing(false);
        setHasUnsavedChanges(false);
        router.replace(`/code/${newId}` as any);
      } else {
        if (Platform.OS === 'web') {
          alert('فشل نشر النسخة: ' + (error || ''));
        } else {
          Alert.alert('خطأ', 'فشل نشر النسخة');
        }
      }
    }

    setSavingEdit(false);
  }, [snippet, user?.id, editedCode]);

  const handleCancelEdit = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowExitWarning(true);
    } else {
      setIsEditing(false);
    }
  }, [hasUnsavedChanges]);

  const handleConfirmExit = useCallback(() => {
    setShowExitWarning(false);
    setIsEditing(false);
    setHasUnsavedChanges(false);
    if (snippet) {
      setEditedCode(snippet.code);
    }
  }, [snippet]);

  const handleSaveAndExit = useCallback(async () => {
    setShowExitWarning(false);
    await handleSaveEdit();
  }, [handleSaveEdit]);

  // Handle back with unsaved changes check
  const handleBack = useCallback(() => {
    if (isEditing && hasUnsavedChanges) {
      setShowExitWarning(true);
    } else {
      router.back();
    }
  }, [isEditing, hasUnsavedChanges]);

  // Edited code tokens for display
  const editedTokens = useMemo(
    () =>
      isEditing
        ? tokenizeCode(editedCode, snippet?.language || 'javascript')
        : [],
    [editedCode, snippet?.language, isEditing]
  );

  const editedLines = useMemo(
    () => (isEditing ? editedCode.split('\n') : []),
    [editedCode, isEditing]
  );

  // ==================== Render ====================

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>جاري تحميل الكود...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!snippet) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={64}
            color="#374151"
          />
          <Text style={styles.errorText}>لم يتم العثور على الكود</Text>
          <TouchableOpacity
            style={styles.errorBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.errorBtnText}>العودة</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const authorName =
    snippet.profiles?.full_name || snippet.profiles?.username || 'مجهول';
  const authorInitial = authorName.charAt(0).toUpperCase();
  const langColor = getLangColor(snippet.language);
  const isOwner = user?.id === snippet.user_id;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[styles.container, isLargeScreen && webStyles.containerWeb]}
        >
          {/* ===== Header ===== */}
          <Animated.View entering={FadeIn.duration(200)} style={styles.header}>
            <TouchableOpacity style={styles.headerBtn} onPress={handleBack}>
              <Ionicons name="arrow-back" size={22} color="#d1d5db" />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {isEditing
                  ? isOwner
                    ? 'تعديل الكود'
                    : 'تعديل (نسخة جديدة)'
                  : snippet.title}
              </Text>
            </View>

            <View style={styles.headerRight}>
              {isEditing ? (
                <>
                  <TouchableOpacity
                    style={[styles.headerBtn, { backgroundColor: '#10b98130' }]}
                    onPress={handleSaveEdit}
                    disabled={savingEdit}
                  >
                    {savingEdit ? (
                      <ActivityIndicator size="small" color="#10b981" />
                    ) : (
                      <Ionicons name="checkmark" size={22} color="#10b981" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.headerBtn}
                    onPress={handleCancelEdit}
                  >
                    <Ionicons name="close" size={22} color="#ef4444" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.runButton}
                    onPress={handleRun}
                  >
                    <Ionicons name="play" size={16} color="#10b981" />
                    <Text style={styles.runButtonText}>تشغيل</Text>
                  </TouchableOpacity>
                  {user?.id && (
                    <TouchableOpacity
                      style={styles.headerBtn}
                      onPress={handleStartEdit}
                    >
                      <Ionicons
                        name="create-outline"
                        size={20}
                        color="#d1d5db"
                      />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.headerBtn}
                    onPress={handleCopy}
                  >
                    <Ionicons
                      name={copied ? 'checkmark' : 'copy-outline'}
                      size={20}
                      color={copied ? '#10b981' : '#d1d5db'}
                    />
                  </TouchableOpacity>
                  {user?.id && (
                    <TouchableOpacity
                      style={styles.headerBtn}
                      onPress={() => setShowModeration(true)}
                      accessibilityLabel={
                        isOwner ? 'خيارات النشر والحذف' : 'إبلاغ أو حظر'
                      }
                    >
                      <Ionicons
                        name="ellipsis-vertical"
                        size={20}
                        color="#d1d5db"
                      />
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </Animated.View>

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {isOwner && (snippet as any).is_hidden && (
              <View style={styles.hiddenBanner}>
                <Ionicons name="eye-off" size={16} color="#fbbf24" />
                <Text style={styles.hiddenBannerText}>
                  هذا المحتوى مخفي عن الآخرين بسبب بلاغات، وبانتظار المراجعة.
                </Text>
              </View>
            )}
            {isOwner && !snippet.is_public && (
              <View style={styles.hiddenBanner}>
                <Ionicons name="lock-closed" size={16} color="#93c5fd" />
                <Text style={[styles.hiddenBannerText, { color: '#bfdbfe' }]}>
                  هذا الكود خاص بك (غير منشور).
                </Text>
              </View>
            )}

            {/* ===== Author Info ===== */}
            <Animated.View
              entering={FadeInDown.delay(50).duration(300)}
              style={styles.authorSection}
            >
              <View style={styles.authorRow}>
                <UserAvatar
                  userId={snippet.user_id}
                  avatarUrl={snippet.profiles?.avatar_url}
                  name={authorName}
                  size="large"
                  color={langColor}
                />
                <TouchableOpacity
                  style={styles.authorDetails}
                  onPress={() => router.push(`/user/${snippet.user_id}` as any)}
                  activeOpacity={0.7}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Text style={styles.authorName} numberOfLines={1}>
                      {authorName}
                      <VerifiedBadge verified={snippet.profiles?.is_verified} size={14} />
                    </Text>
                    <View
                      style={[
                        styles.langBadge,
                        { backgroundColor: langColor + '20' },
                      ]}
                    >
                      <View
                        style={[styles.langDot, { backgroundColor: langColor }]}
                      />
                      <Text
                        style={[styles.langBadgeText, { color: langColor }]}
                      >
                        {getLangLabel(snippet.language)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.authorTime}>
                    {formatTimestamp(snippet.created_at)}
                  </Text>
                </TouchableOpacity>
              </View>
              {user?.id && !isOwner && (
                <FollowButton
                  currentUserId={user.id}
                  targetUserId={snippet.user_id}
                  isFollowing={isFollowing}
                  onToggle={(val) => setIsFollowing(val)}
                />
              )}
            </Animated.View>

            {/* ===== Title & Description ===== */}
            <Animated.View entering={FadeInDown.delay(100).duration(300)}>
              <Text style={styles.snippetTitle}>{snippet.title}</Text>
              {snippet.description ? (
                <Text style={styles.snippetDescription}>
                  {snippet.description}
                </Text>
              ) : null}
            </Animated.View>

            {/* ===== Full Code Display ===== */}
            <Animated.View
              entering={FadeInDown.delay(150).duration(300)}
              style={styles.codeSection}
            >
              {/* Code header */}
              <View style={styles.codeHeader}>
                <View style={styles.codeHeaderLeft}>
                  <View style={styles.windowDots}>
                    <View
                      style={[styles.windowDot, { backgroundColor: '#ef4444' }]}
                    />
                    <View
                      style={[styles.windowDot, { backgroundColor: '#f59e0b' }]}
                    />
                    <View
                      style={[styles.windowDot, { backgroundColor: '#10b981' }]}
                    />
                  </View>
                  {!isProject && (
                    <Text style={styles.codeFileName}>
                      main.
                      {snippet.language === 'react'
                        ? 'jsx'
                        : snippet.language === 'csharp'
                          ? 'cs'
                          : snippet.language}
                    </Text>
                  )}
                  {isProject && (
                    <View style={styles.projectBadge}>
                      <MaterialCommunityIcons
                        name="folder-open"
                        size={14}
                        color="#8b5cf6"
                      />
                      <Text style={styles.projectBadgeText}>مشروع</Text>
                    </View>
                  )}
                </View>
                <View
                  style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}
                >
                  <TouchableOpacity
                    style={styles.runBtnSmall}
                    onPress={handleRun}
                  >
                    <Ionicons name="play" size={14} color="#10b981" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
                    <MaterialIcons
                      name={copied ? 'check' : 'content-copy'}
                      size={16}
                      color={copied ? '#10b981' : '#6b7280'}
                    />
                    <Text
                      style={[
                        styles.copyBtnText,
                        copied && { color: '#10b981' },
                      ]}
                    >
                      {copied ? 'تم!' : 'نسخ'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Project tabs */}
              {isProject && (
                <View style={styles.projectTabs}>
                  {(['html', 'css', 'js'] as ProjectTab[]).map((tab) => {
                    const isActive = activeProjectTab === tab;
                    const tabColor =
                      tab === 'html'
                        ? '#e34c26'
                        : tab === 'css'
                          ? '#1572b6'
                          : '#f7df1e';
                    return (
                      <TouchableOpacity
                        key={tab}
                        style={[
                          styles.projectTab,
                          isActive && {
                            borderBottomColor: tabColor,
                            backgroundColor: '#1a1a3e',
                          },
                        ]}
                        onPress={() => setActiveProjectTab(tab)}
                      >
                        <View
                          style={[
                            styles.projectTabDot,
                            { backgroundColor: tabColor },
                          ]}
                        />
                        <Text
                          style={[
                            styles.projectTabText,
                            isActive && { color: '#fff' },
                          ]}
                        >
                          {tab === 'html'
                            ? 'index.html'
                            : tab === 'css'
                              ? 'style.css'
                              : 'script.js'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Code body */}
              {isEditing ? (
                <View style={styles.editCodeContainer}>
                  <TextInput
                    style={[
                      styles.editCodeInput,
                      Platform.OS === 'web' && ({ outline: 'none' } as any),
                    ]}
                    value={editedCode}
                    onChangeText={handleCodeEdit}
                    multiline
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    textAlignVertical="top"
                    placeholderTextColor="#4b5563"
                    placeholder="اكتب الكود هنا..."
                  />
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={true}
                  style={styles.codeScrollH}
                >
                  <View style={styles.codeBody}>
                    {/* Line numbers */}
                    <View style={styles.lineNumbers}>
                      {(isProject ? activeProjectLines : codeLines).map(
                        (_, i) => (
                          <Text key={i} style={styles.lineNumber}>
                            {i + 1}
                          </Text>
                        )
                      )}
                    </View>

                    {/* Highlighted code */}
                    <View style={styles.codeContent}>
                      <Text style={styles.codeText}>
                        {(isProject
                          ? activeProjectTokens
                          : highlightedTokens
                        ).map((token, i) => (
                          <Text
                            key={i}
                            style={{
                              color:
                                TOKEN_COLORS[token.type] ||
                                TOKEN_COLORS.default,
                            }}
                          >
                            {token.content}
                          </Text>
                        ))}
                      </Text>
                    </View>
                  </View>
                </ScrollView>
              )}
            </Animated.View>

            {/* ===== Edit Mode Actions Bar ===== */}
            {isEditing && (
              <View style={styles.editActionsBar}>
                {!isOwner && (
                  <View style={styles.editNotice}>
                    <Ionicons
                      name="information-circle"
                      size={18}
                      color="#f59e0b"
                    />
                    <Text style={styles.editNoticeText}>
                      سيتم نشر التعديلات كنسخة جديدة باسمك
                    </Text>
                  </View>
                )}
                <View style={styles.editActionsRow}>
                  <TouchableOpacity
                    style={styles.editSaveBtn}
                    onPress={handleSaveEdit}
                    disabled={savingEdit || !hasUnsavedChanges}
                  >
                    {savingEdit ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="save" size={18} color="#fff" />
                        <Text style={styles.editSaveBtnText}>
                          {isOwner ? 'حفظ التعديلات' : 'نشر كنسخة جديدة'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.editCancelBtn}
                    onPress={handleCancelEdit}
                  >
                    <Text style={styles.editCancelBtnText}>إلغاء</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ===== Stats & Actions ===== */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(300)}
              style={styles.actionsSection}
            >
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <MaterialIcons name="visibility" size={16} color="#6b7280" />
                  <Text style={styles.statItemText}>
                    {id ? getViewCount(id, snippet.views_count || 0) : 0} مشاهدة
                  </Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    (id ? likedSnippets.has(id) : false) &&
                      styles.actionButtonActive,
                  ]}
                  onPress={handleLike}
                >
                  <MaterialIcons
                    name={
                      (id ? likedSnippets.has(id) : false)
                        ? 'favorite'
                        : 'favorite-border'
                    }
                    size={22}
                    color={
                      (id ? likedSnippets.has(id) : false)
                        ? '#ef4444'
                        : '#9ca3af'
                    }
                  />
                  <Text
                    style={[
                      styles.actionButtonText,
                      (id ? likedSnippets.has(id) : false) && {
                        color: '#ef4444',
                      },
                    ]}
                  >
                    {id ? getLikeCount(id, snippet?.likes_count || 0) : 0} إعجاب
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    showComments && styles.actionButtonActive,
                  ]}
                  onPress={() => setShowComments((v) => !v)}
                >
                  <MaterialIcons
                    name="chat-bubble-outline"
                    size={20}
                    color={showComments ? '#8b5cf6' : '#9ca3af'}
                  />
                  <Text
                    style={[
                      styles.actionButtonText,
                      showComments && { color: '#8b5cf6' },
                    ]}
                  >
                    {comments.length} تعليق
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleCopy}
                >
                  <MaterialIcons
                    name="content-copy"
                    size={20}
                    color="#9ca3af"
                  />
                  <Text style={styles.actionButtonText}>نسخ</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* ===== Comments Section ===== */}
            {showComments && (
              <Animated.View
                entering={FadeInDown.duration(300)}
                style={styles.commentsSection}
              >
                <Text style={styles.commentsSectionTitle}>
                  التعليقات ({comments.length})
                </Text>

                {loadingComments ? (
                  <ActivityIndicator
                    size="small"
                    color="#8b5cf6"
                    style={{ paddingVertical: 20 }}
                  />
                ) : comments.length === 0 ? (
                  <View style={styles.noComments}>
                    <MaterialIcons
                      name="chat-bubble-outline"
                      size={32}
                      color="#374151"
                    />
                    <Text style={styles.noCommentsText}>
                      لا توجد تعليقات بعد. كن أول من يعلّق!
                    </Text>
                  </View>
                ) : (
                  comments.map((comment, index) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      index={index}
                    />
                  ))
                )}

                {/* Comment Input */}
                {user?.id && (
                  <View style={styles.commentInputContainer}>
                    <TextInput
                      ref={commentInputRef}
                      style={[
                        styles.commentInput,
                        Platform.OS === 'web' && ({ outline: 'none' } as any),
                      ]}
                      placeholder="اكتب تعليقاً..."
                      placeholderTextColor="#4b5563"
                      value={newComment}
                      onChangeText={setNewComment}
                      multiline
                      maxLength={500}
                    />
                    <TouchableOpacity
                      style={[
                        styles.sendBtn,
                        (!newComment.trim() || sendingComment) &&
                          styles.sendBtnDisabled,
                      ]}
                      onPress={handleSendComment}
                      disabled={!newComment.trim() || sendingComment}
                    >
                      {sendingComment ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <MaterialIcons
                          name="send"
                          size={20}
                          color="#ffffff"
                          style={{ transform: [{ scaleX: -1 }] }}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </Animated.View>
            )}

            {/* Bottom spacer */}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>

        {/* ===== RUN OUTPUT MODAL ===== */}
        <Modal
          visible={showRunOutput}
          transparent
          animationType="slide"
          onRequestClose={() => setShowRunOutput(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowRunOutput(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {}}
              style={[styles.runPanel, isLargeScreen && webStyles.dialogWeb]}
            >
              <View style={styles.panelHandle} />
              <View style={styles.runPanelHeader}>
                <Text style={styles.runPanelTitle}>الإخراج</Text>
                <TouchableOpacity onPress={() => setShowRunOutput(false)}>
                  <Ionicons name="close-circle" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.outputScroll}>
                <Text style={styles.outputText} selectable>
                  {runOutput}
                </Text>
              </ScrollView>
              <View style={styles.runPanelActions}>
                <TouchableOpacity
                  style={styles.rerunBtn}
                  onPress={() => {
                    setShowRunOutput(false);
                    setTimeout(handleRun, 200);
                  }}
                >
                  <Ionicons name="refresh" size={16} color="#8b5cf6" />
                  <Text style={styles.rerunText}>إعادة</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeRunBtn}
                  onPress={() => setShowRunOutput(false)}
                >
                  <Text style={styles.closeRunText}>إغلاق</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* ===== WEB PREVIEW MODAL ===== */}
        <Modal
          visible={showWebPreview}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setShowWebPreview(false)}
        >
          <SafeAreaView style={styles.previewSafe}>
            <View style={styles.previewHeader}>
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={() => setShowWebPreview(false)}
              >
                <Ionicons name="close" size={22} color="#d1d5db" />
              </TouchableOpacity>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={styles.previewTitle}>
                  معاينة {isProject ? 'المشروع' : 'الكود'}
                </Text>
                {!isOwner && (
                  <Text style={styles.ugcWarning}>
                    محتوى من مستخدم — لا تُدخل كلمات مرور أو بيانات شخصية
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={() => {
                  setShowWebPreview(false);
                  setTimeout(() => setShowWebPreview(true), 100);
                }}
              >
                <Ionicons name="refresh" size={20} color="#d1d5db" />
              </TouchableOpacity>
            </View>
            {Platform.OS === 'web' ? (
              <View style={styles.iframeWrap}>
                {/* @ts-ignore */}
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#fff',
                    borderRadius: 8,
                    overflow: 'hidden',
                  }}
                >
                  <iframe
                    srcDoc={previewHtml}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    sandbox="allow-scripts allow-same-origin"
                    title="preview"
                  />
                </div>
              </View>
            ) : (
              <View style={styles.iframeWrap}>
                <WebView
                  originWhitelist={['*']}
                  source={{ html: previewHtml }}
                  style={{ flex: 1, backgroundColor: '#fff' }}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  startInLoadingState={true}
                  renderLoading={() => (
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#fff',
                      }}
                    >
                      <ActivityIndicator size="large" color="#8b5cf6" />
                    </View>
                  )}
                />
                <TouchableOpacity
                  style={styles.copyHtmlBtnFloating}
                  onPress={async () => {
                    await Clipboard.setStringAsync(previewHtml);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  <Ionicons name="copy-outline" size={18} color="#8b5cf6" />
                  <Text style={styles.copyHtmlText}>نسخ HTML الكامل</Text>
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        </Modal>

        {/* ===== UNSAVED CHANGES WARNING MODAL ===== */}
        <Modal
          visible={showExitWarning}
          transparent
          animationType="fade"
          onRequestClose={() => setShowExitWarning(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.exitWarningPanel,
                isLargeScreen && webStyles.dialogWeb,
              ]}
            >
              <Ionicons
                name="warning"
                size={48}
                color="#f59e0b"
                style={{ alignSelf: 'center', marginBottom: 16 }}
              />
              <Text style={styles.exitWarningTitle}>
                {isOwner
                  ? 'لديك تعديلات غير محفوظة'
                  : 'ستفقد التغييرات الحالية'}
              </Text>
              <Text style={styles.exitWarningMessage}>
                {isOwner
                  ? 'هل تريد الحفظ أو الخروج بدون حفظ؟'
                  : 'هل تريد الحفظ كنسخة جديدة أو المتابعة بدون حفظ؟'}
              </Text>
              <View style={styles.exitWarningButtons}>
                <TouchableOpacity
                  style={[styles.exitWarningBtn, styles.exitWarningSaveBtn]}
                  onPress={handleSaveAndExit}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.exitWarningSaveBtnText}>
                    {isOwner ? 'حفظ' : 'حفظ كنسخة جديدة'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.exitWarningBtn, styles.exitWarningDiscardBtn]}
                  onPress={handleConfirmExit}
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  <Text style={styles.exitWarningDiscardBtnText}>
                    خروج بدون حفظ
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.exitWarningBtn, styles.exitWarningCancelBtn]}
                  onPress={() => setShowExitWarning(false)}
                >
                  <Text style={styles.exitWarningCancelBtnText}>إلغاء</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <SnippetModerationSheet
          visible={showModeration}
          onClose={() => setShowModeration(false)}
          snippetId={snippet.id}
          authorId={snippet.user_id}
          authorName={authorName}
          isOwner={isOwner}
          isPublic={snippet.is_public}
          onDeleted={() => router.back()}
          onVisibilityChanged={(pub) =>
            setSnippet({ ...snippet, is_public: pub })
          }
          onBlocked={() => router.back()}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ==================== Styles ====================

const styles = StyleSheet.create({
  hiddenBanner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(251,191,36,0.08)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  hiddenBannerText: {
    color: '#fde68a',
    fontSize: 13,
    flex: 1,
    textAlign: 'right',
  },
  ugcWarning: {
    color: '#fbbf24',
    fontSize: 11,
    marginTop: 2,
  },
  flex: { flex: 1 },
  safeArea: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  // Loading / Error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9ca3af',
    textAlign: 'center',
  },
  errorBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#8b5cf6',
    marginTop: 8,
  },
  errorBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a3e',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a3e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },

  // Author
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  authorDetails: {
    gap: 2,
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  authorTime: {
    fontSize: 13,
    color: '#6b7280',
  },
  langBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  langDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  langBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Title/Description
  snippetTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 30,
    marginBottom: 8,
  },
  snippetDescription: {
    fontSize: 15,
    color: '#9ca3af',
    lineHeight: 22,
    marginBottom: 16,
  },

  // Code Section
  codeSection: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e1e3a',
    marginVertical: 12,
    backgroundColor: '#0d0d1a',
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#141428',
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e3a',
  },
  codeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  windowDots: {
    flexDirection: 'row',
    gap: 6,
  },
  windowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  codeFileName: {
    fontSize: 13,
    color: '#6b7280',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#1a1a3e',
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },

  // Code Body
  codeScrollH: {
    maxHeight: 500,
  },
  codeBody: {
    flexDirection: 'row',
    minWidth: '100%',
  },
  lineNumbers: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    backgroundColor: '#0a0a16',
    borderRightWidth: 1,
    borderRightColor: '#1e1e3a',
    alignItems: 'flex-end',
    minWidth: 44,
  },
  lineNumber: {
    fontSize: 12,
    lineHeight: 20,
    color: '#374151',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  codeContent: {
    padding: 14,
    flex: 1,
  },
  codeText: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 20,
  },

  // Stats & Actions
  actionsSection: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1a1a3e',
    gap: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statItemText: {
    fontSize: 13,
    color: '#6b7280',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1a1a3e',
    borderWidth: 1,
    borderColor: '#252550',
  },
  actionButtonActive: {
    borderColor: '#8b5cf640',
    backgroundColor: '#8b5cf610',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },

  // Comments
  commentsSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1a1a3e',
  },
  commentsSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  noComments: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  noCommentsText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  commentItem: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#252550',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8b5cf6',
  },
  commentBody: {
    flex: 1,
    backgroundColor: '#1a1a3e',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#252550',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: '#d1d5db',
  },
  commentTime: {
    fontSize: 11,
    color: '#4b5563',
  },
  commentContent: {
    fontSize: 14,
    color: '#e5e7eb',
    lineHeight: 20,
  },

  // Comment Input
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#252550',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#1a1a3e',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#252550',
    maxHeight: 100,
    textAlign: 'right',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },

  // Run button in header
  runButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#10b98120',
    borderWidth: 1,
    borderColor: '#10b98140',
  },
  runButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10b981',
  },
  runBtnSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10b98120',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Project badge & tabs
  projectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#8b5cf620',
  },
  projectBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  projectTabs: {
    flexDirection: 'row',
    backgroundColor: '#0a0a16',
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e3a',
  },
  projectTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  projectTabDot: { width: 6, height: 6, borderRadius: 3 },
  projectTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  // Modal overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  panelHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#374151',
    alignSelf: 'center',
    marginBottom: 14,
  },

  // Run output panel
  runPanel: {
    backgroundColor: '#0f0f1e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: Dimensions.get('window').height * 0.6,
    paddingBottom: Platform.OS === 'ios' ? 36 : 80,
  },
  runPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  runPanelTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  outputScroll: {
    backgroundColor: '#0a0a16',
    borderRadius: 12,
    padding: 14,
    maxHeight: Dimensions.get('window').height * 0.3,
    borderWidth: 1,
    borderColor: '#1e1e3a',
  },
  outputText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#d1d5db',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  runPanelActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  rerunBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#8b5cf620',
    borderWidth: 1,
    borderColor: '#8b5cf640',
  },
  rerunText: { fontSize: 13, fontWeight: '600', color: '#8b5cf6' },
  closeRunBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1a1a3e',
  },
  closeRunText: { fontSize: 13, fontWeight: '600', color: '#9ca3af' },

  // Web preview
  previewSafe: { flex: 1, backgroundColor: '#0f0f1e' },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a3e',
  },
  previewTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  iframeWrap: {
    flex: 1,
    margin: 8,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#252550',
  },
  noPreviewWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  noPreviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9ca3af',
    marginTop: 8,
  },
  noPreviewSub: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  openBrowserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#8b5cf6',
    marginTop: 16,
    minWidth: 200,
    justifyContent: 'center',
  },
  openBrowserBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  copyHtmlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1a1a3e',
    borderWidth: 1,
    borderColor: '#8b5cf640',
    marginTop: 12,
  },
  copyHtmlText: { fontSize: 14, fontWeight: '600', color: '#8b5cf6' },
  copyHtmlBtnFloating: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    backgroundColor: '#1a1a3e',
    borderWidth: 1,
    borderColor: '#8b5cf640',
    elevation: 8,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  // Edit mode
  editCodeContainer: {
    minHeight: 300,
    maxHeight: 500,
    backgroundColor: '#0a0a16',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  editCodeInput: {
    flex: 1,
    color: '#d1d5db',
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 20,
    padding: 14,
    textAlignVertical: 'top',
    textAlign: 'left',
    minHeight: 300,
  },
  editActionsBar: {
    marginTop: 12,
    gap: 10,
  },
  editNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f59e0b15',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f59e0b30',
  },
  editNoticeText: {
    fontSize: 13,
    color: '#f59e0b',
    flex: 1,
    fontWeight: '600',
  },
  editActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  editSaveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#10b981',
  },
  editSaveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  editCancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#1a1a3e',
    borderWidth: 1,
    borderColor: '#252550',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editCancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9ca3af',
  },

  // Exit warning modal
  exitWarningPanel: {
    backgroundColor: '#1a1a3e',
    borderRadius: 22,
    padding: 28,
    marginHorizontal: 24,
    maxWidth: 420,
    width: '90%',
    alignSelf: 'center',
  },
  exitWarningTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  exitWarningMessage: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  exitWarningButtons: {
    gap: 10,
  },
  exitWarningBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  exitWarningSaveBtn: {
    backgroundColor: '#10b981',
  },
  exitWarningSaveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  exitWarningDiscardBtn: {
    backgroundColor: '#1a1a3e',
    borderWidth: 1,
    borderColor: '#ef444440',
  },
  exitWarningDiscardBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ef4444',
  },
  exitWarningCancelBtn: {
    backgroundColor: 'transparent',
  },
  exitWarningCancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
});

const webStyles = {
  containerWeb: {
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  } as ViewStyle,
  dialogWeb: {
    maxWidth: 560,
    alignSelf: 'center',
    width: '100%',
    borderRadius: 22,
    marginBottom: 40,
  } as ViewStyle,
};
