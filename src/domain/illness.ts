export type Illness = {
  id: number;
  name: string;
  notes: string | null;
  createdAt: string;
};

export type IllnessEpisode = {
  id: number;
  illnessId: number;
  notedAt: string;
  createdAt: string;
};

export type SymptomTactic = {
  id: number;
  illnessId: number;
  body: string;
  url: string | null;
  createdAt: string;
};
