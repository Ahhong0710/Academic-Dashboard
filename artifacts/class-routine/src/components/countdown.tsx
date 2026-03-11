import { useState, useEffect } from "react";
import { differenceInSeconds, formatDistanceToNowStrict } from "date-fns";
import { cn } from "@/lib/utils";

export function LiveCountdown({ targetDate, isCompleted }: { targetDate: string, isCompleted: boolean }) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isPastDue, setIsPastDue] = useState(false);

  useEffect(() => {
    if (isCompleted) {
      setTimeLeft("Completed");
      return;
    }

    const calculateTimeLeft = () => {
      const target = new Date(targetDate);
      const now = new Date();
      const diffSecs = differenceInSeconds(target, now);

      if (diffSecs <= 0) {
        setIsPastDue(true);
        setTimeLeft("Past due");
        return;
      }

      setIsPastDue(false);
      setIsUrgent(diffSecs < 86400 * 2); // Less than 2 days
      setTimeLeft(formatDistanceToNowStrict(target) + " left");
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [targetDate, isCompleted]);

  return (
    <span className={cn(
      "font-mono text-sm font-semibold tracking-tight px-2.5 py-1 rounded-md transition-colors",
      isCompleted ? "bg-secondary text-muted-foreground" :
      isPastDue ? "bg-destructive/10 text-destructive" :
      isUrgent ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary"
    )}>
      {timeLeft}
    </span>
  );
}
