/**
 * Message Service
 * Handle direct messaging between users
 */

import { supabase } from '@/lib/supabase';

// ==================== Types ====================

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_read: boolean;
  is_deleted: boolean;
  is_edited: boolean;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  other_user: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    is_verified?: boolean;
  };
  last_message: {
    content: string;
    created_at: string;
    sender_id: string;
  } | null;
  unread_count: number;
}

export interface ConversationDetail {
  id: string;
  created_at: string;
  updated_at: string;
  other_user: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    is_verified?: boolean;
  };
  messages: Array<
    Message & {
      sender: {
        id: string;
        full_name: string | null;
        username: string | null;
        avatar_url: string | null;
        is_verified?: boolean;
      };
    }
  >;
}

// ==================== Service Functions ====================

/**
 * Get or create a conversation with another user
 */
export async function getOrCreateConversation(
  currentUserId: string,
  otherUserId: string
): Promise<{ data: string | null; error: any }> {
  try {
    const { data, error } = await supabase.rpc('get_or_create_conversation', {
      user1_id: currentUserId,
      user2_id: otherUserId,
    });

    if (error) {
      console.error('[getOrCreateConversation] Error:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('[getOrCreateConversation] Exception:', err);
    return { data: null, error: err };
  }
}

/**
 * Get all conversations for current user
 */
export async function getConversations(
  userId: string
): Promise<{ data: Conversation[] | null; error: any }> {
  try {
    // Get all conversation IDs where user is a participant
    const { data: participations, error: partError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);

    if (partError) {
      console.error('[getConversations] Participation error:', partError);
      return { data: null, error: partError };
    }

    if (!participations || participations.length === 0) {
      return { data: [], error: null };
    }

    const conversationIds = participations.map((p) => p.conversation_id);

    // Get conversation details
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .in('id', conversationIds)
      .order('updated_at', { ascending: false });

    if (convError) {
      console.error('[getConversations] Conversations error:', convError);
      return { data: null, error: convError };
    }

    // For each conversation, get other user and last message
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        // Get other participant
        const { data: participants } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', conv.id)
          .neq('user_id', userId)
          .limit(1)
          .single();

        const otherUserId = participants?.user_id;

        // Get other user's profile (only if otherUserId exists)
        let otherUser = null;
        if (otherUserId) {
          const { data } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url, is_verified')
            .eq('id', otherUserId)
            .single();
          otherUser = data;
        }

        // Get last message
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('content, created_at, sender_id')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Get unread count
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('is_read', false)
          .neq('sender_id', userId);

        return {
          id: conv.id,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          other_user: otherUser || {
            id: otherUserId || '',
            full_name: null,
            username: null,
            avatar_url: null,
          },
          last_message: lastMessage,
          unread_count: unreadCount || 0,
        };
      })
    );

    return { data: conversationsWithDetails, error: null };
  } catch (err) {
    console.error('[getConversations] Exception:', err);
    return { data: null, error: err };
  }
}

/**
 * Get conversation detail with messages
 */
export async function getConversationDetail(
  conversationId: string,
  userId: string
): Promise<{ data: ConversationDetail | null; error: any }> {
  try {
    // Get conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError) {
      console.error('[getConversationDetail] Conversation error:', convError);
      return { data: null, error: convError };
    }

    // Get other participant
    const { data: participants } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .neq('user_id', userId)
      .limit(1)
      .single();

    const otherUserId = participants?.user_id;

    // Get other user's profile
    let otherUser = null;
    if (otherUserId) {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, is_verified')
        .eq('id', otherUserId)
        .single();
      otherUser = data;
    }

    // Get messages with sender info
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select(
        `
        *,
        sender:profiles!messages_sender_id_fkey(id, full_name, username, avatar_url, is_verified)
      `
      )
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (msgError) {
      console.error('[getConversationDetail] Messages error:', msgError);
      return { data: null, error: msgError };
    }

    return {
      data: {
        id: conversation.id,
        created_at: conversation.created_at,
        updated_at: conversation.updated_at,
        other_user: otherUser || {
          id: otherUserId || '',
          full_name: null,
          username: null,
          avatar_url: null,
        },
        messages: messages || [],
      },
      error: null,
    };
  } catch (err) {
    console.error('[getConversationDetail] Exception:', err);
    return { data: null, error: err };
  }
}

/**
 * Send a message
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string
): Promise<{ data: Message | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('[sendMessage] Error:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('[sendMessage] Exception:', err);
    return { data: null, error: err };
  }
}

/**
 * Edit a message
 */
export async function editMessage(
  messageId: string,
  newContent: string
): Promise<{ data: Message | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .update({
        content: newContent.trim(),
        is_edited: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .select()
      .single();

    if (error) {
      console.error('[editMessage] Error:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('[editMessage] Exception:', err);
    return { data: null, error: err };
  }
}

/**
 * Delete a message (soft delete)
 */
export async function deleteMessage(
  messageId: string
): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('messages')
      .update({
        content: 'تم حذف هذه الرسالة',
        is_deleted: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', messageId);

    if (error) {
      console.error('[deleteMessage] Error:', error);
      return { error };
    }

    return { error: null };
  } catch (err) {
    console.error('[deleteMessage] Exception:', err);
    return { error: err };
  }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('[markMessagesAsRead] Error:', error);
      return { error };
    }

    // Update last_read_at for user
    await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    return { error: null };
  } catch (err) {
    console.error('[markMessagesAsRead] Exception:', err);
    return { error: err };
  }
}

/**
 * Get total unread count for user
 */
export async function getUnreadCount(
  userId: string
): Promise<{ data: number | null; error: any }> {
  try {
    // Get all conversation IDs where user is a participant
    const { data: participations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);

    if (!participations || participations.length === 0) {
      return { data: 0, error: null };
    }

    const conversationIds = participations.map((p) => p.conversation_id);

    // Count unread messages in those conversations
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', conversationIds)
      .eq('is_read', false)
      .neq('sender_id', userId);

    if (error) {
      console.error('[getUnreadCount] Error:', error);
      return { data: null, error };
    }

    return { data: count || 0, error: null };
  } catch (err) {
    console.error('[getUnreadCount] Exception:', err);
    return { data: null, error: err };
  }
}

/**
 * Subscribe to new messages in a conversation
 */
export function subscribeToMessages(
  conversationId: string,
  callbacks: {
    onInsert?: (message: Message) => void;
    onUpdate?: (message: Message) => void;
    onDelete?: (message: Message) => void;
  }
) {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload) => {
        if (callbacks.onInsert) {
          // Load sender info for the new message
          const senderId = (payload.new as any).sender_id;
          let sender = null;
          if (senderId) {
            const { data } = await supabase
              .from('profiles')
              .select('id, full_name, username, avatar_url, is_verified')
              .eq('id', senderId)
              .single();
            sender = data;
          }

          const messageWithSender = {
            ...(payload.new as any),
            sender: sender || {
              id: senderId || '',
              full_name: null,
              username: null,
              avatar_url: null,
            },
          };

          callbacks.onInsert(messageWithSender as any);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload) => {
        if (callbacks.onUpdate) {
          // Load sender info
          const senderId = (payload.new as any).sender_id;
          let sender = null;
          if (senderId) {
            const { data } = await supabase
              .from('profiles')
              .select('id, full_name, username, avatar_url, is_verified')
              .eq('id', senderId)
              .single();
            sender = data;
          }

          const messageWithSender = {
            ...(payload.new as any),
            sender: sender || {
              id: senderId || '',
              full_name: null,
              username: null,
              avatar_url: null,
            },
          };

          callbacks.onUpdate(messageWithSender as any);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        if (callbacks.onDelete) {
          callbacks.onDelete(payload.old as Message);
        }
      }
    )
    .subscribe((status) => {
      console.log(`[subscribeToMessages] Status: ${status}`);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
