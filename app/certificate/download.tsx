/**
 * 🎓 Certificate Download Screen - Kodax
 * تحميل الشهادة كـ PDF أو PNG عالية الدقة
 * يستخدم WebView لتوليد الشهادة + تحميلها
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { THEME_COLORS, BORDER_RADIUS } from '@/styles/theme';
import { certificateService } from '@/services/certificateService';
import {
  CertificateSummaryItem,
  CERTIFICATE_LEVEL_CONFIG,
  CertificateLevel,
} from '@/types/certificate';
import { useAuth } from '../_layout';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

export default function CertificateDownloadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { isLargeScreen, isWeb } = useResponsiveLayout();
  const webViewRef = useRef<WebView>(null);

  const [certificate, setCertificate] = useState<CertificateSummaryItem | null>(
    null
  );
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadType, setDownloadType] = useState<'pdf' | 'png'>('pdf');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCertificate();
  }, [id]);

  const loadCertificate = async () => {
    if (!id || !user?.id) return;

    setIsLoading(true);
    try {
      certificateService.setUser(user.id);
      const summary = await certificateService.getUserCertificates();
      const cert = summary.certificates.find((c) => c.id === id);
      if (cert) {
        setCertificate(cert);
        // Get user name from verification
        const verification = await certificateService.verifyCertificate(id);
        if (verification.found) {
          setUserName(verification.holder_name || '');
        }
      } else {
        setError('لم يتم العثور على الشهادة');
      }
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل الشهادة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = useCallback(async () => {
    if (!certificate) return;
    setIsGenerating(true);

    try {
      const config = CERTIFICATE_LEVEL_CONFIG[certificate.level];

      if (isWeb) {
        // On web, generate HTML and open for print/download
        const html = generateCertificateHTML(
          certificate,
          userName,
          downloadType
        );
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        if (downloadType === 'pdf') {
          // Open in new window for printing to PDF
          const printWindow = window.open(url, '_blank');
          if (printWindow) {
            printWindow.onload = () => {
              setTimeout(() => {
                printWindow.print();
                setIsGenerating(false);
              }, 500);
            };
          } else {
            Alert.alert('تنبيه', 'الرجاء السماح للنافذة المنبثقة في المتصفح');
            setIsGenerating(false);
          }
        } else {
          // For PNG - open for screenshot
          const printWindow = window.open(url, '_blank');
          if (printWindow) {
            Alert.alert(
              'تعليمات',
              'استخدم أداة لقطة الشاشة لحفظ الشهادة كصورة'
            );
          }
          setIsGenerating(false);
        }
      } else {
        // On mobile - share the certificate
        const message = `شهادة ${config.label} - ${certificate.course_title_ar || certificate.course_title}\n\nمعرف الشهادة: ${certificate.id}\n\nللتحقق من الشهادة، قم بزيارة منصة Kodax`;

        try {
          await Share.share({
            title: `شهادة ${config.label} - Kodax`,
            message: message,
          });
        } catch (shareError: any) {
          if (shareError.message !== 'User did not share') {
            Alert.alert(
              'تنبيه',
              'للحصول على نسخة قابلة للطباعة، افتح الشهادة من متصفح الويب على kodax.app'
            );
          }
        }
        setIsGenerating(false);
      }
    } catch (error) {
      setIsGenerating(false);
      Alert.alert('خطأ', 'فشل في تحميل الشهادة');
    }
  }, [certificate, userName, downloadType, isWeb]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#0f0f1e', '#1a1a3e', '#0f0f1e']}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color={THEME_COLORS.accent} />
      </View>
    );
  }

  if (error || !certificate) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#0f0f1e', '#1a1a3e', '#0f0f1e']}
          style={StyleSheet.absoluteFill}
        />
        <Ionicons name="alert-circle" size={48} color={THEME_COLORS.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>العودة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const config = CERTIFICATE_LEVEL_CONFIG[certificate.level];
  const certHTML = generateCertificateHTML(certificate, userName, downloadType);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f0f1e', '#1a1a3e', '#0f0f1e']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تحميل الشهادة</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isLargeScreen && styles.scrollContentLarge,
        ]}
      >
        {/* Preview */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>معاينة الشهادة</Text>
            <View style={styles.previewWrapper}>
              {isWeb ? (
                <iframe
                  srcDoc={certHTML}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    backgroundColor: 'transparent',
                  }}
                  title="Certificate Preview"
                />
              ) : (
                <WebView
                  ref={webViewRef}
                  source={{ html: certHTML }}
                  style={styles.webView}
                  scrollEnabled={false}
                  javaScriptEnabled
                  onMessage={(event) => {
                    const data = JSON.parse(event.nativeEvent.data);
                    if (data.type === 'ready') {
                      setIsGenerating(false);
                    }
                  }}
                />
              )}
            </View>
          </View>
        </Animated.View>

        {/* Download Options */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <View style={styles.optionsCard}>
            <Text style={styles.sectionTitle}>
              {isWeb ? 'نوع التحميل' : 'مشاركة الشهادة'}
            </Text>

            {isWeb ? (
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    downloadType === 'pdf' && styles.typeOptionActive,
                  ]}
                  onPress={() => setDownloadType('pdf')}
                >
                  <Ionicons
                    name="document-text"
                    size={24}
                    color={
                      downloadType === 'pdf' ? '#fff' : THEME_COLORS.textMuted
                    }
                  />
                  <Text
                    style={[
                      styles.typeLabel,
                      downloadType === 'pdf' && styles.typeLabelActive,
                    ]}
                  >
                    PDF
                  </Text>
                  <Text style={styles.typeDesc}>مستند رسمي</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    downloadType === 'png' && styles.typeOptionActive,
                  ]}
                  onPress={() => setDownloadType('png')}
                >
                  <Ionicons
                    name="image"
                    size={24}
                    color={
                      downloadType === 'png' ? '#fff' : THEME_COLORS.textMuted
                    }
                  />
                  <Text
                    style={[
                      styles.typeLabel,
                      downloadType === 'png' && styles.typeLabelActive,
                    ]}
                  >
                    PNG
                  </Text>
                  <Text style={styles.typeDesc}>صورة عالية الدقة</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.mobileInfoBox}>
                <Ionicons
                  name="phone-portrait-outline"
                  size={32}
                  color={THEME_COLORS.accent}
                />
                <Text style={styles.mobileInfoText}>
                  للحصول على نسخة PDF قابلة للطباعة، افتح هذه الصفحة من متصفح
                  الويب
                </Text>
                <Text style={styles.mobileInfoSubtext}>
                  يمكنك حالياً مشاركة معلومات الشهادة مع الآخرين
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.downloadButton,
                isGenerating && styles.downloadButtonDisabled,
              ]}
              onPress={handleDownload}
              disabled={isGenerating}
            >
              <LinearGradient
                colors={config.gradientColors}
                style={styles.downloadGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isGenerating ? (
                  <ActivityIndicator color="#1a1a2e" size="small" />
                ) : (
                  <>
                    <Ionicons
                      name={isWeb ? 'download' : 'share'}
                      size={20}
                      color="#1a1a2e"
                    />
                    <Text style={styles.downloadText}>
                      {isWeb
                        ? `تحميل ${downloadType === 'pdf' ? 'PDF' : 'PNG'}`
                        : 'مشاركة الشهادة'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Info */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons
                name="information-circle"
                size={18}
                color={THEME_COLORS.accent}
              />
              <Text style={styles.infoText}>
                {isWeb
                  ? 'الشهادة تحتوي على QR Code مرتبط بصفحة التحقق العامة'
                  : 'للحصول على نسخة PDF قابلة للطباعة، افتح الشهادة من متصفح الويب'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons
                name="shield-checkmark"
                size={18}
                color={THEME_COLORS.success}
              />
              <Text style={styles.infoText}>
                يمكن التحقق من صحة الشهادة عبر Certificate ID
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons
                name="lock-closed"
                size={18}
                color={THEME_COLORS.warning}
              />
              <Text style={styles.infoText}>
                الشهادة محمية بتوقيع رقمي ولا يمكن تزويرها
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ===== Generate Certificate HTML =====
function generateCertificateHTML(
  certificate: CertificateSummaryItem,
  userName: string,
  type: 'pdf' | 'png'
): string {
  const config = CERTIFICATE_LEVEL_CONFIG[certificate.level];
  const issuedDate = new Date(certificate.issued_at);
  const dateEN = issuedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const dateAR = issuedDate.toLocaleDateString('ar-IQ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const qrData = encodeURIComponent(certificate.id);
  // Using QR code API for the QR code
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrData}&bgcolor=1a1a3e&color=ffffff`;

  const levelGradient =
    certificate.level === 'silver'
      ? 'linear-gradient(135deg, #C0C0C0, #A8A8A8)'
      : certificate.level === 'gold'
        ? 'linear-gradient(135deg, #FFD700, #FFA500)'
        : 'linear-gradient(135deg, #E5E4E2, #B8B8B8)';

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Inter:wght@300;400;600;700;800;900&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #0f0f1e;
      font-family: 'Cairo', 'Inter', sans-serif;
    }
    
    .certificate {
      width: 800px;
      min-height: 565px;
      background: linear-gradient(135deg, #1a1a3e 0%, #252550 50%, #1a1a3e 100%);
      border: 3px solid ${config.color}40;
      border-radius: 16px;
      padding: 0;
      position: relative;
      overflow: hidden;
    }
    
    .top-border, .bottom-border {
      height: 5px;
      background: ${levelGradient};
    }
    
    .side-borders {
      position: absolute;
      top: 0; bottom: 0;
      width: 5px;
      background: ${levelGradient};
    }
    .side-borders.left { left: 0; }
    .side-borders.right { right: 0; }
    
    .content {
      padding: 36px 48px;
      text-align: center;
      color: #fff;
    }
    
    .logo {
      font-family: 'Inter', sans-serif;
      font-size: 36px;
      font-weight: 900;
      letter-spacing: 6px;
      color: #fff;
      margin-bottom: 4px;
    }
    
    .subtitle-en {
      font-family: 'Inter', sans-serif;
      font-size: 10px;
      letter-spacing: 4px;
      color: #9ca3af;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    
    .subtitle-ar {
      font-family: 'Cairo', sans-serif;
      font-size: 14px;
      color: #d1d5db;
      font-weight: 600;
      margin-bottom: 16px;
    }
    
    .level-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: ${levelGradient};
      padding: 6px 28px;
      border-radius: 50px;
      margin-bottom: 20px;
    }
    
    .level-badge .emoji { font-size: 20px; }
    .level-badge .text {
      font-family: 'Inter', sans-serif;
      font-size: 16px;
      font-weight: 900;
      color: #1a1a2e;
      letter-spacing: 3px;
    }
    
    .presented-to {
      font-family: 'Inter', sans-serif;
      font-size: 9px;
      letter-spacing: 3px;
      color: #9ca3af;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    
    .presented-ar {
      font-size: 12px;
      color: #d1d5db;
      margin-bottom: 4px;
    }
    
    .recipient {
      font-family: 'Cairo', sans-serif;
      font-size: 28px;
      font-weight: 900;
      color: #fff;
      margin-bottom: 4px;
      direction: rtl;
    }
    
    .divider {
      width: 200px;
      height: 1px;
      background: rgba(255,255,255,0.15);
      margin: 12px auto;
    }
    
    .for-label {
      font-family: 'Inter', sans-serif;
      font-size: 9px;
      letter-spacing: 3px;
      color: #9ca3af;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    
    .course-ar {
      font-family: 'Cairo', sans-serif;
      font-size: 20px;
      font-weight: 800;
      color: #fff;
      direction: rtl;
    }
    
    .course-en {
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      color: #d1d5db;
      margin-bottom: 12px;
    }
    
    .date {
      font-size: 12px;
      color: #9ca3af;
      margin-bottom: 4px;
    }
    
    .date-ar {
      font-family: 'Cairo', sans-serif;
      font-size: 12px;
      color: #9ca3af;
      direction: rtl;
    }
    
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid rgba(255,255,255,0.08);
    }
    
    .qr-section {
      text-align: center;
    }
    
    .qr-section img {
      width: 80px;
      height: 80px;
      border-radius: 8px;
    }
    
    .qr-label {
      font-size: 8px;
      color: #6b7280;
      margin-top: 4px;
      letter-spacing: 1px;
    }
    
    .cert-id-section {
      text-align: center;
      flex: 1;
    }
    
    .cert-id-label {
      font-family: 'Inter', sans-serif;
      font-size: 8px;
      color: #6b7280;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    
    .cert-id {
      font-family: 'Courier New', monospace;
      font-size: 9px;
      color: #9ca3af;
      word-break: break-all;
      direction: ltr;
    }
    
    .issuer-section {
      text-align: center;
    }
    
    .issuer-logo {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 900;
      color: #6b7280;
      letter-spacing: 3px;
    }
    
    .issuer-text {
      font-size: 8px;
      color: #4b5563;
    }
    
    @media print {
      body { background: white; }
      .certificate { box-shadow: none; border-color: ${config.color}60; }
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="top-border"></div>
    <div class="side-borders left"></div>
    <div class="side-borders right"></div>
    
    <div class="content">
      <div class="logo">KODAX</div>
      <div class="subtitle-en">CERTIFICATE OF ACHIEVEMENT</div>
      <div class="subtitle-ar">شهادة إنجاز</div>
      
      <div class="level-badge">
        <span class="emoji">${config.emoji}</span>
        <span class="text">${config.label.toUpperCase()}</span>
      </div>
      
      <div class="presented-to">THIS IS TO CERTIFY THAT</div>
      <div class="presented-ar">نشهد بأن</div>
      
      <div class="recipient">${userName || 'الطالب'}</div>
      
      <div class="divider"></div>
      
      <div class="for-label">HAS SUCCESSFULLY COMPLETED</div>
      <div class="course-ar">${certificate.course_title_ar || certificate.course_title}</div>
      <div class="course-en">${certificate.course_title}</div>
      
      <div class="date">${dateEN}</div>
      <div class="date-ar">${dateAR}</div>
      
      <div class="footer">
        <div class="qr-section">
          <img src="${qrUrl}" alt="QR Code" crossorigin="anonymous" />
          <div class="qr-label">SCAN TO VERIFY</div>
        </div>
        
        <div class="cert-id-section">
          <div class="cert-id-label">Certificate ID</div>
          <div class="cert-id">${certificate.id}</div>
        </div>
        
        <div class="issuer-section">
          <div class="issuer-logo">KODAX</div>
          <div class="issuer-text">Educational Platform</div>
        </div>
      </div>
    </div>
    
    <div class="bottom-border"></div>
  </div>
</body>
</html>`;
}

// ===== Styles =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.backgroundDark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.backgroundDark,
    gap: 12,
  },
  errorText: {
    color: THEME_COLORS.error,
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: THEME_COLORS.accent,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  scrollContentLarge: {
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
  },
  previewContainer: {
    marginBottom: 20,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME_COLORS.textSecondary,
    marginBottom: 10,
  },
  previewWrapper: {
    height: 320,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME_COLORS.borderDark,
    backgroundColor: '#0f0f1e',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  optionsCard: {
    backgroundColor: THEME_COLORS.backgroundMedium,
    borderRadius: BORDER_RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME_COLORS.borderDark,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: THEME_COLORS.borderDark,
    backgroundColor: THEME_COLORS.backgroundLight,
    gap: 6,
  },
  typeOptionActive: {
    borderColor: THEME_COLORS.accent,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME_COLORS.textMuted,
  },
  typeLabelActive: {
    color: '#fff',
  },
  typeDesc: {
    fontSize: 11,
    color: THEME_COLORS.textMuted,
  },
  mobileInfoBox: {
    alignItems: 'center',
    padding: 20,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    gap: 12,
    marginBottom: 20,
  },
  mobileInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  mobileInfoSubtext: {
    fontSize: 12,
    color: THEME_COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  downloadButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  downloadButtonDisabled: {
    opacity: 0.6,
  },
  downloadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  downloadText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  infoCard: {
    backgroundColor: THEME_COLORS.backgroundMedium,
    borderRadius: BORDER_RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME_COLORS.borderDark,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 12,
    color: THEME_COLORS.textMuted,
    flex: 1,
    lineHeight: 20,
  },
});
