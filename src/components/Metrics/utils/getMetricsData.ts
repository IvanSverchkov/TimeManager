import type { Task } from "@state/Task";
import { getDateKey, getWeekDateKeys } from "@utils/time";

type GetMetricsDataParams = {
  liveSeconds: Record<number, number>;
  tasks: Array<Task>;
};

export type MetricsData = {
  taskCount: number;
  completedTasks: number;
  focusedSeconds: number;
  todaySeconds: number;
  totalSeconds: number;
  weekSeconds: number;
};

export function getMetricsData({
  liveSeconds,
  tasks,
}: GetMetricsDataParams): MetricsData {
  const todayKey = getDateKey();
  const weekKeys = new Set(getWeekDateKeys());

  let totalSeconds = 0;
  let todaySeconds = 0;
  let weekSeconds = 0;
  let focusedSeconds = 0;
  let completedTasks = 0;

  tasks.forEach((task) => {
    const liveTaskSeconds = liveSeconds[task.id] ?? 0;
    const taskTotalSeconds = task.seconds + liveTaskSeconds;

    totalSeconds += taskTotalSeconds;
    todaySeconds += (task.dailySeconds[todayKey] ?? 0) + liveTaskSeconds;
    weekSeconds += liveTaskSeconds;

    Object.entries(task.dailySeconds).forEach(([dateKey, seconds]) => {
      if (weekKeys.has(dateKey)) weekSeconds += seconds;
    });

    if (task.status !== "todo") focusedSeconds += taskTotalSeconds;
    if (task.status === "done") completedTasks += 1;
  });

  return {
    completedTasks,
    focusedSeconds,
    taskCount: tasks.length,
    todaySeconds,
    totalSeconds,
    weekSeconds,
  };
}
