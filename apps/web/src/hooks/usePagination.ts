import { useState, useCallback } from 'react';

interface PaginationState {
  page: number;
  limit: number;
}

export function usePagination(initialPage = 0, initialLimit = 10) {
  const [pagination, setPagination] = useState<PaginationState>({ page: initialPage, limit: initialLimit });

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination({ page: 0, limit });
  }, []);

  const reset = useCallback(() => {
    setPagination({ page: initialPage, limit: initialLimit });
  }, [initialPage, initialLimit]);

  return {
    page: pagination.page,
    limit: pagination.limit,
    offset: pagination.page * pagination.limit,
    setPage,
    setLimit,
    reset,
  };
}
