import { useEffect, useState } from "react";
import { secondsUntil } from "../utils/assignment";

export const useAssignmentCountdown = (deadline) => {
  const [remaining, setRemaining] = useState(() => secondsUntil(deadline));

  useEffect(() => {
    const next = secondsUntil(deadline);
    setRemaining(next);
    if (next === null || next === 0) return undefined;

    const interval = setInterval(() => {
      const value = secondsUntil(deadline);
      setRemaining(value);
      if (value === 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  return remaining;
};
