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
      <PageIntro kicker="Why OddsLoom" title="We needed the feed. So we started building it.">
        <p>OddsLoom began as infrastructure for our own real-time systems: one normalized stream instead of a patchwork of sportsbook integrations.</p>
      </PageIntro>

      <section className="about-manifesto">
        <div className="about-rail"><span>01</span><i /></div>
        <div>
          <span className="section-kicker">The problem</span>
          <h2>Odds are everywhere.<br />Usable odds are not.</h2>
          <p>Every book speaks a slightly different language. Markets drift, identifiers disagree, and updates arrive on different clocks. Teams that need real-time data end up spending their time maintaining plumbing instead of building their product.</p>
        </div>
      </section>

      <section className="about-definition">
        <div className="about-definition-copy">
          <span className="section-kicker">The product</span>
          <h2>One connection.<br />A consistent market.</h2>
        </div>
        <div className="about-principles">
          <article><b>01</b><div><h3>Built for machines</h3><p>A structured feed for models, monitoring, trading, media, and automated workflows—not picks and not another betting screen.</p></div></article>
          <article><b>02</b><div><h3>Normalized at the source</h3><p>One vocabulary for events, markets, selections, and prices so downstream systems stay focused on decisions.</p></div></article>
          <article><b>03</b><div><h3>Honest about readiness</h3><p>OddsLoom is pre-production. The contract is still being shaped, and we will publish measured performance and concrete coverage when they are real.</p></div></article>
        </div>
      </section>

      <section className="about-partner">
        <span className="section-kicker">Private beta</span>
        <h2>Building something that moves with the market?</h2>
        <p>We want design partners with real-time use cases and precise requirements. Tell us what your system needs.</p>
        <div><Link className="button primary" href="/beta">Request beta access <span>→</span></Link><Link className="button secondary" href="/docs">Read the draft docs</Link></div>
      </section>
    </SubpageShell>
  )
}
