import type { Metadata } from 'next'
import Link from 'next/link'
import { PageIntro, SubpageShell } from '../components/SubpageShell'
import { articles } from './_content'

export const metadata: Metadata = {
  title: 'Live Odds Engineering Guides',
  description: 'Runnable guides for building correct, resilient applications on real-time sportsbook odds feeds.',
  alternates: { canonical: '/blog' },
}

export default function BlogIndex() {
  return <SubpageShell>
    <PageIntro kicker="LIVE ODDS ENGINEERING" title="Build the client before you trust the stream.">
      A practical TypeScript series about bootstrapping live state, recovering from delivery failures, and resolving sportsbook data into stable canonical entities.
    </PageIntro>
    <section className="article-series" aria-labelledby="series-title">
      <header className="article-series-header">
        <div>
          <h2 id="series-title">The resilient client series</h2>
          <p>Start at the snapshot and finish with comparable cross-book markets. Every guide uses sanitized payloads shaped like the OddsLoom v1 contract.</p>
        </div>
        <span>{articles.length} {articles.length === 1 ? 'guide' : 'guides'}</span>
      </header>
      <div className="article-list">
        {articles.map(article => <Link href={`/blog/${article.slug}`} key={article.slug} className="article-list-item">
          <span className="article-position">{String(article.seriesPosition).padStart(2, '0')}</span>
          <div><h3>{article.title}</h3><p>{article.description}</p></div>
          <span className="article-duration">{article.readingMinutes} min</span>
          <span className="article-arrow" aria-hidden="true">→</span>
        </Link>)}
      </div>
    </section>
  </SubpageShell>
}
