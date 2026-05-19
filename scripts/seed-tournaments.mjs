import 'dotenv/config';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB = process.env.NOTION_TOURNAMENTS_DB;

const tournaments = [
  {
    name: 'FIFA World Cup 1930',
    year: 1930,
    host: 'Uruguay', code: 'UY',
    champion: 'Uruguay', runnerUp: 'Argentina', third: 'USA',
    goals: 70, teams: 13,
    topScorer: 'Guillermo Stábile (8)',
    eraClass: 'era-1930',
    masthead: 'El Cronista del Fútbol',
    mastheadSub: 'Montevideo, Uruguay · Julio 1930',
    summary: 'The inaugural World Cup, hosted in Uruguay to celebrate the centenary of Uruguayan independence. Thirteen nations competed, with the hosts defeating Argentina 4–2 in the final before a crowd of 68,000 at the Estadio Centenario.',
  },
  {
    name: 'FIFA World Cup 1950',
    year: 1950,
    host: 'Brazil', code: 'BR',
    champion: 'Uruguay', runnerUp: 'Brazil', third: 'Sweden',
    goals: 88, teams: 13,
    topScorer: 'Ademir (9)',
    eraClass: 'era-1950',
    masthead: 'The Football Correspondent',
    mastheadSub: 'Rio de Janeiro · July 1950',
    summary: 'The tournament that gave football its greatest upset — the Maracanazo. Uruguay defeated hosts Brazil 2–1 in the deciding final-round match before 200,000 devastated Brazilians at the Maracanã, silencing the largest crowd in football history.',
  },
  {
    name: 'FIFA World Cup 1970',
    year: 1970,
    host: 'Mexico', code: 'MX',
    champion: 'Brazil', runnerUp: 'Italy', third: 'West Germany',
    goals: 95, teams: 16,
    topScorer: 'Gerd Müller (10)',
    eraClass: 'era-1970',
    masthead: 'The World Cup Bulletin',
    mastheadSub: 'Mexico City · June–July 1970',
    summary: 'Widely regarded as the greatest World Cup ever played. Brazil\'s all-conquering side — Pelé, Jairzinho, Rivelino, Tostão — won all six matches and lifted the Jules Rimet Trophy permanently with a 4–1 demolition of Italy in the final.',
  },
  {
    name: 'FIFA World Cup 1986',
    year: 1986,
    host: 'Mexico', code: 'MX',
    champion: 'Argentina', runnerUp: 'West Germany', third: 'France',
    goals: 132, teams: 24,
    topScorer: 'Gary Lineker (6)',
    eraClass: 'era-1986',
    masthead: 'La Crónica Deportiva',
    mastheadSub: 'Ciudad de México · Junio–Julio 1986',
    summary: 'Diego Maradona\'s tournament. In the space of four minutes against England in the quarter-final he scored the most controversial goal in history — the Hand of God — and then the greatest individual goal ever seen. Argentina won the final 3–2 against West Germany.',
  },
  {
    name: 'FIFA World Cup 2022',
    year: 2022,
    host: 'Qatar', code: 'QA',
    champion: 'Argentina', runnerUp: 'France', third: 'Croatia',
    goals: 172, teams: 32,
    topScorer: 'Kylian Mbappé (8)',
    eraClass: 'era-2022',
    masthead: 'The World Cup Chronicle',
    mastheadSub: 'Doha, Qatar · November–December 2022',
    summary: 'Lionel Messi finally claimed the one trophy that had eluded him, leading Argentina to glory in the greatest World Cup final ever played. After a 3–3 draw — Mbappé scoring a hat-trick — Argentina prevailed on penalties to end a 36-year wait.',
  },
];

for (const t of tournaments) {
  const res = await notion.pages.create({
    parent: { database_id: DB },
    properties: {
      'Name':              { title: [{ text: { content: t.name } }] },
      'Year':              { number: t.year },
      'Host Country':      { select: { name: t.host } },
      'Host Country Code': { rich_text: [{ text: { content: t.code } }] },
      'Champion':          { select: { name: t.champion } },
      'Runner Up':         { select: { name: t.runnerUp } },
      'Third Place':       { select: { name: t.third } },
      'Goals Total':       { number: t.goals },
      'Teams':             { number: t.teams },
      'Top Scorer':        { rich_text: [{ text: { content: t.topScorer } }] },
      'Era Class':         { select: { name: t.eraClass } },
      'Masthead Name':     { rich_text: [{ text: { content: t.masthead } }] },
      'Masthead Subtitle': { rich_text: [{ text: { content: t.mastheadSub } }] },
      'Summary':           { rich_text: [{ text: { content: t.summary } }] },
    },
  });
  console.log('✓', t.year, t.name, '-', res.id);
}
