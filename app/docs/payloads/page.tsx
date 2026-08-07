import type { Metadata } from 'next'
import { Code, DocsPage, FieldTable, ObjectLabel } from '../_components'

export const metadata: Metadata = { title: 'Payload Catalog | OddsLoom API', description: 'Draft control, snapshot, odds, event, heartbeat, and error payloads.' }

const envelope = `{
  "type": "odds.upsert",
  "schema_version": "0.3",
  "message_id": "msg_01J5Y7M4T6",
  "sequence": 18492,
  "emitted_at": "2026-08-07T05:20:00.438Z",
  "data": { ... }
}`
const snapshot = `{
  "type": "state.snapshot",
  "schema_version": "0.3",
  "message_id": "msg_01J5Y7M0KJ",
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
const upsert = `{
  "type": "odds.upsert",
  "schema_version": "0.3",
  "message_id": "msg_01J5Y7M4T6",
  "sequence": 18492,
  "emitted_at": "2026-08-07T05:20:00.438Z",
  "data": {
    "subscription_id": "sub_01J5Y7KZXN",
    "quote": {
      "id": "quote_book_a_market_123_outcome_min",
      "market_id": "market_evt_min_den_full_game_spread",
      "outcome_id": "outcome_min",
      "book_id": "book_a",
      "availability": "open",
      "line": 5.5,
      "price": { "american": -105, "decimal": 1.9524 },
      "observed_at": "2026-08-07T05:20:00.432Z"
    }
  }
}`
const remove = `{
  "type": "odds.remove",
  "schema_version": "0.3",
  "message_id": "msg_01J5Y7M8PQ",
  "sequence": 18493,
  "emitted_at": "2026-08-07T05:20:01.014Z",
  "data": {
    "subscription_id": "sub_01J5Y7KZXN",
    "quote_id": "quote_book_a_market_123_outcome_min",
    "reason": "offer_withdrawn",
    "observed_at": "2026-08-07T05:20:01.009Z"
  }
}`
const eventUpdate = `{
  "type": "event.update",
  "schema_version": "0.3",
  "message_id": "msg_01J5Y7N13C",
  "sequence": 18494,
  "emitted_at": "2026-08-07T05:20:02.201Z",
  "data": {
    "event_id": "event_nba_20260808_min_den",
    "changes": {
      "phase": "live",
      "status": "active"
    },
    "observed_at": "2026-08-07T05:20:02.190Z"
  }
}`
const heartbeat = `{
  "type": "session.heartbeat",
  "schema_version": "0.3",
  "message_id": "msg_01J5Y7QHB4",
  "sequence": 18512,
  "emitted_at": "2026-08-07T05:20:15.000Z",
  "data": { "session_id": "ses_01J5Y7K1Y7" }
}`
const error = `{
  "type": "request.error",
  "schema_version": "0.3",
  "message_id": "msg_01J5Y7RXE0",
  "sequence": 18513,
  "emitted_at": "2026-08-07T05:20:16.104Z",
  "data": {
    "request_id": "req_01J5Y7RX8V",
    "code": "INVALID_FILTER",
    "message": "Unknown league key.",
    "retryable": false,
    "details": { "field": "leagues", "value": "nbaa" }
  }
}`

export default function PayloadsPage() {
  return <DocsPage current="/docs/payloads" title="Every message has one job." lede="The payload catalog separates connection control, complete state, market deltas, and failures. The small vocabulary is intended to keep hot-path routing predictable." next={['/docs/reliability', 'Understand reliability']}>
    <section><h2>Catalog</h2><div className="payload-matrix"><div><code>session.ready</code><span>Authentication accepted and session capabilities established.</span><b>CONTROL</b></div><div><code>subscription.ready</code><span>Filters accepted and a subscription ID assigned.</span><b>CONTROL</b></div><div><code>state.snapshot</code><span>Complete subscription state at one sequence.</span><b>STATE</b></div><div><code>odds.upsert</code><span>Create or fully replace one current quote.</span><b>DELTA</b></div><div><code>odds.remove</code><span>Remove one quote from current state.</span><b>DELTA</b></div><div><code>event.update</code><span>Apply a small event lifecycle change.</span><b>DELTA</b></div><div><code>session.heartbeat</code><span>Confirm liveness and the latest stream position.</span><b>CONTROL</b></div><div><code>request.error</code><span>Describe a rejected client action.</span><b>CONTROL</b></div></div></section>
    <section><ObjectLabel>SHARED / ENVELOPE</ObjectLabel><h2>Message envelope</h2><Code>{envelope}</Code><FieldTable rows={[["type","string","Payload discriminator."],["schema_version","string","Contract version required to decode the message."],["message_id","string","Unique tracing and deduplication identifier."],["sequence","integer","Ordered stream position."],["emitted_at","RFC 3339","Time OddsLoom emitted the frame."],["data","object","Shape selected by type."]]} /></section>
    <section><ObjectLabel>STATE</ObjectLabel><h2>state.snapshot</h2><p>Complete state for the accepted filters. Replace local subscription state atomically, commit its sequence, then process later deltas.</p><Code>{snapshot}</Code></section>
    <section><ObjectLabel>DELTA</ObjectLabel><h2>odds.upsert</h2><p>Create or replace the quote with this ID. The payload is deliberately a full quote rather than a partial patch.</p><Code>{upsert}</Code></section>
    <section><ObjectLabel>DELTA</ObjectLabel><h2>odds.remove</h2><p>Delete the quote from current state. Temporary unavailability should normally arrive as an upsert with <code>availability: suspended</code>, not removal.</p><Code>{remove}</Code><FieldTable rows={[["quote_id","string","Quote to remove."],["reason","enum","offer_withdrawn, market_closed, event_closed, correction, or source_unavailable."],["observed_at","RFC 3339","Time the removal condition was observed."]]} /></section>
    <section><ObjectLabel>DELTA</ObjectLabel><h2>event.update</h2><p>Updates event lifecycle fields without resending its participants or market definitions. Only keys present in <code>changes</code> are replaced.</p><Code>{eventUpdate}</Code></section>
    <section><ObjectLabel>CONTROL</ObjectLabel><h2>session.heartbeat</h2><p>A heartbeat proves the connection is live and advances no domain state. Its envelope sequence reports the latest position known to the session.</p><Code>{heartbeat}</Code></section>
    <section><ObjectLabel>CONTROL</ObjectLabel><h2>request.error</h2><p>A request-scoped failure does not necessarily close the session. Consumers should branch on <code>code</code> and <code>retryable</code>, not parse message text.</p><Code>{error}</Code></section>
  </DocsPage>
}
