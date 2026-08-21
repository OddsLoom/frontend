import type { DeveloperArticle } from './types'

export const resilientLiveOddsClient: DeveloperArticle = {
  slug: 'resilient-live-odds-client',
  title: 'Building a Resilient Live Odds Client with REST and WebSockets',
  description: 'Bootstrap a coherent odds graph from REST, authenticate a WebSocket correctly, and apply ordered full-state replacements without corrupting consumer state.',
  summary: 'A practical TypeScript guide to the snapshot-first pattern behind a correct live odds consumer: fetch one coherent state, bind the stream to its exact scope and position, then make every update idempotent.',
  seriesPosition: 1,
  readingMinutes: 14,
  updatedAt: 'August 21, 2026',
  prerequisites: [
    'Node.js 20 or newer and TypeScript',
    'The ws package for WebSocket support',
    'An OddsLoom beta API key supplied through an environment variable',
  ],
  outcomes: [
    'Build local state from a complete v1 REST snapshot before consuming deltas',
    'Authenticate and subscribe without placing credentials in a URL',
    'Bind a stream to the snapshot position and exact effective scope',
    'Apply complete entity and quote replacements idempotently',
  ],
  sections: [
    {
      id: 'why-snapshot-first',
      title: 'The stream is not your starting state',
      lede: 'A WebSocket tells you what changed. It cannot tell a new consumer everything that was already true before the connection opened.',
      blocks: [
        {
          type: 'paragraphs',
          body: [
            'A live odds client needs both a coherent graph and the changes that follow it. A stream alone creates an ambiguous startup window: a quote can reference an unseen event, while a quiet market can remain absent because nothing changes after connection.',
            'OddsLoom v1 makes that boundary explicit. An authenticated REST request returns a complete canonical snapshot for a filtered scope. The response also contains a short-lived snapshot_position. After atomically installing that snapshot, the client opens a WebSocket, authenticates in its first application frame, and creates one subscription using that position and the snapshot\'s exact effective_scope. Only then do relevant deltas begin, at subscription sequence 1.',
            'The important unit is a transition between coherent graphs. If the position becomes stale before subscription acceptance, the server rejects it and the client starts again from a fresh snapshot.',
          ],
        },
        {
          type: 'steps',
          items: [
            { title: 'Snapshot', body: 'Request only the scope your process owns, authenticate with a bearer header, validate schema_version 1, and construct a replacement graph off to the side.' },
            { title: 'Swap', body: 'Publish the replacement graph to your application with one atomic reference assignment. Never expose a half-populated graph.' },
            { title: 'Authenticate', body: 'Open /v1/stream and send session.authenticate as the first application frame. Keep the key out of URLs, source control, and logs.' },
            { title: 'Subscribe', body: 'After session.authenticated, send subscription.create with the returned snapshot_position and effective_scope. Wait for subscription.accepted.' },
            { title: 'Advance', body: 'Apply only the next sequence. Upserts replace complete objects; removals are explicit. Commit the sequence only after the state mutation succeeds.' },
          ],
        },
      ],
    },
    {
      id: 'model-v1',
      title: 'Model the v1 boundary, not a sportsbook page',
      lede: 'Provider records are normalized into stable canonical objects. Quotes are the frequently changing edge of that graph.',
      blocks: [
        {
          type: 'paragraphs',
          body: [
            'Your application can derive richer views, but its ingestion boundary should preserve message_id, sequence, schema_version, and the distinction between OddsLoom publication time (emitted_at) and source observation time (observedAt). Sequence determines ordering; timestamps measure freshness.',
            'The following sanitized fixture contains no customer data or credential. Its field names and nesting follow the v1 snapshot contract, including the complete dependency graph, release coverage, per-source status, and normalization counts. Save it as contract.ts; the later client imports these definitions.',
          ],
        },
        {
          type: 'code',
          language: 'typescript',
          filename: 'contract.ts',
          code: `export type Filters = {
  sport_ids?: string[]
  league_ids?: string[]
  book_ids?: string[]
  market_types?: string[]
  event_phases?: Array<'pregame' | 'live'>
}

export type EffectiveScope = Required<Filters>
export type EntityType =
  | 'sport' | 'league' | 'participant'
  | 'event' | 'market' | 'outcome'

export type Sport = { id: string; key: string; name: string }
export type League = { id: string; sportId: string; name: string }
export type Participant = {
  id: string; sportId: string; leagueId?: string
  type: 'team' | 'player' | 'pairing' | 'field' | 'unknown'
  name: string
}
export type Event = {
  id: string; sportId: string; leagueId: string; name: string
  startsAt?: string; phase: 'pregame' | 'live' | 'complete'
  status: 'scheduled' | 'active' | 'suspended' | 'final' | 'unknown'
  participants: Array<{
    participantId: string; role: 'home' | 'away' | 'competitor'
  }>
}
export type Market = {
  id: string; eventId: string; type: string; period: string
  variant: string; name: string; status: 'open' | 'suspended' | 'closed'
  normalization: 'canonical'
}
export type Outcome = {
  id: string; marketId: string; name: string; participantId?: string
  role: 'participant' | 'over' | 'under' | 'draw' | 'yes' | 'no' | 'other'
}
export type Quote = {
  id: string; eventId: string; marketId: string; outcomeId: string
  bookId: string; jurisdiction: string
  availability: 'open' | 'suspended' | 'closed'; line?: number
  price: { american?: number; decimal?: number }
  source: { eventId: string; marketId: string; selectionId: string }
  observedAt: string
}
export type Snapshot = {
  sports: Sport[]; leagues: League[]; participants: Participant[]
  events: Event[]; markets: Market[]; outcomes: Outcome[]; quotes: Quote[]
  normalization: {
    sourceEvents: number; sourceMarkets: number; sourceSelections: number
    unresolvedMarkets: number; unresolvedSelections: number
  }
  updatedAt?: string
}
type Envelope = {
  schema_version: '1'; sequence: number; message_id: string
  type: string; emitted_at: string
}
export type SnapshotEnvelope = Envelope & {
  type: 'state.snapshot'; snapshot_position: number
  effective_scope: EffectiveScope
  coverage_manifest: Array<{
    book_id: string; jurisdiction: string; event_phase: 'pregame' | 'live'
    sport_ids: string[]; league_ids: string[]; market_types: string[]
  }>
  sources: Array<{
    book_id: string; jurisdiction: string; phase: 'pregame' | 'live'
    status: 'streaming' | 'degraded'; last_success_at?: string
  }>
  snapshot: Snapshot
}
export type Delta =
  | (Envelope & { type: 'state.upsert'; entity_type: EntityType; entity: Sport | League | Participant | Event | Market | Outcome })
  | (Envelope & { type: 'state.remove'; entity_type: EntityType; entity_id: string })
  | (Envelope & { type: 'odds.upsert'; quote: Quote })
  | (Envelope & { type: 'odds.remove'; quote_id: string })
  | (Envelope & { type: 'source.status'; sources: SnapshotEnvelope['sources'] })
  | (Envelope & { type: 'coverage.manifest'; coverage_manifest: SnapshotEnvelope['coverage_manifest'] })

export const sanitizedSnapshot: SnapshotEnvelope = {
  schema_version: '1', type: 'state.snapshot', sequence: 41,
  snapshot_position: 41,
  message_id: '14f05f68-d5fc-47ba-9e1d-469dc9fd8844',
  emitted_at: '2026-08-21T15:00:00.120Z',
  effective_scope: {
    sport_ids: ['sport_basketball'], league_ids: ['league_demo'],
    book_ids: ['draftkings'], market_types: ['spread'],
    event_phases: ['live'],
  },
  coverage_manifest: [{
    book_id: 'draftkings', jurisdiction: 'US-IL', event_phase: 'live',
    sport_ids: ['sport_basketball'], league_ids: ['league_demo'],
    market_types: ['spread'],
  }],
  sources: [{
    book_id: 'draftkings', jurisdiction: 'US-IL', phase: 'live',
    status: 'streaming', last_success_at: '2026-08-21T15:00:00.100Z',
  }],
  snapshot: {
    sports: [{ id: 'sport_basketball', key: 'basketball', name: 'Basketball' }],
    leagues: [{ id: 'league_demo', sportId: 'sport_basketball', name: 'Demo League' }],
    participants: [
      { id: 'team_north', sportId: 'sport_basketball', leagueId: 'league_demo', type: 'team', name: 'North' },
    ],
    events: [{
      id: 'event_north_south', sportId: 'sport_basketball', leagueId: 'league_demo',
      name: 'North at South', startsAt: '2026-08-21T14:00:00Z',
      phase: 'live', status: 'active',
      participants: [
        { participantId: 'team_north', role: 'away' },
      ],
    }],
    markets: [{
      id: 'market_full_game_spread', eventId: 'event_north_south', type: 'spread',
      period: 'full_game', variant: 'standard', name: 'Full Game Spread',
      status: 'open', normalization: 'canonical',
    }],
    outcomes: [{
      id: 'outcome_north', marketId: 'market_full_game_spread',
      name: 'North +5.5', participantId: 'team_north', role: 'participant',
    }],
    quotes: [{
      id: 'quote_demo_north', eventId: 'event_north_south',
      marketId: 'market_full_game_spread', outcomeId: 'outcome_north',
      bookId: 'draftkings', jurisdiction: 'US-IL', availability: 'open', line: 5.5,
      price: { american: -105, decimal: 1.9524 },
      source: { eventId: 'src_event_demo', marketId: 'src_market_demo', selectionId: 'src_selection_demo' },
      observedAt: '2026-08-21T15:00:00.100Z',
    }],
    normalization: {
      sourceEvents: 1, sourceMarkets: 1, sourceSelections: 1,
      unresolvedMarkets: 0, unresolvedSelections: 0,
    },
    updatedAt: '2026-08-21T15:00:00.100Z',
  },
}`,
          caption: 'A sanitized, self-contained v1 snapshot fixture. It is safe to use in tests and local examples.',
        },
      ],
    },
    {
      id: 'atomic-store',
      title: 'Install snapshots atomically and replace by identity',
      lede: 'A snapshot is a replacement boundary. Build a new graph, validate its references, and expose it only when the whole graph is ready.',
      blocks: [
        {
          type: 'paragraphs',
          body: [
            'Construct every ID-keyed map before assigning current. That assignment is atomic for readers in one Node.js process; a database-backed consumer needs the equivalent transaction or generation pointer.',
            'Never merge a fresh snapshot into stale maps or patch an upsert field by field. Each state.upsert and odds.upsert is a complete replacement, making repeated application harmless.',
          ],
        },
        {
          type: 'code',
          language: 'typescript',
          filename: 'store.ts',
          code: `import type {
  Delta, EntityType, Snapshot, SnapshotEnvelope,
} from './contract.js'

type Identified = { id: string }
type Graph = {
  sports: Map<string, Identified>; leagues: Map<string, Identified>
  participants: Map<string, Identified>; events: Map<string, Identified>
  markets: Map<string, Identified>; outcomes: Map<string, Identified>
  quotes: Map<string, Identified>
}

const mapById = <T extends Identified>(values: T[]) =>
  new Map(values.map((value) => [value.id, value]))

function graphFrom(snapshot: Snapshot): Graph {
  return {
    sports: mapById(snapshot.sports), leagues: mapById(snapshot.leagues),
    participants: mapById(snapshot.participants), events: mapById(snapshot.events),
    markets: mapById(snapshot.markets), outcomes: mapById(snapshot.outcomes),
    quotes: mapById(snapshot.quotes),
  }
}

const collection: Record<EntityType, keyof Omit<Graph, 'quotes'>> = {
  sport: 'sports', league: 'leagues', participant: 'participants',
  event: 'events', market: 'markets', outcome: 'outcomes',
}

export class OddsStore {
  private current: Graph = graphFrom({
    sports: [], leagues: [], participants: [], events: [], markets: [],
    outcomes: [], quotes: [],
    normalization: { sourceEvents: 0, sourceMarkets: 0, sourceSelections: 0, unresolvedMarkets: 0, unresolvedSelections: 0 },
  })
  private committedSequence = 0
  private committedMessageIds = new Set<string>()

  replaceSnapshot(message: SnapshotEnvelope) {
    const replacement = graphFrom(message.snapshot)
    this.current = replacement
    this.committedSequence = 0 // subscription sequence starts independently
    this.committedMessageIds = new Set()
  }

  apply(message: Delta) {
    if (this.committedMessageIds.has(message.message_id)) return
    if (message.sequence <= this.committedSequence) return
    if (message.sequence !== this.committedSequence + 1) {
      throw new Error('sequence_gap')
    }

    if (message.type === 'state.upsert') {
      this.current[collection[message.entity_type]].set(message.entity.id, message.entity)
    } else if (message.type === 'state.remove') {
      this.current[collection[message.entity_type]].delete(message.entity_id)
    } else if (message.type === 'odds.upsert') {
      this.current.quotes.set(message.quote.id, message.quote)
    } else if (message.type === 'odds.remove') {
      this.current.quotes.delete(message.quote_id)
    }

    // Commit ordering metadata only after the mutation succeeds.
    this.committedMessageIds.add(message.message_id)
    this.committedSequence = message.sequence
  }
}`,
        },
        {
          type: 'callout',
          title: 'Keep derived views outside the ingestion transaction',
          body: 'A best-price table, alert queue, or UI projection can be rebuilt from the canonical store. Do not let a failure in one downstream calculation leave the canonical graph at a half-committed sequence.',
          tone: 'note',
        },
      ],
    },
    {
      id: 'bootstrap-and-subscribe',
      title: 'Fetch, authenticate, and bind the stream',
      lede: 'The handshake is deliberately ordered. Each frame proves one more fact before live mutations are allowed.',
      blocks: [
        {
          type: 'paragraphs',
          body: [
            'The released manifest bounds a request, so the response returns its authoritative effective_scope. Use that object for subscription.create with the short-lived position.',
            'Put the key in the REST Authorization header and first WebSocket application frame, never either URL. Send subscription.create only after session.authenticated. Control frames use sequence 0 before subscription; relevant subscription messages start at sequence 1.',
            'This client uses Node\'s fetch and the ws package. It surfaces closes and gaps through onRecoveryRequired; article two turns that signal into a supervised resnapshot loop.',
          ],
        },
        {
          type: 'code',
          language: 'typescript',
          filename: 'client.ts',
          code: `import WebSocket from 'ws'
import type { Delta, EffectiveScope, Filters, SnapshotEnvelope } from './contract.js'
import { OddsStore } from './store.js'

const API_ORIGIN = process.env.ODDSLOOM_API_ORIGIN ?? 'https://api.oddsloom.com'
const STREAM_URL = process.env.ODDSLOOM_STREAM_URL ?? 'wss://stream.oddsloom.com/v1/stream'
const apiKey = process.env.ODDSLOOM_API_KEY
if (!apiKey) throw new Error('ODDSLOOM_API_KEY is required')

const filters: Filters = {
  book_ids: ['draftkings'],
  event_phases: ['live'],
}

function queryFor(value: Filters) {
  const query = new URLSearchParams()
  const names: Record<keyof Filters, string> = {
    sport_ids: 'sport_id', league_ids: 'league_id', book_ids: 'book_id',
    market_types: 'market_type', event_phases: 'event_phase',
  }
  for (const [key, values] of Object.entries(value) as Array<[keyof Filters, string[]]>) {
    for (const item of values) query.append(names[key], item)
  }
  return query
}

async function fetchSnapshot(scope: Filters): Promise<SnapshotEnvelope> {
  const response = await fetch(API_ORIGIN + '/v1/snapshot?' + queryFor(scope), {
    headers: { Authorization: 'Bearer ' + apiKey },
  })
  if (!response.ok) throw new Error('snapshot_failed:' + response.status)
  const body = await response.json() as SnapshotEnvelope
  if (body.schema_version !== '1' || body.type !== 'state.snapshot') {
    throw new Error('unsupported_snapshot')
  }
  return body
}

function sameScope(left: EffectiveScope, right: EffectiveScope) {
  const keys = Object.keys(left) as Array<keyof EffectiveScope>
  return keys.every((key) => JSON.stringify(left[key]) === JSON.stringify(right[key]))
}

async function connect(
  snapshot: SnapshotEnvelope,
  store: OddsStore,
  onRecoveryRequired: (reason: string) => void,
) {
  const socket = new WebSocket(STREAM_URL)
  let accepted = false
  let recoveryStarted = false
  const recover = (reason: string) => {
    if (recoveryStarted) return
    recoveryStarted = true
    onRecoveryRequired(reason)
  }

  socket.on('open', () => {
    // This must be the first application frame.
    socket.send(JSON.stringify({ type: 'session.authenticate', api_key: apiKey }))
  })

  socket.on('message', (bytes) => {
    const message = JSON.parse(bytes.toString()) as Record<string, unknown>

    if (message.type === 'session.authenticated') {
      socket.send(JSON.stringify({
        type: 'subscription.create',
        snapshot_position: snapshot.snapshot_position,
        filters: snapshot.effective_scope,
      }))
      return
    }

    if (message.type === 'subscription.accepted') {
      const positionMatches = message.snapshot_position === snapshot.snapshot_position
      const scopeMatches = sameScope(
        message.effective_scope as EffectiveScope,
        snapshot.effective_scope,
      )
      if (!positionMatches || !scopeMatches) {
        socket.close(1000, 'subscription_mismatch')
        recover('subscription_mismatch')
        return
      }
      accepted = true
      return
    }

    if (!accepted) return
    if (message.type === 'state.upsert' || message.type === 'state.remove' ||
        message.type === 'odds.upsert' || message.type === 'odds.remove' ||
        message.type === 'source.status' || message.type === 'coverage.manifest') {
      try {
        store.apply(message as Delta)
      } catch {
        socket.close(1000, 'sequence_gap')
        recover('sequence_gap')
      }
    }
  })

  socket.on('close', (_code, reason) => {
    recover(reason.toString() || 'stream_closed')
  })
  socket.on('error', () => recover('stream_error'))
}

const store = new OddsStore()
const snapshot = await fetchSnapshot(filters)
store.replaceSnapshot(snapshot)
await connect(snapshot, store, (reason) => {
  console.error('fresh snapshot required:', reason)
  process.exitCode = 1
})`,
          caption: 'Install with npm install ws and npm install --save-dev typescript @types/ws. Supply the API key through the process environment, never source code.',
        },
      ],
    },
    {
      id: 'idempotency',
      title: 'Treat replacements and removals literally',
      blocks: [
        {
          type: 'table',
          headers: ['Message', 'Consumer action', 'Do not infer'],
          rows: [
            ['state.upsert', 'Replace the complete canonical entity by ID', 'A partial patch or a new entity on every correction'],
            ['state.remove', 'Delete the named entity after prior dependent removals', 'Removal because an entity was absent from one delta'],
            ['odds.upsert', 'Replace the complete quote by quote ID', 'That a price-only merge preserves valid old fields'],
            ['odds.remove', 'Delete the named quote', 'That suspended means removed'],
          ],
          caption: 'Upserts arrive dependency-first; removals arrive quote-first and in reverse dependency order.',
        },
        {
          type: 'paragraphs',
          body: [
            'A suspended quote remains stored with availability suspended and may reopen under the same ID. Closed is also explicit. Delete only after odds.remove.',
            'message_id identifies one emitted message; sequence establishes per-subscription order. Ignoring duplicates protects idempotency, while rejecting jumps protects completeness. Persist sequence with durable state and commit it only after mutation succeeds.',
            'source.status and coverage.manifest consume sequence numbers even though they are control information. A degraded source has last-known quotes removed. A coverage change is announced before related removals. Surface both signals rather than interpreting an empty book as proof that no market exists.',
          ],
        },
      ],
    },
    {
      id: 'production-boundary',
      title: 'Know where this first client stops',
      lede: 'Correct startup is necessary, but reconnect and recovery need their own explicit state machine.',
      blocks: [
        {
          type: 'bullets',
          items: [
            'Validate incoming JSON at runtime; TypeScript assertions do not validate network input.',
            'Bound message_id memory and retire IDs after snapshot replacement.',
            'Serialize asynchronous database mutations and commit sequence with the transaction.',
            'Record consumer_received_at for freshness analysis; keep ordering sequence-based.',
            'Monitor source.status separately from transport health.',
            'Treat any disconnect, backpressure close, stale snapshot position, or sequence gap as a fresh-snapshot event. Beta-0 provides no replay or resume-from-sequence path.',
          ],
        },
        {
          type: 'callout',
          title: 'Next: make failure a normal state transition',
          body: 'Article two, “Recovering from Sequence Gaps and Backpressure in a Live Odds Stream,” turns onRecoveryRequired into a single-flight recovery loop: pause consumer-visible mutations, discard uncommitted work, fetch and atomically apply a fresh snapshot, create a new authenticated subscription, and resume only after acceptance.',
          tone: 'note',
        },
        {
          type: 'paragraphs',
          body: [
            'Every reader should see either the last committed graph or the new graph, never a mixture. The snapshot defines current scope, the subscription defines where changes begin, replacements make repeats harmless, and sequence checks make omissions visible.',
          ],
        },
      ],
    },
  ],
}
