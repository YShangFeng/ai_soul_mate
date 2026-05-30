// @ts-nocheck
// Deprecated — all quota logic moved to @/lib/permissions
// This file kept for backward compatibility with any remaining imports

export {
  checkChatQuota as checkMessageQuota,
  type QuotaState as QuotaResult,
} from "@/lib/permissions";

// Stub — permissions module handles this now
export async function incrementMessageCount(_userId: string): Promise<void> {
  // No-op; permissions module manages limits centrally
}
