import type { DeveloperArticle } from './types'

const comparisonDemo = `type Id = string

type Participant = {
  id: Id
  type: "team" | "player" | "pairing" | "field" | "unknown"
  name: string
  sportId: Id
  leagueId?: Id
}

type CanonicalEvent = {
  id: Id
  sportId: Id
  leagueId: Id
  name: string
  startsAt?: string
  phase: "pregame" | "live" | "complete"
  status: "scheduled" | "active" | "suspended" | "final" | "unknown"
  participants: Array<{
    participantId: Id
    role: "home" | "away" | "competitor"
  }>
}

type Market = {
  id: Id
  eventId: Id
  type: string
  period: string
  variant: string
  name: string
  status: "open" | "suspended" | "closed"
  normalization: "canonical" | "provider_specific"
}

type Outcome = {
  id: Id
  marketId: Id
  name: string
  participantId?: Id
  role: "participant" | "over" | "under" | "draw" | "yes" | "no" | "other"
}

type Quote = {
  id: Id
  eventId: Id
  marketId: Id
  outcomeId: Id
  bookId: string
  jurisdiction: string
  availability: "open" | "suspended" | "closed"
  line?: number
  price: { american?: number; decimal?: number }
  source: { eventId: string; marketId: string; selectionId: string }
  observedAt: string
}

type Snapshot = {
  participants: Participant[]
  events: CanonicalEvent[]
  markets: Market[]
  outcomes: Outcome[]
  quotes: Quote[]
}

const snapshot: Snapshot = {
  participants: [
    { id: "participant_nba_min", type: "team", name: "Minnesota Timberwolves", sportId: "sport_basketball", leagueId: "league_nba" },
    { id: "participant_nba_den", type: "team", name: "Denver Nuggets", sportId: "sport_basketball", leagueId: "league_nba" }
  ],
  events: [{
    id: "event_nba_20260808_min_den",
    sportId: "sport_basketball",
    leagueId: "league_nba",
    name: "Minnesota Timberwolves at Denver Nuggets",
    startsAt: "2026-08-08T00:10:00Z",
    phase: "live",
    status: "active",
    participants: [
      { participantId: "participant_nba_min", role: "away" },
      { participantId: "participant_nba_den", role: "home" }
    ]
  }],
  markets: [{
    id: "market_evt_min_den_full_game_spread",
    eventId: "event_nba_20260808_min_den",
    type: "spread",
    period: "full_game",
    variant: "standard",
    name: "Full game spread",
    status: "open",
    normalization: "canonical"
  }],
  outcomes: [
    { id: "outcome_min", marketId: "market_evt_min_den_full_game_spread", name: "Minnesota Timberwolves", participantId: "participant_nba_min", role: "participant" },
    { id: "outcome_den", marketId: "market_evt_min_den_full_game_spread", name: "Denver Nuggets", participantId: "participant_nba_den", role: "participant" }
  ],
  quotes: [
    {
      id: "quote_book_a_min",
      eventId: "event_nba_20260808_min_den",
      marketId: "market_evt_min_den_full_game_spread",
      outcomeId: "outcome_min",
      bookId: "book_a",
      jurisdiction: "US-IL",
      availability: "open",
      line: 5.5,
      price: { american: -105, decimal: 1.9524 },
      source: { eventId: "a-991", marketId: "a-spread-8", selectionId: "a-away" },
      observedAt: "2026-08-08T01:12:30.432Z"
    },
    {
      id: "quote_book_b_min",
      eventId: "event_nba_20260808_min_den",
      marketId: "market_evt_min_den_full_game_spread",
      outcomeId: "outcome_min",
      bookId: "book_b",
      jurisdiction: "US-IL",
      availability: "open",
      line: 5.5,
      price: { american: -110, decimal: 1.9091 },
      source: { eventId: "b-44", marketId: "b-main-handicap", selectionId: "b-visitor" },
      observedAt: "2026-08-08T01:12:30.510Z"
    },
    {
      id: "quote_book_b_den",
      eventId: "event_nba_20260808_min_den",
      marketId: "market_evt_min_den_full_game_spread",
      outcomeId: "outcome_den",
      bookId: "book_b",
      jurisdiction: "US-IL",
      availability: "open",
      line: -5.5,
      price: { american: -110, decimal: 1.9091 },
      source: { eventId: "b-44", marketId: "b-main-handicap", selectionId: "b-home" },
      observedAt: "2026-08-08T01:12:30.510Z"
    }
  ]
}

const participants = new Map(snapshot.participants.map(value => [value.id, value]))
const events = new Map(snapshot.events.map(value => [value.id, value]))
const markets = new Map(snapshot.markets.map(value => [value.id, value]))
const outcomes = new Map(snapshot.outcomes.map(value => [value.id, value]))
const quotes = new Map(snapshot.quotes.map(value => [value.id, value]))

function comparisonKey(quote: Quote): string {
  if (quote.line === undefined) return quote.outcomeId + "|no-line"
  return quote.outcomeId + "|line:" + String(quote.line)
}

function bestOpenQuotes(): Map<string, Quote> {
  const best = new Map<string, Quote>()
  for (const quote of quotes.values()) {
    if (quote.availability !== "open") continue
    const market = markets.get(quote.marketId)
    const outcome = outcomes.get(quote.outcomeId)
    if (!market || market.normalization !== "canonical" || !outcome) continue

    const key = comparisonKey(quote)
    const current = best.get(key)
    const candidatePrice = quote.price.decimal ?? 0
    const currentPrice = current?.price.decimal ?? 0
    if (!current || candidatePrice > currentPrice) best.set(key, quote)
  }
  return best
}

for (const quote of bestOpenQuotes().values()) {
  const event = events.get(quote.eventId)
  const outcome = outcomes.get(quote.outcomeId)
  const participant = outcome?.participantId ? participants.get(outcome.participantId) : undefined
  console.log({
    event: event?.name,
    selection: participant?.name ?? outcome?.name,
    line: quote.line,
    bestBook: quote.bookId,
    decimal: quote.price.decimal
  })
}`

const deltaDemo = `type EntityType = "participant" | "event" | "market" | "outcome"

type Delta =
  | { type: "state.upsert"; sequence: number; entity_type: EntityType; entity: Participant | CanonicalEvent | Market | Outcome }
  | { type: "state.remove"; sequence: number; entity_type: EntityType; entity_id: string }
  | { type: "odds.upsert"; sequence: number; quote: Quote }
  | { type: "odds.remove"; sequence: number; quote_id: string }

function applyDelta(message: Delta): void {
  if (message.type === "odds.upsert") {
    if (!events.has(message.quote.eventId) ||
        !markets.has(message.quote.marketId) ||
        !outcomes.has(message.quote.outcomeId)) {
      throw new Error("Quote arrived before its canonical dependencies")
    }
    quotes.set(message.quote.id, message.quote)
    return
  }

  if (message.type === "odds.remove") {
    quotes.delete(message.quote_id)
    return
  }

  const stores = { participant: participants, event: events, market: markets, outcome: outcomes }
  const store = stores[message.entity_type] as Map<string, { id: string }>
  if (message.type === "state.upsert") store.set(message.entity.id, message.entity)
  else store.delete(message.entity_id)
}

// A suspension replaces the quote. It is not a removal.
applyDelta({
  type: "odds.upsert",
  sequence: 21,
  quote: { ...snapshot.quotes[0], availability: "suspended" }
})

// A withdrawal explicitly removes the offer.
applyDelta({ type: "odds.remove", sequence: 22, quote_id: "quote_book_a_min" })`

export const canonicalIdsCrossBookMarkets: DeveloperArticle = {
  slug: 'canonical-ids-cross-book-markets',
  title: 'Canonical IDs: Matching Events and Markets Across Sportsbooks',
  description: 'Build a correct cross-book odds view from canonical events, markets, outcomes, and mutable quotes without joining provider labels or source IDs.',
  summary: 'Two sportsbooks can describe the same event and selection with different IDs, labels, ordering, and market structure. This guide shows how to consume OddsLoom’s canonical v1 graph, group genuinely comparable offers, and keep the view correct as live state changes.',
  seriesPosition: 3,
  readingMinutes: 14,
  updatedAt: 'August 21, 2026',
  prerequisites: [
    'Node.js 20 or newer and basic TypeScript familiarity',
    'A snapshot already applied as described in part one',
    'Contiguous delta handling and resnapshot recovery from part two',
  ],
  outcomes: [
    'Recognize four identity patterns behind safe cross-book comparison',
    'Separate stable meaning from mutable commercial terms',
    'Know when an offer must remain outside the comparison graph',
    'Use the optional TypeScript reference to validate the model',
  ],
  sections: [
    {
      id: 'labels-are-not-identity',
      title: 'Pattern 1: Canonical Identity Graph',
      lede: 'Cross-book matching fails when presentation strings are treated as database keys.',
      blocks: [
        {
          type: 'paragraphs',
          body: [
            'Suppose one source calls an event “Minnesota @ Denver” and another calls it “Timberwolves at Nuggets.” Their event IDs are unrelated, their participants may be ordered differently, and one may abbreviate the competition. The same mismatch continues below the event: “Point Spread,” “Handicap,” and “Full Game Spread” can describe the same board, while two identical-looking “Winner” labels can refer to different periods or settlement rules.',
            'Joining raw source IDs cannot work across books because each ID belongs to its provider namespace. Joining lowercased labels is unsafe because labels omit meaning, change for presentation, and collide. Even home and away are not permanent participant properties: a team’s role changes from event to event. OddsLoom resolves provider records into stable canonical entities so your application can consume an identity graph instead of recreating provider-specific matching logic.',
            'Keep source.eventId, source.marketId, and source.selectionId as provenance for diagnostics. Do not use them as cross-book keys, and do not derive a replacement canonical key from the displayed names. If records share canonical IDs, the normalization boundary has established their relationship. If they do not, similar text alone is not permission to merge them.',
          ],
        },
        {
          type: 'pattern',
          name: 'Canonical Identity Graph',
          problem: 'Provider IDs are namespace-specific and presentation labels collide, change, or omit settlement meaning.',
          response: 'Resolve provider records into shared canonical entities, while retaining source IDs only as diagnostic provenance.',
          tradeoff: 'Some offers remain unmatched until identity is proven. The system prefers an explicit gap over a false join.',
        },
        {
          type: 'table',
          headers: ['Candidate key', 'Useful for', 'Cross-book identity?'],
          rows: [
            ['source.marketId', 'Tracing an offer back to one provider', 'No — provider-scoped'],
            ['market.name', 'Displaying a readable label', 'No — presentation text'],
            ['eventId + marketId + outcomeId', 'Following canonical graph references', 'Yes — within the delivered graph'],
            ['outcomeId + normalized line', 'Grouping equivalent priced selections', 'Yes — when the market is canonical'],
          ],
          caption: 'Provenance helps explain a quote; canonical references determine what it means.',
        },
      ],
    },
    {
      id: 'canonical-graph',
      title: 'Read the canonical graph from stable to mutable',
      lede: 'Descriptive state changes slowly; prices are the high-frequency edge.',
      blocks: [
        {
          type: 'paragraphs',
          body: [
            'The v1 snapshot is a dependency graph: sport → league → event → market → outcome → quote. Participants attach to events and outcomes, while books own quotes. A book does not own the canonical definition of the event, market, or outcome. That separation is what allows multiple books to point at the same meaning.',
            'An event relates canonical participants through event-specific roles such as home, away, or competitor. To render “away at home,” resolve each participantId through the participant table and use the role on that event. Never store home or away on the participant itself. Individual sports can use competitor roles without pretending every contest is a home-versus-away team game.',
            'A market defines the proposition being priced: its event, family, period, and variant. An outcome defines a selection within that market and may reference a participant. A quote is one book’s current offer for one outcome in one jurisdiction. It carries mutable availability, line, price, provenance, and observation time. Changing a price or moving a spread does not create a new event.',
          ],
        },
        {
          type: 'callout',
          title: 'The snapshot is the authority',
          body: 'Build these maps from the complete REST snapshot and replace them atomically during recovery. Do not combine a new snapshot with reference objects left over from an earlier subscription.',
          tone: 'note',
        },
      ],
    },
    {
      id: 'market-identity',
      title: 'Pattern 2: Stable Core, Mutable Edge',
      lede: 'A comparable board is stable; its commercial terms move.',
      blocks: [
        {
          type: 'paragraphs',
          body: [
            'The most common downstream modeling error is putting every number in the market key. Numbers can play different roles. A moving handicap or total belongs to the quote. A fixed rule such as “race to 5” helps define the market. An exact selected result such as 2–1 helps define the outcome. OddsLoom performs that classification upstream; a v1 consumer should respect the delivered IDs and fields rather than trying to infer semantics from a label.',
            'For an ordinary spread or total, group offers first by canonical outcomeId and then by line. Two prices for the same outcome at +5.5 are candidates for comparison. A +5.5 offer and a +6 offer are different priced selections, even though they reference the same market and outcome. For a market without a line, outcomeId is sufficient for the semantic selection and a no-line sentinel keeps the index shape consistent.',
            'Availability also matters. Compare only offers your application is willing to display—usually open quotes. A suspended quote still exists and may reopen, but it is not currently actionable. Closed quotes should likewise be excluded from a best-price calculation. Jurisdiction is part of the offer context, so filter or partition by jurisdiction before presenting a comparison to a user.',
          ],
        },
        {
          type: 'pattern',
          name: 'Stable Core, Mutable Edge',
          problem: 'Embedding every moving line and price into market identity causes duplicate entities and brittle downstream joins.',
          response: 'Keep event, market, and outcome meaning stable; attach book, jurisdiction, availability, line, and price to the replaceable quote edge.',
          tradeoff: 'Consumers navigate more references, but high-frequency changes no longer churn the descriptive graph.',
        },
        {
          type: 'table',
          headers: ['Value', 'Lives on', 'Comparison effect'],
          rows: [
            ['Canonical outcome meaning', 'Outcome', 'Same outcomeId can be compared'],
            ['Moving spread / total', 'Quote.line', 'Different lines require separate groups'],
            ['American / decimal price', 'Quote.price', 'Rank competing offers in one group'],
            ['Open / suspended / closed', 'Quote.availability', 'Determines whether an offer is actionable'],
            ['Provider selection ID', 'Quote.source.selectionId', 'Diagnostic only; never a merge key'],
          ],
        },
      ],
    },
    {
      id: 'runnable-comparison',
      title: 'Build a cross-book comparison index',
      lede: 'The following sanitized example is v1-shaped and runs without API credentials.',
      blocks: [
        {
          type: 'paragraphs',
          body: [
            'Save the example as comparison.ts and run it with npx tsx comparison.ts. It builds lookup maps from a snapshot, filters to open quotes on canonical markets, groups quotes by outcome and line, and retains the highest decimal price in each group. The two books deliberately use unrelated source IDs; their quotes converge because both reference the same canonical event, market, and outcome.',
            'The sample uses a small subset of the complete snapshot so the join is visible. In production, also validate effective scope and the coverage manifest, and filter the graph to the sports, leagues, books, market families, phases, and jurisdictions your product supports. Treat decimal zero in the ranking helper as “missing,” not as a real price.',
          ],
        },
        {
          type: 'code',
          language: 'typescript',
          filename: 'comparison.ts',
          code: comparisonDemo,
          caption: 'Sanitized IDs and prices demonstrate the relationships; they are not a live market sample.',
        },
        {
          type: 'callout',
          title: 'Do not reverse-engineer the normalizer',
          body: 'This client indexes already-canonical output. It does not claim a fuzzy matcher, confidence score, or mapping accuracy. Provider-specific normalization is an upstream admission problem, not a string-matching feature to reproduce in the UI.',
          tone: 'warning',
        },
      ],
    },
    {
      id: 'canonicalization-boundary',
      title: 'Pattern 3: Admission Boundary',
      lede: 'Missing data is safer than a false comparison.',
      blocks: [
        {
          type: 'paragraphs',
          body: [
            'OddsLoom’s market grammar distinguishes canonical, provider-specific, and unresolved states internally. A canonical offer has enough typed evidence to share meaning across books. A provider-specific offer can be safely attached to a source and event but cannot be safely compared. An unresolved record is missing load-bearing attribution or meaning. Similar spelling does not promote either rejected state into a canonical one.',
            'The customer delivery boundary publishes canonical markets and their complete dependency graph. Provider-specific and unresolved offers remain internal rather than appearing as if they were comparable coverage. The v1 market type still includes normalization so defensive consumers can require normalization === “canonical.” This makes the failure mode an absent comparison, not a confidently wrong one.',
            'There are many reasons an upstream candidate may be withheld: an unresolved participant, unknown metric or period, unsupported settlement rule, ambiguous live occurrence, or insufficient source evidence. Your application should not fill those gaps by matching names. Instead, monitor the coverage manifest and source status, and design empty states that say the requested market is not currently in the released canonical scope.',
          ],
        },
        {
          type: 'pattern',
          name: 'Admission Boundary',
          problem: 'Ambiguous offers look usable enough to leak into comparisons even though their subject, period, or settlement semantics are unresolved.',
          response: 'Publish only graph-safe canonical markets; keep provider-specific and unresolved candidates behind the delivery boundary.',
          tradeoff: 'Visible coverage can be narrower than raw ingestion, but every delivered comparison has typed meaning and complete dependencies.',
        },
      ],
    },
    {
      id: 'live-lifecycle',
      title: 'Pattern 4: Explicit Lifecycle',
      lede: 'Correct identity does not help if stale objects survive a removal.',
      blocks: [
        {
          type: 'paragraphs',
          body: [
            'After the snapshot, reference additions and corrections arrive as state.upsert messages; quote changes arrive as odds.upsert. Each upsert is full replacement state, so replace the stored object by ID rather than shallow-merging it with yesterday’s fields. Upserts arrive in dependency order—sport, league, participant, event, market, outcome, then quote—allowing each new reference to resolve when it is applied.',
            'A suspension is an odds.upsert whose quote has availability set to suspended. It is not a removal, and your index should stop ranking it while retaining its identity. A withdrawn offer arrives as odds.remove and must be deleted. Reference removals arrive through state.remove in quote-first dependency-safe order so the graph does not retain dangling children.',
            'Apply these messages only inside the ordered subscription loop from part two. If a sequence is duplicated, deduplicate it by message ID. If a sequence is missing, do not continue updating this graph. Beta-0 has no replay: discard uncommitted deltas, fetch and atomically apply a fresh REST snapshot, then open a new subscription at that snapshot position.',
          ],
        },
        {
          type: 'pattern',
          name: 'Explicit Lifecycle',
          problem: 'Inferring deletion from absence or treating suspension as removal leaves stale joins and destroys identities that may reopen.',
          response: 'Model corrections as full replacements, suspensions as retained unavailable quotes, and withdrawals as explicit removals in dependency-safe order.',
          tradeoff: 'Consumers must handle more state transitions, but they never have to guess whether silence means closed, stale, or removed.',
        },
        {
          type: 'code',
          language: 'typescript',
          filename: 'comparison.ts (continued)',
          code: deltaDemo,
          caption: 'Call applyDelta only after sequence validation in your stream client.',
        },
      ],
    },
  ],
}
