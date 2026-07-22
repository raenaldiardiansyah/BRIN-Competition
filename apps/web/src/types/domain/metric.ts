export interface Metric {
  id: string;
  name: string;
  value: string | number;
  period: string;
  definition: string;
  source?: string;
  decisionRelevance?: string;
}
