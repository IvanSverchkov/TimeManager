import { LocalStorageState } from "./LocalStorageState";

export const TASK_STATUSES = [
  "todo",
  "pause",
  "in-progress",
  "review",
  "testing",
  "done",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Todo",
  pause: "Pause",
  "in-progress": "In progress",
  review: "Review",
  testing: "Testing",
  done: "Done",
};

export type Task = {
  id: number;
  name: string;
  notes: string;
  estimatedHours: number;
  storyPoints?: number;
  seconds: number;
  status?: TaskStatus;
  dailySeconds: Record<string, number>;
}

type TasksState = {
  tasks: Array<Task>;
}

export type TaskStatusVisibilityState = {
  hiddenStatuses: Array<TaskStatus>;
}

class ExternalState extends LocalStorageState<TasksState> {}

class TaskStatusVisibilityStorage extends LocalStorageState<TaskStatusVisibilityState> {}

// TODO: Переименовать во что-то другое, когда станет понятно, что тут хранится
export const externalState = new ExternalState();
export const taskStatusVisibilityStorage = new TaskStatusVisibilityStorage();
