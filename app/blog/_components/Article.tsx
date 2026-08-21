import Link from 'next/link'
import { SubpageShell } from '../../components/SubpageShell'
import type { ArticleBlock, DeveloperArticle } from '../_content/types'
import { CopyCode } from './CopyCode'

function Block({ block }: { block: ArticleBlock }) {
  if (block.type === 'paragraphs') return <>{block.body.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</>
  if (block.type === 'bullets') return <ul>{block.items.map(item => <li key={item}>{item}</li>)}</ul>
  if (block.type === 'steps') return <ol className="article-steps">{block.items.map(item => <li key={item.title}><strong>{item.title}</strong><span>{item.body}</span></li>)}</ol>
  if (block.type === 'callout') return <aside className={`article-callout ${block.tone === 'warning' ? 'warning' : ''}`}><strong>{block.title}</strong><p>{block.body}</p></aside>
  if (block.type === 'table') return <figure className="article-table-wrap">{block.caption && <figcaption>{block.caption}</figcaption>}<div><table><thead><tr>{block.headers.map(header => <th key={header}>{header}</th>)}</tr></thead><tbody>{block.rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={`${index}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody></table></div></figure>
  return <figure className="article-code">
    <figcaption><span>{block.filename}</span><small>{block.language}</small><CopyCode code={block.code} /></figcaption>
    <pre><code>{block.code}</code></pre>
    {block.caption && <p>{block.caption}</p>}
  </figure>
}

export function Article({ article }: { article: DeveloperArticle }) {
  return <SubpageShell>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: article.title,
      description: article.description,
      url: `https://oddsloom.com/blog/${article.slug}`,
      author: { '@type': 'Organization', name: 'OddsLoom', url: 'https://oddsloom.com' },
      publisher: { '@type': 'Organization', name: 'OddsLoom', url: 'https://oddsloom.com' },
    }).replace(/</g, '\\u003c') }} />
    <article className="developer-article">
      <header className="developer-article-header">
        <Link href="/blog" className="article-back">← All engineering guides</Link>
        <div className="article-meta"><span>Part {article.seriesPosition} of 3</span><span>{article.readingMinutes} minute read</span><span>Updated {article.updatedAt}</span></div>
        <h1>{article.title}</h1>
        <p>{article.summary}</p>
      </header>
      <div className="developer-article-layout">
        <aside className="article-rail" aria-label="Article navigation">
          <span>IN THIS GUIDE</span>
          {article.sections.map(section => <a key={section.id} href={`#${section.id}`}>{section.title}</a>)}
        </aside>
        <div className="article-body">
          <section className="article-start">
            <div><h2>Before you start</h2><ul>{article.prerequisites.map(item => <li key={item}>{item}</li>)}</ul></div>
            <div><h2>What you will build</h2><ul>{article.outcomes.map(item => <li key={item}>{item}</li>)}</ul></div>
          </section>
          {article.sections.map(section => <section id={section.id} key={section.id} className="article-section">
            <h2>{section.title}</h2>
            {section.lede && <p className="article-section-lede">{section.lede}</p>}
            {section.blocks.map((block, index) => <Block block={block} key={index} />)}
          </section>)}
          <section className="article-conversion">
            <h2>Build against the live contract.</h2>
            <p>The examples use sanitized v1-shaped payloads. Apply for beta access when you are ready to connect the same client design to a released OddsLoom scope.</p>
            <div><Link className="button primary" href="/beta">Request beta access</Link><Link className="button secondary" href="/docs/protocol">Read the protocol</Link></div>
          </section>
        </div>
      </div>
    </article>
  </SubpageShell>
}
