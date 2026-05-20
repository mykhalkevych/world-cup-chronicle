import 'dotenv/config';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const CLIPS_DB = process.env.NOTION_CLIPPINGS_DB;
const TOURS_DB = process.env.NOTION_TOURNAMENTS_DB;

// Fetch tournament IDs by year
async function getTournamentId(year) {
  const res = await notion.databases.query({
    database_id: TOURS_DB,
    filter: { property: 'Year', number: { equals: year } },
  });
  return res.results[0]?.id ?? null;
}

const clippings = [
  // ── 1930 ──
  {
    year: 1930,
    headline: 'Uruguay Champions of the World!',
    deck: 'The hosts defeat Argentina 4–2 in a historic final at the Centenario',
    source: 'El País · 30 de Julio, 1930',
    country: 'Uruguay',
    type: 'match',
    size: 'featured',
    body: 'In front of a delirious crowd of 68,000, Uruguay clinched the first World Cup with a second-half comeback. Trailing 2–1 at the interval, the Celeste turned the match on its head with three goals in the second period. Castro sealed the victory in the dying minutes to send the nation into rapture. The streets of Montevideo ran blue all night.',
    score: '4 : 2',
    photoEmoji: '🏆',
    photoCaption: 'Captain Nasazzi lifts the Jules Rimet Trophy',
    sortOrder: 1,
    isFeatured: true,
    tags: ['final', 'goal', 'record'],
  },
  {
    year: 1930,
    headline: 'Stábile: Eight Goals, One Tournament',
    deck: 'The Argentine striker rewrites the record books in Montevideo',
    source: 'La Nación · 28 de Julio, 1930',
    country: 'Argentina',
    type: 'profile',
    size: 'medium',
    body: 'Guillermo Stábile arrived in Uruguay as a last-minute replacement and departed as the tournament\'s top scorer with eight goals. The Huracán forward was a revelation, his instinctive movement and lethal finishing a contrast to the more methodical forwards of other nations.',
    photoEmoji: '⚽',
    photoCaption: 'Stábile celebrates after another goal',
    sortOrder: 2,
    isFeatured: false,
    tags: ['goal', 'record'],
  },
  {
    year: 1930,
    headline: 'A Triumph Born of Heartbreak',
    deck: 'For Uruguay, this cup was always about more than football',
    source: 'The Times · July 31, 1930',
    country: 'England',
    type: 'reaction',
    size: 'small',
    body: 'The English football establishment watched from afar as the continent crowned its first world champion. Uruguay\'s victory, thoroughly deserved, demonstrated that the game has outgrown these islands. The time may come when England must prove her worth in such a competition.',
    sortOrder: 3,
    isFeatured: false,
    tags: ['reaction'],
  },

  // ── 1950 ──
  {
    year: 1950,
    headline: 'Silêncio no Maracanã',
    deck: 'O Uruguai destrói o sonho do Brasil: 2 a 1 diante de 200.000 almas',
    source: 'O Globo · 17 de Julho, 1950',
    country: 'Brazil',
    type: 'match',
    size: 'featured',
    body: 'Ninguém acreditava que isso pudesse acontecer. O Brasil, que precisava apenas de um empate, viu o sonho desmoronar em 11 minutos de segundo tempo. Ghiggia — que dirá de onde saiu — cruzou pela direita e fuzilou Barbosa no segundo poste. O Maracanã ficou em silêncio absoluto. Um silêncio que dura até hoje.',
    score: '1 : 2',
    photoEmoji: '😢',
    photoCaption: 'Torcedores brasileiros em choque no Maracanã',
    sortOrder: 1,
    isFeatured: true,
    tags: ['final', 'controversy', 'record'],
  },
  {
    year: 1950,
    headline: 'A Miracle in Maracanã',
    deck: 'Uruguay stun the world — and 200,000 Brazilians — to claim the cup',
    source: 'El País · 17 de Julio, 1950',
    country: 'Uruguay',
    type: 'match',
    size: 'wide',
    body: 'They called it the Maracanazo — the Maracanã blow. Uruguay, written off by every correspondent present, produced the greatest upset in the history of the sport. Schiaffino equalised before Ghiggia\'s late winner plunged the host nation into mourning. For Uruguay, it was a miracle. For Brazil, a wound that will never fully heal.',
    score: '2 : 1',
    photoEmoji: '🎉',
    photoCaption: 'Uruguayan players embrace at the final whistle',
    sortOrder: 2,
    isFeatured: false,
    tags: ['final', 'goal'],
  },

  // ── 1970 ──
  {
    year: 1970,
    headline: 'Brazil Perfect — The Greatest Team Ever Assembled',
    deck: 'Six games, six wins, 19 goals — Pelé crowns his finest hour',
    source: 'The Guardian · June 21, 1970',
    country: 'England',
    type: 'match',
    size: 'featured',
    body: 'There are no more arguments. Brazil 1970 are the greatest international side this game has ever produced. They did not merely win the Jules Rimet Trophy — they annexed it with the authority of conquerors. Pelé, playing in what he has declared his final World Cup, was imperious. Jairzinho scored in every match. Rivelino terrorised every defence he met. The 4–1 final against Italy was not even that close.',
    score: '4 : 1',
    photoEmoji: '🌟',
    photoCaption: 'Pelé embraces Carlos Alberto after the final whistle',
    sortOrder: 1,
    isFeatured: true,
    tags: ['final', 'goal', 'record'],
  },
  {
    year: 1970,
    headline: 'Il Gol di Carlos Alberto',
    deck: 'Una combinazione che il calcio non dimenticherà mai',
    source: 'La Gazzetta dello Sport · 22 Giugno, 1970',
    country: 'Italy',
    type: 'match',
    size: 'medium',
    body: 'Nel finale della partita più bella della storia, quando il risultato era già scritto, il Brasile ha regalato al mondo il gol più bello. Una trama di passaggi costruita da un capo all\'altro del campo si è conclusa con il destro fulminante di Carlos Alberto. Anche noi, sconfitti, abbiamo applaudito.',
    photoEmoji: '⚽',
    photoCaption: 'Carlos Alberto segna il quarto gol',
    sortOrder: 2,
    isFeatured: false,
    tags: ['goal', 'record'],
  },

  // ── 1986 ──
  {
    year: 1986,
    headline: '¡La Mano de Dios!',
    deck: 'Maradona marca con la mano, pero Argentina vence a Inglaterra con genio',
    source: 'Clarín · 23 de Junio, 1986',
    country: 'Argentina',
    type: 'match',
    size: 'featured',
    body: 'Primero fue la mano — "un poco con la cabeza, un poco con la mano de Dios", dijo él después con una sonrisa. Luego, cuatro minutos más tarde, llegó el gol del siglo. Sesenta metros, cinco ingleses regados por el camino, un golpe de genio que no tiene nombre. Argentina ganó 2 a 1 y Diego fue al cielo. Hoy, la Ciudad de México perteneció al número 10.',
    score: '2 : 1',
    photoEmoji: '✋',
    photoCaption: 'El gol que el mundo sigue discutiendo',
    sortOrder: 1,
    isFeatured: true,
    tags: ['controversy', 'goal', 'scandal'],
  },
  {
    year: 1986,
    headline: 'Cheating! Maradona\'s Hand Robs England',
    deck: 'The referee misses the most blatant handball in World Cup history',
    source: 'The Daily Mirror · June 23, 1986',
    country: 'England',
    type: 'reaction',
    size: 'wide',
    body: 'Argentina were gifted a goal that should never have stood. Maradona punched the ball into the net with his left fist in full view of 115,000 spectators — everyone in the stadium could see it except, apparently, the Tunisian referee. England\'s protests were waved away. The goal stood. Football was robbed of its integrity in the Azteca today.',
    score: '1 : 2',
    photoEmoji: '😡',
    photoCaption: 'English players surround the referee in protest',
    sortOrder: 2,
    isFeatured: false,
    tags: ['controversy', 'scandal'],
  },
  {
    year: 1986,
    headline: 'The Goal of the Century',
    deck: 'Four minutes later, Maradona showed the world what genius really looks like',
    source: 'The Times · June 23, 1986',
    country: 'England',
    type: 'match',
    size: 'medium',
    body: 'Whatever one thinks of his first goal, the second was beyond all censure and all praise. From inside his own half, Maradona collected the ball, beat one man, beat another, then another, then two more in the penalty area and rolled the ball into the net. It lasted eleven seconds. We have never seen anything like it. We may never again.',
    photoEmoji: '🐐',
    photoCaption: 'Maradona completes the greatest individual goal ever scored',
    sortOrder: 3,
    isFeatured: false,
    tags: ['goal', 'record'],
  },

  // ── 2022 ──
  {
    year: 2022,
    headline: 'Messi. World Champion. Finally.',
    deck: 'Argentina win the greatest final ever played — on penalties after a 3–3 draw',
    source: 'The Athletic · December 18, 2022',
    country: 'Argentina',
    type: 'match',
    size: 'featured',
    body: 'Lionel Messi has his World Cup. After 36 years of waiting, after three lost finals, after decades of being told he was not Maradona, Argentina\'s captain lifted the trophy he was born to hold. The final itself was the most dramatic in the tournament\'s 92-year history: 2–0 up, pegged back to 2–2 by Mbappé\'s brace, ahead again, equalised again in extra time, then victorious on penalties. Sport does not get better than this.',
    score: '3 : 3 (AET)',
    photoEmoji: '🏆',
    photoCaption: 'Messi holds the trophy he was always destined to win',
    sortOrder: 1,
    isFeatured: true,
    tags: ['final', 'record', 'penalty'],
  },
  {
    year: 2022,
    headline: 'Mbappé: Hat-Trick in a Losing Cause',
    deck: 'The Frenchman scored three — and still ended up on the losing side',
    source: 'L\'Équipe · 18 Décembre, 2022',
    country: 'France',
    type: 'match',
    size: 'medium',
    body: 'Kylian Mbappé scored a hat-trick in a World Cup final and lost. It is the most extraordinary sentence in the history of this sport. He was unplayable for twenty minutes at the end of normal time and into extra time, dragging France from the dead. But Argentina — and Messi — had written a different story. One that was not for rewriting.',
    photoEmoji: '💔',
    photoCaption: 'Mbappé after the final whistle — eight goals, no trophy',
    sortOrder: 2,
    isFeatured: false,
    tags: ['goal', 'record'],
  },
];

// Group by year
const byYear = {};
for (const c of clippings) {
  (byYear[c.year] ??= []).push(c);
}

for (const [year, clips] of Object.entries(byYear)) {
  const tournamentId = await getTournamentId(Number(year));
  if (!tournamentId) { console.log('✗ No tournament found for', year); continue; }

  for (const c of clips) {
    await notion.pages.create({
      parent: { database_id: CLIPS_DB },
      properties: {
        'Headline':      { title: [{ text: { content: c.headline } }] },
        'Tournament':    { relation: [{ id: tournamentId }] },
        'Source':        { rich_text: [{ text: { content: c.source } }] },
        'Country':       { select: { name: c.country } },
        'Type':          { select: { name: c.type } },
        'Size':          { select: { name: c.size } },
        'Deck':          { rich_text: [{ text: { content: c.deck } }] },
        'Body':          { rich_text: [{ text: { content: c.body } }] },
        ...(c.score        ? { 'Score':         { rich_text: [{ text: { content: c.score } }] } } : {}),
        ...(c.photoEmoji   ? { 'Photo Emoji':   { rich_text: [{ text: { content: c.photoEmoji } }] } } : {}),
        ...(c.photoCaption ? { 'Photo Caption': { rich_text: [{ text: { content: c.photoCaption } }] } } : {}),
        'Sort Order':    { number: c.sortOrder },
        'Is Featured':   { checkbox: c.isFeatured },
        'Tags':          { multi_select: c.tags.map(t => ({ name: t })) },
      },
    });
    console.log('✓', year, '—', c.headline);
  }
}
