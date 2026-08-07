import type { Metadata } from 'next'
import Link from 'next/link'
import { DocsPage } from './_components'

export const metadata: Metadata = { title: 'API Documentation — Draft v0.3', description: 'The proposed OddsLoom real-time odds protocol and normalized data contract.' }

const chapters = [
  { href: '/docs/protocol', number: '01', title: 'Protocol', text: 'Connection, authentication, subscriptions, snapshots, and the stream lifecycle.' },
  { href: '/docs/entities', number: '02', title: 'Entity model', text: 'Canonical sports, leagues, participants, events, markets, outcomes, books, and quotes.' },
  { href: '/docs/payloads', number: '03', title: 'Payload catalog', text: 'Complete proposed shapes for control, state, delta, heartbeat, and error messages.' },
  { href: '/docs/reliability', number: '04', title: 'Reliability', text: 'Ordering, timing, state transitions, replay, resnapshot, and consumer responsibilities.' },
]

export default function OverviewPage() {
  return <DocsPage title="One feed. Explicit state." lede="OddsLoom is designed as a stateful, WebSocket-first protocol for normalized sportsbook odds. This reference separates the contract into focused chapters so you can challenge each decision independently." next={['/docs/protocol', 'Start with the protocol']}>
    <section><h2>How the model fits together</h2><p>A subscriber receives canonical reference objects and current book quotes in a snapshot. Ordered deltas then replace or remove individual quotes as source state changes.</p><div className="flow-row"><span>CONNECT</span><i>→</i><span>AUTHENTICATE</span><i>→</i><span>SUBSCRIBE</span><i>→</i><span>SNAPSHOT</span><i>→</i><span>DELTAS</span></div></section>
    <section><h2>Read by chapter</h2><div className="docs-chapter-grid">{chapters.map(chapter => <Link href={chapter.href} key={chapter.href}><b>{chapter.number}</b><h3>{chapter.title}</h3><p>{chapter.text}</p><span>OPEN CHAPTER →</span></Link>)}</div></section>
    <section><h2>Contract principles</h2><div className="spec-grid"><div><span>Canonical identity</span><p>Consumers use stable OddsLoom objects rather than provider-native structures.</p></div><div><span>Full-state upserts</span><p>Hot-path quote updates replace one complete quote instead of applying ambiguous patches.</p></div><div><span>Explicit availability</span><p>Suspended, closed, and removed states are communicated rather than inferred.</p></div><div><span>Recoverable ordering</span><p>Stream positions expose gaps and support replay or a clean resnapshot.</p></div></div></section>
    <section className="docs-cta"><span className="section-kicker">Scope</span><h2>Real-time odds infrastructure.</h2><p>This contract is intentionally focused on live and pregame odds delivery. It is not a picks API, settlement service, injury feed, or general sports statistics product.</p></section>
  </DocsPage>
}
