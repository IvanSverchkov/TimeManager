import { useMemo } from "react";

import type { Task } from "@state/Task";

import { getWidgets } from "./utils/getWidgets";
import { getWidgetsData } from "./utils/getWidgetsData";

type UseWidgetsParams = {
  tasks: Array<Task>;
};

export function useWidgets({ tasks }: UseWidgetsParams) {
  return useMemo(() => {
    const widgetsData = getWidgetsData({ tasks });
    return getWidgets(widgetsData);
  }, [tasks]);
}
