/**
 * زر الرسائل الخاصة: أيقونة بعدد الرسائل غير المقروءة (يتحدث كل 30 ثانية وعند العودة للشاشة).
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconButton } from '@/design';
import { getUnreadCount } from '@/services/messageService';

interface MessagesButtonProps {
  userId: string;
}

export const MessagesButton: React.FC<MessagesButtonProps> = ({ userId }) => {
  const router = useRouter();
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    if (!userId) return;
    const { data } = await getUnreadCount(userId);
    if (data !== null) setUnread(data);
  }, [userId]);

  useEffect(() => {
    load();
    const i = setInterval(load, 30000);
    return () => clearInterval(i);
  }, [load]);
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return <IconButton icon="chatbubble-ellipses-outline" label={unread ? `الرسائل، ${unread} غير مقروءة` : 'الرسائل'} badge={unread} onPress={() => router.push('/messages' as any)} />;
};
