import React, { useEffect, useRef, useState } from "react";

interface TimerProps {
  initialTime: number; // in seconds
  isPaused: boolean;
  onTick?: (timeLeft: number) => void;
  onComplete?: () => void;
}

const MemorizationPhaseTimer: React.FC<TimerProps> = ({
  initialTime,
  isPaused,
  onTick,
  onComplete,
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset timer when initialTime changes (e.g., on game restart)
  useEffect(() => {
    setTimeLeft(initialTime);
    endTimeRef.current = Date.now() + initialTime * 1000;
  }, [initialTime]);

  // Store the timer data to continue on resume
  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        if (endTimeRef.current) {
          const remaining = endTimeRef.current - Date.now();
          setTimeLeft(Math.ceil(remaining / 1000));
        }
      }
      return;
    }

    const now = Date.now();
    endTimeRef.current = now + timeLeft * 1000;

    intervalRef.current = setInterval(() => {
      const remaining = Math.ceil((endTimeRef.current! - Date.now()) / 1000);
      setTimeLeft(remaining);
      onTick?.(remaining);

      if (remaining <= 0) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        onComplete?.();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, onComplete, onTick, timeLeft]);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="flex justify-center items-center">
      <span className="text-[#EADEB8] font-bold text-6xl">
        {minutes}:{seconds}
      </span>
    </div>
  );
};

export default MemorizationPhaseTimer;
