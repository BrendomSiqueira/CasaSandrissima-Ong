import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'motion/react';

interface AnimatedCounterProps {
  value: number;
  duration?: number; // total duration in seconds (default: 1.2)
  delay?: number; // delay in seconds before counting starts
  className?: string;
  prefix?: string;
  suffix?: string;
}

export default function AnimatedCounter({
  value,
  duration = 1.2,
  delay = 0,
  className = '',
  prefix = '',
  suffix = '',
}: AnimatedCounterProps) {
  const [count, setCount] = useState<number>(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const currentCountRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isInView) return;

    const target = Math.max(0, Math.round(Number(value) || 0));
    const start = currentCountRef.current;

    if (start === target && count === target) return;

    const diff = Math.abs(target - start);
    if (diff === 0) {
      setCount(target);
      currentCountRef.current = target;
      return;
    }

    let startTime: number | null = null;
    
    // For small targets (e.g. 1 to 12), step sequentially with distinct readable ticks
    // For larger numbers, count up with smooth deceleration (easeOut)
    const isSmallStep = diff <= 12;
    const totalDurationMs = isSmallStep
      ? Math.max(180, Math.min(260, (duration * 1000) / diff)) * diff
      : duration * 1000;

    const timeoutId = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / totalDurationMs, 1);

        let nextValue: number;
        if (isSmallStep) {
          // Discrete sequential step
          const stepIndex = Math.min(Math.floor(progress * diff), diff);
          nextValue = start < target ? start + stepIndex : start - stepIndex;
        } else {
          // Eased smooth continuous count
          const easeOut = 1 - Math.pow(1 - progress, 3);
          nextValue = Math.round(start + (target - start) * easeOut);
        }

        setCount(nextValue);
        currentCountRef.current = nextValue;

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(step);
        } else {
          setCount(target);
          currentCountRef.current = target;
        }
      };

      animFrameRef.current = requestAnimationFrame(step);
    }, delay * 1000);

    return () => {
      clearTimeout(timeoutId);
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isInView, value, duration, delay]);

  return (
    <span ref={ref} className={`tabular-nums inline-block ${className}`}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}
