import { formatDuration } from "@utils/time";

import type { WidgetProps } from "../Widget";
import type { WidgetsData } from "./getWidgetsData";

function getTotalTrackedWidget({
  totalSeconds,
}: WidgetsData): WidgetProps {
  return {
    label: "Total tracked",
    icon: "clock",
    tone: "blue",
    value: formatDuration(totalSeconds),
  };
}

function getTodayWidget({ todaySeconds }: WidgetsData): WidgetProps {
  return {
    label: "Today",
    icon: "calendar",
    tone: "green",
    value: formatDuration(todaySeconds),
  };
}

function getAllRequiredWidget({ requiredSeconds }: WidgetsData): WidgetProps {
  return {
    label: "All required",
    icon: "trend",
    tone: "purple",
    value: formatDuration(requiredSeconds),
  };
}

function getTasksRequiredWidget({
  requiredSeconds,
  tasksRequiredSeconds,
  timersRequiredSeconds,
}: WidgetsData): WidgetProps {
  return {
    label: "Tasks required",
    icon: "target",
    tone: "red",
    value: formatDuration(tasksRequiredSeconds),
    percentage:
      timersRequiredSeconds > 0 && tasksRequiredSeconds > 0
        ? formatPercentage(tasksRequiredSeconds, requiredSeconds)
        : undefined,
  };
}

function getTimersRequiredWidget({
  requiredSeconds,
  tasksRequiredSeconds,
  timersRequiredSeconds,
}: WidgetsData): WidgetProps {
  return {
    label: "Timers required",
    icon: "clock",
    tone: "blue",
    value: formatDuration(timersRequiredSeconds),
    percentage:
      tasksRequiredSeconds > 0 && timersRequiredSeconds > 0
        ? formatPercentage(timersRequiredSeconds, requiredSeconds)
        : undefined,
  };
}

function getTasksTrackedWidget({
  tasksTrackedSeconds,
  timersTrackedSeconds,
  totalSeconds,
}: WidgetsData): WidgetProps {
  return {
    label: "Tasks tracked",
    icon: "target",
    tone: "red",
    value: formatDuration(tasksTrackedSeconds),
    percentage:
      timersTrackedSeconds > 0 && tasksTrackedSeconds > 0
        ? formatPercentage(tasksTrackedSeconds, totalSeconds)
        : undefined,
    gridColumn: 4,
  };
}

function getTimersTrackedWidget({
  tasksTrackedSeconds,
  timersTrackedSeconds,
  totalSeconds,
}: WidgetsData): WidgetProps {
  return {
    label: "Timers tracked",
    icon: "clock",
    tone: "blue",
    value: formatDuration(timersTrackedSeconds),
    percentage:
      tasksTrackedSeconds > 0 && timersTrackedSeconds > 0
        ? formatPercentage(timersTrackedSeconds, totalSeconds)
        : undefined,
  };
}

function formatPercentage(seconds: number, totalSeconds: number): string {
  return `${Math.round((seconds / totalSeconds) * 100)}%`;
}

function getCompletedWidget({
  completedTasks,
  taskCount,
}: WidgetsData): WidgetProps {
  return {
    label: "Completed",
    icon: "check",
    tone: "green",
    value: `${completedTasks} / ${taskCount}`,
    suffix: "tasks",
  };
}

function getStoryPointsWidget({
  completedStoryPoints,
  totalStoryPoints,
}: WidgetsData): WidgetProps {
  return {
    label: "Story points",
    icon: "target",
    tone: "red",
    value: `${completedStoryPoints} / ${totalStoryPoints}`,
    suffix: "sp",
  };
}

export function getWidgets(data: WidgetsData): Array<WidgetProps> {
  return [
    getTodayWidget(data),
    getTotalTrackedWidget(data),
    getAllRequiredWidget(data),
    getTasksRequiredWidget(data),
    getTimersRequiredWidget(data),
    getCompletedWidget(data),
    getStoryPointsWidget(data),
    getTasksTrackedWidget(data),
    getTimersTrackedWidget(data),
  ];
}
