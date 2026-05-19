export type PlayerRole = 'Forward' | 'Midfielder' | 'Goalkeeper' | 'Defender';

export interface Player {
  id: string;
  name: string;
  slug: string;
  country: string;
  yearsActive: string;
  tournaments: number[];
  goals: number;
  role: PlayerRole;
  nickname?: string;
  bio: string;
}
