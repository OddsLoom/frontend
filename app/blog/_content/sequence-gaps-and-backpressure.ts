import type { DeveloperArticle } from './types'

export const sequenceGapsAndBackpressure: DeveloperArticle = {
  slug: 'sequence-gaps-and-backpressure',
  title: 'Recovering from Sequence Gaps and Backpressure in a Live Odds Stream',
  description: 'Build a defensive TypeScript consumer that detects missing deltas, handles slow-client disconnects, and restores correct live-odds state from a fresh snapshot.',
  summary: 'A live feed is only useful when your application can prove that its local state is coherent. This guide turns sequence numbers, message IDs, explicit removals, and fresh snapshots into a recovery loop you can test.',
  seriesPosition: 2,
  readingMinutes: 16,
  updatedAt: 'August 21, 2026',
  prerequisites: [
    'Node.js 20 or newer and a TypeScript runner such as tsx',
    'Familiarity with REST snapshots and authenticated WebSocket subscriptions',
    'A willingness to replace local state when continuity cannot be proven',
  ],
  outcomes: [
    'A reducer that applies each subscription sequence once and detects gaps',
    'Correct handling for replacement upserts, suspensions, and explicit removals',
    'A bounded reconnect loop that always crosses a fresh-snapshot boundary',
    'Operational signals that distinguish connection health from state correctness',
  ],
  sections: [
    {
      id: 'correctness-model',
      title: 'Treat continuity as a correctness property',
      lede: 'A connected socket does not prove that the state in memory matches the state at the publisher.',
      blocks: [
        {
          type: 'paragraphs',
          body: [
            'OddsLoom beta-0 begins with a coherent REST snapshot and then sends ordered deltas over one authenticated WebSocket subscription. The snapshot position is short-lived and bound to the API key plus the exact effective scope. Once that position and scope are accepted, the first relevant delta has sequence 1.',
            'Sequence belongs to the subscription, not to an event, sportsbook, or permanent global log. A reconnect creates a new subscription whose relevant deltas start at 1 again. Persisting 847 from an old connection and expecting 848 on a new one would mix two different ordering domains.',
            'The safe rule is deliberately strict: apply a delta only when its sequence is exactly the last committed sequence plus one. Ignore a previously committed message ID or sequence. If the next value jumps ahead, stop changing consumer-visible state immediately. You cannot infer what the missing message contained.',
          ],
        },
        {
          type: 'table',
          headers: ['Observed frame', 'Meaning', 'Client action'],
          rows: [
            ['sequence = committed + 1', 'The next delta for this subscription', 'Apply fully, persist, then advance committed sequence'],
            ['known message_id', 'A message already committed', 'Ignore idempotently'],
            ['sequence <= committed', 'Duplicate or stale delivery', 'Ignore and record a duplicate metric'],
            ['sequence > committed + 1', 'At least one delta is missing', 'Freeze application and start fresh-snapshot recovery'],
            ['socket closes', 'Continuity is no longer provable', 'Start fresh-snapshot recovery regardless of close reason'],
          ],
          caption: 'Control frames occur at sequence 0. These rules apply after subscription.accepted, when relevant deltas begin at 1.',
        },
        {
          type: 'callout',
          title: 'There is no replay cursor in beta-0',
          body: 'Do not request messages after your last committed sequence or continue applying frames buffered around a gap. The recovery contract is a fresh filtered REST snapshot followed by a new subscription at that snapshot position.',
          tone: 'warning',
        },
      ],
    },
    {
      id: 'reducer',
      title: 'Make delta application explicit and idempotent',
      lede: 'Full-state upserts make correction handling simple: replace the object at its canonical ID. Absence is not a removal.',
      blocks: [
        {
          type: 'paragraphs',
          body: [
            'An odds.upsert creates or completely replaces one quote. That includes corrections at a higher sequence. A suspended quote remains present with availability set to suspended; it must not be offered as current. Delete a quote only after odds.remove. Reference entities follow the same pattern through state.upsert and state.remove, with additions arriving dependency-first and removals arriving quote-first.',
            'The reducer below uses sanitized v1-shaped messages. It copies the quote map before applying a change, then advances committedSequence only after the replacement state is ready. A database-backed consumer should make the entity change, message-ID insert, and sequence checkpoint one transaction. That transaction is what turns process crashes into safe redelivery instead of partial state.',
          ],
        },
        {
          type: 'code',
          language: 'typescript',
          filename: 'stream-reducer.ts',
          code: `type Availability = "open" | "suspended" | "closed";

type Quote = {
  id: string;
  eventId: string;
  marketId: string;
  outcomeId: string;
  bookId: string;
  jurisdiction: string;
  availability: Availability;
  line?: number;
  price: { american: number; decimal: number };
  observedAt: string;
};

type Envelope = {
  schema_version: "1";
  sequence: number;
  message_id: string;
  emitted_at: string;
};

type Delta =
  | (Envelope & { type: "odds.upsert"; quote: Quote })
  | (Envelope & { type: "odds.remove"; quote_id: string });

type ConsumerState = {
  status: "streaming" | "recovering";
  committedSequence: number;
  seenMessageIds: Set<string>;
  quotes: Map<string, Quote>;
};

type ApplyResult =
  | { kind: "applied"; state: ConsumerState }
  | { kind: "duplicate"; state: ConsumerState }
  | { kind: "gap"; expected: number; received: number; state: ConsumerState };

export function applyDelta(state: ConsumerState, delta: Delta): ApplyResult {
  if (state.status === "recovering") {
    return { kind: "gap", expected: state.committedSequence + 1,
      received: delta.sequence, state };
  }

  if (state.seenMessageIds.has(delta.message_id) ||
      delta.sequence <= state.committedSequence) {
    return { kind: "duplicate", state };
  }

  const expected = state.committedSequence + 1;
  if (delta.sequence !== expected) {
    return {
      kind: "gap",
      expected,
      received: delta.sequence,
      state: { ...state, status: "recovering" },
    };
  }

  const quotes = new Map(state.quotes);
  if (delta.type === "odds.upsert") quotes.set(delta.quote.id, delta.quote);
  if (delta.type === "odds.remove") quotes.delete(delta.quote_id);

  const seenMessageIds = new Set(state.seenMessageIds);
  seenMessageIds.add(delta.message_id);
  return {
    kind: "applied",
    state: { ...state, quotes, seenMessageIds,
      committedSequence: delta.sequence },
  };
}`,
          caption: 'Extend the union with state.upsert, state.remove, source.status, and coverage.manifest handlers used by your application. Keep the same ordering gate around every relevant delta.',
        },
      ],
    },
    {
      id: 'prove-the-reducer',
      title: 'Prove the failure path with sanitized frames',
      lede: 'The most important test is not the happy path. It is proving that a missing sequence cannot silently mutate visible state.',
      blocks: [
        {
          type: 'code',
          language: 'typescript',
          filename: 'demo.ts',
          code: `import assert from "node:assert/strict";
import { applyDelta } from "./stream-reducer.js";

let state: Parameters<typeof applyDelta>[0] = {
  status: "streaming" as const,
  committedSequence: 0,
  seenMessageIds: new Set<string>(),
  quotes: new Map(),
};

const base = {
  schema_version: "1" as const,
  emitted_at: "2026-08-21T15:00:00.100Z",
};

const first = applyDelta(state, {
  ...base,
  type: "odds.upsert",
  sequence: 1,
  message_id: "10000000-0000-4000-8000-000000000001",
  quote: {
    id: "quote_demo_1",
    eventId: "event_demo_1",
    marketId: "market_demo_spread",
    outcomeId: "outcome_demo_home",
    bookId: "book_demo",
    jurisdiction: "US-IL",
    availability: "open",
    line: -2.5,
    price: { american: -105, decimal: 1.9524 },
    observedAt: "2026-08-21T15:00:00.090Z",
  },
});
assert.equal(first.kind, "applied");
state = first.state;

const duplicate = applyDelta(state, {
  ...base,
  type: "odds.remove",
  sequence: 1,
  message_id: "10000000-0000-4000-8000-000000000001",
  quote_id: "quote_demo_1",
});
assert.equal(duplicate.kind, "duplicate");
assert.equal(duplicate.state.quotes.has("quote_demo_1"), true);

const gap = applyDelta(state, {
  ...base,
  type: "odds.remove",
  sequence: 3,
  message_id: "10000000-0000-4000-8000-000000000003",
  quote_id: "quote_demo_1",
});
assert.equal(gap.kind, "gap");
assert.equal(gap.expected, 2);
assert.equal(gap.state.status, "recovering");
assert.equal(gap.state.quotes.has("quote_demo_1"), true);

console.log("Gap detected without corrupting visible state");`,
          caption: 'Save both files, install tsx with npm install --save-dev tsx, and run npx tsx demo.ts.',
        },
        {
          type: 'paragraphs',
          body: [
            'The duplicate deliberately carries a removal body. Because its message ID and sequence were already committed, the body never runs. The jump to sequence 3 also leaves the quote untouched. This is the behavior you want: stale data may remain visible briefly under a recovering status, but unprovable data must never be presented as newly current.',
            'In production, expose the recovering status beside the data or remove the affected view from serving. Which presentation is appropriate depends on the product, but do not label frozen prices as live.',
          ],
        },
      ],
    },
    {
      id: 'backpressure',
      title: 'Bound work before the socket bounds it for you',
      lede: 'Backpressure means the consumer is not keeping pace with publication. More buffering only postpones the correctness decision.',
      blocks: [
        {
          type: 'paragraphs',
          body: [
            'OddsLoom disconnects a slow client rather than silently dropping deltas. The measured beta behavior is WebSocket close code 1013 with reason backpressure. Treat that close as a signal to reduce work, capacity, or scope—but use the same correctness recovery as any other disconnect.',
            'Keep the socket callback cheap. Parse and validate the envelope, place it on a bounded queue, and apply messages serially. If the queue reaches its bound, stop accepting frames, mark the consumer recovering, close the socket, and resnapshot. Do not process sequence 920 merely because sequence 919 might still be hidden in an unbounded application queue.',
          ],
        },
        {
          type: 'bullets',
          items: [
            'Batch database writes without reordering them, and commit the highest sequence only in the same transaction.',
            'Move analytics, notifications, and UI fan-out behind the durable state commit instead of blocking the stream handler.',
            'Reduce subscription scope when the client does not need every released book, league, market family, or event phase.',
            'Alert on repeated 1013 closes; successful reconnects can otherwise hide a permanently undersized consumer.',
          ],
        },
        {
          type: 'callout',
          title: '1013 is evidence, not permission to resume',
          body: 'The close reason explains why continuity ended. It does not prove which frames the client applied before the disconnect. Freeze state, discard uncommitted work, and cross the fresh-snapshot boundary.',
          tone: 'warning',
        },
      ],
    },
    {
      id: 'recovery-loop',
      title: 'Put every disconnect through one recovery loop',
      lede: 'A single recovery path is easier to reason about than separate reconnect, stale-position, scope-mismatch, and backpressure paths.',
      blocks: [
        {
          type: 'steps',
          items: [
            { title: 'Freeze', body: 'Stop mutating consumer-visible state on a gap, local queue overflow, or WebSocket close.' },
            { title: 'Discard', body: 'Remove deltas that were received but not durably committed. Do not guess their order or completeness.' },
            { title: 'Resnapshot', body: 'Fetch the same filters through GET /v1/snapshot and atomically replace the complete local graph.' },
            { title: 'Resubscribe', body: 'Open a new socket, authenticate in the first application frame, and declare the new snapshot_position with matching filters.' },
            { title: 'Resume', body: 'Wait for subscription.accepted, reset the subscription sequence to 0, and accept relevant delta sequence 1.' },
          ],
        },
        {
          type: 'paragraphs',
          body: [
            'A stale snapshot position is rejected as fresh_snapshot_required. A position issued to another key or effective scope is rejected as snapshot_scope_mismatch. Neither should be retried with the same position. Fetch a new snapshot, verify its effective scope, replace state atomically, and subscribe with that new position.',
            'Use exponential backoff with jitter around the whole bootstrap operation, not around a naked socket reconnect. Bound the delay so a long outage does not grow into an impractical wait, and reset the attempt counter only after the client has reached accepted streaming state.',
          ],
        },
        {
          type: 'code',
          language: 'typescript',
          filename: 'recovery-loop.ts',
          code: `type CloseInfo = { code: number; reason: string };

const sleep = (milliseconds: number) =>
  new Promise<void>(resolve => setTimeout(resolve, milliseconds));

function retryDelay(attempt: number): number {
  const ceiling = Math.min(10_000, 250 * 2 ** attempt);
  return Math.floor(Math.random() * ceiling);
}

async function runForever(): Promise<never> {
  let attempt = 0;

  for (;;) {
    try {
      setServingState("recovering");
      discardUncommittedDeltas();

      const snapshot = await fetchSnapshot(filters);
      await atomicallyReplaceState(snapshot.snapshot);

      const close: CloseInfo = await streamUntilClosed({
        snapshotPosition: snapshot.snapshot_position,
        filters,
        onAccepted: () => {
          resetSubscriptionSequenceToZero();
          setServingState("streaming");
          attempt = 0;
        },
        onDelta: applyAndCommitNextDelta,
      });

      recordDisconnect(close.code, close.reason);
      // 1013/backpressure, policy closes, and network loss all resnapshot.
    } catch (error) {
      recordRecoveryFailure(error);
    }

    setServingState("recovering");
    await sleep(retryDelay(attempt));
    attempt = Math.min(attempt + 1, 6);
  }
}`,
          caption: 'The helper signatures are application boundaries: REST/auth transport, an atomic store replacement, a serialized durable delta transaction, and metrics. The important behavior is that the loop always returns to fetchSnapshot.',
        },
      ],
    },
    {
      id: 'observability',
      title: 'Measure correctness separately from connectivity',
      lede: 'A dashboard with zero socket errors can still represent a feed that is stale, unconsumed, or outside the scope your users expect.',
      blocks: [
        {
          type: 'table',
          headers: ['Signal', 'What it answers', 'Useful dimensions'],
          rows: [
            ['stream_sequence_committed', 'Is each active subscription advancing?', 'consumer, subscription, effective-scope hash'],
            ['sequence_gap_total', 'How often was continuity lost?', 'expected, received, consumer'],
            ['duplicate_message_total', 'Are retries or duplicate frames being absorbed?', 'message type, consumer'],
            ['disconnect_total', 'Why did a stream end?', 'close code, reason, consumer'],
            ['recovery_duration_ms', 'How long was state marked recovering?', 'outcome, attempt count'],
            ['queue_depth', 'Is the consumer approaching backpressure?', 'consumer, worker'],
            ['snapshot_replace_total', 'Did recovery reach its correctness boundary?', 'outcome, effective-scope hash'],
            ['consumer_receive_lag_ms', 'How old was publication when received?', 'book, event phase; derived from emitted_at'],
          ],
        },
        {
          type: 'paragraphs',
          body: [
            'Use sequence for ordering, not timestamps. emitted_at is the OddsLoom publication time, observedAt is when OddsLoom observed provider state, and consumer_received_at is your local receipt time. Those clocks help diagnose freshness, but they cannot fill a missing sequence. Provider clocks may be absent or skewed and should not be invented.',
            'Page on sustained recovering state, repeated gaps, repeated 1013 closes, or a committed sequence that stops advancing while relevant traffic exists. Also record the accepted effective scope. A perfectly healthy consumer of the wrong scope is still a product incident.',
          ],
        },
      ],
    },
    {
      id: 'production-checklist',
      title: 'Ship the invariant, not just the reconnect',
      blocks: [
        {
          type: 'bullets',
          items: [
            'Scope sequence state to one accepted subscription and reset it for each new subscription.',
            'Deduplicate message_id and make full-state replacements idempotent.',
            'Commit the state mutation, message ID, and sequence checkpoint atomically.',
            'Represent suspended, closed, corrected, and removed state explicitly.',
            'Freeze serving state before recovery and replace the snapshot graph atomically.',
            'Use bounded queues plus bounded, jittered retry delays.',
            'Resnapshot after every gap or disconnect; do not implement an imaginary replay path.',
            'Test duplicate, gap, stale-position, scope-mismatch, backpressure, and mid-commit crash cases.',
          ],
        },
        {
          type: 'paragraphs',
          body: [
            'The central invariant is short: consumer-visible state comes from one complete snapshot plus every contiguous, durably committed delta in its accepted subscription. When any part of that proof is missing, recovery is not an optimization. It is the boundary that makes the state trustworthy again.',
          ],
        },
      ],
    },
  ],
}
