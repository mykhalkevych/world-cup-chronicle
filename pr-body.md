## Summary

- Scaffold Angular 21 SSR project with full newspaper archive design system (8 era themes, paper textures, typography, animations)
- Core services: `NotionService` (server-side only + TransferState), `CacheService`, `EraThemeService`, `AnalyticsService` (Umami)
- All routes with SSR resolvers: home, `/tournament/:year`, `/player/:slug`, `/moment/:slug`, `/archive`, `/2026` (lazy), 404
- i18n: EN / ES / PT / FR via `@ngx-translate`, with `TranslateServerLoader` for SSR (no double-fetch)
- Home page: era-sectioned layout — paper tone shifts from sepia to white as you scroll through decades
- View Transitions API wired into router for smooth page-to-page animations
- Config: `.mcp.json` (Notion + Firebase MCP servers), `apphosting.yaml` (Firebase App Hosting), `.env.example`, `notion-schema.md`

## Test plan

- [ ] `npm run build` passes with zero errors
- [ ] `npm start` serves the app at http://localhost:4200
- [ ] Home page renders all 22 + 2026 tournaments organised by era section
- [ ] Navigating to `/tournament/1986` applies `era-1986` class to body (sepia tone)
- [ ] Navigating back to home clears the era class
- [ ] `/archive` search form renders correctly
- [ ] `/2026` renders the live section with breaking badge and score boxes
- [ ] 404 route renders the "CORRECTION" notice
- [ ] Language switcher cycles EN / ES / PT / FR

🤖 Generated with [Claude Code](https://claude.ai/claude-code)
