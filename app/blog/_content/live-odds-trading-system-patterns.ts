import type { DeveloperArticle } from './types'

const tradingViewReference = `type Availability = "open" | "suspended" | "closed"
type SourceStatus = "streaming" | "degraded"

type Quote = {
  id: string
  outcomeId: string
  bookId: string
  jurisdiction: string
  availability: Availability
  line?: number
  price: { american?: number; decimal?: number }
  observedAt: string
}

type Source = {
  bookId: string
  jurisdiction: string
  phase: "pregame" | "live"
  status: SourceStatus
}

type Movement =
  | { kind: "number"; from?: number; to?: number }
  | { kind: "price"; from?: number; to?: number }
  | { kind: "availability"; from: Availability; to: Availability }
  | { kind: "unchanged" }

function sourceKey(bookId: string, jurisdiction: string) {
  return bookId + "|" + jurisdiction
}

function comparisonKey(quote: Quote) {
  const line = quote.line === undefined ? "no-line" : String(quote.line)
  return [quote.jurisdiction, quote.outcomeId, line].join("|")
}

function classifyMovement(previous: Quote, next: Quote): Movement {
  if (previous.availability !== next.availability) {
    return { kind: "availability", from: previous.availability, to: next.availability }
  }
  if (previous.line !== next.line) {
    return { kind: "number", from: previous.line, to: next.line }
  }
  if (previous.price.decimal !== next.price.decimal) {
    return { kind: "price", from: previous.price.decimal, to: next.price.decimal }
  }
  return { kind: "unchanged" }
}

function buildPriceLadder(
  quotes: Iterable<Quote>,
  sources: Map<string, Source>,
  receivedAt: number,
  maximumObservedAgeMs: number,
) {
  const ladder = new Map<string, Quote[]>()

  for (const quote of quotes) {
    const source = sources.get(sourceKey(quote.bookId, quote.jurisdiction))
    const observedAge = Math.max(0, receivedAt - Date.parse(quote.observedAt))
    const tradable = quote.availability === "open" &&
      source?.status === "streaming" &&
      observedAge <= maximumObservedAgeMs &&
      typeof quote.price.decimal === "number"

    if (!tradable) continue
    const key = comparisonKey(quote)
    const group = ladder.get(key) ?? []
    group.push(quote)
    group.sort((left, right) => right.price.decimal! - left.price.decimal!)
    ladder.set(key, group)
  }

  return ladder
}`

export const liveOddsTradingSystemPatterns: DeveloperArticle = {
  slug: 'live-odds-trading-system-patterns',
  title: 'Four Design Patterns for a Real-Time Odds Trading System',
  description: 'Turn live cross-book quotes into a market view that knows what is comparable, what moved, and when every trading signal must be suppressed.',
  summary: 'A trading system is not a scrolling list of prices. It is a state machine that admits only current quotes, compares like with like, separates line movement from price movement, and stops signaling when continuity is uncertain.',
  seriesPosition: 3,
  readingMinutes: 12,
  updatedAt: 'August 24, 2026',
  prerequisites: [
    'A snapshot-first client from part one',
    'Gap detection and fresh-snapshot recovery from part two',
    'A product policy for quote age, jurisdictions, and supported market scope',
  ],
  outcomes: [
    'Build a market view from quotes that are actually eligible for trading decisions',
    'Compare the same outcome and exact line across sportsbooks',
    'Distinguish a number move from a price move or suspension',
    'Fail closed when source health or stream continuity is uncertain',
  ],
  sections: [
    {
      id: 'trading-view-not-ticker',
      title: 'Start with a trading view, not a ticker',
      lede: 'Speed attracts traders, but state discipline is what keeps a fast interface from presenting a stale price as an opportunity.',
      blocks: [
        {
          type: 'paragraphs',
          body: [
            'A raw odds ticker answers only one question: what values arrived? A trading view must answer harder questions before it alerts a person or bot. Is the source healthy? Is the quote open? Is it recent enough for this product? Does another book quote the same outcome at the same line? Did the handicap move, or did only the price change?',
            'Those questions belong in a small set of reusable design patterns. The patterns do not predict winners and do not guarantee execution at a displayed price. They create a defensible market-state layer from which a trader can observe price dispersion, line movement, and temporary loss of liquidity without confusing any of them.',
            'OddsLoom supplies the live state transitions: complete snapshots, ordered full-state upserts, explicit suspensions and removals, source status, and canonical references. Your trading application supplies its own policies for acceptable age, markets, jurisdictions, alert thresholds, and downstream execution.',
          ],
        },
        {
          type: 'table',
          headers: ['Raw feed question', 'Trading-system question'],
          rows: [
            ['What quote arrived?', 'Is this quote currently eligible to influence a decision?'],
            ['Which price is larger?', 'Are these offers for the same outcome at the same line and jurisdiction?'],
            ['Did the value change?', 'Was it a number move, price move, suspension, or correction?'],
            ['Is the socket connected?', 'Can the client still prove contiguous and healthy market state?'],
          ],
          caption: 'The trading layer turns delivery events into decision-safe market state.',
        },
      ],
    },
    {
      id: 'tradable-quote-set',
      title: 'Pattern 1: Tradable Quote Set',
      lede: 'Separate every quote you know about from the smaller set allowed to influence a live decision.',
      blocks: [
        {
          type: 'pattern',
          name: 'Tradable Quote Set',
          problem: 'Open, suspended, stale, closed, and degraded-source quotes can coexist in local state. Treating every stored quote as current manufactures false opportunities.',
          response: 'Maintain an explicit eligibility predicate over availability, source health, effective scope, jurisdiction, and a consumer-owned freshness policy.',
          tradeoff: 'The visible board may shrink during uncertainty. That is preferable to filling it with prices the system cannot defend as current.',
        },
        {
          type: 'paragraphs',
          body: [
            'The complete state store should retain information needed for lifecycle handling, but the trading view should admit only eligible quotes. An open quote from a streaming source may enter. A suspended quote remains in state because it can reopen under the same ID, but it leaves the tradable set. A closed or explicitly removed quote also leaves. When a source is degraded, its last-known quotes must not continue to look live.',
            'Freshness is a product policy, not a universal number. Use observedAt to understand when OddsLoom observed provider state, emitted_at to understand publication time, and consumer_received_at from your own process. Set thresholds by market and use case only after measuring the real distribution. Do not advertise an arbitrary threshold as an OddsLoom latency promise.',
            'This pattern gives every downstream feature the same guardrail. The price ladder, movement alerts, and bot inputs read from one tradable set instead of independently deciding whether a quote is safe.',
          ],
        },
        {
          type: 'callout',
          title: 'Fail closed on uncertainty',
          body: 'If source status, age, scope, or continuity cannot be established, suppress the signal. “Unknown” is an operational state, not permission to reuse the last price.',
          tone: 'warning',
        },
      ],
    },
    {
      id: 'comparable-price-ladder',
      title: 'Pattern 2: Comparable Price Ladder',
      lede: 'A best-price calculation is meaningful only after the system proves that the offers describe the same trade.',
      blocks: [
        {
          type: 'pattern',
          name: 'Comparable Price Ladder',
          problem: 'Sportsbooks use different labels and source IDs, while a better price at a worse handicap is not an apples-to-apples improvement.',
          response: 'Group eligible quotes by jurisdiction, canonical outcome, and exact line; rank decimal price only inside that comparison group.',
          tradeoff: 'The board exposes multiple line groups instead of collapsing everything into one “best” number. The comparison is narrower, but it is honest.',
        },
        {
          type: 'paragraphs',
          body: [
            'For a spread, +5.5 at -105 and +5.5 at -110 belong on one price ladder. +6 at -115 is a different group because the outcome condition changed. Totals need the same treatment. Markets without a moving line can use the canonical outcome alone after partitioning by jurisdiction.',
            'Canonical IDs are useful here, but they are plumbing rather than the story. They let the application compare equivalent events, markets, and outcomes without joining provider labels. The trader-facing result is a clean ladder showing where the same live position is offered and which currently eligible book has the strongest price.',
            'Keep provenance beside the normalized view. When a quote looks surprising, source event, market, and selection IDs help diagnose it. They should not become cross-book grouping keys.',
          ],
        },
        {
          type: 'table',
          headers: ['Offer A', 'Offer B', 'Same ladder?'],
          rows: [
            ['Away +5.5 at -105, US-IL', 'Away +5.5 at -110, US-IL', 'Yes — compare price'],
            ['Away +5.5 at -105, US-IL', 'Away +6 at -115, US-IL', 'No — different line'],
            ['Away +5.5 at -105, US-IL', 'Away +5.5 at -105, another jurisdiction', 'No — different offer context'],
            ['Open quote', 'Suspended quote', 'No — suspended is not tradable'],
          ],
        },
      ],
    },
    {
      id: 'movement-detector',
      title: 'Pattern 3: Movement Detector',
      lede: 'Turn replacements into typed market events instead of treating every update as generic motion.',
      blocks: [
        {
          type: 'pattern',
          name: 'Movement Detector',
          problem: 'A change from -110 to -120, a move from +5.5 to +6, and a transition to suspended have different trading meanings but can look identical in a generic update log.',
          response: 'Compare the previous and replacement quote by identity, then classify number, price, availability, correction, and removal transitions separately.',
          tradeoff: 'The application retains the previous committed state long enough to classify transitions. In return, alerts can describe what changed instead of merely saying that something changed.',
        },
        {
          type: 'paragraphs',
          body: [
            'OddsLoom upserts are full replacements. That makes movement classification a comparison between the last committed quote and the next committed quote. If line changes, record a number move. If the line is stable and decimal or American price changes, record a price move. If availability changes, record the market-state transition before considering any price alert.',
            'Sequence remains the ordering authority. Timestamps support freshness and latency analysis, but they do not repair a missing update. Classify movement only after the contiguous-sequence gate from part two accepts the replacement.',
            'A movement event is an observation, not a prediction. Downstream rules can decide whether a cross-book discrepancy deserves an alert, but the article and product should not imply that movement guarantees direction, execution, or profit.',
          ],
        },
        {
          type: 'steps',
          items: [
            { title: 'Validate', body: 'Confirm the message is the next committed sequence and belongs to the accepted effective scope.' },
            { title: 'Compare', body: 'Load the previous quote by ID and compare availability, line, and price before replacement.' },
            { title: 'Classify', body: 'Emit one typed movement event with the old and new values.' },
            { title: 'Replace', body: 'Install the complete new quote and commit the sequence in the same durable boundary.' },
            { title: 'Evaluate', body: 'Run alert or trading policies only against the refreshed tradable quote set.' },
          ],
        },
      ],
    },
    {
      id: 'signal-kill-switch',
      title: 'Pattern 4: Signal Kill Switch',
      lede: 'A trading system needs one explicit state that prevents uncertain data from becoming an actionable alert.',
      blocks: [
        {
          type: 'pattern',
          name: 'Signal Kill Switch',
          problem: 'A socket can stay connected while a source degrades, and a reconnect can succeed while local state still contains an unproven gap.',
          response: 'Gate all outward signals behind a single market-state status. Disable them on gaps, disconnects, source degradation, stale data, or snapshot replacement; re-enable only after a fresh snapshot and accepted subscription restore the invariant.',
          tradeoff: 'The system intentionally misses some transient opportunities during recovery. It avoids the worse failure of acting on state it cannot prove.',
        },
        {
          type: 'paragraphs',
          body: [
            'The kill switch should sit after ingestion and before every consumer that can create urgency: alerts, dashboards, automated comparisons, and bot decisions. It is not only a UI banner. It is a shared authorization check for whether the current market view may produce outward signals.',
            'Trigger it when the next sequence is missing, the bounded queue overflows, the WebSocket closes, the snapshot position is rejected, or a relevant source reports degraded. Beta-0 provides no replay path. The recovery procedure is to freeze mutations, fetch and atomically install a fresh snapshot, create a new authenticated subscription with matching scope, and resume only after acceptance.',
            'Track why the switch opened and how long it remained open. Connection uptime and signal availability are different measurements. A healthy trading product needs both, plus evidence that relevant quotes were actually flowing.',
          ],
        },
        {
          type: 'callout',
          title: 'Delivery is not execution',
          body: 'OddsLoom provides live market state, not sportsbook order placement or confirmation. A displayed quote can change or suspend before an external wager is accepted.',
          tone: 'note',
        },
      ],
    },
    {
      id: 'reference-implementation',
      title: 'Optional reference: assemble the market view',
      lede: 'The design is the deliverable. This compact TypeScript sketch exists only to make the pattern boundaries concrete.',
      blocks: [
        {
          type: 'paragraphs',
          body: [
            'The example filters a sanitized quote set using source health and a caller-supplied age policy, groups exact comparisons, ranks decimal price, and classifies quote movement. A production consumer would place the contiguous sequence gate and durable transaction around these functions.',
            'Clock comparison assumes the consumer and OddsLoom publication clocks are reasonably synchronized. Record all three clocks and measure before setting a real threshold.',
          ],
        },
        {
          type: 'code',
          language: 'typescript',
          filename: 'market-state.ts',
          code: tradingViewReference,
          caption: 'Illustrative consumer policy using sanitized v1-shaped fields. It is not a latency benchmark or automated betting strategy.',
        },
      ],
    },
    {
      id: 'operating-checklist',
      title: 'The operating checklist',
      blocks: [
        {
          type: 'bullets',
          items: [
            'Keep stored state separate from the smaller tradable quote set.',
            'Partition comparisons by jurisdiction, canonical outcome, and exact line.',
            'Classify line, price, availability, correction, and removal transitions separately.',
            'Run alert policies only after the current delta is durably committed.',
            'Disable every outward signal when continuity, source health, or freshness is uncertain.',
            'Measure signal availability separately from socket uptime and endpoint availability.',
            'Treat quote delivery as market observation, not execution confirmation or guaranteed value.',
          ],
        },
        {
          type: 'paragraphs',
          body: [
            'These four patterns turn a real-time odds feed into trading infrastructure: a controlled set of eligible quotes, an honest cross-book ladder, typed movement events, and one reliable way to stop signals when the underlying state loses its proof.',
          ],
        },
      ],
    },
  ],
}
