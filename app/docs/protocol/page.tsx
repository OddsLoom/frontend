import type { Metadata } from 'next'
import { Code, DocsPage, FieldTable, ObjectLabel } from '../_components'

export const metadata: Metadata = { title: 'Protocol | OddsLoom API', description: 'Beta-0 REST snapshot, authenticated WebSocket, and ordered delta protocol for OddsLoom.' }

const snapshotRequest = [
  'GET https://api.oddsloom.com/v1/snapshot?event_phase=pregame,live',
  'Authorization: Bearer <api-key>',
  '',
  '{',
  '  "schema_version": "1",',
  '  "type": "state.snapshot",',
  '  "sequence": 1,',
  '  "snapshot_position": 1,',
  '  "message_id": "550e8400-e29b-41d4-a716-446655440000",',
  '  "emitted_at": "2026-08-12T15:20:00.120Z",',
  '  "effective_scope": { ... },',
  '  "coverage_manifest": [ ... ],',
  '  "sources": [ ... ],',
  '  "snapshot": { ... }',
  '}',
].join('\n')

const auth = [
  '{',
  '  "type": "session.authenticate",',
  '  "api_key": "ol_test_••••••••"',
  '}',
].join('\n')

const authenticated = [
  '{',
  '  "schema_version": "1",',
  '  "type": "session.authenticated",',
  '  "sequence": 0,',
  '  "message_id": "550e8400-e29b-41d4-a716-446655440001",',
  '  "emitted_at": "2026-08-12T15:20:00.981Z",',
  '  "key_id": "design-partner"',
  '}',
].join('\n')

const subscribe = [
  '{',
  '  "type": "subscription.create",',
  '  "snapshot_position": 1,',
  '  "filters": {',
  '    "book_ids": ["draftkings", "betmgm"],',
  '    "event_phases": ["pregame", "live"]',
  '  }',
  '}',
].join('\n')

export default function ProtocolPage() {
  return <DocsPage current="/docs/protocol" title="Snapshot first. Then ordered deltas." lede="Beta-0 bootstraps from an authenticated versioned REST snapshot, then opens an authenticated WebSocket at that declared snapshot position for contiguous ordered deltas." next={['/docs/entities', 'Explore the entity model']}>
    <section><ObjectLabel>REST / V1</ObjectLabel><h2>Fetch a fresh snapshot</h2><p><code>GET /v1/snapshot</code> returns a coherent canonical view and a short-lived <code>snapshot_position</code> for the same filtered scope. If state changes before subscription, the stream rejects the stale position and the client refetches.</p><Code>{snapshotRequest}</Code><p>The effective scope is bounded by the release manifest. It includes canonical markets only, lists the exact books, jurisdictions, event phases, sports, leagues, and market families currently present, and reports degraded sources separately.</p></section>
    <section><ObjectLabel>WEBSOCKET / V1</ObjectLabel><h2>Connect to the stream</h2><p><code>GET /v1/stream</code> upgrades to a WebSocket session. The first application frame must authenticate within five seconds.</p><Code>{'wss://stream.oddsloom.com/v1/stream'}</Code><div className="spec-grid"><div><span>Encoding</span><p>UTF-8 JSON text frames.</p></div><div><span>Compression</span><p>Per-message compression is disabled.</p></div><div><span>Credentials</span><p>Keys appear only in the first frame, never in URLs.</p></div><div><span>Backpressure</span><p>Slow clients are disconnected and must resnapshot.</p></div></div></section>
    <section><ObjectLabel>CLIENT → SERVER</ObjectLabel><h2>Authenticate</h2><p>Send <code>session.authenticate</code> first. Missing, disabled, and invalid keys close generically without exposing coverage.</p><Code>{auth}</Code></section>
    <section><ObjectLabel>SERVER → CLIENT</ObjectLabel><h2>Authentication accepted</h2><p>The server confirms the non-secret key identifier. Control frames use sequence zero before a subscription exists.</p><Code>{authenticated}</Code></section>
    <section><ObjectLabel>CLIENT → SERVER</ObjectLabel><h2>Create one subscription</h2><p>Declare the applied REST <code>snapshot_position</code> and the same filters. Unsupported filters or a stale position are rejected; the returned effective scope is never silently broadened.</p><Code>{subscribe}</Code><FieldTable rows={[["snapshot_position","integer","Position from the atomically applied REST snapshot."],["sport_ids","string[]?","Canonical sport IDs."],["league_ids","string[]?","Canonical league IDs."],["book_ids","string[]?","Released sportsbook IDs."],["market_types","string[]?","Canonical market families."],["event_phases","enum[]?","pregame, live, or both."]]} /></section>
    <section><h2>Lifecycle</h2><div className="flow-row"><span>REST SNAPSHOT</span><i>→</i><span>OPEN STREAM</span><i>→</i><span>AUTH</span><i>→</i><span>DECLARE POSITION</span><i>→</i><span>ORDERED DELTAS</span></div><p>One connection owns one subscription. Its first relevant delta starts at sequence 1. On reconnect, a stale-position rejection, or any gap, discard uncommitted deltas, fetch a new REST snapshot, atomically replace state, and declare its position on a new subscription. Beta-0 has no replay path.</p></section>
  </DocsPage>
}
