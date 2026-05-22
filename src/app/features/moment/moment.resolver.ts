import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/core';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Moment } from '../../core/models/moment.model';
import { Clipping } from '../../core/models/clipping.model';
import { NotionService } from '../../core/services/notion.service';

export interface MomentPageData {
  moment: Moment | null;
  clippings: Clipping[];
}

export const momentResolver: ResolveFn<MomentPageData> = async (route) => {
  const slug = route.paramMap.get('slug') ?? '';
  const platformId = inject(PLATFORM_ID);
  const transferState = inject(TransferState);
  const notion = inject(NotionService);

  const KEY = makeStateKey<MomentPageData>(`moment-${slug}`);

  if (isPlatformServer(platformId)) {
    const moment = await notion.getMomentBySlug(slug);
    const clippings = moment
      ? await Promise.all(
          moment.clippingIds.map(id => notion.getClippingsByTournament(id))
        ).then(groups => groups.flat())
      : [];
    const data: MomentPageData = { moment, clippings };
    transferState.set(KEY, data);
    return data;
  }

  const cached = transferState.get<MomentPageData | null>(KEY, null);
  if (cached) {
    transferState.remove(KEY);
    return cached;
  }

  const http = inject(HttpClient);
  return firstValueFrom(
    http.get<MomentPageData>(`/api/moment/${slug}`).pipe(
      catchError(() => of({ moment: null, clippings: [] as Clipping[] }))
    )
  );
};
