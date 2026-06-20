import { memo } from "react";

import type { Task } from "@state/Task";

import { MetricCard } from "./MetricCard";
import styles from "./Metrics.module.scss";
import { useMetrics } from "./useMetrics";

type MetricsProps = {
  tasks: Array<Task>;
};

export const Metrics = memo(function Metrics({ tasks }: MetricsProps) {
  const metricCards = useMetrics({ tasks });

  return (
    <section className={styles.metrics}>
      {metricCards.map((metric) => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </section>
  );
});
