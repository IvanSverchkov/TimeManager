import React from "react";

import { Button } from "@kit/Button";
import { TaskComponent } from "../Task";
import type { Task, TaskStatus } from "@state/Task";
import { getDateKey } from "@utils/time";
import type { OmitExcept } from "@utils/types";

type StopwatchProps = {
  id: number;
  isActive: boolean;
  name: string;
  seconds: number;
  notes: string;
  status: TaskStatus;
  dailySeconds: Record<string, number>;
  hidden?: boolean;
  onActiveChange?: (id: number, isActive: boolean) => void;
  onDelete?: (id: number) => void;
  onLiveSecondsChange?: (id: number, seconds: number) => void;
  onUpdate?: (task: OmitExcept<Task, "id">) => void;
};

type State = {
  startTimeMs: number | null;
  seconds: number;
  newSeconds: number;
  isRunning: boolean;
};

export class Stopwatch extends React.Component<StopwatchProps, State> {
  private timerId: number = 0;

  constructor(props: StopwatchProps) {
    super(props);

    this.state = {
      startTimeMs: null,
      seconds: Math.max(0, Number(props.seconds) || 0),
      newSeconds: 0,
      isRunning: false,
    };
  }

  componentDidUpdate(previousProps: StopwatchProps) {
    if (
      previousProps.isActive &&
      !this.props.isActive &&
      this.state.isRunning
    ) {
      this.pauseTimer();
      return;
    }

    if (
      !this.state.isRunning &&
      previousProps.seconds !== this.props.seconds &&
      this.state.seconds !== this.props.seconds
    ) {
      this.setState({ seconds: Math.max(0, this.props.seconds) });
    }
  }

  componentWillUnmount() {
    window.clearInterval(this.timerId);
    this.props.onActiveChange?.(this.props.id, false);
    this.props.onLiveSecondsChange?.(this.props.id, 0);
  }

  startTimer = () => {
    if (this.state.isRunning) return;

    this.setState({
      startTimeMs: Date.now(),
      isRunning: true,
      newSeconds: 0,
    });
    this.props.onActiveChange?.(this.props.id, true);
    this.props.onLiveSecondsChange?.(this.props.id, 0);

    window.clearInterval(this.timerId);
    this.timerId = window.setInterval(this.updateTimer, 333);
  };

  pauseTimer = (additionalSeconds?: number) => {
    if (!this.state.isRunning && additionalSeconds === undefined) return;

    window.clearInterval(this.timerId);
    const deltaSeconds = this.state.newSeconds + (additionalSeconds ?? 0);
    const seconds = Math.max(0, this.state.seconds + deltaSeconds);
    const appliedDelta = seconds - this.state.seconds;
    const todayKey = getDateKey();
    const todaySeconds = Math.max(
      0,
      (this.props.dailySeconds[todayKey] ?? 0) + appliedDelta,
    );

    this.setState({
      seconds,
      isRunning: false,
      newSeconds: 0,
      startTimeMs: null,
    });
    this.props.onActiveChange?.(this.props.id, false);
    this.props.onLiveSecondsChange?.(this.props.id, 0);
    this.props.onUpdate?.({
      id: this.props.id,
      seconds,
      dailySeconds: {
        ...this.props.dailySeconds,
        [todayKey]: todaySeconds,
      },
    });
  };

  updateTimer = () => {
    if (this.state.startTimeMs === null) return;
    const newSeconds = Math.floor((Date.now() - this.state.startTimeMs) / 1000);

    if (newSeconds !== this.state.newSeconds) {
      this.setState({ newSeconds });
      this.props.onLiveSecondsChange?.(this.props.id, newSeconds);
    }
  };

  toggleTimer = () => {
    if (this.state.isRunning) this.pauseTimer();
    else this.startTimer();
  };

  render() {
    const displayedSeconds = this.state.seconds + this.state.newSeconds;

    return (
      <div hidden={this.props.hidden}>
        <TaskComponent
          id={this.props.id}
          isActive={this.state.isRunning}
          text={this.props.name}
          seconds={displayedSeconds}
          notes={this.props.notes}
          onDelete={() => this.props.onDelete?.(this.props.id)}
          onUpdate={this.props.onUpdate}
          onToggle={this.toggleTimer}
          status={this.props.status}
          buttons={
            <>
              <Button
                text="-10m"
                disabled={this.state.isRunning}
                onClick={() => this.pauseTimer(-60 * 10)}
              />
              <Button
                text="-1m"
                disabled={this.state.isRunning}
                onClick={() => this.pauseTimer(-60)}
              />
              <Button
                text="+1m"
                disabled={this.state.isRunning}
                onClick={() => this.pauseTimer(60)}
              />
              <Button
                text="+10m"
                disabled={this.state.isRunning}
                onClick={() => this.pauseTimer(60 * 10)}
              />
            </>
          }
        />
      </div>
    );
  }
}
