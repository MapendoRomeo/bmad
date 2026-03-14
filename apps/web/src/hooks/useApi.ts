import { useState, useEffect, useCallback } from 'react';
import { AxiosResponse } from 'axios';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(
  apiCall: () => Promise<AxiosResponse<T>>,
  deps: unknown[] = [],
  immediate = true,
) {
  const [state, setState] = useState<UseApiState<T>>({ data: null, loading: immediate, error: null });

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await apiCall();
      setState({ data: res.data, loading: false, error: null });
      return res.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      const message = error.response?.data?.error?.message || 'Une erreur est survenue';
      setState((prev) => ({ ...prev, loading: false, error: message }));
      throw err;
    }
  }, deps);

  useEffect(() => {
    if (immediate) { execute(); }
  }, [execute, immediate]);

  return { ...state, execute, refetch: execute };
}
