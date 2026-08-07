import type { Metadata } from 'next'
import { Code, DocsPage, FieldTable, ObjectLabel } from '../_components'

export const metadata: Metadata = { title: 'Protocol | OddsLoom API', description: 'Draft connection, authentication, and subscription protocol for OddsLoom.' }

const auth = `{
  "type": "session.authenticate",
  "request_id": "req_01J5Y7JVB6",
  "data": { "api_key": "ol_test_••••••••" }
}`

const ready = `{
  "type": "session.ready",
  "schema_version": "0.3",
  "message_id": "msg_01J5Y7K2DX",
  "sequence": 0,
  "emitted_at": "2026-08-07T05:19:59.981Z",
  "data": {
    "session_id": "ses_01J5Y7K1Y7",
    "environment": "sandbox",
    "heartbeat_interval_ms": 15000,
    "resume_supported": true
  }
}`

const subscribe = `{
  "type": "subscription.create",
  "request_id": "req_01J5Y7KZXN",
  "data": {
    "sports": ["basketball"],
    "leagues": ["nba"],
    "books": ["book_a", "book_b"],
    "market_types": ["moneyline", "spread", "total"],
    "event_phase": ["pregame", "live"]
  }
}`

const accepted = `{
  "type": "subscription.ready",
  "schema_version": "0.3",
  "message_id": "msg_01J5Y7M0A2",
  "sequence": 18490,
  "emitted_at": "2026-08-07T05:20:00.041Z",
  "data": {
    "subscription_id": "sub_01J5Y7KZXN",
    "effective_filters": {
      "sports": ["basketball"],
      "leagues": ["nba"],
      "books": ["book_a", "book_b"]
    }
  }
}`

export default function ProtocolPage() {
  return <DocsPage current="/docs/protocol" title="Connection and subscription." lede="The proposed protocol uses a long-lived secure WebSocket. Clients authenticate once, create a scoped subscription, establish state from a snapshot, and process ordered deltas." next={['/docs/entities', 'Explore the entity model']}>
    <section><ObjectLabel>TRANSPORT</ObjectLabel><h2>Connection</h2><p>The production hostname is not yet active. The intended connection target is shown only to make the draft concrete.</p><Code>{`wss://stream.oddsloom.com/v1`}</Code><div className="spec-grid"><div><span>Encoding</span><p>UTF-8 JSON text frames for the initial beta.</p></div><div><span>Direction</span><p>Control messages are bidirectional; state and deltas flow server to client.</p></div><div><span>Compression</span><p>WebSocket compression policy remains under evaluation.</p></div><div><span>Environment</span><p>Sandbox and production credentials will be isolated.</p></div></div></section>
    <section><ObjectLabel>CLIENT → SERVER</ObjectLabel><h2>Authentication</h2><p>The proposed handshake sends a scoped API key in the first application frame. This avoids putting credentials in URLs and keeps authentication explicit.</p><Code>{auth}</Code><p>Until the service exists, key format, scopes, rotation, and authentication timeouts remain design decisions rather than guarantees.</p></section>
    <section><ObjectLabel>SERVER → CLIENT</ObjectLabel><h2>Session ready</h2><p>A successful handshake returns session capabilities before subscriptions are accepted.</p><Code>{ready}</Code><FieldTable rows={[["session_id","string","Identifier for this connection lifetime."],["environment","enum","sandbox or production."],["heartbeat_interval_ms","integer","Expected maximum interval between liveness messages."],["resume_supported","boolean","Whether this session class supports replay from a committed position."]]} /></section>
    <section><ObjectLabel>CLIENT → SERVER</ObjectLabel><h2>Create a subscription</h2><p>Filters describe the state the consumer wants maintained. The server validates the combination and returns the effective scope; it does not silently broaden a request.</p><Code>{subscribe}</Code><FieldTable rows={[["sports","string[]","Canonical sport keys."],["leagues","string[]?","Optional league restriction."],["books","string[]","Canonical book IDs to include."],["market_types","string[]?","Optional canonical market families."],["event_phase","enum[]?","pregame, live, or both."]]} /></section>
    <section><ObjectLabel>SERVER → CLIENT</ObjectLabel><h2>Subscription ready</h2><p>The accepted message establishes the stream position immediately before the initial snapshot.</p><Code>{accepted}</Code></section>
    <section><h2>Lifecycle</h2><div className="flow-row"><span>OPEN</span><i>→</i><span>AUTH</span><i>→</i><span>SESSION READY</span><i>→</i><span>SUBSCRIBE</span><i>→</i><span>SUBSCRIPTION READY</span><i>→</i><span>SNAPSHOT</span><i>→</i><span>LIVE DELTAS</span></div><p>Subscription modification and multiple concurrent subscriptions are still open design questions. The first beta may intentionally support one subscription per connection to keep sequence ownership unambiguous.</p></section>
  </DocsPage>
}
