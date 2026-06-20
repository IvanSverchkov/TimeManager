import { useMemo } from "react";

import type { Task } from "@state/Task";

import { getMetricCards } from "./utils/getMetricCards";
import { getMetricsData } from "./utils/getMetricsData";

type UseMetricsParams = {
  tasks: Array<Task>;
};

export function useMetrics({ tasks }: UseMetricsParams) {
  return useMemo(() => {
    const metricsData = getMetricsData({ tasks });
    return getMetricCards(metricsData);
  }, [tasks]);
}
