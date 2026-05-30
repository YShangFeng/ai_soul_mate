// ============================================
// SoulMate.ai — Common/API Type Definitions
// ============================================

/** Standard API response wrapper */
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: { code: string; message: string };
}

/** Paginated response */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
