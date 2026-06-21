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
    getCompletedWidget(data),
    getStoryPointsWidget(data),
  ];
}
