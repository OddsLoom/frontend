import type { Metadata } from 'next'
import { Code, DocsPage, FieldTable, ObjectLabel } from '../_components'

export const metadata: Metadata = { title: 'Entity Model | OddsLoom API', description: 'Draft canonical entities for the OddsLoom real-time odds feed.' }

const participant = `{
  "id": "participant_nba_min",
  "type": "team",
  "name": "Minnesota Timberwolves",
  "abbreviation": "MIN",
  "sport_id": "sport_basketball",
  "league_id": "league_nba"
}`
const event = `{
  "id": "event_nba_20260808_min_den",
  "sport_id": "sport_basketball",
  "league_id": "league_nba",
  "name": "Minnesota Timberwolves at Denver Nuggets",
  "starts_at": "2026-08-08T00:10:00Z",
  "phase": "pregame",
  "status": "scheduled",
  "participants": [
    { "participant_id": "participant_nba_min", "role": "away" },
    { "participant_id": "participant_nba_den", "role": "home" }
  ]
}`
const market = `{
  "id": "market_evt_min_den_full_game_spread",
  "event_id": "event_nba_20260808_min_den",
  "type": "spread",
  "period": "full_game",
  "status": "open",
  "outcomes": [
    { "id": "outcome_min", "participant_id": "participant_nba_min" },
    { "id": "outcome_den", "participant_id": "participant_nba_den" }
  ]
}`
const quote = `{
  "id": "quote_book_a_market_123_outcome_min",
  "event_id": "event_nba_20260808_min_den",
  "market_id": "market_evt_min_den_full_game_spread",
  "outcome_id": "outcome_min",
  "book_id": "book_a",
  "jurisdiction": "US-IL",
  "availability": "open",
  "line": 5.5,
  "price": { "american": -105, "decimal": 1.9524 },
  "source_updated_at": null,
  "observed_at": "2026-08-07T05:20:00.432Z"
}`

export default function EntitiesPage() {
  return <DocsPage current="/docs/entities" title="Stable objects beneath moving prices." lede="Provider records are normalized into canonical OddsLoom entities. High-frequency quotes reference these objects by ID instead of repeating descriptive data on every update." next={['/docs/payloads', 'Review every payload']}>
    <section><h2>Relationship map</h2><div className="entity-flow"><span>SPORT</span><i>→</i><span>LEAGUE</span><i>→</i><span>EVENT</span><i>→</i><span>MARKET</span><i>→</i><span>OUTCOME</span><i>→</i><span>QUOTE</span></div><p>Participants attach to events and outcomes. Books own quotes; they do not own the canonical market definition.</p></section>
    <section><ObjectLabel>OBJECT / PARTICIPANT</ObjectLabel><h2>Participant</h2><p>A participant can represent a team, player, pairing, or field entry. This keeps team sports ergonomic without forcing every sport into a home-versus-away model.</p><Code>{participant}</Code><FieldTable rows={[["id","string","Stable OddsLoom participant ID."],["type","enum","team, player, pairing, or field."],["name","string","Canonical display name."],["abbreviation","string?","Common short label when applicable."],["sport_id","string","Parent sport reference."],["league_id","string?","Primary league reference when applicable."]]} /></section>
    <section><ObjectLabel>OBJECT / EVENT</ObjectLabel><h2>Event</h2><p>The scheduled or active contest. Roles belong to the event relationship, not the participant, because the same team can be home in one event and away in another.</p><Code>{event}</Code><FieldTable rows={[["id","string","Stable OddsLoom event ID."],["sport_id","string","Canonical sport reference."],["league_id","string","Canonical league reference."],["starts_at","RFC 3339","Current scheduled start."],["phase","enum","pregame, live, or complete."],["status","enum","scheduled, delayed, active, suspended, final, postponed, or cancelled."],["participants","array","Participant IDs and event-specific roles."]]} /></section>
    <section><ObjectLabel>OBJECT / MARKET</ObjectLabel><h2>Market and outcome</h2><p>A market defines the proposition being priced. Outcomes define its canonical sides. A sportsbook changing price or line does not create a new event object.</p><Code>{market}</Code><FieldTable rows={[["id","string","Canonical market ID."],["event_id","string","Event being priced."],["type","enum","Initial families include moneyline, spread, and total."],["period","enum","Canonical contest segment such as full_game or first_half."],["status","enum","open, suspended, or closed."],["outcomes","array","Canonical sides eligible for quotes."]]} /></section>
    <section><ObjectLabel>OBJECT / QUOTE</ObjectLabel><h2>Quote</h2><p>The quote is the mutable edge: one book’s current offer for one outcome in one jurisdiction. Each upsert carries the full replacement state.</p><Code>{quote}</Code><FieldTable rows={[["id","string","Identity for the book/market/outcome offer."],["market_id","string","Canonical market reference."],["outcome_id","string","Canonical outcome reference."],["book_id","string","Book offering the price."],["jurisdiction","string","Region from which the offer was observed."],["availability","enum","open, suspended, or closed."],["line","number?","Handicap or total where applicable."],["price","object","Equivalent American and decimal forms."],["source_updated_at","RFC 3339?","Provider time when supplied."],["observed_at","RFC 3339","Time OddsLoom observed the source state."]]} /></section>
    <section><h2>Identity rules still to settle</h2><ul><li>Whether postponed events retain IDs after substantial rescheduling</li><li>How participant mergers, renames, and corrections are communicated</li><li>How alternate lines affect market identity versus quote identity</li><li>Whether provider-native IDs are exposed as optional provenance</li></ul></section>
  </DocsPage>
}
