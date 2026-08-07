import type { ReactNode } from 'react'
import Link from 'next/link'
import { PageIntro, SubpageShell } from '../components/SubpageShell'

const sections = [
  ['/docs', 'Overview'],
  ['/docs/protocol', 'Protocol'],
  ['/docs/entities', 'Entity model'],
  ['/docs/payloads', 'Payload catalog'],
  ['/docs/reliability', 'Reliability'],
] as const

export function DocsPage({ title, lede, children, current = '/docs', next }: { title: string; lede: string; children: ReactNode; current?: string; next?: [string, string] }) {
  return <SubpageShell>
    <PageIntro kicker="Developer preview / Draft v0.3" title={title}><p>{lede}</p></PageIntro>
    <div className="docs-layout docs-site-layout">
      <aside className="docs-nav docs-site-nav"><span>DOCUMENTATION</span>{sections.map(([href, label]) => <Link href={href} key={href} aria-current={href === current ? 'page' : undefined}>{label}</Link>)}<i /><small>Draft contract<br />August 2026</small></aside>
      <article className="prose docs-content">
        <div className="notice"><strong>DRAFT v0.3</strong><span>Proposed OddsLoom contract. Synthetic examples; no production compatibility or performance guarantee yet.</span></div>
        {children}
        {next && <Link className="docs-next" href={next[0]}><span>CONTINUE</span><strong>{next[1]} →</strong></Link>}
      </article>
    </div>
  </SubpageShell>
}

export function FieldTable({ rows }: { rows: [string, string, string][] }) {
  return <div className="field-table">{rows.map(([field, type, meaning]) => <div key={field}><code>{field}</code><b>{type}</b><span>{meaning}</span></div>)}</div>
}

export function Code({ children }: { children: string }) {
  return <pre><code>{children}</code></pre>
}

export function ObjectLabel({ children }: { children: ReactNode }) {
  return <span className="doc-object-label">{children}</span>
}
