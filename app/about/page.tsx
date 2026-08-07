import type { Metadata } from 'next'
import Link from 'next/link'
import { PageIntro, SubpageShell } from '../components/SubpageShell'

export const metadata: Metadata = {
  title: 'About | OddsLoom',
  description: 'Why OddsLoom is building real-time sports odds infrastructure for developers and automated systems.',
}

export default function AboutPage() {
  return (
    <SubpageShell>
      <PageIntro kicker="About OddsLoom" title="Odds infrastructure built from a real need.">
        <p>OddsLoom started as infrastructure we wanted for our own real-time systems: one dependable stream instead of a patchwork of sportsbook integrations.</p>
      </PageIntro>

      <section className="prose-grid">
        <article>
          <h2>What we are building</h2>
          <p>A normalized, low-latency API for live and pregame sportsbook odds. The product is intended for developers building models, monitoring, trading, media, and other automated workflows—not a picks service or a consumer betting app.</p>
        </article>
        <article>
          <h2>How we intend to earn trust</h2>
          <p>By publishing concrete coverage, delivery behavior, incident status, and measured performance as the service comes online. We will distinguish what is live from what is planned and avoid presenting projections as production results.</p>
        </article>
        <article>
          <h2>Where things stand</h2>
          <p>OddsLoom is pre-production. The API contract is in draft, coverage is being built, and qualified design partners can apply for the private beta. Current availability is always reflected on the <Link href="/status">status page</Link>.</p>
        </article>
        <article>
          <h2>Who we want to work with</h2>
          <p>Teams whose product depends on timely, machine-readable odds and who can give precise feedback about schemas, delivery guarantees, recovery, and operational needs.</p>
        </article>
      </section>

      <section className="page-cta">
        <span className="section-kicker">Design partners</span>
        <h2>Help shape the feed you need.</h2>
        <p>Tell us about your use case, required coverage, and update volume.</p>
        <Link className="btn-primary" href="/beta">Request beta access <span>→</span></Link>
      </section>
    </SubpageShell>
  )
}
