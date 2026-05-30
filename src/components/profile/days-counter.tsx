"use client";

import { useEffect, useState, useRef } from "react";

// ============================================
// Types
// ============================================

interface DaysCounterProps {
  days: number;
}

// ============================================
// Component
// ============================================

export function DaysCounter({ days }: DaysCounterProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Intersection Observer — start animation when visible
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Animate count up
  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    const duration = 1500; // ms

    function animate(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * days));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(days);
      }
    }

    requestAnimationFrame(animate);
  }, [isVisible, days]);

  return (
    <div ref={ref} className="flex flex-col items-center py-4">
      <span className="text-4xl font-extrabold tabular-nums bg-gradient-to-r from-brand-purple to-brand-rose bg-clip-text text-transparent">
        {count}
      </span>
      <span className="text-sm text-muted-foreground">Days together</span>
    </div>
  );
}
