import { memo, useCallback, useEffect, useState } from "react";

import { CopyButton } from "@components/CopyButton";
import { FilterButton } from "@components/FilterButton";
import { Metrics } from "@components/Metrics";
import { Stopwatch } from "@components/Stopwatch";
import { Icon } from "@kit/Icon";
import {
  TASK_STATUSES,
  externalState,
  type Task,
  type TaskStatus,
} from "@state/Task";
import { getDateKey } from "@utils/time";
import type { OmitExcept } from "@utils/types";

import styles from "./App.module.scss";

type TimerFilter = "all" | "active" | "done";

export const App = memo(function App() {
  const [tasks, setTasks] = useState<Array<Task>>(() => {
    const state = externalState.get("tasks");
    if (!state?.tasks.length) return [];
    return state.tasks.map(normalizeTask);
  });
  const [filter, setFilter] = useState<TimerFilter>("all");
  const [runningTaskId, setRunningTaskId] = useState<number | null>(null);
  const [liveSeconds, setLiveSeconds] = useState<Record<number, number>>({});

  useEffect(() => {
    externalState.set("tasks", { tasks });
  }, [tasks]);

  const createTask = (task: Omit<Task, "id">) => {
    setTasks((currentTasks) => [
      ...currentTasks,
      {
        ...task,
        id: Date.now() + Math.random(),
      },
    ]);
  };

  const updateTask = useCallback((newTask: OmitExcept<Task, "id">) => {
    setTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === newTask.id
          ? { ...currentTask, ...newTask, id: currentTask.id }
          : currentTask,
      ),
    );
  }, []);

  const deleteTask = useCallback((id: number) => {
    setTasks((currentTasks) =>
      currentTasks.filter((currentTask) => currentTask.id !== id),
    );
  }, []);

  const handleActiveChange = useCallback((id: number, isActive: boolean) => {
    setRunningTaskId((currentId) => {
      if (isActive) return id;
      return currentId === id ? null : currentId;
    });
  }, []);

  const handleLiveSecondsChange = useCallback((id: number, seconds: number) => {
    setLiveSeconds((currentSeconds) => {
      if ((currentSeconds[id] ?? 0) === seconds) return currentSeconds;
      return { ...currentSeconds, [id]: seconds };
    });
  }, []);

  const onAddStopwatchClick = () => {
    createTask({
      name: "",
      notes: "",
      estimatedHours: 0,
      storyPoints: 0,
      seconds: 0,
      status: "todo",
      dailySeconds: {},
    });
  };

  const activeCount = runningTaskId === null ? 0 : 1;
  const doneCount = tasks.filter((task) => task.status === "done").length;
  const visibleTaskCount = tasks.filter((task) => {
    if (filter === "active") return runningTaskId === task.id;
    if (filter === "done") return task.status === "done";
    return true;
  }).length;

  return (
    <main className={styles.page}>
      <section className={styles.appShell}>
        <header className={styles.header}>
          <h1>TimeManager</h1>
          <div className={styles.headerActions}>
            <CopyButton
              seconds={tasks.map(
                (task) => task.seconds + (liveSeconds[task.id] ?? 0),
              )}
            />
            <button
              className={styles.addButton}
              onClick={onAddStopwatchClick}
              type="button"
            >
              <Icon name="plus" size={22} />
              <span>New timer</span>
            </button>
          </div>
        </header>

        <div className={styles.content}>
          <Metrics liveSeconds={liveSeconds} tasks={tasks} />

          <section className={styles.timersSection}>
            <div className={styles.timersHeader}>
              <h2>Timers</h2>
              <div className={styles.filters}>
                <FilterButton
                  active={filter === "all"}
                  count={tasks.length}
                  label="All"
                  onClick={() => setFilter("all")}
                />
                <FilterButton
                  active={filter === "active"}
                  count={activeCount}
                  label="Active"
                  onClick={() => setFilter("active")}
                />
                <FilterButton
                  active={filter === "done"}
                  count={doneCount}
                  label="Done"
                  onClick={() => setFilter("done")}
                />
              </div>
            </div>

            <div className={styles.cardContainer}>
              {tasks.map((task) => {
                const isHidden =
                  (filter === "active" && runningTaskId !== task.id) ||
                  (filter === "done" && task.status !== "done");

                return (
                  <Stopwatch
                    dailySeconds={task.dailySeconds}
                    hidden={isHidden}
                    id={task.id}
                    isActive={runningTaskId === task.id}
                    key={task.id}
                    name={task.name}
                    notes={task.notes}
                    estimatedHours={task.estimatedHours}
                    storyPoints={task.storyPoints}
                    onActiveChange={handleActiveChange}
                    onDelete={deleteTask}
                    onLiveSecondsChange={handleLiveSecondsChange}
                    onUpdate={updateTask}
                    seconds={task.seconds}
                    status={task.status}
                  />
                );
              })}

              {tasks.length === 0 && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <Icon name="clock" />
                  </div>
                  <h3>Your time starts here</h3>
                  <p>Create a timer for the first thing you want to focus on.</p>
                  <button onClick={onAddStopwatchClick} type="button">
                    <Icon name="plus" size={18} />
                    New timer
                  </button>
                </div>
              )}

              {tasks.length > 0 && visibleTaskCount === 0 && (
                <div className={styles.filterEmpty}>
                  No timers match this filter yet.
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
});

function normalizeTask(task: Task): Task {
  const status = TASK_STATUSES.includes(task.status) ? task.status : "todo";
  const dailySeconds = task.dailySeconds ?? {
    [getDateKey()]: Math.max(0, Number(task.seconds) || 0),
  };

  return {
    ...task,
    name: task.name ?? "",
    notes: task.notes ?? "",
    estimatedHours: toWholeNumber(task.estimatedHours),
    storyPoints: toWholeNumber(task.storyPoints),
    seconds: Math.max(0, Number(task.seconds) || 0),
    status: status as TaskStatus,
    dailySeconds,
  };
}

function toWholeNumber(value: number): number {
  return Math.max(0, Math.floor(Number(value) || 0));
}
