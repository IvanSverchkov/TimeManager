import type { Task } from "@state/Task";
import { getDateKey, getWeekDateKeys } from "@utils/time";

type GetMetricsDataParams = {
  tasks: Array<Task>;
};

export type MetricsData = {
  taskCount: number;
  completedTasks: number;
  completedStoryPoints: number;
  totalStoryPoints: number;
  todaySeconds: number;
  totalSeconds: number;
  weekSeconds: number;
};

export function getMetricsData({ tasks }: GetMetricsDataParams): MetricsData {
  const todayKey = getDateKey();
  const weekKeys = new Set(getWeekDateKeys());

  let totalSeconds = 0;
  let todaySeconds = 0;
  let weekSeconds = 0;
  let completedTasks = 0;
  let completedStoryPoints = 0;
  let totalStoryPoints = 0;

  tasks.forEach((task) => {
    totalSeconds += task.seconds;
    todaySeconds += task.dailySeconds[todayKey] ?? 0;
    totalStoryPoints += task.storyPoints;

    Object.entries(task.dailySeconds).forEach(([dateKey, seconds]) => {
      if (weekKeys.has(dateKey)) weekSeconds += seconds;
    });

    if (task.status === "done") {
      completedTasks += 1;
      completedStoryPoints += task.storyPoints;
    }
  });

  return {
    completedTasks,
    completedStoryPoints,
    taskCount: tasks.length,
    todaySeconds,
    totalStoryPoints,
    totalSeconds,
    weekSeconds,
  };
}
