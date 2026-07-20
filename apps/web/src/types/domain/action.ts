export interface ActionConfig {
  id: string;
  label: string;
  href?: string;
  actionType?: string;
  requiresAuthentication?: boolean;
  returnContext?: Record<string, string>;
}
