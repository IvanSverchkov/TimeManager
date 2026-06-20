import { useMemo } from "react";

import type { Task } from "@state/Task";

import { getMetricCards } from "./utils/getMetricCards";
import { getMetricsData } from "./utils/getMetricsData";

type UseMetricsParams = {
  liveSeconds: Record<number, number>;
  tasks: Array<Task>;
};

export function useMetrics({ liveSeconds, tasks }: UseMetricsParams) {
  return useMemo(() => {
    const metricsData = getMetricsData({ liveSeconds, tasks });
    return getMetricCards(metricsData);
  }, [liveSeconds, tasks]);
}
