import { useEffect, useState } from 'react';

type AnimatedNumberProps = {
  target: number;
  duration?: number;
  minimumDigits?: number;
  format?: (value: number) => string;
};

/** Exponential ease-out: quick initial progress with a controlled final settle. */
export function easeOutExpo(progress: number) {
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;
  return 1 - 2 ** (-4 * progress);
}

/** Animates an integer from zero to its target while respecting reduced motion. */
export function AnimatedNumber({ target, duration = 1400, minimumDigits = 1, format }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(target);
      return;
    }

    let frame = 0;
    let startedAt: number | null = null;
    const update = (timestamp: number) => {
      startedAt ??= timestamp;
      const progress = Math.min(1, (timestamp - startedAt) / duration);
      setDisplayValue(Math.min(target, Math.round(target * easeOutExpo(progress))));
      if (progress < 1) frame = window.requestAnimationFrame(update);
    };
    frame = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(frame);
  }, [duration, target]);

  return <>{format ? format(displayValue) : String(displayValue).padStart(minimumDigits, '0')}</>;
}
