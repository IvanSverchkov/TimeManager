import { memo, useCallback, useEffect, useMemo, useState } from "react";

import { CopyButton } from "@components/CopyButton";
import { Stopwatch } from "@components/Stopwatch";
import { Icon } from "@kit/Icon";
import {
  TASK_STATUSES,
  externalState,
  type Task,
  type TaskStatus,
} from "@state/Task";
import { formatDuration, getDateKey, getWeekDateKeys } from "@utils/time";
import type { OmitExcept } from "@utils/types";

import styles from "./App.module.scss";
import { MetricCard, type MetricCardProps } from "@components/MetricCard";
import { FilterButton } from "@components/FilterButton";

type TimerFilter = "all" | "active" | "done";

const WORK_DAY_SECONDS = 8 * 60 * 60;
const WORK_WEEK_SECONDS = 40 * 60 * 60;

export const App = memo(function App() {
  const [tasks, setTasks] = useState<Array<Task>>(() => {
    const state = externalState.get("tasks");
    if (!state?.tasks.length) return [];
    return state.tasks.map(normalizeTask);
  });
  const [filter, setFilter] = useState<TimerFilter>("all");
  const [runningTaskIds, setRunningTaskIds] = useState<Set<number>>(
    () => new Set(),
  );
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

  const handleActiveChange = useCallback((id: number, isActive: boolean) => {
    setRunningTaskIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (isActive) nextIds.add(id);
      else nextIds.delete(id);
      return nextIds;
    });
  }, []);

  const handleLiveSecondsChange = useCallback((id: number, seconds: number) => {
    setLiveSeconds((currentSeconds) => {
      if ((currentSeconds[id] ?? 0) === seconds) return currentSeconds;
      return { ...currentSeconds, [id]: seconds };
    });
  }, []);

  const onAddStopwatchClick = () => {
    const name = prompt("Task title");
    if (name === null) return;

    createTask({
      name: name.trim(),
      notes: "",
      seconds: 0,
      status: "todo",
      dailySeconds: {},
    });
  };

  const metrics = useMemo(() => {
    const todayKey = getDateKey();
    const weekKeys = new Set(getWeekDateKeys());
    let totalSeconds = 0;
    let todaySeconds = 0;
    let weekSeconds = 0;
    let focusedSeconds = 0;

    tasks.forEach((task) => {
      const liveTaskSeconds = liveSeconds[task.id] ?? 0;
      const taskTotal = task.seconds + liveTaskSeconds;
      totalSeconds += taskTotal;
      todaySeconds += (task.dailySeconds[todayKey] ?? 0) + liveTaskSeconds;

      Object.entries(task.dailySeconds).forEach(([dateKey, seconds]) => {
        if (weekKeys.has(dateKey)) weekSeconds += seconds;
      });
      weekSeconds += liveTaskSeconds;

      if (task.status !== "todo") focusedSeconds += taskTotal;
    });

    const completedTasks = tasks.filter((task) => task.status === "done").length;
    const todayProgress = Math.min(100, (todaySeconds / WORK_DAY_SECONDS) * 100);
    const focusRate = totalSeconds === 0
      ? 0
      : Math.round((focusedSeconds / totalSeconds) * 100);

    return {
      completedTasks,
      focusRate,
      todayProgress,
      todaySeconds,
      totalSeconds,
      weekRemaining: Math.max(0, WORK_WEEK_SECONDS - weekSeconds),
    };
  }, [liveSeconds, tasks]);

  const activeCount = runningTaskIds.size;
  const doneCount = tasks.filter((task) => task.status === "done").length;
  const visibleTaskCount = tasks.filter((task) => {
    if (filter === "active") return runningTaskIds.has(task.id);
    if (filter === "done") return task.status === "done";
    return true;
  }).length;

  const metricCards: Array<MetricCardProps> = [
    {
      icon: "clock",
      tone: "blue",
      label: "Total tracked",
      value: formatDuration(metrics.totalSeconds),
    },
    {
      icon: "calendar",
      tone: "green",
      label: "Today",
      value: formatDuration(metrics.todaySeconds),
      suffix: "of 8h",
      progress: metrics.todayProgress,
    },
    {
      icon: "trend",
      tone: "purple",
      label: "Week remaining",
      value: formatDuration(metrics.weekRemaining),
    },
    {
      icon: "check",
      tone: "green",
      label: "Completed",
      value: `${metrics.completedTasks} / ${tasks.length}`,
      suffix: "tasks",
    },
    {
      icon: "target",
      tone: "red",
      label: "Focus rate",
      value: `${metrics.focusRate}%`,
    },
  ];

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
          <section className={styles.metrics}>
            {metricCards.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </section>

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
              {tasks.map((task, index) => {
                const isHidden =
                  (filter === "active" && !runningTaskIds.has(task.id)) ||
                  (filter === "done" && task.status !== "done");

                return (
                  <Stopwatch
                    dailySeconds={task.dailySeconds}
                    hidden={isHidden}
                    id={task.id}
                    key={task.id}
                    name={task.name}
                    notes={task.notes}
                    onActiveChange={handleActiveChange}
                    onLiveSecondsChange={handleLiveSecondsChange}
                    onUpdate={updateTask}
                    order={index + 1}
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
    seconds: Math.max(0, Number(task.seconds) || 0),
    status: status as TaskStatus,
    dailySeconds,
  };
}
