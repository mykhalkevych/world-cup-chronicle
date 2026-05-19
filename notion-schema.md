# Notion Database Schema

This file documents the exact structure of each Notion database used by the app.
Create all four databases in Notion, then share each one with your integration.

---

## Setup checklist

1. Go to `notion.so/my-integrations` → **New integration** → name it "World Cup Chronicle"
2. Copy the **Internal Integration Token** → this is your `NOTION_TOKEN`
3. Create the four databases below
4. For each database: open it → `···` menu → **Connections** → add "World Cup Chronicle"
5. Copy each DB ID from its URL: `notion.so/<DB_ID>?v=...` → paste into `.env`

---

## Tournaments

| Property | Type | Notes |
|---|---|---|
| `Name` | Title | e.g. "FIFA World Cup 1986" |
| `Year` | Number | e.g. 1986 |
| `Host Country` | Select | e.g. Mexico |
| `Host Country Code` | Text | e.g. MX |
| `Champion` | Select | e.g. Argentina |
| `Runner Up` | Select | e.g. West Germany |
| `Third Place` | Select | e.g. France |
| `Goals Total` | Number | e.g. 132 |
| `Teams` | Number | e.g. 24 |
| `Top Scorer` | Text | e.g. "Gary Lineker (6)" |
| `Era Class` | Select | One of: era-1930 era-1934 era-1938 era-1950 era-1954 era-1958 era-1962 era-1966 era-1970 era-1974 era-1978 era-1982 era-1986 era-1990 era-1994 era-1998 era-2002 era-2006 era-2010 era-2014 era-2018 era-2022 |
| `Masthead Name` | Text | Newspaper name for this era |
| `Masthead Subtitle` | Text | Newspaper tagline |
| `Summary` | Rich Text | 2–3 sentence tournament overview |

---

## Clippings

| Property | Type | Notes |
|---|---|---|
| `Headline` | Title | Clipping headline |
| `Tournament` | Relation | → Tournaments |
| `Source` | Text | e.g. "Clarín · June 29, 1986" |
| `Country` | Select | Argentina / England / Brazil / … |
| `Type` | Select | match / profile / scandal / reaction |
| `Size` | Select | small / medium / wide / featured |
| `Deck` | Text | Subtitle / lead sentence |
| `Body` | Rich Text | Article body (2–3 paragraphs) |
| `Score` | Text | e.g. "3 : 2" (optional) |
| `Photo Emoji` | Text | e.g. 🏆 (optional photo placeholder) |
| `Photo Caption` | Text | Caption under emoji (optional) |
| `Sort Order` | Number | Display order on the page |
| `Is Featured` | Checkbox | Main clipping — one per tournament |
| `Tags` | Multi-select | goal / controversy / record / reaction / … |

---

## Players

| Property | Type | Notes |
|---|---|---|
| `Name` | Title | e.g. Pelé |
| `Slug` | Text | URL slug, e.g. pele |
| `Country` | Select | e.g. Brazil |
| `Years Active` | Text | e.g. "1958–1970" |
| `Tournaments` | Multi-select | Years as options: 1958, 1962, 1966, 1970 |
| `Goals` | Number | World Cup goals total |
| `Role` | Select | Forward / Midfielder / Goalkeeper / Defender |
| `Nickname` | Text | e.g. "O Rei" (optional) |
| `Bio` | Rich Text | Player dossier body (3–5 paragraphs) |

---

## Moments

| Property | Type | Notes |
|---|---|---|
| `Name` | Title | e.g. "Hand of God" |
| `Slug` | Text | URL slug, e.g. hand-of-god |
| `Tournament` | Relation | → Tournaments |
| `Minute` | Number | Match minute, e.g. 51 |
| `Description` | Rich Text | Full narrative description |
| `Clippings` | Relation | → Clippings (multiple country perspectives) |

---

## Starter content (seed these first)

| Tournament | Era Class | Masthead Name |
|---|---|---|
| 1930 | era-1930 | El Diario del Fútbol |
| 1950 | era-1950 | The Football Correspondent |
| 1970 | era-1970 | The World Cup Bulletin |
| 1986 | era-1986 | El Crónica Deportiva |
| 2022 | era-2022 | The World Cup Chronicle |

Use the **Fjelstul World Cup Database** (`github.com/jfjelstul/worldcup`) as the data source for all historical facts.
