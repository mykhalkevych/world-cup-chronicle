# The World Cup Chronicle — Project Brief

> This file is the single source of truth for Claude Code. Read it fully before doing any work on this project.

---

## Concept

**"A living newspaper archive room"** — a website covering the history of all 22 FIFA World Cups, where every piece of content is presented as a clipping from an old newspaper of that era.

**Core idea #1 — the era changes the interface.** When the user navigates between tournaments from different decades, not just the content changes — the entire "newspaper" changes: paper color, fonts, layout, color scheme, degree of yellowing.
- 1930s = black-and-white offset print, heavy sepia, Gothic typeface
- 1950–60s = yellowed paper, classic serif headlines
- 1970–80s = warm newsprint, multi-column layout
- 1990s = colorful tabloid
- 2000s+ = bright modern broadsheet

**Core idea #2 — multi-perspective.** One match, multiple newspapers from different countries. Maracanazo 1950: the Uruguayan paper writes "A Miracle!", the Brazilian one — "A Nation in Mourning". Hand of God 1986: Argentine paper — "Genius!", English paper — "Cheating!".

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Framework | **Angular 18+ with SSR** (Angular Universal built-in) | SSR for SEO, fast TTF, hydration |
| Styles | **SCSS** + CSS Custom Properties | Dynamic era theming at CSS variable level |
| Content / CMS | **Notion API** (`@notionhq/client`) | Edit content without redeployment |
| Fonts | **Google Fonts** (downloaded locally via `@font-face`) | No CDN dependency in production |
| i18n | **@ngx-translate** (`@ngx-translate/core`) | Runtime switching, single bundle, Firebase App Hosting compatible |
| News feed | RSS feeds + **API-Football** (`api-football.com`) | Live news and scores for the 2026 module |
| Analytics | **Umami** (self-hosted or Umami Cloud) | Lightweight, GDPR-compliant, no cookies |
| Deployment | **Node.js server** (Express, runs Angular SSR) | Notion API calls stay server-side only |

### Do NOT use
- ❌ NgRx / Redux — overkill for this project
- ❌ Angular Material / PrimeNG — breaks newspaper aesthetics
- ❌ Bootstrap / Tailwind — conflicts with the custom design system
- ❌ Google Analytics — heavy, requires cookie consent banner; Umami replaces it

---

## Project Structure

```
world-cup-chronicle/
├── CLAUDE.md                              ← this file
├── .mcp.json                              ← MCP servers config, commit to git
├── .gitignore
├── apphosting.yaml                        ← Firebase App Hosting config
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── services/
│   │   │   │   ├── notion.service.ts      ← all Notion API calls
│   │   │   │   ├── era-theme.service.ts   ← era-based theme switching
│   │   │   │   ├── cache.service.ts       ← in-memory cache for all API responses
│   │   │   │   └── analytics.service.ts   ← Umami wrapper
│   │   │   └── models/
│   │   │       ├── tournament.model.ts
│   │   │       ├── clipping.model.ts
│   │   │       ├── player.model.ts
│   │   │       ├── moment.model.ts
│   │   │       └── news-article.model.ts  ← for the 2026 live module
│   │   ├── features/
│   │   │   ├── home/                      ← "editor's desk" with all tournaments
│   │   │   ├── tournament/                ← single tournament page
│   │   │   ├── player/                    ← player dossier
│   │   │   ├── moment/                    ← iconic moment page
│   │   │   ├── archive/                   ← search / card index
│   │   │   └── world-cup-2026/            ← standalone live news module
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── newspaper-clipping/    ← base clipping component
│   │   │   │   ├── masthead/              ← newspaper header
│   │   │   │   ├── score-box/             ← score in a bordered box
│   │   │   │   ├── breaking-news-ticker/  ← scrolling headline ticker (2026 only)
│   │   │   │   └── era-transition/        ← era change animation wrapper
│   │   │   └── pipes/
│   │   │       ├── era-filter.pipe.ts     ← CSS sepia filter value by year
│   │   │       └── byline-date.pipe.ts    ← formats date as "June 14, 1986"
│   │   └── app.routes.ts
│   ├── environments/                      ← Angular standard location
│   │   ├── environment.ts                 ← dev, public values only, commit
│   │   ├── environment.prod.ts            ← prod, public values only, commit
│   │   └── environment.local.ts           ← local overrides, DO NOT commit
│   ├── styles/
│   │   ├── _variables.scss                ← CSS Custom Properties per era
│   │   ├── _typography.scss               ← newspaper fonts
│   │   ├── _textures.scss                 ← paper grain and aging effects
│   │   └── _animations.scss              ← page turn, unfold, typewriter
│   └── server.ts                          ← Express SSR server (reads process.env)
├── .claude/
│   └── settings.local.json               ← personal Claude Code overrides, DO NOT commit
└── notion-schema.md                       ← Notion DB structure docs
```

---

## Design System

### Era Themes

Each era is a set of CSS Custom Properties applied to `<body>` via a class like `.era-1986`. `EraThemeService` sets this class based on the current tournament year.

```scss
// _variables.scss

// --- 1930s: black-and-white offset ---
.era-1930, .era-1934, .era-1938 {
  --paper-bg: #e8dcc8;
  --paper-filter: sepia(0.9) contrast(1.15) brightness(0.88);
  --ink-color: #1a0f00;
  --ink-secondary: #4a3520;
  --border-style: 3px double #2a1a0e;
  --font-headline: 'UnifrakturMaguntia', serif;  // Gothic blackletter
  --font-body: 'Libre Baskerville', serif;
  --font-meta: 'Special Elite', cursive;
  --grain-opacity: 0.12;
  --column-count: 3;
}

// --- 1950s: yellowed newsprint ---
.era-1950, .era-1954, .era-1958 {
  --paper-bg: #f0e2c0;
  --paper-filter: sepia(0.7) contrast(1.1) brightness(0.92);
  --ink-color: #160c00;
  --font-headline: 'Playfair Display', serif;
  --grain-opacity: 0.09;
  --column-count: 3;
}

// --- 1960s–70s: classic broadsheet ---
.era-1962, .era-1966, .era-1970, .era-1974, .era-1978 {
  --paper-bg: #f5ead6;
  --paper-filter: sepia(0.5) contrast(1.05);
  --font-headline: 'Playfair Display', serif;
  --grain-opacity: 0.06;
  --column-count: 4;
}

// --- 1980s–90s: colorful tabloid ---
.era-1982, .era-1986, .era-1990, .era-1994, .era-1998 {
  --paper-bg: #faf4e8;
  --paper-filter: sepia(0.25) brightness(0.97);
  --font-headline: 'Playfair Display', serif;
  --grain-opacity: 0.03;
  --column-count: 4;
}

// --- 2000s+: modern archive ---
.era-2002, .era-2006, .era-2010, .era-2014, .era-2018, .era-2022 {
  --paper-bg: #fffdf8;
  --paper-filter: sepia(0.08) brightness(1.0);
  --font-headline: 'Playfair Display', serif;
  --grain-opacity: 0.01;
  --column-count: 3;
}

// --- 2026 LIVE module: fresh newspaper ink ---
// No sepia. Clean white. Red BREAKING accents.
.era-2026 {
  --paper-bg: #ffffff;
  --paper-filter: none;
  --ink-color: #0a0a0a;
  --ink-secondary: #444;
  --accent-color: #c0392b;         // red for BREAKING / LIVE badges
  --font-headline: 'Playfair Display', serif;
  --grain-opacity: 0;
  --column-count: 3;
}
```

### Fonts (download locally)

```
UnifrakturMaguntia  — headlines for 1930–1940s (Gothic blackletter)
Playfair Display    — headlines for all other eras (400, 700, 900 + italic)
Special Elite       — metadata, bylines, newspaper name
Libre Baskerville   — body text inside clippings (regular + italic)
```

Download via `google-webfonts-helper` and place in `src/assets/fonts/`. Never load from Google CDN in production.

### Paper Texture Effect

```scss
// _textures.scss
.newspaper-page {
  background-color: var(--paper-bg);
  filter: var(--paper-filter);

  &::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9999;
    opacity: var(--grain-opacity);
    background-image: url("data:image/svg+xml,..."); // SVG feTurbulence noise
  }
}

.clipping {
  background: var(--paper-bg);
  border: 1px solid color-mix(in srgb, var(--ink-color) 30%, transparent);
  box-shadow: 2px 3px 8px rgba(0,0,0,0.2);

  // Rotation is generated deterministically from clipping id
  // so SSR and client always match — no hydration mismatch
}
```

---

## Module: World Cup 2026

This is a **standalone feature module** at `/2026`. It has its own aesthetic — fresh newspaper ink, no sepia, red BREAKING/LIVE accents — and a live data feed. Think "today's front page" vs the archive.

### Route
```
/2026  →  world-cup-2026 lazy-loaded module
```

### Page layout

```
┌─────────────────────────────────────────────────────────┐
│  MASTHEAD: "The World Cup Chronicle — 2026 SPECIAL ED." │
│  "USA · Canada · Mexico  ·  June–July 2026"             │
│  🔴 LIVE ticker — scrolling latest headlines            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [FEATURED clipping — top story of the day, wide]      │
│                                                         │
│  [News clipping]  [News clipping]  [News clipping]     │
│  [News clipping]  [News clipping]  [News clipping]     │
│                                                         │
│  ── GROUP STAGE RESULTS ─────────────────────────────  │
│  [Score box] [Score box] [Score box] [Score box]       │
│                                                         │
│  ── STANDINGS / BRACKET ────────────────────────────── │
│  Group tables + knockout bracket in broadsheet style   │
│                                                         │
│  ── TOP SCORERS ────────────────────────────────────── │
│  League table in newspaper typography                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Data sources

| Data | Source | Cost | Cache TTL |
|---|---|---|---|
| Live news articles | RSS feeds (BBC Sport, ESPN) — parsed server-side | Free | 15 min |
| Match results & fixtures | API-Football (`api-football.com`) — `league=1&season=2026` | Free tier (100 req/day) | 5 min live, 30 min otherwise |
| Group standings | API-Football | Free tier | 30 min |
| Top scorers | API-Football | Free tier | 30 min |
| Static 2026 fixtures | `openfootball/worldcup.json` (GitHub) | Free, no key | seed data |
| Editorial clippings | Notion DB (same as archive) | Free | 1 hour |

API-Football free tier: 100 requests/day. During the tournament register at `rapidapi.com/api-sports/api/api-football` — free tier is enough for a non-commercial project with SSR caching.

All external API calls happen **server-side only**. Never in browser-executed code.

### NewsArticle model

```typescript
export interface NewsArticle {
  id: string;
  headline: string;
  deck: string;           // subtitle / lead
  source: string;         // e.g. "BBC Sport · June 14, 2026"
  sourceCountry: string;  // for multi-perspective display
  body: string;           // first 2–3 paragraphs
  url: string;            // link to original article
  publishedAt: Date;
  isBreaking: boolean;
  tags: string[];         // 'group-stage' | 'injury' | 'result' | 'transfer' | ...
  size: 'small' | 'medium' | 'wide' | 'featured';
}
```

### Module structure

```
features/world-cup-2026/
├── world-cup-2026.component.ts      ← page shell, applies era-2026 class
├── world-cup-2026.component.html
├── world-cup-2026.routes.ts
├── services/
│   ├── news-feed.service.ts         ← RSS parsing, runs server-side
│   └── fixtures.service.ts          ← football-data.org: results, standings, scorers
└── components/
    ├── live-ticker/                  ← scrolling breaking news bar
    ├── results-grid/                 ← today's match scores
    ├── group-table/                  ← group stage standings
    ├── knockout-bracket/             ← visual bracket
    └── top-scorers-table/            ← golden boot leaderboard
```

### Cache key prefix for 2026 live data
Always prefix with `2026-` to avoid collisions with archive cache:
`2026-news`, `2026-fixtures`, `2026-standings-A`, `2026-scorers`, etc.

---

## Analytics — Umami

### Why Umami (not Google Analytics)

| | Umami | Google Analytics |
|---|---|---|
| Script size | ~2 KB | ~45 KB |
| Cookie banner needed | No | Yes (GDPR) |
| Data ownership | You | Google |
| Cost | Free / self-hosted | Free (with data sharing) |
| Setup complexity | Low | Medium |

### Setup options

**Option A — Umami Cloud** (recommended to start): Sign up at [umami.is](https://umami.is). Free tier available. Add your site, get website ID and script URL. Takes 5 minutes.

**Option B — Self-hosted**: Deploy via Docker on Railway, Render, or a VPS. Needs a PostgreSQL database.

### Tracking script

```html
<!-- src/index.html — place before </body> -->
<script
  defer
  src="https://YOUR_UMAMI_URL/script.js"
  data-website-id="YOUR_WEBSITE_ID"
></script>
```

### Analytics service

```typescript
// analytics.service.ts
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  init(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.trackPageview(e.urlAfterRedirects);
      });
  }

  trackPageview(url: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    (window as any).umami?.track({ url });
  }

  trackEvent(name: string, data?: Record<string, string | number>): void {
    if (!isPlatformBrowser(this.platformId)) return;
    (window as any).umami?.track(name, data);
  }
}
```

Call `analytics.init()` inside `AppComponent.ngOnInit()`.

### Events to track

| Event name | Trigger | Data payload |
|---|---|---|
| `pageview` | every route change | url (automatic) |
| `tournament-open` | user opens a tournament | `{ year: 1986 }` |
| `clipping-click` | user clicks a clipping | `{ headline, year }` |
| `player-open` | user opens a player dossier | `{ name }` |
| `moment-open` | user opens an iconic moment | `{ slug }` |
| `archive-search` | user submits archive search | `{ query }` |
| `era-jump` | navigation across different eras | `{ from: 1966, to: 1986 }` |
| `2026-ticker-click` | user clicks a live ticker headline | — |
| `2026-result-expand` | user expands a match result | `{ match }` |

```typescript
// Example in tournament.component.ts
ngOnInit() {
  this.analytics.trackEvent('tournament-open', { year: this.tournament.year });
}
```

---

## Notion — Database Schema

### How the connection works

```
Notion DB → Notion API → Angular SSR (Node.js) → rendered HTML → browser
```

The `NOTION_TOKEN` lives **only** in `process.env`. It never reaches the browser. Notion calls happen in Angular `ResolveFn` with `TransferState` — executed once on the server, result transferred to the client without a repeat request.

### Caching (mandatory — Notion is slow)

Notion API has a 3 req/s limit and 200–800ms latency. Always go through `CacheService`.

```typescript
// cache.service.ts
@Injectable({ providedIn: 'root' })
export class CacheService {
  private store = new Map<string, { data: unknown; ts: number }>();

  get<T>(key: string, ttlMs = 3_600_000): T | null {
    const entry = this.store.get(key);
    if (!entry || Date.now() - entry.ts > ttlMs) return null;
    return entry.data as T;
  }

  set(key: string, data: unknown): void {
    this.store.set(key, { data, ts: Date.now() });
  }
}
```

### Database: Tournaments

| Field | Type | Description |
|---|---|---|
| `Name` | Title | "FIFA World Cup 1986" |
| `Year` | Number | 1986 |
| `Host Country` | Select | Mexico |
| `Host Country Code` | Text | MX |
| `Champion` | Select | Argentina |
| `Runner Up` | Select | West Germany |
| `Third Place` | Select | France |
| `Goals Total` | Number | 132 |
| `Teams` | Number | 24 |
| `Top Scorer` | Text | "Gary Lineker (6)" |
| `Era Class` | Select | era-1986 |
| `Masthead Name` | Text | Newspaper name for this era |
| `Masthead Subtitle` | Text | Newspaper tagline |
| `Summary` | Rich Text | Short tournament overview |

### Database: Clippings

| Field | Type | Description |
|---|---|---|
| `Headline` | Title | Clipping headline |
| `Tournament` | Relation | → Tournaments |
| `Source` | Text | "Clarín · June 29, 1986" |
| `Country` | Select | Argentina / England / Brazil / ... |
| `Type` | Select | match / profile / scandal / reaction |
| `Size` | Select | small / medium / wide / featured |
| `Deck` | Text | Subtitle / lead sentence |
| `Body` | Rich Text | Article body |
| `Score` | Text | "3 : 2" (optional) |
| `Photo Emoji` | Text | 🏆 (photo placeholder) |
| `Photo Caption` | Text | Caption under photo |
| `Sort Order` | Number | Display order on the page |
| `Is Featured` | Checkbox | Main clipping on the page |
| `Tags` | Multi-select | goal / controversy / record / ... |

### Database: Players

| Field | Type | Description |
|---|---|---|
| `Name` | Title | Pelé |
| `Slug` | Text | pele |
| `Country` | Select | Brazil |
| `Years Active` | Text | "1958–1970" |
| `Tournaments` | Multi-select | 1958, 1962, 1966, 1970 |
| `Goals` | Number | 12 |
| `Role` | Select | Forward / Midfielder / Goalkeeper |
| `Nickname` | Text | "O Rei" |
| `Bio` | Rich Text | Dossier body text |

### Database: Moments (iconic moments)

| Field | Type | Description |
|---|---|---|
| `Name` | Title | "Hand of God" |
| `Slug` | Text | hand-of-god |
| `Tournament` | Relation | → Tournaments |
| `Minute` | Number | 51 |
| `Description` | Rich Text | Full description |
| `Clippings` | Relation | → Clippings (multiple country perspectives) |

---

## Routing

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component')
  },
  {
    path: 'tournament/:year',
    loadComponent: () => import('./features/tournament/tournament.component'),
    resolve: { tournament: tournamentResolver }
  },
  {
    path: 'player/:slug',
    loadComponent: () => import('./features/player/player.component'),
    resolve: { player: playerResolver }
  },
  {
    path: 'moment/:slug',
    loadComponent: () => import('./features/moment/moment.component'),
    resolve: { moment: momentResolver }
  },
  {
    path: 'archive',
    loadComponent: () => import('./features/archive/archive.component')
  },
  {
    path: '2026',
    loadChildren: () => import('./features/world-cup-2026/world-cup-2026.routes')
  },
];
```

---

## Notion Service — Base Code

```typescript
// notion.service.ts
import { Injectable, inject } from '@angular/core';
import { Client } from '@notionhq/client';
import { CacheService } from './cache.service';
import { environment } from '../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class NotionService {
  private notion = new Client({ auth: environment.notionToken });
  private cache = inject(CacheService);

  private DB = {
    tournaments: environment.notion.tournamentsDbId,
    clippings:   environment.notion.clippingsDbId,
    players:     environment.notion.playersDbId,
    moments:     environment.notion.momentsDbId,
  };

  async getTournamentByYear(year: number): Promise<Tournament> {
    const key = `tournament-${year}`;
    const cached = this.cache.get<Tournament>(key);
    if (cached) return cached;

    const res = await this.notion.databases.query({
      database_id: this.DB.tournaments,
      filter: { property: 'Year', number: { equals: year } },
    });

    const data = this.mapTournament(res.results[0]);
    this.cache.set(key, data);
    return data;
  }

  async getClippingsByTournament(tournamentId: string): Promise<Clipping[]> {
    const key = `clippings-${tournamentId}`;
    const cached = this.cache.get<Clipping[]>(key);
    if (cached) return cached;

    const res = await this.notion.databases.query({
      database_id: this.DB.clippings,
      filter: { property: 'Tournament', relation: { contains: tournamentId } },
      sorts: [{ property: 'Sort Order', direction: 'ascending' }],
    });

    const data = res.results.map(p => this.mapClipping(p));
    this.cache.set(key, data);
    return data;
  }

  // Private mappers — always map Notion's raw structure to clean TS models.
  // Components receive only clean models, never raw Notion API responses.
  private mapTournament(page: any): Tournament { /* ... */ }
  private mapClipping(page: any): Clipping { /* ... */ }
  private mapPlayer(page: any): Player { /* ... */ }
}
```

---

## Key Animations

### 1. Clipping hover
```scss
.clipping {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  &:hover {
    transform: rotate(0deg) scale(1.03) translateY(-4px) !important;
    box-shadow: 6px 10px 24px rgba(0,0,0,0.3);
    z-index: 10;
  }
}
```

### 2. Era page transition (Angular Animation on router-outlet)
```typescript
trigger('eraTransition', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      animate('600ms ease-out', style({ opacity: 1, transform: 'none' }))
    ], { optional: true })
  ])
])
```

### 3. Clipping unfold on click
`style({ transform: 'scaleY(0)' })` → `scaleY(1)`, 400ms ease-out. Simulates unfolding a piece of paper from a pocket.

### 4. Typewriter loading state
CSS `@keyframes` animation — characters appear one by one. Used as a loading indicator while Notion data fetches.

---

## Environment Configuration

Angular SSR has **two separate runtime contexts** that require different approaches for configuration.

### The two contexts

| | Browser bundle | SSR Node.js server |
|---|---|---|
| Executed by | User's browser | Node.js on the server |
| Config source | `src/environments/` | `process.env` |
| Secrets allowed | ❌ Never — compiled into public JS | ✅ Yes — server-side only |
| When resolved | Build time | Runtime |

### `src/environments/` — public, build-time values only

Standard Angular approach. Values are compiled into the JS bundle at build time. **Never put secrets here.**

```typescript
// src/environments/environment.ts  (dev)
export const environment = {
  production: false,
  umamiWebsiteId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  umamiUrl: 'https://your-umami.com',
};

// src/environments/environment.prod.ts  (prod)
export const environment = {
  production: true,
  umamiWebsiteId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  umamiUrl: 'https://your-umami.com',
};

// src/environments/environment.local.ts  — DO NOT COMMIT
// Local dev overrides, added to .gitignore
export const environment = {
  production: false,
  umamiWebsiteId: 'local-dev-id',
  umamiUrl: 'http://localhost:3001',
};
```

`fileReplacements` in `angular.json` swaps the file at build time:
```json
{
  "configurations": {
    "production": {
      "fileReplacements": [
        { "replace": "src/environments/environment.ts",
          "with": "src/environments/environment.prod.ts" }
      ]
    }
  }
}
```

### `process.env` — secrets, server-side only

All API keys and tokens live here. They are **never imported from `environments/`**.

```typescript
// server.ts — only runs on Node.js, never in the browser
// For local development, load from a local .env file:
import 'dotenv/config'; // dev only — Firebase ignores this in production

// Read secrets at runtime
const notionToken      = process.env['NOTION_TOKEN'];
const apiFootballKey   = process.env['API_FOOTBALL_KEY'];
const notionTourDB     = process.env['NOTION_TOURNAMENTS_DB'];
const notionClipsDB    = process.env['NOTION_CLIPPINGS_DB'];
const notionPlayersDB  = process.env['NOTION_PLAYERS_DB'];
const notionMomentsDB  = process.env['NOTION_MOMENTS_DB'];
```

In `NotionService` and all server-side services, always guard with `isPlatformServer()`:
```typescript
// notion.service.ts
import { isPlatformServer } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotionService {
  private platformId = inject(PLATFORM_ID);

  async getTournamentByYear(year: number) {
    if (!isPlatformServer(this.platformId)) return null; // never runs in browser
    // ... Notion API call using process.env values
  }
}
```

### Local development secrets — `.env` file

Create this file at the project root for local dev only. **Never commit it.**

```
# .env  — local development only, listed in .gitignore
NOTION_TOKEN=secret_xxxxxxxxxxxx
NOTION_TOURNAMENTS_DB=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_CLIPPINGS_DB=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_PLAYERS_DB=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_MOMENTS_DB=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
API_FOOTBALL_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Install `dotenv` as a dev dependency:
```bash
npm install --save-dev dotenv
```

Import at the top of `server.ts` **before** any service initialisation, wrapped in a dev-only guard:
```typescript
// server.ts
if (process.env['NODE_ENV'] !== 'production') {
  const { config } = await import('dotenv');
  config();
}
```

### Production secrets — Firebase Secret Manager

In production, `process.env` is populated automatically by Firebase App Hosting via `apphosting.yaml`. No `.env` file is needed on the server.

```bash
# Store each secret once — Firebase injects them at runtime
firebase apphosting:secrets:set NOTION_TOKEN
firebase apphosting:secrets:set NOTION_TOURNAMENTS_DB
firebase apphosting:secrets:set NOTION_CLIPPINGS_DB
firebase apphosting:secrets:set NOTION_PLAYERS_DB
firebase apphosting:secrets:set NOTION_MOMENTS_DB
firebase apphosting:secrets:set API_FOOTBALL_KEY
```

### `.gitignore` — must include

```
# Secrets
.env

# Angular build output
dist/
.angular/

# Dependencies
node_modules/

# Local environment overrides
src/environments/environment.local.ts

# Claude Code personal config
.claude/settings.local.json

# Logs
*.log
```

---

---

## Angular Skill

Install the **official Angular skill** maintained by the Angular core team. Without it, Claude Code defaults to outdated patterns — constructor injection, `@Input()` decorators, `*ngIf`, NgModules — instead of modern Angular 18+ conventions.

```bash
npx skills add https://github.com/angular/skills --skill angular-developer
```

This skill enforces:
- `inject()` instead of constructor injection
- `input()` / `output()` signals instead of `@Input()` / `@Output()` decorators
- `@if` / `@for` instead of `*ngIf` / `*ngFor`
- `ChangeDetectionStrategy.OnPush` on every component
- Standalone components only — no NgModule ever
- Runs `ng build` automatically after generating code to catch errors
- Signal Forms for Angular 18+

The skill is installed once and applies to all projects. No extra setup needed after installation.

---

## MCP Servers

### Configuration scopes — understand this first

There are three levels of MCP configuration. Each has a different purpose and a different file location.

| Scope | File | Committed to git? | When to use |
|---|---|---|---|
| **Project** | `.mcp.json` at project root | ✅ Yes | Servers every dev on this project needs |
| **Project-local** | `.claude/settings.local.json` | ❌ No | Your personal overrides for this project |
| **User (global)** | `~/.claude.json` on Mac/Linux, `%USERPROFILE%\.claude.json` on Windows | ❌ No | Servers you use across all projects |

Project-level MCP config is shared with everyone via the `.mcp.json` file. User-level is available across all projects. Claude Code loads **both** — project servers supplement, not replace, user servers.

**Rule of thumb:**
- GitHub, Chrome DevTools → **user-level** (useful in every project)
- Notion, Firebase → **project-level** (`.mcp.json`, committed to repo — specific to this project)

### Project-level config — `.mcp.json` at project root

Commit this file. When teammates clone the repo and open Claude Code, they get prompted to approve the servers once, then everything just works.

```json
{
  "mcpServers": {
    "firebase": {
      "command": "npx",
      "args": ["-y", "firebase-tools@latest", "mcp"]
    },
    "notionApi": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "${env:NOTION_TOKEN}"
      }
    }
  }
}
```

`${env:NOTION_TOKEN}` reads from your local `.env` file — the token never gets committed.

### User-level config — install once, works in all projects

Run these commands once from any terminal:

```bash
# GitHub — HTTP transport, OAuth login
claude mcp add --scope user --transport http github \
  https://api.githubcopilot.com/mcp/

# Chrome DevTools — inspect live Angular app in browser
claude mcp add --scope user --transport stdio chrome-devtools \
  -- npx -y @chrome-devtools/mcp
```

After adding GitHub, run `/mcp` inside Claude Code to authenticate via browser OAuth.

### What each MCP server unlocks for this project

**Notion MCP** — instead of writing `NotionService` code to query data, just say:
> *"Look at the Clippings database and add 3 new clippings for the 1966 tournament"*

**Firebase MCP** — manage App Hosting without leaving the terminal:
> *"Check the latest deployment status and show me the Cloud Run logs"*

**GitHub MCP** — full repo workflow from the terminal:
> *"Create a PR for the era-theme feature branch with a description of what changed"*

**Chrome DevTools MCP** — debug the running Angular app visually:
> *"Open the 1986 tournament page and tell me why the clipping rotation CSS isn't applying"*

### Add `.mcp.json` secrets to `.gitignore`

The `.mcp.json` itself is safe to commit — it uses `${env:VAR}` references, not actual values. But add this to `.gitignore` to be safe:

```
.claude/settings.local.json
```

---

## Public Data Sources for Historical Content

All historical content (1930–2022) is available for free. Use these to populate Notion.

| Source | URL | What it contains | Format |
|---|---|---|---|
| **Fjelstul World Cup Database** | `github.com/jfjelstul/worldcup` | All 22 tournaments, every match, every goal, every player, squads, bookings, substitutions | CSV / JSON |
| **openfootball/worldcup.json** | `github.com/openfootball/worldcup.json` | Match schedules and results 1930–2026, no API key needed | JSON |
| **Maven Analytics dataset** | `mavenanalytics.io/data-playground/world-cup` | Historical matches up to 2022, groups, squads | CSV |

**Recommended workflow for populating Notion:**
1. Download Fjelstul DB from GitHub — it has everything structured (tournaments, scorers, players, goals by minute)
2. Use it as the source of truth for all archive clipping text and statistics
3. For 2026 live data use API-Football (register at `rapidapi.com/api-sports/api/api-football`)
4. For 2026 static fixtures use `openfootball/worldcup.json` as seed data (already has the full group draw and schedule)

---

## Notion Setup (Free Plan — No Subscription Needed)

Notion API is fully available on the **free plan**. No paid subscription required for this project.

**One-time setup steps:**
1. Create account at `notion.so` (free)
2. Go to `notion.so/my-integrations` → create a new integration → copy the **Internal Integration Token** → this is your `NOTION_TOKEN`
3. Create 4 databases in Notion following the schema below (Tournaments, Clippings, Players, Moments)
4. For each database: open it → click `...` menu → `Connections` → add your integration
5. Copy each database ID from its URL: `notion.so/YOUR-DB-ID?v=...` → these are your `NOTION_*_DB` env vars

**Free plan limits that matter:**
- API access: ✅ fully available
- Number of databases: ✅ unlimited
- Number of pages: ✅ unlimited (personal workspace)
- Team members: solo only (invite collaborators requires Plus ~$10/mo — not needed for solo)
- API rate limit: 3 requests/second → handled by `CacheService`

---

## Architecture Decision: No Separate Backend

Angular SSR runs on a Node.js/Express server and is fully capable of:
- Making server-side calls to Notion API, API-Football, and RSS feeds
- Caching responses in memory
- Rendering HTML before sending to the client

A separate backend would add infrastructure complexity without any benefit for this project's current scope (read-only content).

**When a backend would be needed (future Phase 5):**
- User accounts / authentication
- Saved favourites per user
- Comments on clippings
- Notion webhooks (auto-invalidate cache on content update)

If any of these are added later, the recommended approach is a small separate service (e.g. a few Cloud Functions in the same Firebase project) — not a full rewrite.

---

## Deployment — Firebase App Hosting

Firebase App Hosting is the chosen deployment platform. It has native Angular SSR support, auto-deploys on every GitHub push, serves static assets via a global CDN, and runs the SSR server on Cloud Run — all with zero infrastructure configuration.

### Why Firebase App Hosting
- **Native Angular SSR** — zero-config, Firebase detects Angular automatically
- **Auto CI/CD** — every push to `main` triggers a build and deploy
- **Global CDN** — static assets (fonts, SCSS, JS bundles) cached at the edge
- **Scales to zero** — no idle costs, Cloud Run spins up on demand
- **Secrets management** — env vars stored in Google Cloud Secret Manager, never in code
- **GDPR-compliant** — deploy to `europe-west4` (Netherlands) to keep data in EU

### Pricing
Requires a **Blaze (pay-as-you-go) plan** — a credit card must be attached, but there is no flat monthly fee. At the scale of this project (< 1M requests/month) the bill will be effectively $0. Set a budget alert in Google Cloud Console at $5/month to be safe.

### One-time setup
```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login
firebase login

# 3. In the project root — initialise App Hosting
firebase init apphosting

# 4. Connect your GitHub repo when prompted
# Firebase will create a backend and set up the CI/CD pipeline automatically
```

This generates an `apphosting.yaml` in the project root — commit it to git.

### `apphosting.yaml` — base config
```yaml
runConfig:
  runtime: nodejs20
  concurrency: 80
  cpu: 1
  memoryMiB: 512
  minInstances: 0      # scale to zero when idle
  maxInstances: 10

env:
  - variable: NOTION_TOKEN
    secret: NOTION_TOKEN          # stored in Google Cloud Secret Manager
  - variable: NOTION_TOURNAMENTS_DB
    secret: NOTION_TOURNAMENTS_DB
  - variable: NOTION_CLIPPINGS_DB
    secret: NOTION_CLIPPINGS_DB
  - variable: NOTION_PLAYERS_DB
    secret: NOTION_PLAYERS_DB
  - variable: NOTION_MOMENTS_DB
    secret: NOTION_MOMENTS_DB
  - variable: API_FOOTBALL_KEY
    secret: API_FOOTBALL_KEY
  - variable: UMAMI_WEBSITE_ID
    secret: UMAMI_WEBSITE_ID
  - variable: UMAMI_URL
    secret: UMAMI_URL
```

### Secrets — store in Google Cloud Secret Manager (not in `.env` in production)
```bash
# Add each secret via Firebase CLI
firebase apphosting:secrets:set NOTION_TOKEN
firebase apphosting:secrets:set NOTION_TOURNAMENTS_DB
firebase apphosting:secrets:set NOTION_CLIPPINGS_DB
firebase apphosting:secrets:set NOTION_PLAYERS_DB
firebase apphosting:secrets:set NOTION_MOMENTS_DB
firebase apphosting:secrets:set API_FOOTBALL_KEY
firebase apphosting:secrets:set UMAMI_WEBSITE_ID
firebase apphosting:secrets:set UMAMI_URL
```

`.env` is used **only locally** for development. In production all secrets come from Secret Manager via `apphosting.yaml`.

### Deploy workflow
```
git push origin main
       ↓
Firebase detects push → triggers Cloud Build
       ↓
ng build (SSR) → bundles browser + server
       ↓
Static assets → Firebase CDN (global)
SSR server    → Cloud Run (europe-west4)
       ↓
Live in ~2 minutes
```

### Local development
```bash
npm run dev           # ng serve with SSR watch mode — reads local .env via dotenv
```

### Region
Set the backend region to `europe-west4` (Netherlands) during `firebase init apphosting` for EU data residency.

---

## Error Handling

### Notion API failures
If Notion is unreachable or a DB query fails, **never crash the page**. Fall back gracefully:

```typescript
async getTournamentByYear(year: number): Promise<Tournament | null> {
  try {
    // ... query
  } catch (err) {
    console.error(`[NotionService] Failed to fetch tournament ${year}:`, err);
    return null; // component handles null with a fallback UI
  }
}
```

Components must always handle `null` data — show a styled "Archive temporarily unavailable" message that looks like a torn newspaper clipping.

### API-Football failures
If live scores are unavailable, show the last cached result with a "Last updated: X minutes ago" byline. Never show a blank section.

### RSS feed failures
If RSS parsing fails, hide the ticker silently — do not show an error in the 2026 live ticker.

### Global error page (`404`, `500`)
Create `not-found` and `server-error` components styled as a newspaper "CORRECTION" notice or "LATE EDITION" with an apology in period-appropriate language.

---

## SEO

Every page must have proper meta tags. Use Angular's `Meta` and `Title` services inside resolvers or `ngOnInit`.

```typescript
// tournament.component.ts
this.title.setTitle(`${tournament.year} FIFA World Cup — The World Cup Chronicle`);
this.meta.updateTag({ name: 'description', content: tournament.summary });
this.meta.updateTag({ property: 'og:title', content: `${tournament.year} World Cup` });
this.meta.updateTag({ property: 'og:description', content: tournament.summary });
this.meta.updateTag({ property: 'og:image', content: `https://yoursite.com/og/${tournament.year}.png` });
this.meta.updateTag({ property: 'og:type', content: 'article' });
```

### JSON-LD structured data
Add to tournament pages for Google rich results:
```typescript
// In tournament.component.ts — inject to <head> via TransferState or DOCUMENT
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: `${tournament.year} FIFA World Cup`,
  startDate: tournament.startDate,
  endDate: tournament.endDate,
  location: { '@type': 'Country', name: tournament.hostCountry },
  winner: { '@type': 'SportsTeam', name: tournament.champion },
};
```

### Sitemap
Generate `sitemap.xml` at build time listing all tournament, player, and moment URLs. Place in `src/` and reference in `robots.txt`.

```
# robots.txt
User-agent: *
Allow: /
Sitemap: https://yoursite.com/sitemap.xml
```

---

## Accessibility (a11y)

Newspaper aesthetics should not come at the cost of accessibility.

- **Contrast**: low-contrast sepia text on old-paper background must still meet WCAG AA (4.5:1 for body text). Test with `axe` or Chrome DevTools.
- **Font size**: minimum 14px for body text inside clippings, even for 1930s era (legibility over full period authenticity).
- **`prefers-reduced-motion`**: wrap all CSS animations in a media query. Users who opt out of motion get instant transitions.
  ```scss
  @media (prefers-reduced-motion: reduce) {
    .clipping, .era-transition { transition: none !important; animation: none !important; }
  }
  ```
- **Alt text**: every `<img>` and photo placeholder must have a descriptive `alt` attribute (e.g. `alt="Maradona celebrating the Hand of God goal, 1986"`).
- **Semantic HTML**: use `<article>` for each clipping, `<time datetime="1986-06-22">` for dates, `<nav>` for era navigation.
- **Keyboard navigation**: clippings must be focusable and openable via keyboard (`tabindex="0"`, `(keydown.enter)`).

---

## Internationalisation (i18n) — @ngx-translate

`@ngx-translate` is used instead of Angular built-in i18n. One bundle, language switches at runtime without page reload, and zero Firebase deployment complexity — fully compatible with Firebase App Hosting out of the box.

### Why @ngx-translate over Angular i18n

| | Angular i18n | @ngx-translate |
|---|---|---|
| Build output | One bundle per locale | Single bundle |
| Firebase App Hosting | ⚠️ Not supported natively | ✅ Works out of the box |
| Language switch | Full page reload | Runtime, no reload |
| Deployment complexity | High (Hosting rewrites, multi-build) | None |
| SSR support | Complex | Straightforward |

### Supported languages

| Code | Language | Why |
|---|---|---|
| `en` | English | Default, UI language |
| `es` | Spanish | Argentina, Spain — key football nations |
| `pt` | Portuguese | Brazil, Portugal |
| `fr` | French | France — 1998 champions, major football culture |

### Setup

```bash
npm install @ngx-translate/core @ngx-translate/http-loader
```

### Translation files location

```
src/assets/i18n/
├── en.json
├── es.json
├── pt.json
└── fr.json
```

### Configuration in `app.config.ts`

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { importProvidersFrom } from '@angular/core';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      })
    ),
  ],
};
```

### SSR — TransferState to avoid double HTTP request

Without TransferState, the translation JSON is fetched once on the server and again on the client (hydration). Prevent this with a custom loader:

```typescript
// translate-server.loader.ts  — used only on the server
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { readFileSync } from 'fs';
import { join } from 'path';

export class TranslateServerLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    const filePath = join(process.cwd(), 'dist/world-cup-chronicle/browser/assets/i18n', `${lang}.json`);
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    return of(data);
  }
}

// app.config.server.ts  — SSR-specific config
import { mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateServerLoader } from './translate-server.loader';
import { appConfig } from './app.config';

export const serverConfig = mergeApplicationConfig(appConfig, {
  providers: [
    provideServerRendering(),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: { provide: TranslateLoader, useClass: TranslateServerLoader },
      })
    ),
  ],
});
```

### Translation file structure

```json
// src/assets/i18n/en.json
{
  "nav": {
    "archive": "Archive",
    "worldCup2026": "World Cup 2026",
    "players": "Players"
  },
  "masthead": {
    "subtitle": "A Complete History of FIFA World Cups",
    "edition": "Edition No. {{number}}"
  },
  "tournament": {
    "champion": "Champion",
    "topScorer": "Top Scorer",
    "goals": "{{count}} goals"
  },
  "errors": {
    "archiveUnavailable": "Archive Temporarily Unavailable",
    "notFound": "Page Not Found"
  },
  "2026": {
    "breaking": "BREAKING",
    "live": "LIVE",
    "lastUpdated": "Last updated {{time}} minutes ago"
  }
}
```

### Usage in templates

```html
<!-- Pipe syntax — preferred -->
<span>{{ 'nav.archive' | translate }}</span>

<!-- With parameters -->
<span>{{ 'masthead.edition' | translate: { number: 22 } }}</span>

<!-- Directive syntax -->
<h1 [translate]="'masthead.subtitle'"></h1>
```

### Usage in components

```typescript
import { TranslateService } from '@ngx-translate/core';

@Component({ standalone: true, imports: [TranslatePipe] })
export class MastheadComponent {
  private translate = inject(TranslateService);

  // Get translation imperatively (e.g. for meta tags)
  setPageTitle(year: number): void {
    this.translate
      .get('tournament.pageTitle', { year })
      .subscribe(title => this.titleService.setTitle(title));
  }
}
```

### Language detection and persistence

```typescript
// app.component.ts
@Component({ standalone: true })
export class AppComponent implements OnInit {
  private translate = inject(TranslateService);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    this.translate.addLangs(['en', 'es', 'pt', 'fr']);
    this.translate.setDefaultLang('en');

    if (isPlatformBrowser(this.platformId)) {
      // 1. Saved preference
      const saved = localStorage.getItem('lang');
      // 2. Browser language
      const browser = navigator.language.slice(0, 2);
      const supported = ['en', 'es', 'pt', 'fr'];
      const lang = supported.includes(saved ?? '') ? saved!
                 : supported.includes(browser) ? browser
                 : 'en';
      this.translate.use(lang);
    }
  }
}
```

### Locale switcher component

```typescript
// locale-switcher.component.ts
@Component({
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="locale-switcher" role="navigation" aria-label="Language">
      @for (lang of langs; track lang.code) {
        <button
          [class.active]="currentLang === lang.code"
          (click)="switch(lang.code)"
          [attr.aria-label]="lang.label">
          {{ lang.code.toUpperCase() }}
        </button>
      }
    </div>
  `
})
export class LocaleSwitcherComponent {
  private translate = inject(TranslateService);
  langs = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'pt', label: 'Português' },
    { code: 'fr', label: 'Français' },
  ];

  get currentLang(): string { return this.translate.currentLang; }

  switch(lang: string): void {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }
}
```

### What gets translated vs what stays per-content

| Content | Translated | Stays in original |
|---|---|---|
| Navigation, buttons, labels | ✅ | — |
| Tournament summaries | ✅ | — |
| Player bios | ✅ | — |
| Error pages | ✅ | — |
| Clipping body text | — | ✅ Written in source country's language |
| Masthead newspaper name | — | ✅ Era-specific, part of the design |

Clipping body text is **intentionally multilingual by design** — an Argentine clipping stays in Spanish regardless of the user's UI language. This is the multi-perspective feature.

---



## Rules for Claude Code

1. **Always check cache** before any Notion or external API call.
2. **Notion → model mapping** only inside `NotionService`. Components receive clean TypeScript objects, never raw Notion API responses.
3. **All external API calls** (Notion, API-Football, RSS) are server-side only — inside `ResolveFn`, guarded with `isPlatformServer()`, or in `server.ts`. Never in `ngOnInit()` without a platform check.
4. **Era CSS class** is set only via `EraThemeService.setEra()`. Never hardcode era classes in templates.
5. **Clipping rotation** must be generated **deterministically** from the clipping `id` as a seed (e.g., `(id.charCodeAt(0) % 5) - 2` degrees). This ensures SSR and client output match and prevents hydration mismatches.
6. **Fonts** — local only. Never load from Google CDN in production.
7. **All new components** — standalone (`standalone: true`), no NgModule.
8. **Styles** — SCSS only. Always use CSS Custom Properties from `_variables.scss`. No hardcoded color values in component styles.
9. **Analytics** — always wrap Umami calls with `isPlatformBrowser()` guard. Track events listed in the events table above.
10. **2026 module cache TTLs**: news feed = 15 min, live scores = 5 min, standings/scorers = 30 min. Always use `2026-` prefix for cache keys. API-Football free tier is 100 req/day — the cache is essential to stay within limits.
11. **Secrets** — never in `src/environments/`. Browser bundle is public. All tokens read from `process.env` in server-side code only.
12. **`environment.local.ts`** — if this file exists, it is a local dev override and must never be committed.

---

## Development Phases

### Phase 1 — MVP (weeks 1–3)
- [ ] `ng new world-cup-chronicle --ssr`
- [ ] `npm install @ngx-translate/core @ngx-translate/http-loader`
- [ ] Configure `TranslateModule` in `app.config.ts` + `TranslateServerLoader` in `app.config.server.ts`
- [ ] Create `src/assets/i18n/en.json` with all UI strings
- [ ] `<app-locale-switcher>` component in masthead
- [ ] `npx skills add https://github.com/angular/skills --skill angular-developer`
- [ ] Create `.mcp.json` at project root (Notion + Firebase servers)
- [ ] Add GitHub and Chrome DevTools MCP at user level via `claude mcp add --scope user`
- [ ] `.gitignore` — include `.env`, `dist/`, `.angular/`, `src/environments/environment.local.ts`, `.claude/settings.local.json`
- [ ] Design system: local fonts, SCSS variables for all eras, paper texture
- [ ] `NotionService` + `CacheService`
- [ ] `<app-newspaper-clipping>` base component
- [ ] `EraThemeService`
- [ ] Global error pages: 404 and 500 styled as newspaper corrections
- [ ] Home page — tournament grid ("editor's desk")
- [ ] Tournament page — clippings layout
- [ ] Notion content: 5 tournaments (1930, 1950, 1970, 1986, 2022) seeded from Fjelstul DB
- [ ] Umami setup + basic pageview tracking
- [ ] Firebase App Hosting setup: `firebase init apphosting`, connect GitHub repo, set region to `europe-west4`
- [ ] Store all secrets in Google Cloud Secret Manager via `firebase apphosting:secrets:set`
- [ ] Verify auto-deploy works on push to `main`
- [ ] Basic SEO: `<title>` and `<meta description>` per page

### Phase 2 — Expansion (weeks 4–9)
- [ ] All 22 tournaments in Notion
- [ ] Player dossier pages
- [ ] Archive search / card index
- [ ] Era transition animation
- [ ] Multi-perspective clippings (same match, multiple countries)
- [ ] Custom Umami events (tournament-open, clipping-click, era-jump)
- [ ] Accessibility audit: contrast ratios, keyboard nav, `prefers-reduced-motion`
- [ ] `og:image` per tournament page
- [ ] `sitemap.xml` + `robots.txt`
- [ ] i18n: create `es.json`, `pt.json`, `fr.json` translation files in `src/assets/i18n/`
- [ ] Language detection from browser + `localStorage` persistence

### Phase 3 — World Cup 2026 Module (weeks 8–12, parallel with Phase 2)
- [ ] `/2026` route and module scaffold
- [ ] `NewsFeedService` — RSS parsing server-side
- [ ] `FixturesService` — API-Football integration (results, standings, scorers)
- [ ] Live ticker component
- [ ] Results grid + group standings
- [ ] Knockout bracket
- [ ] Top scorers table
- [ ] Graceful fallback if API-Football is unavailable (show cached data + timestamp)
- [ ] 2026-specific Umami events

### Phase 4 — Flagship (weeks 13–16)
- [ ] Iconic moment pages with multi-source clippings
- [ ] Statistical infographics in era-appropriate style
- [ ] Sound effects (page turn, typewriter on search) with opt-out toggle
- [ ] Mobile version
- [ ] JSON-LD structured data for tournament pages
- [ ] Performance audit: Lighthouse score ≥ 90 on all categories

### Phase 5 — Future (if needed)
- [ ] User accounts + saved favourite clippings (requires backend service)
- [ ] Notion webhook → cache invalidation on content update
- [ ] Comments on clippings
- [ ] Additional locales beyond EN / ES / PT / FR

