import type { Metadata } from 'next'
import { SubpageShell, PageIntro } from '../components/SubpageShell'

export const metadata: Metadata = {
  title: 'API Documentation — Draft v0',
  description: 'Preview the proposed OddsLoom snapshot and real-time odds update protocol.',
}

const snapshot = `{
  "type": "snapshot",
  "schema_version": "0.1",
  "sequence": 18491,
  "generated_at": "2026-08-07T05:20:00.120Z",
  "events": [{
    "id": "evt_nba_min_den_20260807",
    "sport": "basketball",
    "league": "nba",
    "starts_at": "2026-08-08T00:10:00Z",
    "participants": ["MIN", "DEN"]
  }]
}`

const update = `{
  "type": "odds.update",
  "schema_version": "0.1",
  "sequence": 18492,
  "observed_at": "2026-08-07T05:20:00.432Z",
  "event_id": "evt_nba_min_den_20260807",
  "source": "book_a",
  "market": "spread",
  "outcome": "MIN",
  "line": 5.5,
  "price_american": -105
}`

export default function DocsPage() {
  return (
    <SubpageShell>
      <PageIntro kicker="Developer preview / Draft v0" title="One protocol for a moving market.">
        <p>This documentation describes the current design direction—not a production contract. Fields, naming, transport behavior, and coverage may change before beta.</p>
      </PageIntro>

      <div className="docs-layout">
        <aside className="docs-nav">
          <span>ON THIS PAGE</span>
          <a href="#model">Delivery model</a><a href="#connection">Connection</a><a href="#snapshot">Snapshot</a><a href="#updates">Updates</a><a href="#ordering">Ordering</a><a href="#recovery">Recovery</a>
        </aside>
        <article className="prose docs-content">
          <div className="notice"><strong>DRAFT v0.1</strong><span>Illustrative payloads. No production SLA or compatibility guarantee yet.</span></div>
          <section id="model"><h2>Delivery model</h2><p>OddsLoom is being designed as a stateful real-time feed. A consumer establishes an authenticated WebSocket connection, receives a complete snapshot for its subscriptions, then applies ordered incremental updates.</p><div className="flow-row"><span>CONNECT</span><i>→</i><span>AUTH</span><i>→</i><span>SUBSCRIBE</span><i>→</i><span>SNAPSHOT</span><i>→</i><span>DELTAS</span></div></section>
          <section id="connection"><h2>Connection</h2><p>The proposed production interface uses secure WebSocket transport. Authentication and subscription syntax are still under design.</p><pre><code>wss://feed.oddsloom.com/v1</code></pre><h3>Design goals</h3><ul><li>Explicit schema versions</li><li>Client-selected sports, leagues, sources, and market types</li><li>Heartbeat messages and detectable connection health</li><li>Bounded payload sizes and documented limits</li></ul></section>
          <section id="snapshot"><h2>Initial snapshot</h2><p>A snapshot establishes the complete state for a subscription at a known sequence. Consumers should persist that sequence and apply only subsequent deltas.</p><pre><code>{snapshot}</code></pre></section>
          <section id="updates"><h2>Incremental updates</h2><p>Updates identify a single changed outcome and carry source-aware timing when available. The example below is synthetic.</p><pre><code>{update}</code></pre></section>
          <section id="ordering"><h2>Ordering and time</h2><div className="spec-grid"><div><span>sequence</span><p>Monotonic stream position used to detect gaps.</p></div><div><span>observed_at</span><p>When OddsLoom observed the upstream change.</p></div><div><span>generated_at</span><p>When a snapshot or message was emitted.</p></div><div><span>schema_version</span><p>Payload contract version for compatibility handling.</p></div></div></section>
          <section id="recovery"><h2>Recovery</h2><p>The planned recovery model prioritizes correctness over silently continuing after a gap. If a consumer detects a missing sequence or exceeds the replay window, it should request a fresh snapshot before processing more deltas.</p></section>
          <section className="docs-cta"><span className="section-kicker">Shape the contract</span><h2>Does this model fit your system?</h2><p>Design partners can review the draft schema and tell us what they need before it becomes difficult to change.</p><a className="button primary" href="/beta">Request beta access →</a></section>
        </article>
      </div>
    </SubpageShell>
  )
}
