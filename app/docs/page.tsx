import type { Metadata } from 'next'
import Link from 'next/link'
import { DocsPage } from './_components'

export const metadata: Metadata = { title: 'API Documentation — Beta-0', description: 'The beta-0 OddsLoom real-time odds delivery contract and normalized data model.' }

const chapters = [
  { href: '/docs/protocol', number: '01', title: 'Protocol', text: 'Versioned REST snapshots, WebSocket authentication, declared positions, and ordered deltas.' },
  { href: '/docs/entities', number: '02', title: 'Entity model', text: 'Canonical sports, leagues, participants, events, markets, outcomes, books, and quotes.' },
  { href: '/docs/payloads', number: '03', title: 'Payload catalog', text: 'Executable v1 shapes for snapshot, control, state, odds, source, and manifest messages.' },
  { href: '/docs/reliability', number: '04', title: 'Reliability', text: 'Ordering, freshness, explicit state transitions, and fresh-snapshot recovery.' },
]

export default function OverviewPage() {
  return <DocsPage title="One feed. Explicit state." lede="The executable beta-0 delivery service pairs an authenticated versioned REST snapshot with an authenticated WebSocket stream of ordered deltas after the declared snapshot position." next={['/docs/protocol', 'Start with the protocol']}>
    <section><h2>How the stream fits together</h2><p>A subscriber atomically applies the filtered REST snapshot, authenticates to the stream, declares that snapshot’s current position and filters, then processes contiguous ordered deltas.</p><div className="flow-row"><span>REST SNAPSHOT</span><i>→</i><span>AUTHENTICATE</span><i>→</i><span>DECLARE POSITION</span><i>→</i><span>ORDERED DELTAS</span></div></section>
    <section><h2>Read by chapter</h2><div className="docs-chapter-grid">{chapters.map(chapter => <Link href={chapter.href} key={chapter.href}><b>{chapter.number}</b><h3>{chapter.title}</h3><p>{chapter.text}</p><span>OPEN CHAPTER →</span></Link>)}</div></section>
    <section><h2>Contract principles</h2><div className="spec-grid"><div><span>Canonical identity</span><p>Consumers use stable OddsLoom objects rather than provider-native structures.</p></div><div><span>Full-state upserts</span><p>Hot-path updates replace a complete entity or quote instead of applying ambiguous patches.</p></div><div><span>Explicit availability</span><p>Suspended, closed, corrected, and removed states are communicated rather than inferred.</p></div><div><span>Fresh-snapshot recovery</span><p>A reconnect or sequence gap requires a new REST snapshot before deltas resume. Beta has no replay path.</p></div></div></section>
    <section><h2>Coverage follows the live manifest</h2><p>The customer product includes every actively ingested sportsbook, every jurisdiction each feed actually represents, and every ingested sport and league—once the relevant book, jurisdiction, and event phase pass the release gate. The customer-visible manifest reports the exact coverage available now.</p><p>Within that released scope, OddsLoom publishes every observed canonical market. <code>provider_specific</code> and unresolved offers remain outside the customer product until their semantics are canonical.</p></section>
    <section className="docs-cta"><h2>Real-time odds infrastructure.</h2><p>This contract is intentionally focused on live and pregame canonical odds delivery. It is not a picks API, settlement service, historical or replay product, injury feed, or general sports statistics product.</p></section>
  </DocsPage>
}
