/**
 * BroadcastManager.tsx
 *
 * مدير الرسائل العامة - يتم تضمينه في _layout.tsx
 * يجلب الرسائل غير المقروءة ويعرضها بالتسلسل:
 * - Toast: يعرض كإشعار بسيط ثم يُسجّل كمقروء
 * - Modal: يعرض كنافذة منبثقة ويُسجّل عند الإغلاق
 *
 * يدعم المتغيرات الديناميكية مثل {{name}}
 * لا يؤثر على أداء التطبيق - يعمل بشكل غير متزامن بعد تحميل الشاشة
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  getUnreadMessages,
  markMessageRead,
  BroadcastMessage,
} from '@/services/broadcastService';
import { showToast } from '@/components/ui/Toast';
import BroadcastModal from '@/components/ui/BroadcastModal';

interface BroadcastManagerProps {
  userId: string;
  userName?: string;
}

/**
 * استبدال المتغيرات الديناميكية في النصوص
 * حالياً يدعم {{name}} - قابل للتوسعة بسهولة
 */
function replaceDynamicVariables(
  text: string | null | undefined,
  context: { name?: string }
): string {
  if (!text) return '';
  return text.replace(/\{\{name\}\}/gi, context.name || 'مستخدم');
}

export default function BroadcastManager({
  userId,
  userName,
}: BroadcastManagerProps) {
  const [modalMessage, setModalMessage] = useState<BroadcastMessage | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const hasCheckedRef = useRef(false);
  const processingRef = useRef(false);
  const variableContext = useRef({ name: userName || '' });

  // تحديث السياق عند تغيّر الاسم
  useEffect(() => {
    variableContext.current = { name: userName || '' };
  }, [userName]);

  const processMessages = useCallback(async () => {
    if (!userId || processingRef.current) return;

    processingRef.current = true;

    try {
      const messages = await getUnreadMessages(userId);
      if (!messages || messages.length === 0) return;

      const ctx = variableContext.current;

      // فصل الرسائل حسب النوع
      const toasts = messages.filter((m) => m.type === 'toast');
      const modals = messages.filter((m) => m.type === 'modal');

      // 1) عرض Toast messages واحدة تلو الأخرى
      for (const toast of toasts) {
        const resolvedTitle = replaceDynamicVariables(toast.title, ctx);
        showToast.info(resolvedTitle, 4000);
        await markMessageRead(toast.id, userId);
        if (toasts.length > 1) {
          await new Promise((r) => setTimeout(r, 1500));
        }
      }

      // 2) عرض أول Modal message (الأقدم أولاً)
      if (modals.length > 0) {
        if (toasts.length > 0) {
          await new Promise((r) => setTimeout(r, 2000));
        }
        setModalMessage(modals[0]);
        setShowModal(true);
      }
    } catch {
      // silent
    } finally {
      processingRef.current = false;
    }
  }, [userId]);

  // فحص الرسائل بعد تحميل التطبيق (تأخير 3 ثواني)
  useEffect(() => {
    if (!userId || hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const timer = setTimeout(() => {
      processMessages();
    }, 3000);

    return () => clearTimeout(timer);
  }, [userId, processMessages]);

  // إغلاق Modal وتسجيله كمقروء
  const handleModalClose = useCallback(async () => {
    if (modalMessage) {
      await markMessageRead(modalMessage.id, userId);
    }
    setShowModal(false);
    // تأخير بسيط قبل حذف البيانات لضمان اكتمال الأنميشن
    setTimeout(() => setModalMessage(null), 100);
  }, [modalMessage, userId]);

  const ctx = variableContext.current;

  // ⚡ حل جذري: لا نعرض BroadcastModal إلا عندما يكون هناك رسالة فعلية
  if (!showModal || !modalMessage) return null;

  return (
    <BroadcastModal
      visible={showModal}
      title={replaceDynamicVariables(modalMessage?.title, ctx)}
      body={replaceDynamicVariables(modalMessage?.body, ctx)}
      imageUrl={modalMessage?.image_url}
      onClose={handleModalClose}
    />
  );
}
