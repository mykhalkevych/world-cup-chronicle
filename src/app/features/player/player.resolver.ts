import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { isPlatformServer } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/core';
import { Player } from '../../core/models/player.model';
import { NotionService } from '../../core/services/notion.service';

export const playerResolver: ResolveFn<Player | null> = async (route) => {
  const slug = route.paramMap.get('slug') ?? '';
  const platformId = inject(PLATFORM_ID);
  const transferState = inject(TransferState);
  const notion = inject(NotionService);

  const KEY = makeStateKey<Player | null>(`player-${slug}`);

  if (!isPlatformServer(platformId)) {
    const cached = transferState.get<Player | null>(KEY, null);
    if (cached) {
      transferState.remove(KEY);
      return cached;
    }
    return null;
  }

  const player = await notion.getPlayerBySlug(slug);
  transferState.set(KEY, player);
  return player;
};
