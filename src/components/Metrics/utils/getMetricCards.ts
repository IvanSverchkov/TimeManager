import { formatDuration } from "@utils/time";

import type { MetricCardProps } from "../MetricCard";
import type { MetricsData } from "./getMetricsData";

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
  return {
    label: "Today",
    icon: "calendar",
    tone: "green",
    value: formatDuration(todaySeconds),
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

function getStoryPointsMetric({
  completedStoryPoints,
  totalStoryPoints,
}: MetricsData): MetricCardProps {
  return {
    label: "Story points",
    icon: "target",
    tone: "red",
    value: `${completedStoryPoints} / ${totalStoryPoints}`,
    suffix: "sp",
  };
}

export function getMetricCards(data: MetricsData): Array<MetricCardProps> {
  return [
    getTodayMetric(data),
    getTotalTrackedMetric(data),
    getCompletedMetric(data),
    getStoryPointsMetric(data),
  ];
}
