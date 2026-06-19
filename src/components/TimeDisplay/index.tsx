import { formatDuration, formatTimer } from "@utils/time";

import styles from "./TimeDisplay.module.scss";

export function TimeDisplay({ seconds }: { seconds: number }) {
  return (
    <div className={styles.timeDisplay}>
      <strong>{formatTimer(seconds)}</strong>
      <span aria-hidden="true" className={styles.divider} />
      <span>{formatDuration(seconds)}</span>
    </div>
  );
}
