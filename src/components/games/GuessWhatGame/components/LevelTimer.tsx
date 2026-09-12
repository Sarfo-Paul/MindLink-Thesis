import React, { useEffect, useRef, useState } from "react";

interface LevelTimerProps {
  shouldRun: boolean;
  isMemorizationPhase: boolean;
  onTick?: (elapsedTime: number) => void;
  onReset?: () => void;
}

const LevelTimer: React.FC<LevelTimerProps> = ({
  shouldRun,
  isMemorizationPhase,
  onTick,
  onReset,
}) => {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset when entering memorization phase
  useEffect(() => {
    if (isMemorizationPhase) {
      setElapsed(0);
      onReset?.();

      // Also clear the interval if it's running
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isMemorizationPhase, onReset]);

  // Start/stop counting logic
  useEffect(() => {
    if (shouldRun && !isMemorizationPhase) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          const newElapsed = prev + 1;
          onTick?.(newElapsed);
          return newElapsed;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [shouldRun, isMemorizationPhase, onTick]);

  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="flex justify-center items-center">
      <span className="font-bold text-xl">
        {minutes}:{seconds}
      </span>
    </div>
  );
};

export default LevelTimer;
