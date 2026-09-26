export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export function normalizePagination(page = 1, limit = 25): { page: number; limit: number; skip: number } {
  const normalizedPage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const normalizedLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 100) : 25;
  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip: (normalizedPage - 1) * normalizedLimit,
  };
}
