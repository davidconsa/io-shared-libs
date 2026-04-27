export interface RequestMetadata {
  url: string;
  method: string;
  correlationId: string;
  durationMs: number;
  attempt: number;
}
