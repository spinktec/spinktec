// Drives a "ballots coming in" animation. Whenever `triggerKey` changes, the
// returned progress sweeps from 0 to 1 over `durationMs` using an ease-out
// curve (fast at first, settling at the end) so vote tallies climb on screen
// the way returns arrive on election night. Honors prefers-reduced-motion.

import { useEffect, useRef, useState } from 'react';

export interface Tally {
  progress: number; // 0 → 1
  counting: boolean; // true while progress < 1
}

export function useTally(triggerKey: string | number, durationMs = 1500): Tally {
  const [progress, setProgress] = useState(1);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setProgress(1);
      return;
    }

    let start: number | null = null;
    setProgress(0);

    const tick = (t: number): void => {
      if (start === null) start = t;
      const linear = Math.min(1, (t - start) / durationMs);
      const eased = 1 - Math.pow(1 - linear, 3); // easeOutCubic
      setProgress(eased);
      if (linear < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [triggerKey, durationMs]);

  return { progress, counting: progress < 1 };
}
