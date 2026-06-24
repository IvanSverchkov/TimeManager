import cn from "classnames";

import { formatDuration, formatTimer } from "@utils/time";

import styles from "./TimeDisplay.module.scss";

type TimeDisplayProps = {
  estimatedHours: number;
  seconds: number;
  todaySeconds: number;
};

export function TimeDisplay({
  estimatedHours,
  seconds,
  todaySeconds,
}: TimeDisplayProps) {
  const remainingSeconds = estimatedHours * 60 * 60 - seconds;
  const isOverrun = remainingSeconds < 0;
  const safeTodaySeconds = Math.max(0, Math.floor(todaySeconds));
  const hasTodaySeconds = safeTodaySeconds > 0;

  return (
    <div className={cn(styles.timeDisplay, hasTodaySeconds && styles.hasToday)}>
      <strong>{formatTimer(seconds)}</strong>
      {hasTodaySeconds && (
        <span className={styles.today}>{formatDuration(safeTodaySeconds)}</span>
      )}
      <span aria-hidden="true" className={styles.divider} />
      <span className={isOverrun ? styles.overrun : styles.remaining}>
        {formatDuration(Math.abs(remainingSeconds))}
      </span>
    </div>
  );
}
