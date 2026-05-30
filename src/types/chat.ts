// ============================================
// SoulMate.ai — Chat & Message Type Definitions
// ============================================

export type MessageRole = "user" | "companion";

/** Single chat message */
export interface Message {
  id: string;
  companionId: string;
  role: MessageRole;
  content: string;
  moderated: boolean;
  moderationFlagged: boolean;
  createdAt: string;
}

/** Request body for sending a message via API */
export interface ChatRequest {
  companionId: string;
  message: string;
}

/** Standard chat API response */
export interface ChatResponse {
  userMessage: Message;
  companionMessage: Message;
}

/** Streaming chat chunk from the API */
export interface ChatStreamChunk {
  id: string;
  content: string;
  done: boolean;
}

/** Conversation summary (used in sidebar/chat list) */
export interface ConversationSummary {
  companionId: string;
  companionName: string;
  companionAvatarUrl: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
}

/** Maps snake_case DB row to camelCase Message */
export function mapMessageRow(row: {
  id: string;
  companion_id: string;
  role: string;
  content: string;
  moderated: boolean;
  moderation_flagged: boolean;
  created_at: string;
}): Message {
  return {
    id: row.id,
    companionId: row.companion_id,
    role: row.role as MessageRole,
    content: row.content,
    moderated: row.moderated,
    moderationFlagged: row.moderation_flagged,
    createdAt: row.created_at,
  };
}
