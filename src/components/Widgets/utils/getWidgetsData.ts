import type { Task } from "@state/Task";
import { getDateKey } from "@utils/time";

type GetWidgetsDataParams = {
  tasks: Array<Task>;
};

export type WidgetsData = {
  taskCount: number;
  completedTasks: number;
  completedStoryPoints: number;
  requiredSeconds: number;
  totalStoryPoints: number;
  todaySeconds: number;
  totalSeconds: number;
};

export function getWidgetsData({ tasks }: GetWidgetsDataParams): WidgetsData {
  const todayKey = getDateKey();

  let totalSeconds = 0;
  let todaySeconds = 0;
  let completedTasks = 0;
  let completedStoryPoints = 0;
  let requiredSeconds = 0;
  let totalStoryPoints = 0;

  tasks.forEach((task) => {
    totalSeconds += task.seconds;
    todaySeconds += task.dailySeconds[todayKey] ?? 0;
    if (task.status !== "done") {
      requiredSeconds += Math.max(task.estimatedHours * 60 * 60 - task.seconds, 0);
    }
    if (task.storyPoints !== undefined) {
      totalStoryPoints += task.storyPoints;
    }

    if (task.status === "done") {
      completedTasks += 1;
      completedStoryPoints += task.storyPoints ?? 0;
    }
  });

  return {
    completedTasks,
    completedStoryPoints,
    requiredSeconds,
    taskCount: tasks.filter((task) => task.status !== undefined).length,
    todaySeconds,
    totalStoryPoints,
    totalSeconds,
  };
}
