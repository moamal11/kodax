import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { certificateService } from '@/services/certificateService';
import type { CertificateSummaryItem } from '@/types/certificate';

/** Discard an old request when the route or account changes. */
export function useCertificateDetail(id?: string) {
  const { user } = useAuth();
  const [certificate, setCertificate] = useState<CertificateSummaryItem | null>(null);
  const [holder, setHolder] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const request = useRef(0);
  const load = useCallback(async () => {
    const version = ++request.current;
    setLoading(true);
    setError(null);
    setCertificate(null);
    setHolder('');
    if (!id || !user?.id) {
      setError(!id ? 'رابط الشهادة غير مكتمل.' : 'سجّل الدخول لعرض شهاداتك.');
      setLoading(false);
      return;
    }
    try {
      certificateService.setUser(user.id);
      const summary = await certificateService.getUserCertificates();
      if (version !== request.current) return;
      const cert = summary.certificates.find((item) => item.id === id);
      if (!cert) throw new Error('لم نعثر على هذه الشهادة ضمن شهاداتك.');
      setCertificate(cert);
      const verification = await certificateService.verifyCertificate(id);
      if (version === request.current) setHolder(verification.holder_name || '');
    } catch (e) {
      if (version === request.current) setError(e instanceof Error ? e.message : 'تعذّر تحميل الشهادة.');
    } finally {
      if (version === request.current) setLoading(false);
    }
  }, [id, user?.id]);
  useEffect(() => {
    load();
    return () => {
      request.current++;
    };
  }, [load]);
  return { certificate, holder, loading, error, reload: load };
}
