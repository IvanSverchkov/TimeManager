import { memo } from "react";

import type { Task } from "@state/Task";

import { MetricCard } from "./MetricCard";
import styles from "./Metrics.module.scss";
import { useMetrics } from "./useMetrics";

type MetricsProps = {
  liveSeconds: Record<number, number>;
  tasks: Array<Task>;
};

export const Metrics = memo(function Metrics({
  liveSeconds,
  tasks,
}: MetricsProps) {
  const metricCards = useMetrics({ liveSeconds, tasks });

  return (
    <section className={styles.metrics}>
      {metricCards.map((metric) => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </section>
  );
});
