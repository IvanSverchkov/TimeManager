import { memo, useCallback, useState } from "react";

import { CopyButton } from "@components/CopyButton";
import { FilterButton } from "@components/FilterButton";
import { SortableList } from "@components/SortableList";
import { Widgets } from "@components/Widgets";
import { Stopwatch } from "@components/Stopwatch";
import { Icon } from "@kit/Icon";
import {
  TASK_STATUS_LABELS,
  TASK_STATUSES,
  externalState,
  taskStatusVisibilityStorage,
  type Task,
  type TaskStatus,
  type TaskStatusVisibilityState,
} from "@state/Task";
import { getDateKey } from "@utils/time";
import type { OmitExcept } from "@utils/types";

import styles from "./App.module.scss";

type HiddenTaskStatuses = Partial<Record<TaskStatus, boolean>>;

export const App = memo(function App() {
  const [tasks, setTasks] = useState<Array<Task>>(() => {
    const state = externalState.get("tasks");
    if (!state?.tasks.length) return [];
    return state.tasks.map(normalizeTask);
  });
  const [hiddenTaskStatuses, setHiddenTaskStatuses] =
    useState<HiddenTaskStatuses>(() =>
      normalizeHiddenTaskStatuses(
        taskStatusVisibilityStorage.get("hiddenStatuses"),
      ),
    );
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

  const reorderTimers = useCallback(
    (orderedIds: Array<number>) => {
      commitTasks((currentTasks) =>
        applyGroupOrder(
          currentTasks,
          orderedIds,
          (task) => task.status === undefined,
        ),
      );
    },
    [commitTasks],
  );

  const reorderTasks = useCallback(
    (orderedIds: Array<number>) => {
      commitTasks((currentTasks) =>
        applyGroupOrder(
          currentTasks,
          orderedIds,
          (task) => task.status !== undefined,
        ),
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

  const isTaskStatusVisible = useCallback(
    (status: TaskStatus | undefined) =>
      status === undefined || hiddenTaskStatuses[status] !== true,
    [hiddenTaskStatuses],
  );

  const toggleTaskStatusVisibility = useCallback((status: TaskStatus) => {
    setHiddenTaskStatuses((currentStatuses) => {
      const nextStatuses = {
        ...currentStatuses,
        [status]: currentStatuses[status] !== true,
      };

      taskStatusVisibilityStorage.set("hiddenStatuses", {
        hiddenStatuses: TASK_STATUSES.filter(
          (taskStatus) => nextStatuses[taskStatus] === true,
        ),
      });

      return nextStatuses;
    });
  }, []);

  const onAddTimerClick = () => {
    createTask({
      name: "",
      notes: "",
      estimatedHours: 0,
      seconds: 0,
      dailySeconds: {},
    });
  };

  const onAddTaskClick = () => {
    createTask({
      name: "",
      notes: "",
      estimatedHours: 0,
      seconds: 0,
      status: "todo",
      dailySeconds: {},
    });
  };

  const timers = tasks.filter((task) => task.status === undefined);
  const taskTimers = tasks.filter((task) => task.status !== undefined);
  const visibleTaskCount = taskTimers.filter((task) =>
    isTaskStatusVisible(task.status),
  ).length;
  const todayKey = getDateKey();

  return (
    <main className={styles.page}>
      <section className={styles.appShell}>
        <header className={styles.header}>
          <h1>Time Manager</h1>
        </header>

        <div className={styles.content}>
          <Widgets tasks={tasks} />

          <section className={styles.timersSection}>
            <div className={styles.sectionHeader}>
              <h2>Timers</h2>
              <button
                className={styles.addButton}
                onClick={onAddTimerClick}
                type="button"
              >
                <Icon name="plus" size={22} />
                <span>New timer</span>
              </button>
            </div>

            <div className={styles.cardContainer}>
              <SortableList
                getHandleText={(task) => `Move ${task.name || "timer"}`}
                items={timers}
                onReorder={reorderTimers}
              >
                {(task) => (
                  <Stopwatch
                    id={task.id}
                    isActive={runningTaskId === task.id}
                    name={task.name}
                    notes={task.notes}
                    estimatedHours={task.estimatedHours}
                    onActiveChange={handleActiveChange}
                    onDelete={deleteTask}
                    onSecondsChange={handleSecondsChange}
                    onUpdate={updateTask}
                    seconds={task.seconds}
                    todaySeconds={task.dailySeconds[todayKey] ?? 0}
                  />
                )}
              </SortableList>

              {timers.length === 0 && (
                <div className={styles.sectionEmpty}>
                  No standalone timers yet.
                </div>
              )}
            </div>
          </section>

          <section className={styles.timersSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.timersHeader}>
                <h2>Tasks</h2>
                <div className={styles.filters}>
                  {TASK_STATUSES.map((status) => (
                    <FilterButton
                      count={
                        taskTimers.filter((task) => task.status === status)
                          .length
                      }
                      isVisible={hiddenTaskStatuses[status] !== true}
                      key={status}
                      label={TASK_STATUS_LABELS[status]}
                      onClick={() => toggleTaskStatusVisibility(status)}
                    />
                  ))}
                </div>
              </div>
              <div className={styles.sectionActions}>
                <CopyButton seconds={tasks.map((task) => task.seconds)} />
                <button
                  className={styles.addButton}
                  onClick={onAddTaskClick}
                  type="button"
                >
                  <Icon name="plus" size={22} />
                  <span>New task</span>
                </button>
              </div>
            </div>

            <div className={styles.cardContainer}>
              <SortableList
                getHandleText={(task) => `Move ${task.name || "task"}`}
                isItemVisible={(task) => isTaskStatusVisible(task.status)}
                items={taskTimers}
                onReorder={reorderTasks}
              >
                {(task) => (
                  <Stopwatch
                    id={task.id}
                    isActive={runningTaskId === task.id}
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
                    todaySeconds={task.dailySeconds[todayKey] ?? 0}
                  />
                )}
              </SortableList>

              {taskTimers.length === 0 && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <Icon name="clock" />
                  </div>
                  <h3>Your first task starts here</h3>
                  <p>Create a task when you want to track its status and story points.</p>
                  <button onClick={onAddTaskClick} type="button">
                    <Icon name="plus" size={18} />
                    New task
                  </button>
                </div>
              )}

              {taskTimers.length > 0 && visibleTaskCount === 0 && (
                <div className={styles.filterEmpty}>
                  All task statuses are hidden.
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
  const status =
    task.status != null && TASK_STATUSES.includes(task.status)
      ? task.status
      : undefined;
  const dailySeconds = task.dailySeconds ?? {
    [getDateKey()]: Math.max(0, Number(task.seconds) || 0),
  };

  return {
    ...task,
    name: task.name ?? "",
    notes: task.notes ?? "",
    estimatedHours: toWholeNumber(task.estimatedHours),
    storyPoints:
      task.storyPoints == null
        ? undefined
        : toWholeNumber(task.storyPoints),
    seconds: Math.max(0, Number(task.seconds) || 0),
    status: status as TaskStatus | undefined,
    dailySeconds,
  };
}

function normalizeHiddenTaskStatuses(
  state: TaskStatusVisibilityState | null,
): HiddenTaskStatuses {
  const hiddenStatuses = new Set(
    (state?.hiddenStatuses ?? []).filter((status): status is TaskStatus =>
      TASK_STATUSES.includes(status),
    ),
  );

  return Object.fromEntries(
    TASK_STATUSES.map((status) => [status, hiddenStatuses.has(status)]),
  ) as HiddenTaskStatuses;
}

function toWholeNumber(value: number): number {
  return Math.max(0, Math.floor(Number(value) || 0));
}

function applyGroupOrder(
  currentTasks: Array<Task>,
  orderedIds: Array<number>,
  isGroupTask: (task: Task) => boolean,
): Array<Task> {
  const groupTasksById = new Map(
    currentTasks.filter(isGroupTask).map((task) => [task.id, task]),
  );
  const orderedIdSet = new Set(orderedIds);
  const orderedGroupTasks = orderedIds.flatMap((id) => {
    const task = groupTasksById.get(id);
    return task ? [task] : [];
  });

  currentTasks.forEach((task) => {
    if (isGroupTask(task) && !orderedIdSet.has(task.id)) {
      orderedGroupTasks.push(task);
    }
  });

  let groupIndex = 0;
  return currentTasks.map((task) =>
    isGroupTask(task) ? orderedGroupTasks[groupIndex++] : task,
  );
}
