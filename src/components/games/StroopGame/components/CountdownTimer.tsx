// CountdownTimer.tsx
import React, { useEffect, useRef, useState } from "react";

interface CountdownTimerProps {
  duration: number; // in ms
  onComplete: () => void;
  isPaused: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  duration,
  onComplete,
  isPaused,
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  const startTimeRef = useRef<number>(Date.now());
  const pauseStartRef = useRef<number | null>(null);
  const totalPausedRef = useRef<number>(0);

  useEffect(() => {
    if (isPaused && pauseStartRef.current === null) {
      // Start pausing
      pauseStartRef.current = Date.now();
    }

    if (!isPaused && pauseStartRef.current !== null) {
      // Resumed — add to totalPausedRef
      totalPausedRef.current += Date.now() - pauseStartRef.current;
      pauseStartRef.current = null;
    }
  }, [isPaused]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (isPaused) return;

      const now = Date.now();
      const elapsed = now - startTimeRef.current - totalPausedRef.current;
      const remaining = duration - elapsed;

      if (remaining <= 0) {
        clearInterval(timer);
        setTimeLeft(0);
        onComplete();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, duration, onComplete]);

  const totalSeconds = Math.floor(timeLeft / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return (
    <p className="text-lg font-semibold">
      {minutes}:{seconds}
    </p>
  );
};
