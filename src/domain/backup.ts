import type { Comment, Injury, InjuryEvent, SeverityReading, Solution } from '@/domain/injury';

export type BackupPayload = {
  formatVersion: 1;
  schemaVersion: number;
  exportedAt: string;
  injuries: Injury[];
  comments: Comment[];
  solutions: Solution[];
  events: InjuryEvent[];
  readings: SeverityReading[];
};
