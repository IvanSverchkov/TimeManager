import { memo } from "react";

import type { Task } from "@state/Task";

import { Widget } from "./Widget";
import styles from "./Widgets.module.scss";
import { useWidgets } from "./useWidgets";

type WidgetsProps = {
  tasks: Array<Task>;
};

export const Widgets = memo(function Widgets({ tasks }: WidgetsProps) {
  const widgets = useWidgets({ tasks });

  return (
    <section className={styles.widgets}>
      {widgets.map((widget) => (
        <Widget key={widget.label} {...widget} />
      ))}
    </section>
  );
});
