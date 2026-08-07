import type { Metadata } from 'next'
import { SubpageShell, PageIntro } from '../components/SubpageShell'

export const metadata: Metadata = {
  title: 'API Documentation — Draft v0.2',
  description: 'Explore the proposed OddsLoom real-time odds protocol, entities, payloads, ordering, and recovery model.',
}

const envelope = `{
  "type": "odds.upsert",
  "schema_version": "0.2",
  "message_id": "msg_01J5Y7M4T6K8",
  "sequence": 18492,
  "emitted_at": "2026-08-07T05:20:00.438Z",
  "data": { ... }
}`

const team = `{
  "id": "team_nba_min",
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
  "status": "scheduled",
  "participants": [
    { "id": "team_nba_min", "type": "team", "role": "away" },
    { "id": "team_nba_den", "type": "team", "role": "home" }
  ]
}`

const market = `{
  "id": "market_event_nba_20260808_min_den_full_game_spread",
  "event_id": "event_nba_20260808_min_den",
  "type": "spread",
  "period": "full_game",
  "status": "open",
  "outcomes": [
    { "id": "outcome_min", "participant_id": "team_nba_min", "side": "away" },
    { "id": "outcome_den", "participant_id": "team_nba_den", "side": "home" }
  ]
}`

const quote = `{
  "id": "quote_book_a_market_123_outcome_min",
  "event_id": "event_nba_20260808_min_den",
  "market_id": "market_event_nba_20260808_min_den_full_game_spread",
  "outcome_id": "outcome_min",
  "book_id": "book_a",
  "jurisdiction": "US-IL",
  "status": "open",
  "line": 5.5,
  "price": { "american": -105, "decimal": 1.9524 },
  "source_updated_at": null,
  "observed_at": "2026-08-07T05:20:00.432Z"
}`

const snapshot = `{
  "type": "snapshot",
  "schema_version": "0.2",
  "message_id": "msg_01J5Y7M0KJAC",
  "sequence": 18491,
  "emitted_at": "2026-08-07T05:20:00.120Z",
  "data": {
    "subscription_id": "sub_01J5Y7KZXN",
    "sports": [ ... ],
    "leagues": [ ... ],
    "participants": [ ... ],
    "events": [ ... ],
    "markets": [ ... ],
    "books": [ ... ],
    "quotes": [ ... ]
  }
}`

const update = `{
  "type": "odds.upsert",
  "schema_version": "0.2",
  "message_id": "msg_01J5Y7M4T6K8",
  "sequence": 18492,
  "emitted_at": "2026-08-07T05:20:00.438Z",
  "data": {
    "quote": ${quote.replaceAll('\n', '\n    ')}
  }
}`

const removal = `{
  "type": "odds.remove",
  "schema_version": "0.2",
  "message_id": "msg_01J5Y7M8PQQ1",
  "sequence": 18493,
  "emitted_at": "2026-08-07T05:20:01.014Z",
  "data": {
    "quote_id": "quote_book_a_market_123_outcome_min",
    "reason": "market_closed",
    "observed_at": "2026-08-07T05:20:01.009Z"
  }
}`

const FieldTable = ({ rows }: { rows: [string, string, string][] }) => <div className="field-table">{rows.map(([field, type, meaning]) => <div key={field}><code>{field}</code><b>{type}</b><span>{meaning}</span></div>)}</div>

export default function DocsPage() {
  return (
    <SubpageShell>
      <PageIntro kicker="Developer preview / Draft v0.2" title="A contract for every move.">
        <p>This is the working design for OddsLoom’s normalized real-time feed. It is detailed enough to review and challenge, but remains a pre-beta proposal rather than a production compatibility promise.</p>
      </PageIntro>

      <div className="docs-layout">
        <aside className="docs-nav">
          <span>ON THIS PAGE</span>
          <a href="#principles">Principles</a><a href="#envelope">Envelope</a><a href="#types">Payload types</a><a href="#entities">Entity model</a><a href="#participant">Participant</a><a href="#event">Event</a><a href="#market">Market</a><a href="#quote">Quote</a><a href="#snapshot">Snapshot</a><a href="#updates">Updates</a><a href="#ordering">Ordering</a><a href="#recovery">Recovery</a>
        </aside>
        <article className="prose docs-content">
          <div className="notice"><strong>DRAFT v0.2</strong><span>Names and shapes are proposed. Examples are synthetic; measured latency and final coverage are not yet claimed.</span></div>

          <section id="principles"><h2>Contract principles</h2><div className="spec-grid"><div><span>Canonical entities</span><p>Consumers integrate with OddsLoom IDs, while provider IDs remain internal mappings.</p></div><div><span>Explicit state</span><p>Open, suspended, closed, and removed are represented rather than inferred.</p></div><div><span>Lossless timing</span><p>Source, observation, and emission timestamps stay distinct when available.</p></div><div><span>Ordered changes</span><p>Every state-changing message has a monotonically increasing stream sequence.</p></div></div></section>

          <section id="envelope"><h2>Message envelope</h2><p>Every server message uses the same top-level envelope. Message-specific content lives under <code>data</code>, keeping routing fields predictable.</p><pre><code>{envelope}</code></pre><FieldTable rows={[["type","string","Discriminator for the payload shape."],["schema_version","string","Contract version used to decode the message."],["message_id","string","Globally unique message identifier for tracing and deduplication."],["sequence","integer","Monotonic position within the subscribed stream."],["emitted_at","RFC 3339","Time OddsLoom emitted the message."],["data","object","Payload determined by type."]]} /></section>

          <section id="types"><h2>Payload types</h2><p>The initial protocol is intentionally small. Entity definitions arrive in snapshots; the hot path carries quote and event changes.</p><div className="payload-matrix"><div><code>session.ready</code><span>Connection accepted, heartbeat interval and recovery limits.</span><b>CONTROL</b></div><div><code>snapshot</code><span>Complete state for the active subscription at one sequence.</span><b>STATE</b></div><div><code>odds.upsert</code><span>Create or replace the current quote for one book and outcome.</span><b>DELTA</b></div><div><code>odds.remove</code><span>Remove a quote that is no longer offered or valid.</span><b>DELTA</b></div><div><code>event.update</code><span>Change event status, start time, score, or clock.</span><b>DELTA</b></div><div><code>heartbeat</code><span>Connection liveness and latest server sequence.</span><b>CONTROL</b></div><div><code>error</code><span>Machine-readable request or subscription failure.</span><b>CONTROL</b></div></div></section>

          <section id="entities"><h2>Entity model</h2><p>Definitions are normalized once and referenced by ID from the high-volume quote stream.</p><div className="entity-flow"><span>SPORT</span><i>→</i><span>LEAGUE</span><i>→</i><span>EVENT</span><i>→</i><span>MARKET</span><i>→</i><span>OUTCOME</span><i>→</i><span>QUOTE</span></div><p>A <strong>participant</strong>—usually a team or player—connects to an event and its outcomes. A <strong>book</strong> owns quotes, not canonical markets.</p></section>

          <section id="participant"><span className="doc-object-label">OBJECT / PARTICIPANT</span><h2>Team, player, or field</h2><p>We use <code>participant</code> as the shared concept and discriminate with <code>type</code>. Team sports can reference stable team objects without making the entire protocol team-specific.</p><pre><code>{team}</code></pre><FieldTable rows={[["id","string","Stable OddsLoom participant ID."],["type","enum","team, player, pairing, or field."],["name","string","Canonical display name."],["abbreviation","string?","Common short label when one exists."],["sport_id","string","Parent sport."],["league_id","string?","Primary league when applicable."]]} /></section>

          <section id="event"><span className="doc-object-label">OBJECT / EVENT</span><h2>Event</h2><p>An event is the scheduled or live contest. Participant roles express home/away or other positions without encoding them into IDs.</p><pre><code>{event}</code></pre><FieldTable rows={[["id","string","Stable OddsLoom event ID."],["sport_id","string","Canonical sport reference."],["league_id","string","Canonical league or competition reference."],["name","string","Human-readable event label."],["starts_at","RFC 3339","Current scheduled start time."],["status","enum","scheduled, live, delayed, suspended, final, or cancelled."],["participants","array","Participant references and event-specific roles."]]} /></section>

          <section id="market"><span className="doc-object-label">OBJECT / MARKET</span><h2>Market and outcome</h2><p>A market describes what is being priced; outcomes describe the possible sides. Sportsbooks do not define separate canonical markets merely because their prices differ.</p><pre><code>{market}</code></pre><FieldTable rows={[["id","string","Stable canonical market ID."],["event_id","string","Event being priced."],["type","enum","moneyline, spread, total, team_total, player_prop, and future extensions."],["period","enum","full_game, first_half, first_quarter, or sport-specific period."],["status","enum","open, suspended, or closed."],["outcomes","array","Canonical sides that can receive book quotes."]]} /></section>

          <section id="quote"><span className="doc-object-label">OBJECT / QUOTE</span><h2>Book quote</h2><p>A quote is the mutable edge of the model: one sportsbook’s current offer for one outcome in one jurisdiction. Upserts replace the full current quote, avoiding ambiguous partial patches.</p><pre><code>{quote}</code></pre><FieldTable rows={[["id","string","Stable identity for this book/market/outcome offer."],["market_id","string","Canonical market reference."],["outcome_id","string","Canonical outcome reference."],["book_id","string","Sportsbook offering the price."],["jurisdiction","string","Regulated region from which the quote was observed."],["status","enum","open, suspended, or closed."],["line","number?","Handicap or total; absent for pure moneyline markets."],["price","object","American and decimal representations of the same price."],["source_updated_at","RFC 3339?","Provider timestamp when supplied; null otherwise."],["observed_at","RFC 3339","Time OddsLoom observed the source state."]]} /></section>

          <section id="snapshot"><h2>Initial snapshot</h2><p>After subscription, the server sends complete reference and quote state at a known sequence. Consumers build local maps keyed by ID, then apply later deltas.</p><pre><code>{snapshot}</code></pre><p>The snapshot is scoped to the subscription. An NBA-only subscriber will not receive unrelated sports, events, or books.</p></section>

          <section id="updates"><h2>Incremental updates</h2><h3>Upsert a quote</h3><p>An upsert carries the complete latest quote. It is idempotent by quote ID and newer stream sequence.</p><pre><code>{update}</code></pre><h3>Remove a quote</h3><p>A removal is explicit and includes a reason so a consumer can distinguish normal market closure from source loss or correction.</p><pre><code>{removal}</code></pre></section>

          <section id="ordering"><h2>Ordering and time</h2><div className="spec-grid"><div><span>sequence</span><p>Strictly increasing within a stream. A jump indicates a gap.</p></div><div><span>source_updated_at</span><p>When the provider says it changed, if supplied.</p></div><div><span>observed_at</span><p>When OddsLoom saw the source state.</p></div><div><span>emitted_at</span><p>When OddsLoom delivered the normalized message.</p></div></div><p>Consumers should use <code>sequence</code> for state ordering. Timestamps describe latency and provenance, not delivery order.</p></section>

          <section id="recovery"><h2>Recovery</h2><p>If a sequence gap is detected, the consumer pauses delta application and requests replay from its last committed sequence. If that position has expired from the replay window, the server sends a fresh snapshot. Silent continuation after a gap is never considered safe.</p><div className="flow-row"><span>GAP DETECTED</span><i>→</i><span>PAUSE</span><i>→</i><span>REPLAY</span><i>or</i><span>RESNAPSHOT</span><i>→</i><span>RESUME</span></div></section>

          <section className="docs-cta"><span className="section-kicker">Shape the contract</span><h2>What would you change?</h2><p>The most useful beta feedback is specific: missing market identity, participant edge cases, timing semantics, or recovery behavior your system cannot accept.</p><a className="button primary" href="/beta">Request beta access →</a></section>
        </article>
      </div>
    </SubpageShell>
  )
}
