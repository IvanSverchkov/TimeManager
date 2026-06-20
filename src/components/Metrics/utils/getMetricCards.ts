import { formatDuration } from "@utils/time";

import type { MetricCardProps } from "../MetricCard";
import type { MetricsData } from "./getMetricsData";

const WORK_DAY_SECONDS = 8 * 60 * 60;
const WORK_WEEK_SECONDS = 40 * 60 * 60;

function getTotalTrackedMetric({
  totalSeconds,
}: MetricsData): MetricCardProps {
  return {
    label: "Total tracked",
    icon: "clock",
    tone: "blue",
    value: formatDuration(totalSeconds),
  };
}

function getTodayMetric({ todaySeconds }: MetricsData): MetricCardProps {
  const progress = Math.min(100, (todaySeconds / WORK_DAY_SECONDS) * 100);

  return {
    label: "Today",
    icon: "calendar",
    tone: "green",
    value: formatDuration(todaySeconds),
    suffix: "of 8h",
    progress,
  };
}

function getWeekRemainingMetric({
  weekSeconds,
}: MetricsData): MetricCardProps {
  const remainingSeconds = Math.max(0, WORK_WEEK_SECONDS - weekSeconds);

  return {
    label: "Week remaining",
    icon: "trend",
    tone: "purple",
    value: formatDuration(remainingSeconds),
  };
}

function getCompletedMetric({
  completedTasks,
  taskCount,
}: MetricsData): MetricCardProps {
  return {
    label: "Completed",
    icon: "check",
    tone: "green",
    value: `${completedTasks} / ${taskCount}`,
    suffix: "tasks",
  };
}

function getFocusRateMetric({
  focusedSeconds,
  totalSeconds,
}: MetricsData): MetricCardProps {
  const focusRate =
    totalSeconds === 0
      ? 0
      : Math.round((focusedSeconds / totalSeconds) * 100);

  return {
    label: "Focus rate",
    icon: "target",
    tone: "red",
    value: `${focusRate}%`,
  };
}

export function getMetricCards(data: MetricsData): Array<MetricCardProps> {
  return [
    getTotalTrackedMetric(data),
    getTodayMetric(data),
    getWeekRemainingMetric(data),
    getCompletedMetric(data),
    getFocusRateMetric(data),
  ];
}
