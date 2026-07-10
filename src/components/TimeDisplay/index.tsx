import { formatDuration } from "@utils/time";

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
  const safeTodaySeconds = Math.max(0, Math.floor(todaySeconds));

  return (
    <div className={styles.timeDisplay}>
      <span className={styles.metric}>
        <span className={styles.label}>today</span>
        <strong className={styles.value}>
          {formatDuration(safeTodaySeconds)}
        </strong>
      </span>

      <span className={styles.divider} />

      <span className={styles.metric}>
        <span className={styles.label}>total</span>
        <strong className={styles.value}>
          {formatDuration(seconds)}
        </strong>
      </span>

      <span className={styles.divider} />

      <span className={styles.metric}>
        <span className={styles.label}>rest</span>
        <strong className={styles.value}>
          {formatDuration(Math.abs(remainingSeconds))}
        </strong>
      </span>
    </div>
  );
}
