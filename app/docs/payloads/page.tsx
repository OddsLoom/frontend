import type { Metadata } from 'next'
import { Code, DocsPage, FieldTable, ObjectLabel } from '../_components'

export const metadata: Metadata = { title: 'Payload Catalog | OddsLoom API', description: 'Executable v1 snapshot, state, odds, source, and manifest payloads.' }

const snapshot = `{
  "schema_version": "1",
  "type": "state.snapshot",
  "sequence": 1,
  "snapshot_position": 1,
  "message_id": "550e8400-e29b-41d4-a716-446655440010",
  "emitted_at": "2026-08-12T15:20:00.120Z",
  "effective_scope": { ... },
  "coverage_manifest": [ ... ],
  "sources": [ ... ],
  "snapshot": {
    "sports": [ ... ], "leagues": [ ... ],
    "participants": [ ... ], "events": [ ... ],
    "markets": [ ... ], "outcomes": [ ... ], "quotes": [ ... ]
  }
}`

const entityUpsert = `{
  "schema_version": "1", "type": "state.upsert", "sequence": 1,
  "message_id": "550e8400-e29b-41d4-a716-446655440011",
  "emitted_at": "2026-08-12T15:20:00.400Z",
  "entity_type": "event",
  "entity": { ... }
}`

const oddsUpsert = `{
  "schema_version": "1", "type": "odds.upsert", "sequence": 3,
  "message_id": "550e8400-e29b-41d4-a716-446655440012",
  "emitted_at": "2026-08-12T15:20:00.438Z",
  "quote": {
    "id": "quote_01...", "eventId": "evt_01...",
    "marketId": "mkt_01...", "outcomeId": "out_01...",
    "bookId": "draftkings", "jurisdiction": "US-IL",
    "availability": "open", "line": 5.5,
    "price": { "american": -105, "decimal": 1.9524 },
    "source": { "eventId": "src_evt_01...", "marketId": "src_mkt_01...", "selectionId": "src_sel_01..." },
    "observedAt": "2026-08-12T15:20:00.432Z"
  }
}`

const removal = `{
  "schema_version": "1", "type": "odds.remove", "sequence": 3,
  "message_id": "550e8400-e29b-41d4-a716-446655440013",
  "emitted_at": "2026-08-12T15:20:01.014Z",
  "quote_id": "quote_01..."
}`

const sourceStatus = `{
  "schema_version": "1", "type": "source.status", "sequence": 4,
  "message_id": "550e8400-e29b-41d4-a716-446655440014",
  "emitted_at": "2026-08-12T15:20:15.000Z",
  "sources": [{
    "book_id": "draftkings", "jurisdiction": "US-IL",
    "phase": "live", "status": "degraded",
    "last_success_at": "2026-08-12T15:19:59.000Z"
  }]
}`

export default function PayloadsPage() {
  return <DocsPage current="/docs/payloads" title="Every message has one job." lede="These v1 shapes mirror the executable delivery service and machine-readable OpenAPI and AsyncAPI contracts." next={['/docs/reliability', 'Understand reliability']}>
    <section><h2>Catalog</h2><div className="payload-matrix"><div><code>session.authenticated</code><span>First-frame authentication succeeded.</span><b>CONTROL</b></div><div><code>subscription.accepted</code><span>The snapshot position and effective scope were accepted at sequence 0.</span><b>CONTROL</b></div><div><code>state.snapshot</code><span>Complete canonical REST state with a short-lived stream position.</span><b>STATE</b></div><div><code>state.upsert</code><span>Fully replace a canonical reference entity.</span><b>DELTA</b></div><div><code>state.remove</code><span>Remove a reference entity in dependency-safe order.</span><b>DELTA</b></div><div><code>odds.upsert</code><span>Create or fully replace one quote.</span><b>DELTA</b></div><div><code>odds.remove</code><span>Explicitly remove one quote.</span><b>DELTA</b></div><div><code>source.status</code><span>Report streaming or degraded source state.</span><b>CONTROL</b></div><div><code>coverage.manifest</code><span>Announce release-gate changes before removals.</span><b>CONTROL</b></div></div></section>
    <section><ObjectLabel>STATE / V1</ObjectLabel><h2>state.snapshot</h2><p>The REST endpoint returns a complete graph-safe snapshot. It contains canonical markets only, the effective scope, exact release gates, source status, and the short-lived position the WebSocket subscription must declare.</p><Code>{snapshot}</Code><FieldTable rows={[["schema_version","string","Always 1 on this route."],["snapshot_position","integer","Must still be current when creating the matching stream subscription."],["message_id","UUID","Unique message identifier."],["emitted_at","RFC 3339","OddsLoom publication time."],["snapshot","object","Complete canonical graph for the effective scope."]]} /></section>
    <section><ObjectLabel>DELTA / V1</ObjectLabel><h2>state.upsert</h2><p>Additions and corrections replace a complete canonical entity. Upserts arrive in dependency order: sport, league, participant, event, market, outcome, then quote.</p><Code>{entityUpsert}</Code></section>
    <section><ObjectLabel>DELTA / V1</ObjectLabel><h2>odds.upsert</h2><p>Create or replace one quote. A suspension is an upsert with <code>availability: suspended</code>; a correction is a replacement at a higher sequence.</p><Code>{oddsUpsert}</Code></section>
    <section><ObjectLabel>DELTA / V1</ObjectLabel><h2>Explicit removals</h2><p><code>odds.remove</code> removes a quote. <code>state.remove</code> uses <code>entity_type</code> and <code>entity_id</code>. Removals arrive quote-first so references never dangle.</p><Code>{removal}</Code></section>
    <section><ObjectLabel>SOURCE / V1</ObjectLabel><h2>source.status</h2><p>When a released source becomes stale or fails, OddsLoom reports it as degraded and removes its last-known quotes rather than presenting them as current.</p><Code>{sourceStatus}</Code></section>
    <section><h2>Publication and observation time</h2><p>The envelope’s <code>emitted_at</code> is when OddsLoom published the state. A quote’s <code>observedAt</code> is when OddsLoom observed the provider state; source-provided clocks may be absent and are not invented.</p></section>
  </DocsPage>
}
