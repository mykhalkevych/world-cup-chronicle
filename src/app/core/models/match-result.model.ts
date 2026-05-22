export interface MatchResult {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number | null;
  awayGoals: number | null;
  status: 'NS' | 'LIVE' | 'FT' | 'AET' | 'PEN' | 'PST' | 'CANC';
  minute: number | null;
  date: string;
  group: string;
  round: string;
}
