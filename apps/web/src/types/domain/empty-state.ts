import { ActionConfig } from './action';

export type EmptyStateTone =
  | "POSITIVE"
  | "NEUTRAL"
  | "ATTENTION"
  | "ERROR";

export interface EmptyStateConfig {
  id: string;
  title: string;
  explanation: string;
  tone: EmptyStateTone;
  primaryAction: ActionConfig;
  secondaryAction?: ActionConfig;
  preservedContext?: Record<string, string>;
  iconReference?: string;
}
