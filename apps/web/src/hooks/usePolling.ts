import { useEffect, useRef } from "react";

export function usePolling(
  callback: () => void | Promise<void>,
  intervalMs: number,
  enabled = true,
) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || intervalMs <= 0) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    let visible = !document.hidden;

    const tick = () => {
      if (visible) {
        Promise.resolve(savedCallback.current()).finally(() => {
          timeoutId = setTimeout(tick, intervalMs);
        });
      } else {
        timeoutId = setTimeout(tick, intervalMs);
      }
    };

    const handleVisibility = () => {
      visible = !document.hidden;
      if (visible) {
        // Refresh immediately on tab focus
        Promise.resolve(savedCallback.current());
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    timeoutId = setTimeout(tick, intervalMs);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [intervalMs, enabled]);
}
