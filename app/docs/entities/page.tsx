import type { Metadata } from 'next'
import { Code, DocsPage, FieldTable, ObjectLabel } from '../_components'

export const metadata: Metadata = { title: 'Entity Model | OddsLoom API', description: 'Canonical v1 entities for the OddsLoom real-time odds feed.' }

const participant = [
  '{',
  '  "id": "participant_nba_min",',
  '  "type": "team",',
  '  "name": "Minnesota Timberwolves",',
  '  "sportId": "sport_basketball",',
  '  "leagueId": "league_nba"',
  '}',
].join('\n')

const event = [
  '{',
  '  "id": "event_nba_20260808_min_den",',
  '  "sportId": "sport_basketball",',
  '  "leagueId": "league_nba",',
  '  "name": "Minnesota Timberwolves at Denver Nuggets",',
  '  "startsAt": "2026-08-08T00:10:00Z",',
  '  "phase": "pregame",',
  '  "status": "scheduled",',
  '  "participants": [',
  '    { "participantId": "participant_nba_min", "role": "away" },',
  '    { "participantId": "participant_nba_den", "role": "home" }',
  '  ]',
  '}',
].join('\n')

const market = [
  '{',
  '  "id": "market_evt_min_den_full_game_spread",',
  '  "eventId": "event_nba_20260808_min_den",',
  '  "type": "spread",',
  '  "period": "full_game",',
  '  "variant": "standard",',
  '  "status": "open",',
  '  "normalization": "canonical"',
  '}',
].join('\n')

const quote = [
  '{',
  '  "id": "quote_book_a_market_123_outcome_min",',
  '  "eventId": "event_nba_20260808_min_den",',
  '  "marketId": "market_evt_min_den_full_game_spread",',
  '  "outcomeId": "outcome_min",',
  '  "bookId": "draftkings",',
  '  "jurisdiction": "US-IL",',
  '  "availability": "open",',
  '  "line": 5.5,',
  '  "price": { "american": -105, "decimal": 1.9524 },',
  '  "source": { "eventId": "src_evt_123", "marketId": "src_mkt_123", "selectionId": "src_sel_123" },',
  '  "observedAt": "2026-08-07T05:20:00.432Z"',
  '}',
].join('\n')

export default function EntitiesPage() {
  return <DocsPage current="/docs/entities" title="Stable objects beneath moving prices." lede="Provider records are normalized into canonical OddsLoom entities. High-frequency quotes reference these objects by ID instead of repeating descriptive data on every update." next={['/docs/payloads', 'Review every payload']}>
    <section><h2>Relationship map</h2><div className="entity-flow"><span>SPORT</span><i>→</i><span>LEAGUE</span><i>→</i><span>EVENT</span><i>→</i><span>MARKET</span><i>→</i><span>OUTCOME</span><i>→</i><span>QUOTE</span></div><p>Participants attach to events and outcomes. Books own quotes; they do not own the canonical market definition.</p></section>
    <section><ObjectLabel>OBJECT / PARTICIPANT / V1 EXAMPLE</ObjectLabel><h2>Participant</h2><p>A participant can represent a team, player, pairing, or field entry. This keeps team sports ergonomic without forcing every sport into a home-versus-away model.</p><Code>{participant}</Code><FieldTable rows={[["id","string","Stable OddsLoom participant ID."],["type","enum","team, player, pairing, field, or unknown."],["name","string","Canonical display name."],["sportId","string","Parent sport reference."],["leagueId","string?","Primary league reference when applicable."]]} /></section>
    <section><ObjectLabel>OBJECT / EVENT / V1 EXAMPLE</ObjectLabel><h2>Event</h2><p>The scheduled or active contest. Roles belong to the event relationship, not the participant, because the same team can be home in one event and away in another.</p><Code>{event}</Code><FieldTable rows={[["id","string","Stable OddsLoom event ID."],["sportId","string","Canonical sport reference."],["leagueId","string","Canonical league reference."],["startsAt","RFC 3339?","Current scheduled start when known."],["phase","enum","pregame, live, or complete."],["status","enum","scheduled, active, suspended, final, or unknown."],["participants","array","Participant IDs and event-specific roles."]]} /></section>
    <section><ObjectLabel>OBJECT / MARKET / V1 EXAMPLE</ObjectLabel><h2>Market and outcome</h2><p>A market defines the proposition being priced. Outcomes are separate canonical objects referencing the market. A sportsbook changing price or line does not create a new event object.</p><Code>{market}</Code><FieldTable rows={[["id","string","Canonical market ID."],["eventId","string","Event being priced."],["type","string","Canonical market family; every classified family in released scope is eligible."],["period","string","Canonical contest segment."],["variant","string","Canonical market variant."],["status","enum","open, suspended, or closed."],["normalization","enum","Customer output is always canonical."]]} /></section>
    <section><ObjectLabel>OBJECT / QUOTE / V1 EXAMPLE</ObjectLabel><h2>Quote</h2><p>The quote is the mutable edge: one book’s current offer for one outcome in one jurisdiction. Each upsert carries the full replacement state; the containing envelope’s <code>emitted_at</code> is its OddsLoom publication time.</p><Code>{quote}</Code><FieldTable rows={[["id","string","Identity for the book/market/outcome offer."],["marketId","string","Canonical market reference."],["outcomeId","string","Canonical outcome reference."],["bookId","string","Book offering the price."],["jurisdiction","string","Region from which the offer was observed."],["availability","enum","open, suspended, or closed."],["line","number?","Handicap or total where applicable."],["price","object","American and/or decimal forms supplied by normalization."],["observedAt","RFC 3339","Time OddsLoom observed the source state."]]} /></section>
    <section><h2>Canonicalization boundary</h2><p>Every canonical market observed within the released live manifest can enter the customer product. <code>provider_specific</code> and unresolved offers remain internal: OddsLoom does not present them as comparable canonical markets.</p></section>
  </DocsPage>
}
