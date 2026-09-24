import type { Illness, IllnessEpisode, SymptomTactic } from '@/domain/illness';
import type { Injury, InjuryEvent, InjuryUpdate, Solution } from '@/domain/injury';

export type BackupPayload = {
  formatVersion: 1;
  schemaVersion: number;
  exportedAt: string;
  injuries: Injury[];
  updates: InjuryUpdate[];
  solutions: Solution[];
  events: InjuryEvent[];
  illnesses: Illness[];
  episodes: IllnessEpisode[];
  tactics: SymptomTactic[];
};
