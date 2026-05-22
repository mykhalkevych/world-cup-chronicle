import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { MatchResult } from '../../../core/models/match-result.model';
import { GroupStanding } from '../../../core/models/group-standing.model';
import { TopScorer } from '../../../core/models/top-scorer.model';

@Injectable({ providedIn: 'root' })
export class FixturesService {
  private http = inject(HttpClient);

  getFixtures(): Observable<MatchResult[]> {
    return this.http.get<any>('/api/2026/fixtures').pipe(
      map(data => this.mapFixtures(data)),
      catchError(() => of([]))
    );
  }

  getStandings(): Observable<GroupStanding[]> {
    return this.http.get<any>('/api/2026/standings').pipe(
      map(data => this.mapStandings(data)),
      catchError(() => of([]))
    );
  }

  getTopScorers(): Observable<TopScorer[]> {
    return this.http.get<any>('/api/2026/scorers').pipe(
      map(data => this.mapScorers(data)),
      catchError(() => of([]))
    );
  }

  private mapFixtures(data: any): MatchResult[] {
    const response = data?.response ?? data ?? [];
    if (!Array.isArray(response)) return [];
    return response.map((item: any) => ({
      id: item.fixture?.id ?? 0,
      homeTeam: item.teams?.home?.name ?? '',
      awayTeam: item.teams?.away?.name ?? '',
      homeGoals: item.goals?.home ?? null,
      awayGoals: item.goals?.away ?? null,
      status: item.fixture?.status?.short ?? 'NS',
      minute: item.fixture?.status?.elapsed ?? null,
      date: item.fixture?.date ?? '',
      group: item.league?.round ?? '',
      round: item.league?.round ?? '',
    } satisfies MatchResult));
  }

  private mapStandings(data: any): GroupStanding[] {
    const response = data?.response?.[0]?.league?.standings ?? data?.response ?? data ?? [];
    if (!Array.isArray(response)) return [];
    return response.map((group: any[]) => {
      const first = group[0];
      const groupName = first?.group ?? 'Group';
      return {
        group: groupName,
        teams: group.map((entry: any, i: number) => ({
          rank: entry.rank ?? i + 1,
          team: entry.team?.name ?? '',
          teamCode: entry.team?.code ?? '',
          played: entry.all?.played ?? 0,
          won: entry.all?.win ?? 0,
          drawn: entry.all?.draw ?? 0,
          lost: entry.all?.lose ?? 0,
          goalsFor: entry.all?.goals?.for ?? 0,
          goalsAgainst: entry.all?.goals?.against ?? 0,
          goalDiff: entry.goalsDiff ?? 0,
          points: entry.points ?? 0,
        })),
      } satisfies GroupStanding;
    });
  }

  private mapScorers(data: any): TopScorer[] {
    const response = data?.response ?? data ?? [];
    if (!Array.isArray(response)) return [];
    return response.slice(0, 10).map((entry: any, i: number) => ({
      rank: i + 1,
      name: entry.player?.name ?? '',
      team: entry.statistics?.[0]?.team?.name ?? '',
      goals: entry.statistics?.[0]?.goals?.total ?? 0,
      assists: entry.statistics?.[0]?.goals?.assists ?? 0,
    } satisfies TopScorer));
  }
}
