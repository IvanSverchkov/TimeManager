import { memo, useMemo } from "react";

import { Icon } from "@kit/Icon";
import type { Task } from "@state/Task";
import { formatDuration, getDateKey } from "@utils/time";

import styles from "./Overview.module.scss";

type OverviewProps = {
  tasks: Array<Task>;
  todayKey: string;
  onDailyCommentChange: (
    taskId: number,
    dateKey: string,
    comment: string,
  ) => void;
};

type OverviewEntry = {
  task: Task;
  seconds: number;
  comment: string;
  index: number;
};

type OverviewSection = {
  dateKey: string;
  entries: Array<OverviewEntry>;
  totalSeconds: number;
  timersSeconds: number;
  tasksSeconds: number;
};

type DayMetricData = {
  key: string;
  icon: "clock" | "target" | "trend";
  tone: "blue" | "purple" | "red";
  seconds: number;
};

export const Overview = memo(function Overview({
  tasks,
  todayKey,
  onDailyCommentChange,
}: OverviewProps) {
  const sections = useMemo(
    () => getOverviewSections(tasks, todayKey),
    [tasks, todayKey],
  );

  return (
    <div className={styles.overview}>
      {sections.map((section) => (
        <details
          className={styles.dateGroup}
          key={section.dateKey}
          {...(section.dateKey === todayKey ? { open: true } : {})}
        >
          <summary className={styles.dateHeader}>
            <div className={styles.dateTitle}>
              <div className={styles.dateIcon}>
                <Icon name="calendar" size={18} />
              </div>
              <h3>{formatDateTitle(section.dateKey, todayKey)}</h3>
              <div className={styles.dayMetrics}>
                {getDayMetrics(section).map((metric) => (
                  <DayMetric
                    icon={metric.icon}
                    key={metric.key}
                    tone={metric.tone}
                    value={formatOverviewDuration(metric.seconds)}
                  />
                ))}
              </div>
            </div>

            <span className={styles.toggleButton}>
              <Icon name="chevron-down" size={20} />
            </span>
          </summary>

          <div className={styles.entryList}>
            {section.entries.map(({ task, seconds, comment }) => (
              <div className={styles.entry} key={task.id}>
                <div className={styles.entrySummary}>
                  <strong>{task.name || "Untitled"}</strong>
                  <span className={styles.entryTime}>
                    <Icon name="clock" size={15} />
                    {formatOverviewDuration(seconds)}
                  </span>
                </div>

                <label className={styles.commentField}>
                  <span className={styles.visuallyHidden}>Daily note</span>
                  <input
                    placeholder="Add note"
                    type="text"
                    value={comment}
                    onChange={(event) => {
                      onDailyCommentChange(
                        task.id,
                        section.dateKey,
                        event.target.value,
                      );
                    }}
                  />
                </label>
              </div>
            ))}
          </div>
        </details>
      ))}

      {sections.length === 0 && (
        <div className={styles.emptyState}>No tracked time yet.</div>
      )}
    </div>
  );
});

function getDayMetrics(section: OverviewSection): Array<DayMetricData> {
  const metrics: Array<DayMetricData> = [
    {
      key: "total",
      icon: "trend",
      tone: "purple",
      seconds: section.totalSeconds,
    },
    {
      key: "timers",
      icon: "clock",
      tone: "blue",
      seconds: section.timersSeconds,
    },
    {
      key: "tasks",
      icon: "target",
      tone: "red",
      seconds: section.tasksSeconds,
    },
  ];

  return metrics.filter((metric) => metric.seconds > 0);
}

function DayMetric({
  icon,
  tone,
  value,
}: {
  icon: "clock" | "target" | "trend";
  tone: "blue" | "purple" | "red";
  value: string;
}) {
  return (
    <span className={styles.dayMetric}>
      <span className={`${styles.dayMetricIcon} ${styles[tone]}`}>
        <Icon name={icon} size={14} />
      </span>
      <span>{value}</span>
    </span>
  );
}

function getOverviewSections(
  tasks: Array<Task>,
  todayKey: string,
): Array<OverviewSection> {
  const dateKeys = new Set<string>([todayKey]);

  tasks.forEach((task) => {
    Object.entries(task.dailySeconds).forEach(([dateKey, seconds]) => {
      if (seconds > 0) dateKeys.add(dateKey);
    });

    Object.entries(task.dailyComments).forEach(([dateKey, comment]) => {
      if (comment.trim() !== "") dateKeys.add(dateKey);
    });
  });

  return Array.from(dateKeys)
    .sort((left, right) => right.localeCompare(left))
    .map((dateKey) => {
      const entries = tasks
        .map((task, index) => ({
          task,
          index,
          seconds: task.dailySeconds[dateKey] ?? 0,
          comment: task.dailyComments[dateKey] ?? "",
        }))
        .filter(({ seconds }) => seconds > 0)
        .sort((left, right) => {
          const timeSort = right.seconds - left.seconds;
          if (timeSort !== 0) return timeSort;
          return left.index - right.index;
        });

      return {
        dateKey,
        entries,
        totalSeconds: entries.reduce(
          (totalSeconds, entry) => totalSeconds + entry.seconds,
          0,
        ),
        timersSeconds: entries.reduce(
          (timersSeconds, entry) =>
            entry.task.status === undefined
              ? timersSeconds + entry.seconds
              : timersSeconds,
          0,
        ),
        tasksSeconds: entries.reduce(
          (tasksSeconds, entry) =>
            entry.task.status === undefined
              ? tasksSeconds
              : tasksSeconds + entry.seconds,
          0,
        ),
      };
    })
    .filter((section) => section.entries.length > 0);
}

function formatDateTitle(dateKey: string, todayKey: string): string {
  if (dateKey === todayKey) return "Today";

  const today = parseDateKey(todayKey);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (dateKey === getDateKey(yesterday)) return "Yesterday";

  const date = parseDateKey(dateKey);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    weekday: "short",
  };

  if (date.getFullYear() !== today.getFullYear()) {
    options.year = "numeric";
  }

  return new Intl.DateTimeFormat(undefined, options).format(date);
}

function formatOverviewDuration(seconds: number): string {
  if (seconds > 0 && seconds < 60) return "< 1 min";
  return formatDuration(seconds);
}

function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}
