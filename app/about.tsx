/**
 * صفحة عن التطبيق - About Page
 * معلومات عن تطبيق Kodax
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function AboutScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;

  const features = [
    {
      icon: 'school' as const,
      iconLib: 'material',
      color: '#3b82f6',
      title: 'دروس تفاعلية',
      description: 'تعلم البرمجة من خلال دروس مرتبة ومنظمة بلغات متعددة',
    },
    {
      icon: 'code-braces' as const,
      iconLib: 'material',
      color: '#8b5cf6',
      title: 'محرر أكواد احترافي',
      description: 'اكتب وشغّل الأكواد مباشرة من التطبيق مع تلوين الصيغة',
    },
    {
      icon: 'trophy' as const,
      iconLib: 'ionicons',
      color: '#f59e0b',
      title: 'تحديات وإنجازات',
      description: 'اختبر مهاراتك عبر تحديات متنوعة واكسب الشارات والنقاط',
    },
    {
      icon: 'chatbubbles' as const,
      iconLib: 'ionicons',
      color: '#10b981',
      title: 'مساعد ذكاء اصطناعي',
      description: 'احصل على مساعدة فورية من المساعد الذكي في أي وقت',
    },
    {
      icon: 'ribbon' as const,
      iconLib: 'ionicons',
      color: '#ec4899',
      title: 'شهادات معتمدة',
      description: 'احصل على شهادات بعد إتمام الدورات بنجاح',
    },
    {
      icon: 'people' as const,
      iconLib: 'ionicons',
      color: '#6366f1',
      title: 'مجتمع المبرمجين',
      description: 'شارك أكوادك وتفاعل مع المبرمجين الآخرين',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#e2e8f0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>عن التطبيق</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isLargeScreen && {
            maxWidth: 700,
            alignSelf: 'center',
            width: '100%',
          },
        ]}
      >
        {/* App Logo & Info */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.appInfoSection}
        >
          <View style={styles.logoWrapper}>
            <Image
              source={require('../assets/kodax-light-trans.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>Kodax</Text>
          <Text style={styles.appVersion}>الإصدار 1.0.0</Text>
          <Text style={styles.appDescription}>
            منصة تعليمية تفاعلية لتعلم البرمجة باللغة العربية.
            {'\n'}
            صُمّمت لتكون بسيطة وسهلة الاستخدام مع دعم كامل للعربية.
          </Text>
        </Animated.View>

        {/* Features */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={styles.sectionTitle}>المميزات</Text>
          <View
            style={[
              styles.featuresGrid,
              isLargeScreen && { flexDirection: 'row', flexWrap: 'wrap' },
            ]}
          >
            {features.map((feature, i) => (
              <View
                key={i}
                style={[styles.featureCard, isLargeScreen && { width: '48%' }]}
              >
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: `${feature.color}15` },
                  ]}
                >
                  {feature.iconLib === 'ionicons' ? (
                    <Ionicons
                      name={feature.icon as any}
                      size={22}
                      color={feature.color}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name={feature.icon as any}
                      size={22}
                      color={feature.color}
                    />
                  )}
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Tech Stack */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={styles.sectionTitle}>التقنيات المستخدمة</Text>
          <View style={styles.techGrid}>
            {[
              { name: 'React Native', icon: 'logo-react' },
              { name: 'Expo', icon: 'phone-portrait' },
              { name: 'Supabase', icon: 'server' },
              { name: 'TypeScript', icon: 'code-slash' },
            ].map((tech, i) => (
              <View key={i} style={styles.techItem}>
                <Ionicons name={tech.icon as any} size={20} color="#a78bfa" />
                <Text style={styles.techName}>{tech.name}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Credits */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <View style={styles.creditsSection}>
            <Text style={styles.creditsYear}>© 2026 KODAX</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  // App Info
  appInfoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 80,
    height: 85,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  appVersion: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 12,
  },
  appDescription: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  // Section
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 16,
  },
  // Features
  featuresGrid: {
    gap: 12,
    marginBottom: 32,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  featureDescription: {
    fontSize: 13,
    color: '#9ca3af',
    lineHeight: 20,
  },
  // Tech
  techGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  techItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(167, 139, 250, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.15)',
  },
  techName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#c4b5fd',
  },
  // Credits
  creditsSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    gap: 4,
  },
  creditsTitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  creditsName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#a78bfa',
  },
  creditsYear: {
    fontSize: 12,
    color: '#4b5563',
  },
});
