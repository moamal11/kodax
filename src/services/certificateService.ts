/**
 * 🎓 Certificate Service - Kodax
 * Professional server-side certificate management
 *
 * All certificate operations go through the Edge Function for security.
 * The client NEVER creates or modifies certificates directly.
 */

import { supabase } from '@/lib/supabase';
import { SUPABASE_URL } from '@/constants';
import AsyncStorage from '@/lib/platformStorage';
import {
  Certificate,
  CertificateLevel,
  EligibilityResult,
  IssueCertificateResult,
  VerificationResult,
  UserCertificatesSummary,
  CertificateSummaryItem,
  FinalExamResult,
  FinalExamAnswer,
} from '@/types/certificate';

const CACHE_KEY = '@kodax_certificates_';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

class CertificateService {
  private userId: string | null = null;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  // ===== User Management =====
  setUser(userId: string) {
    if (this.userId !== userId) {
      this.cache.clear();
    }
    this.userId = userId;
  }

  clearUser() {
    this.userId = null;
    this.cache.clear();
  }

  resetState() {
    this.userId = null;
    this.cache.clear();
  }

  // ===== Private: Call Edge Function =====
  private async callEdgeFunction(body: any): Promise<any> {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/certificate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    return response.json();
  }

  // ===== Private: Cache helpers =====
  private getCached(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  private setCache(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private invalidateCache(courseId?: string) {
    if (courseId) {
      // Invalidate course-specific caches
      for (const key of this.cache.keys()) {
        if (key.includes(courseId)) {
          this.cache.delete(key);
        }
      }
    }
    // Always invalidate summary cache
    this.cache.delete('user_summary');
  }

  // ===== Check Eligibility for Field =====
  async checkEligibility(
    fieldId: string,
    level: CertificateLevel
  ): Promise<EligibilityResult> {
    console.log('[CertificateService] checkEligibility called:', {
      fieldId,
      level,
    });

    const payload = {
      action: 'check_eligibility',
      course_id: fieldId,
      level,
    };

    console.log('[CertificateService] Calling Edge Function with:', payload);

    const result = await this.callEdgeFunction(payload);

    console.log('[CertificateService] Edge Function response:', result);

    return result;
  }

  // ===== Check All Levels Eligibility for Field =====
  async checkAllLevels(fieldId: string): Promise<{
    silver: EligibilityResult;
    gold: EligibilityResult;
    platinum: EligibilityResult;
    highestEligible: CertificateLevel | null;
  }> {
    console.log('[CertificateService] checkAllLevels input:', {
      fieldId,
    });

    const levels: CertificateLevel[] = ['silver', 'gold', 'platinum'];
    const results: Record<string, EligibilityResult> = {};
    let highestEligible: CertificateLevel | null = null;

    for (const level of levels) {
      results[level] = await this.checkEligibility(fieldId, level);
      console.log(`[CertificateService] ${level} eligibility:`, results[level]);
      if (results[level].eligible) {
        highestEligible = level;
      }
    }

    return {
      silver: results.silver,
      gold: results.gold,
      platinum: results.platinum,
      highestEligible,
    };
  }

  // ===== Issue Certificate for Field =====
  // السيرفر يحسب الأهلية والأعداد واسم المجال بنفسه من التقدم الموثّق — لا تُرسل أرقام من التطبيق
  async issueCertificate(
    fieldId: string,
    level: CertificateLevel,
    fieldName: string,
    fieldNameAr?: string
  ): Promise<IssueCertificateResult> {
    const result = await this.callEdgeFunction({
      action: 'issue',
      course_id: fieldId,
      level,
      course_title: fieldName,
      course_title_ar: fieldNameAr || fieldName,
    });

    // Invalidate caches on success
    if (result.success) {
      this.invalidateCache(fieldId);
      // Persist to AsyncStorage for offline
      try {
        await this.persistCertificateLocally(result.certificate);
      } catch (e) {
        console.error('Failed to persist certificate locally:', e);
      }
    }

    return result;
  }

  // ===== Verify Certificate (Public) =====
  async verifyCertificate(certificateId: string): Promise<VerificationResult> {
    const result = await this.callEdgeFunction({
      action: 'verify',
      certificate_id: certificateId,
    });
    return result;
  }

  // ===== Get User Certificates =====
  async getUserCertificates(): Promise<UserCertificatesSummary> {
    const cacheKey = 'user_summary';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const result = await this.callEdgeFunction({
      action: 'get_user_certs',
    });

    // Normalize
    const summary: UserCertificatesSummary = {
      total: result.total || 0,
      silver: result.silver || 0,
      gold: result.gold || 0,
      platinum: result.platinum || 0,
      certificates: result.certificates || [],
    };

    this.setCache(cacheKey, summary);

    // Also persist to AsyncStorage
    try {
      await AsyncStorage.setItem(
        `${CACHE_KEY}${this.userId}`,
        JSON.stringify(summary)
      );
    } catch (e) {
      console.error('Failed to save certificates to AsyncStorage:', e);
    }

    return summary;
  }

  // ===== Get Certificates from Local Cache (Offline) =====
  async getCertificatesOffline(): Promise<UserCertificatesSummary | null> {
    try {
      const data = await AsyncStorage.getItem(`${CACHE_KEY}${this.userId}`);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to read certificates from AsyncStorage:', e);
    }
    return null;
  }

  // ===== Get Certificate for Field =====
  async getFieldHighestCertificate(
    fieldId: string
  ): Promise<CertificateSummaryItem | null> {
    const summary = await this.getUserCertificates();
    const fieldCerts = summary.certificates
      .filter(
        (c) =>
          (c.field_id === fieldId || c.course_id === fieldId) &&
          c.status === 'valid'
      )
      .sort((a, b) => {
        const order = { silver: 1, gold: 2, platinum: 3 };
        return (
          order[b.level as keyof typeof order] -
          order[a.level as keyof typeof order]
        );
      });

    return fieldCerts[0] || null;
  }

  // ===== Submit Final Exam =====
  async submitFinalExam(
    courseId: string,
    answers: FinalExamAnswer[],
    totalQuestions: number,
    timeTakenSeconds?: number
  ): Promise<FinalExamResult> {
    if (!this.userId) {
      throw new Error('Not authenticated');
    }

    const correctAnswers = answers.filter((a) => a.is_correct).length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Get attempt number
    const { data: prevAttempts } = await supabase
      .from('course_final_exams')
      .select('attempt_number')
      .eq('user_id', this.userId)
      .eq('course_id', courseId)
      .order('attempt_number', { ascending: false })
      .limit(1);

    const attemptNumber = (prevAttempts?.[0]?.attempt_number || 0) + 1;

    const examResult = {
      user_id: this.userId,
      course_id: courseId,
      score,
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
      time_taken_seconds: timeTakenSeconds || null,
      answers: JSON.stringify(answers),
      passed: score >= 60, // Minimum passing score
      attempt_number: attemptNumber,
    };

    const { data, error } = await supabase
      .from('course_final_exams')
      .insert(examResult)
      .select()
      .single();

    if (error) {
      console.error('Failed to submit exam:', error);
      throw new Error('فشل في حفظ نتيجة الاختبار');
    }

    // Invalidate eligibility cache since exam score changed
    this.invalidateCache(courseId);

    return {
      ...data,
      answers: JSON.parse(data.answers),
    };
  }

  // ===== Get Best Exam Score =====
  async getBestExamScore(courseId: string): Promise<number | null> {
    if (!this.userId) return null;

    const { data, error } = await supabase
      .from('course_final_exams')
      .select('score')
      .eq('user_id', this.userId)
      .eq('course_id', courseId)
      .order('score', { ascending: false })
      .limit(1);

    if (error || !data?.length) return null;
    return data[0].score;
  }

  // ===== Get Exam History =====
  async getExamHistory(courseId: string): Promise<FinalExamResult[]> {
    if (!this.userId) return [];

    const { data, error } = await supabase
      .from('course_final_exams')
      .select('*')
      .eq('user_id', this.userId)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to get exam history:', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      ...d,
      answers:
        typeof d.answers === 'string' ? JSON.parse(d.answers) : d.answers,
    }));
  }

  // ===== Private: Persist certificate locally =====
  private async persistCertificateLocally(cert: Certificate) {
    try {
      const existing = await AsyncStorage.getItem(`${CACHE_KEY}${this.userId}`);
      let summary: UserCertificatesSummary = existing
        ? JSON.parse(existing)
        : { total: 0, silver: 0, gold: 0, platinum: 0, certificates: [] };

      // Add or update the certificate
      const idx = summary.certificates.findIndex(
        (c) => c.field_id === cert.field_id && c.level === cert.level
      );

      const item: CertificateSummaryItem = {
        id: cert.id,
        field_id: cert.field_id,
        field_name: cert.field_name,
        field_name_ar: cert.field_name_ar,
        level: cert.level,
        status: cert.status,
        issued_at: cert.issued_at,
        achievement_snapshot: cert.achievement_snapshot,
      };

      if (idx >= 0) {
        summary.certificates[idx] = item;
      } else {
        summary.certificates.unshift(item);
      }

      // Recalculate counts
      const validCerts = summary.certificates.filter(
        (c) => c.status === 'valid'
      );
      summary.total = validCerts.length;
      summary.silver = validCerts.filter((c) => c.level === 'silver').length;
      summary.gold = validCerts.filter((c) => c.level === 'gold').length;
      summary.platinum = validCerts.filter(
        (c) => c.level === 'platinum'
      ).length;

      await AsyncStorage.setItem(
        `${CACHE_KEY}${this.userId}`,
        JSON.stringify(summary)
      );
    } catch (e) {
      console.error('Error persisting certificate locally:', e);
    }
  }
}

// Singleton
export const certificateService = new CertificateService();
