import { memo, useCallback, useState } from "react";

import { CopyButton } from "@components/CopyButton";
import { FilterButton } from "@components/FilterButton";
import { Metrics } from "@components/Metrics";
import { Stopwatch } from "@components/Stopwatch";
import { Icon } from "@kit/Icon";
import {
  TASK_STATUS_LABELS,
  TASK_STATUSES,
  externalState,
  type Task,
  type TaskStatus,
} from "@state/Task";
import { getDateKey } from "@utils/time";
import type { OmitExcept } from "@utils/types";

import styles from "./App.module.scss";

type TimerFilter = "all" | TaskStatus;

export const App = memo(function App() {
  const [tasks, setTasks] = useState<Array<Task>>(() => {
    const state = externalState.get("tasks");
    if (!state?.tasks.length) return [];
    return state.tasks.map(normalizeTask);
  });
  const [filter, setFilter] = useState<TimerFilter>("all");
  const [runningTaskId, setRunningTaskId] = useState<number | null>(null);

  const commitTasks = useCallback(
    (getNextTasks: (currentTasks: Array<Task>) => Array<Task>) => {
      setTasks((currentTasks) => {
        const nextTasks = getNextTasks(currentTasks);
        externalState.set("tasks", { tasks: nextTasks });
        return nextTasks;
      });
    },
    [],
  );

  const createTask = (task: Omit<Task, "id">) => {
    commitTasks((currentTasks) => [
      ...currentTasks,
      {
        ...task,
        id: Date.now() + Math.random(),
      },
    ]);
  };

  const updateTask = useCallback(
    (newTask: OmitExcept<Task, "id">) => {
      commitTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === newTask.id
            ? { ...currentTask, ...newTask, id: currentTask.id }
            : currentTask,
        ),
      );
    },
    [commitTasks],
  );

  const deleteTask = useCallback(
    (id: number) => {
      commitTasks((currentTasks) =>
        currentTasks.filter((currentTask) => currentTask.id !== id),
      );
    },
    [commitTasks],
  );

  const handleActiveChange = useCallback((id: number, isActive: boolean) => {
    setRunningTaskId((currentId) => {
      if (isActive) return id;
      return currentId === id ? null : currentId;
    });
  }, []);

  const handleSecondsChange = useCallback(
    (id: number, deltaSeconds: number) => {
      if (deltaSeconds === 0) return;

      const todayKey = getDateKey();

      commitTasks((currentTasks) =>
        currentTasks.map((task) => {
          if (task.id !== id) return task;

          const seconds = Math.max(0, task.seconds + deltaSeconds);
          const appliedDelta = seconds - task.seconds;
          const todaySeconds = Math.max(
            0,
            (task.dailySeconds[todayKey] ?? 0) + appliedDelta,
          );

          return {
            ...task,
            seconds,
            dailySeconds: {
              ...task.dailySeconds,
              [todayKey]: todaySeconds,
            },
          };
        }),
      );
    },
    [commitTasks],
  );

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

  const visibleTaskCount = tasks.filter(
    (task) => filter === "all" || task.status === filter,
  ).length;

  return (
    <main className={styles.page}>
      <section className={styles.appShell}>
        <header className={styles.header}>
          <h1>TimeManager</h1>
          <div className={styles.headerActions}>
            <CopyButton seconds={tasks.map((task) => task.seconds)} />
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
          <Metrics tasks={tasks} />
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
                {TASK_STATUSES.map((status) => (
                  <FilterButton
                    active={filter === status}
                    count={
                      tasks.filter((task) => task.status === status).length
                    }
                    key={status}
                    label={TASK_STATUS_LABELS[status]}
                    onClick={() => setFilter(status)}
                  />
                ))}
              </div>
            </div>

            <div className={styles.cardContainer}>
              {tasks.map((task) => {
                const isHidden = filter !== "all" && task.status !== filter;

                return (
                  <Stopwatch
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
                    onSecondsChange={handleSecondsChange}
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
