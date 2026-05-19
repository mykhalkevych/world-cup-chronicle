export interface Tournament {
  id: string;
  name: string;
  year: number;
  hostCountry: string;
  hostCountryCode: string;
  champion: string;
  runnerUp: string;
  thirdPlace: string;
  goalsTotal: number;
  teams: number;
  topScorer: string;
  eraClass: string;
  mastheadName: string;
  mastheadSubtitle: string;
  summary: string;
}
