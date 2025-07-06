import { useState, useEffect, useCallback } from "react";

export const useTimer = () => {
  const [processingTime, setProcessingTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);

  // Function to start the timer
  const startTimer = useCallback(() => {
    // Clear any existing timer first
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    setProcessingTime(0);
    const interval = setInterval(() => {
      setProcessingTime((prev) => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  }, [timerInterval]);

  // Function to stop the timer
  const stopTimer = useCallback(() => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  }, [timerInterval]);

  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  return {
    processingTime,
    setProcessingTime,
    timerInterval,
    setTimerInterval,
    startTimer,
    stopTimer,
  };
};
