import type React from "react";

import { TimeDisplay } from "../TimeDisplay";
import { DisplayInput } from "@kit/DisplayInput";
import { Icon } from "@kit/Icon";
import type { Task, TaskStatus } from "@state/Task";
import type { OmitExcept } from "@utils/types";

import styles from "./Task.module.scss";

type CardProps = {
  id: number;
  isActive: boolean;
  text: string;
  seconds: number;
  notes: string;
  status: TaskStatus;
  buttons?: React.ReactNode;
  onDelete: () => void;
  onToggle: () => void;
  onUpdate?: (task: OmitExcept<Task, "id">) => void;
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Todo",
  "in-progress": "In progress",
  review: "Review",
  testing: "Testing",
  done: "Done",
};

export function TaskComponent(props: CardProps) {
  return (
    <article
      className={`${styles.taskCard} ${props.isActive ? styles.active : ""}`}
    >
      <div className={styles.description}>
        <DisplayInput
          className={styles.titleInput}
          placeholder="Title"
          size={16}
          value={props.text}
          weight={650}
          onChange={(value) => {
            props.onUpdate?.({ id: props.id, name: value });
          }}
        />
        <DisplayInput
          className={styles.notesInput}
          placeholder="Notes"
          size={12}
          value={props.notes}
          onChange={(value) => {
            props.onUpdate?.({ id: props.id, notes: value });
          }}
        />
      </div>

      <label className={styles.status} data-status={props.status}>
        <span className={styles.visuallyHidden}>Task status</span>
        <select
          value={props.status}
          onChange={(event) => {
            props.onUpdate?.({
              id: props.id,
              status: event.target.value as TaskStatus,
            });
          }}
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <svg aria-hidden="true" viewBox="0 0 12 8">
          <path d="m1 1 5 5 5-5" />
        </svg>
      </label>

      <TimeDisplay seconds={props.seconds} />

      <button
        className={`${styles.toggle} ${props.isActive ? styles.pause : ""}`}
        onClick={props.onToggle}
        type="button"
      >
        <Icon name={props.isActive ? "pause" : "play"} size={25} />
      </button>

      <div className={styles.adjustments}>{props.buttons}</div>

      <button
        className={styles.delete}
        onClick={props.onDelete}
        type="button"
      >
        <Icon name="trash" size={25} />
      </button>
    </article>
  );
}
