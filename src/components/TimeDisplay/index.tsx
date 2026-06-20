import { formatDuration, formatTimer } from "@utils/time";

import styles from "./TimeDisplay.module.scss";

type TimeDisplayProps = {
  estimatedHours: number;
  seconds: number;
};

export function TimeDisplay({ estimatedHours, seconds }: TimeDisplayProps) {
  const remainingSeconds = estimatedHours * 60 * 60 - seconds;
  const isOverrun = remainingSeconds < 0;

  return (
    <div className={styles.timeDisplay}>
      <strong>{formatTimer(seconds)}</strong>
      <span aria-hidden="true" className={styles.divider} />
      <span className={isOverrun ? styles.overrun : styles.remaining}>
        {formatDuration(Math.abs(remainingSeconds))}
      </span>
    </div>
  );
}
