import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { isPlatformServer } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/core';
import { Tournament } from '../../core/models/tournament.model';
import { Clipping } from '../../core/models/clipping.model';
import { NotionService } from '../../core/services/notion.service';

export interface TournamentPageData {
  tournament: Tournament | null;
  clippings: Clipping[];
}

export const tournamentResolver: ResolveFn<TournamentPageData> = async (route) => {
  const year = parseInt(route.paramMap.get('year') ?? '0', 10);
  const platformId = inject(PLATFORM_ID);
  const transferState = inject(TransferState);
  const notion = inject(NotionService);

  const KEY = makeStateKey<TournamentPageData>(`tournament-${year}`);

  if (!isPlatformServer(platformId)) {
    const cached = transferState.get<TournamentPageData | null>(KEY, null);
    if (cached) {
      transferState.remove(KEY);
      return cached;
    }
    return { tournament: null, clippings: [] };
  }

  const tournament = await notion.getTournamentByYear(year);
  const clippings = tournament ? await notion.getClippingsByTournament(tournament.id) : [];
  const data: TournamentPageData = { tournament, clippings };

  transferState.set(KEY, data);
  return data;
};
