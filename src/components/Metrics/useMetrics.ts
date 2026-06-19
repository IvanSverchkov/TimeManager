import { useMemo } from "react";

import type { Task } from "@state/Task";
import { formatDuration, getDateKey, getWeekDateKeys } from "@utils/time";

import type { MetricCardProps } from "./MetricCard";

const WORK_DAY_SECONDS = 8 * 60 * 60;
const WORK_WEEK_SECONDS = 40 * 60 * 60;

type UseMetricsParams = {
  liveSeconds: Record<number, number>;
  tasks: Array<Task>;
};

export function useMetrics({ liveSeconds, tasks }: UseMetricsParams) {
  return useMemo<Array<MetricCardProps>>(() => {
    const todayKey = getDateKey();
    const weekKeys = new Set(getWeekDateKeys());
    let totalSeconds = 0;
    let todaySeconds = 0;
    let weekSeconds = 0;
    let focusedSeconds = 0;

    tasks.forEach((task) => {
      const liveTaskSeconds = liveSeconds[task.id] ?? 0;
      const taskTotal = task.seconds + liveTaskSeconds;
      totalSeconds += taskTotal;
      todaySeconds += (task.dailySeconds[todayKey] ?? 0) + liveTaskSeconds;

      Object.entries(task.dailySeconds).forEach(([dateKey, seconds]) => {
        if (weekKeys.has(dateKey)) weekSeconds += seconds;
      });
      weekSeconds += liveTaskSeconds;

      if (task.status !== "todo") focusedSeconds += taskTotal;
    });

    const completedTasks = tasks.filter((task) => task.status === "done").length;
    const todayProgress = Math.min(
      100,
      (todaySeconds / WORK_DAY_SECONDS) * 100,
    );
    const focusRate =
      totalSeconds === 0
        ? 0
        : Math.round((focusedSeconds / totalSeconds) * 100);
    const weekRemaining = Math.max(0, WORK_WEEK_SECONDS - weekSeconds);

    return [
      {
        icon: "clock",
        tone: "blue",
        label: "Total tracked",
        value: formatDuration(totalSeconds),
      },
      {
        icon: "calendar",
        tone: "green",
        label: "Today",
        value: formatDuration(todaySeconds),
        suffix: "of 8h",
        progress: todayProgress,
      },
      {
        icon: "trend",
        tone: "purple",
        label: "Week remaining",
        value: formatDuration(weekRemaining),
      },
      {
        icon: "check",
        tone: "green",
        label: "Completed",
        value: `${completedTasks} / ${tasks.length}`,
        suffix: "tasks",
      },
      {
        icon: "target",
        tone: "red",
        label: "Focus rate",
        value: `${focusRate}%`,
      },
    ];
  }, [liveSeconds, tasks]);
}
