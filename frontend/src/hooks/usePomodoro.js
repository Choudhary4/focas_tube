import { useEffect, useMemo, useRef, useState } from 'react';

export function usePomodoro(initialMinutes = 25) {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          setIsRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const time = useMemo(() => {
    const min = Math.floor(secondsLeft / 60);
    const sec = secondsLeft % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }, [secondsLeft]);

  function start() {
    if (secondsLeft > 0) setIsRunning(true);
  }

  function pause() {
    setIsRunning(false);
  }

  function reset(minutes = initialMinutes) {
    setIsRunning(false);
    setSecondsLeft(minutes * 60);
  }

  return {
    time,
    isRunning,
    start,
    pause,
    reset,
  };
}
