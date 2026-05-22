import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import https from 'node:https';
import http from 'node:http';
// Load .env for local development (no-op in production where .env doesn't exist)
import 'dotenv/config';

const browserDistFolder = join(import.meta.dirname, '../browser');

// ── 2026 in-memory cache ──────────────────────────────────────────────────────
const cache2026 = new Map<string, { data: unknown; ts: number }>();

function get2026Cache<T>(key: string, ttlMs: number): T | null {
  const entry = cache2026.get(key);
  if (!entry || Date.now() - entry.ts > ttlMs) return null;
  return entry.data as T;
}

function set2026Cache(key: string, data: unknown): void {
  cache2026.set(key, { data, ts: Date.now() });
}

// ── HTTP/S fetch helper with redirect support ─────────────────────────────────
function fetchUrl(url: string, depth = 0): Promise<string> {
  return new Promise((resolve, reject) => {
    if (depth > 3) { reject(new Error('Too many redirects')); return; }
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers: { 'User-Agent': 'WorldCupChronicle/1.0' } }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(fetchUrl(res.headers.location, depth + 1));
        return;
      }
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    });
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.on('error', reject);
  });
}

// ── RSS parser ────────────────────────────────────────────────────────────────
import type { NewsArticle } from './app/core/models/news-article.model';

function parseRss(xml: string, sourceName: string): NewsArticle[] {
  const items = xml.match(/<item[\s\S]*?<\/item>/g) ?? [];
  return items.slice(0, 20).map((item, i) => {
    const title   = (item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) ?? item.match(/<title>([\s\S]*?)<\/title>/))?.[1]?.trim() ?? '';
    const desc    = (item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) ?? item.match(/<description>([\s\S]*?)<\/description>/))?.[1]?.trim() ?? '';
    const link    = item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? '';
    const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ?? '';
    const plain   = desc.replace(/<[^>]+>/g, '').slice(0, 400);
    return {
      id: `rss-${i}-${Date.now()}`,
      headline: title,
      deck: plain.slice(0, 120),
      source: `${sourceName} · ${pubDate ? new Date(pubDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}`,
      sourceCountry: 'INT',
      body: plain,
      url: link,
      publishedAt: pubDate ? new Date(pubDate) : new Date(),
      isBreaking: false,
      tags: ['news'],
      size: i === 0 ? 'featured' : i < 3 ? 'wide' : 'medium',
    } satisfies NewsArticle;
  });
}

// ── API-Football helper ───────────────────────────────────────────────────────
async function fetchApiFootball(path: string): Promise<unknown> {
  const key = process.env['API_FOOTBALL_KEY'];
  if (!key) return null;
  const url = `https://v3.football.api-sports.io${path}`;
  try {
    const raw = await fetchUrl(url + (url.includes('?') ? '&' : '?') + `x-apisports-key=${key}`);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

import { Client as NotionClient } from '@notionhq/client';

function notionClient() {
  return new NotionClient({ auth: process.env['NOTION_TOKEN'] });
}

function mapTournament(page: any) {
  const p = page.properties;
  return {
    id: page.id,
    name: p['Name']?.title?.[0]?.plain_text ?? '',
    year: p['Year']?.number ?? 0,
    hostCountry: p['Host Country']?.select?.name ?? '',
    hostCountryCode: p['Host Country Code']?.rich_text?.[0]?.plain_text ?? '',
    champion: p['Champion']?.select?.name ?? '',
    runnerUp: p['Runner Up']?.select?.name ?? '',
    thirdPlace: p['Third Place']?.select?.name ?? '',
    goalsTotal: p['Goals Total']?.number ?? 0,
    teams: p['Teams']?.number ?? 0,
    topScorer: p['Top Scorer']?.rich_text?.[0]?.plain_text ?? '',
    eraClass: p['Era Class']?.select?.name ?? '',
    mastheadName: p['Masthead Name']?.rich_text?.[0]?.plain_text ?? 'The World Cup Chronicle',
    mastheadSubtitle: p['Masthead Subtitle']?.rich_text?.[0]?.plain_text ?? '',
    summary: p['Summary']?.rich_text?.map((r: any) => r.plain_text).join('') ?? '',
  };
}

function mapPlayer(page: any) {
  const p = page.properties;
  return {
    id: page.id,
    name: p['Name']?.title?.[0]?.plain_text ?? '',
    slug: p['Slug']?.rich_text?.[0]?.plain_text ?? '',
    country: p['Country']?.select?.name ?? '',
    yearsActive: p['Years Active']?.rich_text?.[0]?.plain_text ?? '',
    tournaments: p['Tournaments']?.multi_select?.map((t: any) => parseInt(t.name)) ?? [],
    goals: p['Goals']?.number ?? 0,
    role: p['Role']?.select?.name ?? 'Forward',
    nickname: p['Nickname']?.rich_text?.[0]?.plain_text ?? null,
    bio: p['Bio']?.rich_text?.map((r: any) => r.plain_text).join('') ?? '',
  };
}

function mapMoment(page: any) {
  const p = page.properties;
  return {
    id: page.id,
    name: p['Name']?.title?.[0]?.plain_text ?? '',
    slug: p['Slug']?.rich_text?.[0]?.plain_text ?? '',
    tournamentId: p['Tournament']?.relation?.[0]?.id ?? '',
    minute: p['Minute']?.number ?? 0,
    description: p['Description']?.rich_text?.map((r: any) => r.plain_text).join('') ?? '',
    clippingIds: p['Clippings']?.relation?.map((r: any) => r.id) ?? [],
  };
}

function mapClipping(page: any) {
  const p = page.properties;
  return {
    id: page.id,
    headline: p['Headline']?.title?.[0]?.plain_text ?? '',
    tournamentId: p['Tournament']?.relation?.[0]?.id ?? '',
    source: p['Source']?.rich_text?.[0]?.plain_text ?? '',
    country: p['Country']?.select?.name ?? '',
    type: p['Type']?.select?.name ?? 'match',
    size: p['Size']?.select?.name ?? 'medium',
    deck: p['Deck']?.rich_text?.[0]?.plain_text ?? '',
    body: p['Body']?.rich_text?.map((r: any) => r.plain_text).join('') ?? '',
    score: p['Score']?.rich_text?.[0]?.plain_text ?? null,
    photoEmoji: p['Photo Emoji']?.rich_text?.[0]?.plain_text ?? null,
    photoCaption: p['Photo Caption']?.rich_text?.[0]?.plain_text ?? null,
    sortOrder: p['Sort Order']?.number ?? 0,
    isFeatured: p['Is Featured']?.checkbox ?? false,
    tags: p['Tags']?.multi_select?.map((t: any) => t.name) ?? [],
  };
}

const app = express();
const angularApp = new AngularNodeAppEngine();

// JSON API for client-side navigation (Notion calls are server-side only)
app.get('/api/tournament/:year', async (req, res) => {
  try {
    const year = parseInt(req.params['year'], 10);
    const notion = notionClient();
    const result = await notion.databases.query({
      database_id: process.env['NOTION_TOURNAMENTS_DB'] ?? '',
      filter: { property: 'Year', number: { equals: year } },
    });
    res.json(result.results[0] ? mapTournament(result.results[0]) : null);
  } catch (err) {
    console.error('[API] /api/tournament/:year', err);
    res.status(500).json(null);
  }
});

app.get('/api/clippings/:tournamentId', async (req, res) => {
  try {
    const notion = notionClient();
    const result = await notion.databases.query({
      database_id: process.env['NOTION_CLIPPINGS_DB'] ?? '',
      filter: { property: 'Tournament', relation: { contains: req.params['tournamentId'] } },
      sorts: [{ property: 'Sort Order', direction: 'ascending' }],
    });
    res.json(result.results.map(mapClipping));
  } catch (err) {
    console.error('[API] /api/clippings/:tournamentId', err);
    res.status(500).json([]);
  }
});

app.get('/api/player/:slug', async (req, res) => {
  try {
    const notion = notionClient();
    const result = await notion.databases.query({
      database_id: process.env['NOTION_PLAYERS_DB'] ?? '',
      filter: { property: 'Slug', rich_text: { equals: req.params['slug'] } },
    });
    res.json(result.results[0] ? mapPlayer(result.results[0]) : null);
  } catch (err) {
    console.error('[API] /api/player/:slug', err);
    res.status(500).json(null);
  }
});

app.get('/api/moment/:slug', async (req, res) => {
  try {
    const notion = notionClient();
    const momentResult = await notion.databases.query({
      database_id: process.env['NOTION_MOMENTS_DB'] ?? '',
      filter: { property: 'Slug', rich_text: { equals: req.params['slug'] } },
    });
    if (!momentResult.results[0]) { res.json({ moment: null, clippings: [] }); return; }
    const moment = mapMoment(momentResult.results[0]);
    const clippings = await Promise.all(
      moment.clippingIds.map((id: string) => notion.pages.retrieve({ page_id: id }).then(mapClipping))
    );
    res.json({ moment, clippings });
  } catch (err) {
    console.error('[API] /api/moment/:slug', err);
    res.status(500).json({ moment: null, clippings: [] });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const q = String(req.query['q'] ?? '').trim();
    if (!q) { res.json([]); return; }
    const notion = notionClient();
    const result = await notion.databases.query({
      database_id: process.env['NOTION_CLIPPINGS_DB'] ?? '',
      filter: { property: 'Headline', title: { contains: q } },
    });
    res.json(result.results.map(mapClipping));
  } catch (err) {
    console.error('[API] /api/search', err);
    res.status(500).json([]);
  }
});

// ── 2026 Live API endpoints ───────────────────────────────────────────────────
const TTL_NEWS     = 15 * 60 * 1000;
const TTL_LIVE     =  5 * 60 * 1000;
const TTL_STANDING = 30 * 60 * 1000;

app.get('/api/2026/news', async (_req, res) => {
  const cached = get2026Cache<NewsArticle[]>('2026-news', TTL_NEWS);
  if (cached) { res.json(cached); return; }
  try {
    const feeds = [
      { url: 'https://feeds.bbci.co.uk/sport/football/rss.xml',      name: 'BBC Sport' },
      { url: 'https://www.espn.com/espn/rss/soccer/news',             name: 'ESPN FC' },
    ];
    const results = await Promise.allSettled(feeds.map(f => fetchUrl(f.url).then(xml => parseRss(xml, f.name))));
    const articles: NewsArticle[] = results
      .flatMap(r => r.status === 'fulfilled' ? r.value : [])
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    set2026Cache('2026-news', articles);
    res.json(articles);
  } catch (err) {
    console.error('[API] /api/2026/news', err);
    res.json([]);
  }
});

app.get('/api/2026/fixtures', async (_req, res) => {
  const cached = get2026Cache<unknown>('2026-fixtures', TTL_LIVE);
  if (cached) { res.json(cached); return; }
  try {
    const data = await fetchApiFootball('/fixtures?league=1&season=2026');
    const fixtures = data ?? [];
    set2026Cache('2026-fixtures', fixtures);
    res.json(fixtures);
  } catch (err) {
    console.error('[API] /api/2026/fixtures', err);
    res.json([]);
  }
});

app.get('/api/2026/standings', async (_req, res) => {
  const cached = get2026Cache<unknown>('2026-standings', TTL_STANDING);
  if (cached) { res.json(cached); return; }
  try {
    const data = await fetchApiFootball('/standings?league=1&season=2026');
    const standings = data ?? [];
    set2026Cache('2026-standings', standings);
    res.json(standings);
  } catch (err) {
    console.error('[API] /api/2026/standings', err);
    res.json([]);
  }
});

app.get('/api/2026/scorers', async (_req, res) => {
  const cached = get2026Cache<unknown>('2026-scorers', TTL_STANDING);
  if (cached) { res.json(cached); return; }
  try {
    const data = await fetchApiFootball('/players/topscorers?league=1&season=2026');
    const scorers = data ?? [];
    set2026Cache('2026-scorers', scorers);
    res.json(scorers);
  } catch (err) {
    console.error('[API] /api/2026/scorers', err);
    res.json([]);
  }
});

app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) throw error;
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
