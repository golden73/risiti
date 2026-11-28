import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

/**
 * Runs an async function and tracks loading/error/data.
 * Pass `enabled: false` to skip execution (e.g. waiting on a phone number).
 */
export function useAsync<T>(
  fn: () => Promise<T>,
  deps: unknown[],
  options: { enabled?: boolean } = {},
) {
  const { enabled = true } = options;
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: enabled,
    error: null,
  });
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const run = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fnRef.current();
      setState({ data, loading: false, error: null });
      return data;
    } catch (e) {
      const err =
        e instanceof ApiError
          ? e
          : new ApiError("unknown", "An unexpected error occurred.", null);
      setState((prev) => ({ ...prev, loading: false, error: err }));
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  return { ...state, refetch: run };
}