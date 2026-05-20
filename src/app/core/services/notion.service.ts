import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { CacheService } from './cache.service';
import { Tournament } from '../models/tournament.model';
import { Clipping } from '../models/clipping.model';
import { Player } from '../models/player.model';
import { Moment } from '../models/moment.model';

@Injectable({ providedIn: 'root' })
export class NotionService {
  private platformId = inject(PLATFORM_ID);
  private cache = inject(CacheService);

  private get notion() {
    const { Client } = require('@notionhq/client');
    return new Client({ auth: process.env['NOTION_TOKEN'] });
  }

  private get DB() {
    return {
      tournaments: process.env['NOTION_TOURNAMENTS_DB'] ?? '',
      clippings: process.env['NOTION_CLIPPINGS_DB'] ?? '',
      players: process.env['NOTION_PLAYERS_DB'] ?? '',
      moments: process.env['NOTION_MOMENTS_DB'] ?? '',
    };
  }

  async getTournaments(): Promise<Tournament[]> {
    if (!isPlatformServer(this.platformId)) return [];

    const key = 'tournaments-all';
    const cached = this.cache.get<Tournament[]>(key);
    if (cached) return cached;

    try {
      const res = await this.notion.databases.query({
        database_id: this.DB.tournaments,
        sorts: [{ property: 'Year', direction: 'ascending' }],
      });
      const data = res.results.map((p: any) => this.mapTournament(p));
      this.cache.set(key, data);
      return data;
    } catch (err) {
      console.error('[NotionService] Failed to fetch tournaments:', err);
      return [];
    }
  }

  async getTournamentByYear(year: number): Promise<Tournament | null> {
    if (!isPlatformServer(this.platformId)) return null;

    const key = `tournament-${year}`;
    const cached = this.cache.get<Tournament>(key);
    if (cached) return cached;

    try {
      const res = await this.notion.databases.query({
        database_id: this.DB.tournaments,
        filter: { property: 'Year', number: { equals: year } },
      });
      if (!res.results.length) return null;
      const data = this.mapTournament(res.results[0]);
      this.cache.set(key, data);
      return data;
    } catch (err) {
      console.error(`[NotionService] Failed to fetch tournament ${year}:`, err);
      return null;
    }
  }

  async getClippingsByTournament(tournamentId: string): Promise<Clipping[]> {
    if (!isPlatformServer(this.platformId)) return [];

    const key = `clippings-${tournamentId}`;
    const cached = this.cache.get<Clipping[]>(key);
    if (cached) return cached;

    try {
      const res = await this.notion.databases.query({
        database_id: this.DB.clippings,
        filter: { property: 'Tournament', relation: { contains: tournamentId } },
        sorts: [{ property: 'Sort Order', direction: 'ascending' }],
      });
      const data = res.results.map((p: any) => this.mapClipping(p));
      this.cache.set(key, data);
      return data;
    } catch (err) {
      console.error(`[NotionService] Failed to fetch clippings for ${tournamentId}:`, err);
      return [];
    }
  }

  async getPlayerBySlug(slug: string): Promise<Player | null> {
    if (!isPlatformServer(this.platformId)) return null;

    const key = `player-${slug}`;
    const cached = this.cache.get<Player>(key);
    if (cached) return cached;

    try {
      const res = await this.notion.databases.query({
        database_id: this.DB.players,
        filter: { property: 'Slug', rich_text: { equals: slug } },
      });
      if (!res.results.length) return null;
      const data = this.mapPlayer(res.results[0]);
      this.cache.set(key, data);
      return data;
    } catch (err) {
      console.error(`[NotionService] Failed to fetch player ${slug}:`, err);
      return null;
    }
  }

  async getMomentBySlug(slug: string): Promise<Moment | null> {
    if (!isPlatformServer(this.platformId)) return null;

    const key = `moment-${slug}`;
    const cached = this.cache.get<Moment>(key);
    if (cached) return cached;

    try {
      const res = await this.notion.databases.query({
        database_id: this.DB.moments,
        filter: { property: 'Slug', rich_text: { equals: slug } },
      });
      if (!res.results.length) return null;
      const data = this.mapMoment(res.results[0]);
      this.cache.set(key, data);
      return data;
    } catch (err) {
      console.error(`[NotionService] Failed to fetch moment ${slug}:`, err);
      return null;
    }
  }

  async searchClippings(query: string): Promise<Clipping[]> {
    if (!isPlatformServer(this.platformId)) return [];

    try {
      const res = await this.notion.databases.query({
        database_id: this.DB.clippings,
        filter: { property: 'Headline', title: { contains: query } },
      });
      return res.results.map((p: any) => this.mapClipping(p));
    } catch (err) {
      console.error('[NotionService] Failed to search clippings:', err);
      return [];
    }
  }

  private mapTournament(page: any): Tournament {
    const props = page.properties;
    return {
      id: page.id,
      name: props['Name']?.title?.[0]?.plain_text ?? '',
      year: props['Year']?.number ?? 0,
      hostCountry: props['Host Country']?.select?.name ?? '',
      hostCountryCode: props['Host Country Code']?.rich_text?.[0]?.plain_text ?? '',
      champion: props['Champion']?.select?.name ?? '',
      runnerUp: props['Runner Up']?.select?.name ?? '',
      thirdPlace: props['Third Place']?.select?.name ?? '',
      goalsTotal: props['Goals Total']?.number ?? 0,
      teams: props['Teams']?.number ?? 0,
      topScorer: props['Top Scorer']?.rich_text?.[0]?.plain_text ?? '',
      eraClass: props['Era Class']?.select?.name ?? '',
      mastheadName: props['Masthead Name']?.rich_text?.[0]?.plain_text ?? 'The World Cup Chronicle',
      mastheadSubtitle: props['Masthead Subtitle']?.rich_text?.[0]?.plain_text ?? '',
      summary: props['Summary']?.rich_text?.map((r: any) => r.plain_text).join('') ?? '',
    };
  }

  private mapClipping(page: any): Clipping {
    const props = page.properties;
    return {
      id: page.id,
      headline: props['Headline']?.title?.[0]?.plain_text ?? '',
      tournamentId: props['Tournament']?.relation?.[0]?.id ?? '',
      source: props['Source']?.rich_text?.[0]?.plain_text ?? '',
      country: props['Country']?.select?.name ?? '',
      type: props['Type']?.select?.name ?? 'match',
      size: props['Size']?.select?.name ?? 'medium',
      deck: props['Deck']?.rich_text?.[0]?.plain_text ?? '',
      body: props['Body']?.rich_text?.map((r: any) => r.plain_text).join('') ?? '',
      score: props['Score']?.rich_text?.[0]?.plain_text,
      photoEmoji: props['Photo Emoji']?.rich_text?.[0]?.plain_text,
      photoCaption: props['Photo Caption']?.rich_text?.[0]?.plain_text,
      sortOrder: props['Sort Order']?.number ?? 0,
      isFeatured: props['Is Featured']?.checkbox ?? false,
      tags: props['Tags']?.multi_select?.map((t: any) => t.name) ?? [],
    };
  }

  private mapPlayer(page: any): Player {
    const props = page.properties;
    return {
      id: page.id,
      name: props['Name']?.title?.[0]?.plain_text ?? '',
      slug: props['Slug']?.rich_text?.[0]?.plain_text ?? '',
      country: props['Country']?.select?.name ?? '',
      yearsActive: props['Years Active']?.rich_text?.[0]?.plain_text ?? '',
      tournaments: props['Tournaments']?.multi_select?.map((t: any) => parseInt(t.name)) ?? [],
      goals: props['Goals']?.number ?? 0,
      role: props['Role']?.select?.name ?? 'Forward',
      nickname: props['Nickname']?.rich_text?.[0]?.plain_text,
      bio: props['Bio']?.rich_text?.map((r: any) => r.plain_text).join('') ?? '',
    };
  }

  private mapMoment(page: any): Moment {
    const props = page.properties;
    return {
      id: page.id,
      name: props['Name']?.title?.[0]?.plain_text ?? '',
      slug: props['Slug']?.rich_text?.[0]?.plain_text ?? '',
      tournamentId: props['Tournament']?.relation?.[0]?.id ?? '',
      minute: props['Minute']?.number ?? 0,
      description: props['Description']?.rich_text?.map((r: any) => r.plain_text).join('') ?? '',
      clippingIds: props['Clippings']?.relation?.map((r: any) => r.id) ?? [],
    };
  }
}
