"use client";

import { useCallback, useState } from "react";

const MIN_LOADING_MS = 350;

/**
 * Wraps an event handler with a loading flag for use with `<Button loading={loading} />`.
 */
export function useAsyncAction<E>(
  handler: (event: E) => void | Promise<void>,
): [(event: E) => Promise<void>, boolean] {
  const [loading, setLoading] = useState(false);

  const run = useCallback(
    async (event: E) => {
      setLoading(true);
      const started = Date.now();
      try {
        await handler(event);
      } finally {
        const elapsed = Date.now() - started;
        if (elapsed < MIN_LOADING_MS) {
          await new Promise((resolve) => setTimeout(resolve, MIN_LOADING_MS - elapsed));
        }
        setLoading(false);
      }
    },
    [handler],
  );

  return [run, loading];
}
