import { Icon, type IconName } from "@kit/Icon";

import styles from "./MetricCard.module.scss";

export type MetricCardProps = {
  icon: IconName;
  tone: "blue" | "green" | "purple" | "red";
  label: string;
  value: string;
  suffix?: string;
  progress?: number;
};

export function MetricCard({
  icon,
  tone,
  label,
  value,
  suffix,
  progress,
}: MetricCardProps) {
  return (
    <article className={styles.metricCard}>
      <div className={`${styles.metricIcon} ${styles[tone]}`}>
        <Icon name={icon} size={17} />
      </div>
      <div className={styles.metricBody}>
        <p>{label}</p>
        <div className={styles.metricValue}>
          <strong>{value}</strong>
          {suffix && <span>{suffix}</span>}
        </div>
        {progress !== undefined && (
          <div className={styles.progress} role="progressbar">
            <span style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </article>
  );
}
