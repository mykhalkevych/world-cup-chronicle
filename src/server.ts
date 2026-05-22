import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
// Load .env for local development (no-op in production where .env doesn't exist)
import 'dotenv/config';

const browserDistFolder = join(import.meta.dirname, '../browser');

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
