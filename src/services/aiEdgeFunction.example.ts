/**
 * مثال على استخدام AI Chat Edge Function من React Native
 */

import { supabase } from '@/lib/supabase';

// ====================================
// الدالة الأساسية
// ====================================
export async function sendAIChatMessage(
  message: string,
  userId?: string,
  context?: string
): Promise<string> {
  try {
    // استدعاء Edge Function
    alert('before invoke');
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: {
        message,
        userId,
        context,
      },
    });

    if (error) {
      console.error('[AI Chat Error]', error);
      throw new Error('فشل في الاتصال بالخادم');
    }

    return data.reply;
  } catch (error) {
    console.error('[AI Chat Error]', error);
    throw error;
  }
}

// ====================================
// أمثلة الاستخدام
// ====================================

// مثال 1: سؤال بسيط
async function example1() {
  const reply = await sendAIChatMessage('ما هو React؟');
  console.log(reply);
  // → "React مكتبة JavaScript لبناء واجهات تفاعلية..."
}

// مثال 2: سؤال مع user ID
async function example2(userId: string) {
  const reply = await sendAIChatMessage('اشرح لي useEffect بالتفصيل', userId);
  console.log(reply);
}

// مثال 3: سؤال مع context
async function example3() {
  const reply = await sendAIChatMessage(
    'كيف أبدأ؟',
    'user-123',
    'مبتدئ في React Native'
  );
  console.log(reply);
}

// ====================================
// استخدام في Component
// ====================================
/*
import { useState } from 'react';
import { sendAIChatMessage } from '@/services/aiEdgeFunction';

function ChatComponent() {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const aiReply = await sendAIChatMessage(message);
      setReply(aiReply);
      setMessage('');
    } catch (error) {
      console.error(error);
      setReply('عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="اسأل أي سؤال..."
      />
      <Button title="إرسال" onPress={handleSend} disabled={loading} />
      {loading && <Text>جاري التحميل...</Text>}
      {reply && <Text>{reply}</Text>}
    </View>
  );
}
*/

// ====================================
// استخدام مع async/await + error handling
// ====================================
export async function sendAIChatWithRetry(
  message: string,
  maxRetries: number = 2
): Promise<string> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await sendAIChatMessage(message);
    } catch (error) {
      lastError = error as Error;
      console.warn(`Retry ${i + 1}/${maxRetries}`);
      // انتظر قليلاً قبل إعادة المحاولة
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }

  throw lastError || new Error('فشلت جميع المحاولات');
}

export default {
  sendAIChatMessage,
  sendAIChatWithRetry,
};
