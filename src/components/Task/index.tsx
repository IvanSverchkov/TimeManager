import type React from "react";

import { TimeDisplay } from "../TimeDisplay";
import { DisplayInput } from "@kit/DisplayInput";
import { Icon } from "@kit/Icon";
import {
  TASK_STATUS_LABELS,
  TASK_STATUSES,
  type Task,
  type TaskStatus,
} from "@state/Task";
import type { OmitExcept } from "@utils/types";

import styles from "./Task.module.scss";

type CardProps = {
  id: number;
  isActive: boolean;
  text: string;
  seconds: number;
  notes: string;
  estimatedHours: number;
  todaySeconds: number;
  storyPoints?: number;
  status?: TaskStatus;
  buttons?: React.ReactNode;
  onDelete: () => void;
  onToggle: () => void;
  onUpdate?: (task: OmitExcept<Task, "id">) => void;
};

export function TaskComponent(props: CardProps) {
  return (
    <article
      className={`${styles.taskCard} ${props.status === undefined ? styles.simpleTimer : ""} ${props.isActive ? styles.active : ""}`}
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

      {props.status !== undefined && (
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
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {TASK_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <svg aria-hidden="true" viewBox="0 0 12 8">
            <path d="m1 1 5 5 5-5" />
          </svg>
        </label>
      )}

      <div className={styles.estimates}>
        <label>
          <span>Time</span>
          <input
            min="1"
            placeholder="0"
            step="1"
            type="number"
            value={props.estimatedHours || ""}
            onChange={(event) => {
              props.onUpdate?.({
                id: props.id,
                estimatedHours: toWholeNumber(event.target.value),
              });
            }}
          />
          <small>h</small>
        </label>
        {props.status !== undefined && (
          <label>
            <span>SP</span>
            <input
              min="1"
              placeholder="0"
              step="1"
              type="number"
              value={props.storyPoints ?? ""}
              onChange={(event) => {
                props.onUpdate?.({
                  id: props.id,
                  storyPoints: toOptionalWholeNumber(event.target.value),
                });
              }}
            />
          </label>
        )}
      </div>

      <div className={styles.time}>
        <TimeDisplay
          estimatedHours={props.estimatedHours}
          seconds={props.seconds}
          todaySeconds={props.todaySeconds}
        />
      </div>

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

function toWholeNumber(value: string): number {
  return Math.max(0, Math.floor(Number(value) || 0));
}

function toOptionalWholeNumber(value: string): number | undefined {
  return value === "" ? undefined : toWholeNumber(value);
}
