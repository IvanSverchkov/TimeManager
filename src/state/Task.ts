import { LocalStorageState } from "./LocalStorageState";

export const TASK_STATUSES = [
  "todo",
  "in-progress",
  "review",
  "testing",
  "done",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export type Task = {
  id: number;
  name: string;
  notes: string;
  seconds: number;
  status: TaskStatus;
  dailySeconds: Record<string, number>;
}

type State = {
  tasks: Array<Task>;
}

class ExternalState extends LocalStorageState<State> {}

// TODO: Переименовать во что-то другое, когда станет понятно, что тут хранится
export const externalState = new ExternalState();
