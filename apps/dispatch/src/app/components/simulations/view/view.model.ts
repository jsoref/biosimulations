import {
  SimulationRunStatus,
  EnvironmentVariable,
  Purpose,
  PlotlyAxisType as AxisType,
  PlotlyTraceMode as TraceMode,
} from '@biosimulations/datamodel/common';
export interface FormattedSimulation {
  id: string;
  name: string;
  simulator: string;
  simulatorVersion: string;
  simulatorUrl: string;
  cpus: number;
  memory: string;
  maxTime: string;
  envVars: EnvironmentVariable[];
  purpose: Purpose;
  status: SimulationRunStatus;
  statusRunning: boolean;
  statusSucceeded: boolean;
  statusLabel: string;
  submitted: string;
  updated: string;
  // runtime: string;
  projectUrl: string;
  projectSize: string;
  resultsUrl: string;
  resultsSize: string;
}

export interface AxisLabelType {
  label: string;
  type: AxisType;
}

export const AXIS_LABEL_TYPES: AxisLabelType[] = [
  {
    label: 'Linear',
    type: AxisType.linear,
  },
  {
    label: 'Logarithmic',
    type: AxisType.log,
  },
];

export interface TraceModeLabel {
  label: string;
  mode: TraceMode;
}

export const TRACE_MODE_LABELS: TraceModeLabel[] = [
  {
    label: 'Line',
    mode: TraceMode.lines,
  },
  {
    label: 'Scatter',
    mode: TraceMode.markers,
  },
];
