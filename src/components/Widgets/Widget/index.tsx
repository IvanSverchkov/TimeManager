import { Icon, type IconName } from "@kit/Icon";

import styles from "./Widget.module.scss";

export type WidgetProps = {
  icon: IconName;
  tone: "blue" | "green" | "purple" | "red";
  label: string;
  value: string;
  suffix?: string;
  progress?: number;
};

export function Widget({
  icon,
  tone,
  label,
  value,
  suffix,
  progress,
}: WidgetProps) {
  return (
    <article className={styles.widget}>
      <div className={`${styles.widgetIcon} ${styles[tone]}`}>
        <Icon name={icon} size={17} />
      </div>
      <div className={styles.widgetBody}>
        <p>{label}</p>
        <div className={styles.widgetValue}>
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
